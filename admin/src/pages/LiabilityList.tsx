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
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getLiabilities, getInsuranceCompanies } from '../utils/api';

interface Liability {
  liability_id: number;
  liability_code: string;
  liability_name: string;
  liability_type: string;
  unit_type: string;
  company_name: string;
  company_id: number;
  is_additional: number | boolean;
  clause_id?: number;
  clause_name?: string;
  clause_code?: string;
  description?: string;
  status: string;
}

interface InsuranceCompany {
  company_id: number;
  company_code: string;
  company_name: string;
}

const LiabilityList: React.FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Liability | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [companyFilter]);

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
      const response = await getLiabilities(params);
      const data = Array.isArray(response) ? response : response?.data || [];
      setDataSource(data);
    } catch (error: any) {
      console.error('获取责任列表失败:', error);
      message.error(error?.message || '获取责任列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Liability) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // TODO: 调用API保存
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns: ColumnsType<Liability> = [
    {
      title: '责任代码',
      dataIndex: 'liability_code',
      width: 120,
    },
    {
      title: '责任名称',
      dataIndex: 'liability_name',
      width: 250,
    },
    {
      title: '责任类型',
      dataIndex: 'liability_type',
      width: 100,
    },
    {
      title: '单位类型',
      dataIndex: 'unit_type',
      width: 100,
    },
    {
      title: '是否附加险',
      dataIndex: 'is_additional',
      width: 100,
      render: (isAdditional: number | boolean) => (
        <Tag color={isAdditional ? 'orange' : 'blue'}>
          {isAdditional ? '附加险' : '主险'}
        </Tag>
      ),
    },
    {
      title: '关联条款',
      width: 200,
      render: (_, record) => (
        record.clause_name ? (
          <span title={record.clause_code}>{record.clause_name}</span>
        ) : (
          <span style={{ color: '#999' }}>未关联</span>
        )
      ),
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
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="责任管理"
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加责任
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="liability_id"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑责任' : '添加责任'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
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
              <Select.Option value={1}>利宝保险</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="liability_code"
            label="责任代码"
            rules={[{ required: true, message: '请输入责任代码' }]}
          >
            <Input placeholder="如：DEATH_BENEFIT" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            name="liability_name"
            label="责任名称"
            rules={[{ required: true, message: '请输入责任名称' }]}
          >
            <Input placeholder="如：意外身故伤残保险金" />
          </Form.Item>
          <Form.Item
            name="liability_type"
            label="责任类型"
            rules={[{ required: true, message: '请选择责任类型' }]}
          >
            <Select>
              <Select.Option value="身故">身故</Select.Option>
              <Select.Option value="医疗">医疗</Select.Option>
              <Select.Option value="津贴">津贴</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="unit_type"
            label="单位类型"
            rules={[{ required: true, message: '请选择单位类型' }]}
          >
            <Select>
              <Select.Option value="金额">金额</Select.Option>
              <Select.Option value="天数">天数</Select.Option>
              <Select.Option value="比例">比例</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="责任描述"
          >
            <Input.TextArea rows={3} />
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
    </div>
  );
};

export default LiabilityList;

