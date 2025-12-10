import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Select,
  InputNumber,
  Space,
  Tag,
  message,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getPlan, getPlanLiabilities, getLiabilities, deletePlanLiability } from '../utils/api';

const { Text } = Typography;

interface PlanLiability {
  id?: number;
  liability_id: number;
  liability_name: string;
  is_required: boolean;
  coverage_options: string[];
  default_coverage: string;
  unit: string;
  display_order: number;
}

const PlanLiabilityConfig: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<PlanLiability[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PlanLiability | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [availableLiabilities, setAvailableLiabilities] = useState<any[]>([]);

  // 获取方案信息
  useEffect(() => {
    fetchPlanInfo();
    fetchAvailableLiabilities();
    fetchPlanLiabilities();
  }, [planId]);

  const fetchPlanInfo = async () => {
    try {
      if (!planId) return;
      const response = await getPlan(planId);
      if (response.success && response.data) {
        setPlanInfo({
          plan_name: response.data.plan_name,
          product_name: response.data.product_name,
          company_name: response.data.company_name,
        });
      }
    } catch (error: any) {
      console.error('获取方案信息失败:', error);
      message.error('获取方案信息失败: ' + (error.message || '未知错误'));
    }
  };

  const fetchAvailableLiabilities = async () => {
    try {
      // 获取所有可用的责任列表（可以根据方案所属的保司过滤）
      const response = await getLiabilities();
      if (Array.isArray(response)) {
        setAvailableLiabilities(response);
      } else if (response.data && Array.isArray(response.data)) {
        setAvailableLiabilities(response.data);
      }
    } catch (error: any) {
      console.error('获取责任列表失败:', error);
      message.error('获取责任列表失败: ' + (error.message || '未知错误'));
    }
  };

  const fetchPlanLiabilities = async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const response = await getPlanLiabilities(planId);
      if (response.success && Array.isArray(response.data)) {
        setDataSource(response.data);
      } else if (Array.isArray(response)) {
        setDataSource(response);
      } else if (response.data && Array.isArray(response.data)) {
        setDataSource(response.data);
      } else {
        console.warn('获取到的数据格式不正确:', response);
        setDataSource([]);
      }
    } catch (error: any) {
      console.error('获取责任配置失败:', error);
      message.error('获取责任配置失败: ' + (error.message || '未知错误'));
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: PlanLiability) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      coverage_options_string: record.coverage_options.join(','),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (!planId) return;
    try {
      await deletePlanLiability(planId, id);
      message.success('删除成功');
      fetchPlanLiabilities();
    } catch (error: any) {
      console.error('删除失败:', error);
      message.error('删除失败: ' + (error.message || '未知错误'));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        coverage_options: values.coverage_options_string
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item),
      };
      
      // TODO: 调用API保存
      // if (editingRecord?.id) {
      //   await api.updatePlanLiability(editingRecord.id, data);
      // } else {
      //   await api.createPlanLiability(planId, data);
      // }
      
      message.success(editingRecord ? '更新成功' : '创建成功');
      setModalVisible(false);
      fetchPlanLiabilities();
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns: ColumnsType<PlanLiability> = [
    {
      title: '显示顺序',
      dataIndex: 'display_order',
      width: 100,
      sorter: (a, b) => a.display_order - b.display_order,
    },
    {
      title: '责任名称',
      dataIndex: 'liability_name',
      width: 200,
    },
    {
      title: '是否必选',
      dataIndex: 'is_required',
      width: 100,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>
          {value ? '必选' : '可选'}
        </Tag>
      ),
    },
    {
      title: '保额选项',
      dataIndex: 'coverage_options',
      render: (options: string[]) => (
        <Space wrap>
          {options.map((option, index) => (
            <Tag key={index}>{option}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '默认保额',
      dataIndex: 'default_coverage',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
    },
    {
      title: '操作',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/plans')}
        >
          返回
        </Button>
        <Text strong style={{ fontSize: 16 }}>
          方案责任配置
        </Text>
      </Space>

      {planInfo && (
        <Card style={{ marginBottom: 16 }}>
          <Space size="large">
            <Text>保司：{planInfo.company_name}</Text>
            <Text>产品：{planInfo.product_name}</Text>
            <Text>方案：{planInfo.plan_name}</Text>
          </Space>
        </Card>
      )}

      <Card
        title="责任配置列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加责任
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey={(record) => record.id || record.liability_id || Math.random()}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑责任配置' : '添加责任配置'}
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
            name="liability_id"
            label="选择责任"
            rules={[{ required: true, message: '请选择责任' }]}
          >
            <Select
              placeholder="请选择责任"
              disabled={!!editingRecord}
              showSearch
              optionFilterProp="label"
            >
              {availableLiabilities.map((liability) => (
                <Select.Option
                  key={liability.liability_id}
                  value={liability.liability_id}
                  label={liability.liability_name}
                >
                  {liability.liability_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_required"
            label="是否必选"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="必选" unCheckedChildren="可选" />
          </Form.Item>

          <Form.Item
            name="coverage_options_string"
            label="保额选项"
            rules={[
              { required: true, message: '请输入保额选项' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const options = value.split(',').map((item: string) => item.trim()).filter((item: string) => item);
                  if (options.length === 0) {
                    return Promise.reject(new Error('至少需要一个保额选项'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="多个选项用逗号分隔，如：10万,30万,50万"
          >
            <Input.TextArea
              rows={3}
              placeholder="10万,30万,50万,80万,100万"
            />
          </Form.Item>

          <Form.Item
            name="default_coverage"
            label="默认保额"
          >
            <Input placeholder="如：10万" />
          </Form.Item>

          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请输入单位' }]}
          >
            <Select placeholder="请选择单位">
              <Select.Option value="元">元</Select.Option>
              <Select.Option value="元/天">元/天</Select.Option>
              <Select.Option value="比例">比例</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="display_order"
            label="显示顺序"
            rules={[{ required: true, message: '请输入显示顺序' }]}
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PlanLiabilityConfig;

