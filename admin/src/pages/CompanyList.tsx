// 企业客户管理页面
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  Form,
  message,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Company {
  company_id: number;
  company_name: string;
  credit_code: string;
  province: string;
  city: string;
  district: string;
  address: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  status: string;
  created_at: string;
}

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      const mockData: Company[] = [
        {
          company_id: 1,
          company_name: '测试企业有限公司',
          credit_code: '91110000MA01234567',
          province: '北京市',
          city: '北京市',
          district: '通州区',
          address: '测试地址123号',
          contact_name: '张三',
          contact_phone: '13800138000',
          contact_email: 'test@example.com',
          status: '正常',
          created_at: '2025-01-01 10:00:00',
        },
      ];
      setCompanies(mockData);
    } catch (error) {
      message.error('获取企业列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCompany(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Company) => {
    setEditingCompany(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: 调用删除API
      message.success('删除成功');
      fetchCompanies();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingCompany) {
        // TODO: 调用更新API
        message.success('更新成功');
      } else {
        // TODO: 调用创建API
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchCompanies();
    } catch (error) {
      message.error(editingCompany ? '更新失败' : '创建失败');
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.company_name.includes(searchKeyword) ||
      company.credit_code.includes(searchKeyword) ||
      company.contact_name.includes(searchKeyword)
  );

  const columns: ColumnsType<Company> = [
    {
      title: '企业名称',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
    },
    {
      title: '统一社会信用代码',
      dataIndex: 'credit_code',
      key: 'credit_code',
      width: 200,
    },
    {
      title: '所在地区',
      key: 'region',
      width: 200,
      render: (_, record) => `${record.province} ${record.city} ${record.district}`,
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
      width: 150,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contact_email',
      key: 'contact_email',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '正常' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.company_id)}
          >
            <Tooltip title="删除">
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Input
              placeholder="搜索企业名称、信用代码、联系人"
              style={{ width: 300 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增企业
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchCompanies}>
              刷新
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredCompanies}
            loading={loading}
            rowKey="company_id"
            scroll={{ x: 1500 }}
            pagination={{
              total: filteredCompanies.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      <Modal
        title={editingCompany ? '编辑企业' : '新增企业'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="company_name"
            label="企业名称"
            rules={[{ required: true, message: '请输入企业名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="credit_code"
            label="统一社会信用代码"
            rules={[{ required: true, message: '请输入统一社会信用代码' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请输入省份' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="city" label="城市">
            <Input />
          </Form.Item>
          <Form.Item
            name="district"
            label="区县"
            rules={[{ required: true, message: '请输入区县' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item
            name="contact_name"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contact_email"
            label="联系邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyList;

