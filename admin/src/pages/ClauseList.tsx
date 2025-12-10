import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getClauses, getInsuranceCompanies } from '../utils/api';

interface Clause {
  clause_id: number;
  company_id: number;
  clause_code: string;
  clause_name: string;
  clause_type: string;
  registration_no: string;
  clause_content?: string;
  status: string;
  company_name: string;
  company_code: string;
}

interface InsuranceCompany {
  company_id: number;
  company_code: string;
  company_name: string;
}

const ClauseList: React.FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<Clause[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [contentModalVisible, setContentModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Clause | null>(null);
  const [viewingContent, setViewingContent] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [clauseTypeFilter, setClauseTypeFilter] = useState<string>('');
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [companyFilter, clauseTypeFilter]);

  const fetchCompanies = async () => {
    try {
      const data = await getInsuranceCompanies();
      setCompanies(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error('获取保司列表失败:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (companyFilter) {
        params.company_id = companyFilter;
      }
      if (clauseTypeFilter) {
        params.clause_type = clauseTypeFilter;
      }
      const response = await getClauses(params);
      const data = Array.isArray(response) ? response : response?.data || [];
      setDataSource(data);
    } catch (error: any) {
      console.error('获取条款列表失败:', error);
      message.error(error?.message || '获取条款列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Clause) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleViewContent = (record: Clause) => {
    setViewingContent(record.clause_content || '暂无条款内容');
    setContentModalVisible(true);
  };

  const handleSubmit = async (_values: any) => {
    try {
      // TODO: 调用API保存
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns: ColumnsType<Clause> = [
    {
      title: '条款代码',
      dataIndex: 'clause_code',
      width: 150,
    },
    {
      title: '条款名称',
      dataIndex: 'clause_name',
      width: 300,
      ellipsis: true,
    },
    {
      title: '条款类型',
      dataIndex: 'clause_type',
      width: 100,
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          '主险': 'blue',
          '附加险': 'orange',
          '特约': 'purple',
        };
        return (
          <Tag color={colorMap[type] || 'default'}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: '注册号',
      dataIndex: 'registration_no',
      width: 200,
    },
    {
      title: '保司',
      dataIndex: 'company_name',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '启用' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewContent(record)}
          >
            查看内容
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="条款管理"
        extra={
          <Space>
            <Select
              placeholder="选择保司"
              style={{ width: 200 }}
              allowClear
              value={companyFilter}
              onChange={setCompanyFilter}
            >
              {companies.map(company => (
                <Select.Option key={company.company_id} value={String(company.company_id)}>
                  {company.company_name}
                </Select.Option>
              ))}
            </Select>
            <Select
              placeholder="选择条款类型"
              style={{ width: 150 }}
              allowClear
              value={clauseTypeFilter}
              onChange={setClauseTypeFilter}
            >
              <Select.Option value="主险">主险</Select.Option>
              <Select.Option value="附加险">附加险</Select.Option>
              <Select.Option value="特约">特约</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加条款
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="clause_id"
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑条款' : '添加条款'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="company_id"
            label="保司"
            rules={[{ required: true, message: '请选择保司' }]}
          >
            <Select placeholder="请选择保司">
              {companies.map(company => (
                <Select.Option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="clause_code"
            label="条款代码"
            rules={[{ required: true, message: '请输入条款代码' }]}
          >
            <Input placeholder="如：16M00031" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            name="clause_name"
            label="条款名称"
            rules={[{ required: true, message: '请输入条款名称' }]}
          >
            <Input placeholder="如：利宝保险有限公司雇主责任保险条款（2024版A款）" />
          </Form.Item>
          <Form.Item
            name="clause_type"
            label="条款类型"
            rules={[{ required: true, message: '请选择条款类型' }]}
          >
            <Select>
              <Select.Option value="主险">主险</Select.Option>
              <Select.Option value="附加险">附加险</Select.Option>
              <Select.Option value="特约">特约</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="registration_no"
            label="注册号"
            rules={[{ required: true, message: '请输入注册号' }]}
          >
            <Input placeholder="如：C00006030912024080703473" />
          </Form.Item>
          <Form.Item
            name="clause_content"
            label="条款内容"
          >
            <Input.TextArea rows={6} placeholder="请输入条款详细内容..." />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="启用"
          >
            <Select>
              <Select.Option value="启用">启用</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="条款内容"
        open={contentModalVisible}
        onCancel={() => setContentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setContentModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
          {viewingContent || '暂无条款内容'}
        </div>
      </Modal>
    </div>
  );
};

export default ClauseList;

