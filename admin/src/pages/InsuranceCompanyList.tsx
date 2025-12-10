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
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface InsuranceCompany {
  company_id: number;
  company_code: string;
  company_name: string;
  contact_name: string;
  contact_phone: string;
  status: string;
}

const InsuranceCompanyList: React.FC = () => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<InsuranceCompany | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API
      // const response = await api.getInsuranceCompanies();
      // setDataSource(response.data);
      
      // 模拟数据
      setDataSource([
        {
          company_id: 1,
          company_code: 'LIBO',
          company_name: '利宝保险',
          contact_name: '张三',
          contact_phone: '13800138000',
          status: '启用',
        },
      ]);
    } catch (error) {
      message.error('获取保司列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: InsuranceCompany) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // TODO: 调用API保存
      // if (editingRecord) {
      //   await api.updateInsuranceCompany(editingRecord.company_id, values);
      // } else {
      //   await api.createInsuranceCompany(values);
      // }
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns: ColumnsType<InsuranceCompany> = [
    {
      title: '保司代码',
      dataIndex: 'company_code',
      width: 150,
    },
    {
      title: '保司名称',
      dataIndex: 'company_name',
      width: 200,
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
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
        <Space>
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
        title="保司管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加保司
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="company_id"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑保司' : '添加保司'}
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
            name="company_code"
            label="保司代码"
            rules={[{ required: true, message: '请输入保司代码' }]}
          >
            <Input placeholder="如：LIBO" disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            name="company_name"
            label="保司名称"
            rules={[{ required: true, message: '请输入保司名称' }]}
          >
            <Input placeholder="如：利宝保险" />
          </Form.Item>
          <Form.Item
            name="contact_name"
            label="联系人"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_phone"
            label="联系电话"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_email"
            label="联系邮箱"
          >
            <Input type="email" />
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

export default InsuranceCompanyList;

