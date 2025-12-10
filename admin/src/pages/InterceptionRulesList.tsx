// 拦截规则管理页面
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
  Select,
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

const { TextArea } = Input;

interface InterceptionRule {
  rule_id: number;
  rule_name: string;
  rule_type: string;
  insurance_company_code: string;
  insurance_company_name: string;
  product_code: string;
  product_name: string;
  condition_type: string;
  condition_value: string;
  action: string;
  priority: number;
  status: string;
  description: string;
}

const InterceptionRulesList: React.FC = () => {
  const [rules, setRules] = useState<InterceptionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<InterceptionRule | null>(null);
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      const mockData: InterceptionRule[] = [
        {
          rule_id: 1,
          rule_name: '年龄限制规则',
          rule_type: '年龄限制',
          insurance_company_code: 'LIBO',
          insurance_company_name: '利宝保险',
          product_code: 'PRODUCT_A',
          product_name: '雇主责任险A',
          condition_type: '年龄',
          condition_value: '18-65',
          action: '拦截',
          priority: 1,
          status: '启用',
          description: '被保人年龄必须在18-65岁之间',
        },
      ];
      setRules(mockData);
    } catch (error) {
      message.error('获取拦截规则列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: InterceptionRule) => {
    setEditingRule(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: 调用删除API
      message.success('删除成功');
      fetchRules();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRule) {
        // TODO: 调用更新API
        message.success('更新成功');
      } else {
        // TODO: 调用创建API
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRules();
    } catch (error) {
      message.error(editingRule ? '更新失败' : '创建失败');
    }
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.rule_name.includes(searchKeyword) ||
      rule.insurance_company_name.includes(searchKeyword) ||
      rule.product_name.includes(searchKeyword)
  );

  const columns: ColumnsType<InterceptionRule> = [
    {
      title: '规则名称',
      dataIndex: 'rule_name',
      key: 'rule_name',
      width: 200,
    },
    {
      title: '规则类型',
      dataIndex: 'rule_type',
      key: 'rule_type',
      width: 120,
    },
    {
      title: '保司',
      dataIndex: 'insurance_company_name',
      key: 'insurance_company_name',
      width: 120,
    },
    {
      title: '产品',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: '条件类型',
      dataIndex: 'condition_type',
      key: 'condition_type',
      width: 120,
    },
    {
      title: '条件值',
      dataIndex: 'condition_value',
      key: 'condition_value',
      width: 150,
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => (
        <Tag color={action === '拦截' ? 'error' : 'success'}>{action}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
      ),
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
            onConfirm={() => handleDelete(record.rule_id)}
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
              placeholder="搜索规则名称、保司、产品"
              style={{ width: 300 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增规则
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchRules}>
              刷新
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredRules}
            loading={loading}
            rowKey="rule_id"
            scroll={{ x: 1500 }}
            pagination={{
              total: filteredRules.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      <Modal
        title={editingRule ? '编辑拦截规则' : '新增拦截规则'}
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
            name="rule_name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="rule_type"
            label="规则类型"
            rules={[{ required: true, message: '请选择规则类型' }]}
          >
            <Select>
              <Select.Option value="年龄限制">年龄限制</Select.Option>
              <Select.Option value="职业限制">职业限制</Select.Option>
              <Select.Option value="保额限制">保额限制</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="insurance_company_code"
            label="保司"
            rules={[{ required: true, message: '请选择保司' }]}
          >
            <Select>
              <Select.Option value="LIBO">利宝保险</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="product_code"
            label="产品"
            rules={[{ required: true, message: '请选择产品' }]}
          >
            <Select>
              <Select.Option value="PRODUCT_A">雇主责任险A</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="condition_type"
            label="条件类型"
            rules={[{ required: true, message: '请输入条件类型' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="condition_value"
            label="条件值"
            rules={[{ required: true, message: '请输入条件值' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="action"
            label="动作"
            rules={[{ required: true, message: '请选择动作' }]}
          >
            <Select>
              <Select.Option value="拦截">拦截</Select.Option>
              <Select.Option value="警告">警告</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请输入优先级' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterceptionRulesList;

