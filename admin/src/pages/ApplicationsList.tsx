// 投保单管理页面
import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Input,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface Application {
  application_id: number;
  application_no: string;
  company_name: string;
  product_name: string;
  total_premium: number;
  insured_count: number;
  status: string;
  effective_date: string;
  expiry_date: string;
  created_at: string;
  insurance_company: string;
}

const ApplicationsList: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      const mockData: Application[] = [
        {
          application_id: 1,
          application_no: 'APP20250101001',
          company_name: '测试企业有限公司',
          product_name: '雇主责任险A',
          total_premium: 8100,
          insured_count: 10,
          status: '待核保',
          effective_date: '2025-01-01',
          expiry_date: '2026-01-01',
          created_at: '2025-01-01 10:00:00',
          insurance_company: '利宝保险',
        },
      ];
      setApplications(mockData);
    } catch (error) {
      message.error('获取投保单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchApplications();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      status: '',
      dateRange: null,
    });
    fetchApplications();
  };

  const handleViewDetail = (record: Application) => {
    setSelectedApplication(record);
    setDetailVisible(true);
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      草稿: { color: 'default', text: '草稿' },
      待核保: { color: 'processing', text: '待核保' },
      核保中: { color: 'warning', text: '核保中' },
      已通过: { color: 'success', text: '已通过' },
      已拒绝: { color: 'error', text: '已拒绝' },
      已生效: { color: 'success', text: '已生效' },
      已过期: { color: 'default', text: '已过期' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns: ColumnsType<Application> = [
    {
      title: '投保单号',
      dataIndex: 'application_no',
      key: 'application_no',
      width: 180,
      fixed: 'left',
    },
    {
      title: '企业名称',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 150,
    },
    {
      title: '保司',
      dataIndex: 'insurance_company',
      key: 'insurance_company',
      width: 120,
    },
    {
      title: '总保费',
      dataIndex: 'total_premium',
      key: 'total_premium',
      width: 120,
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      title: '被保人数',
      dataIndex: 'insured_count',
      key: 'insured_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '生效日期',
      dataIndex: 'effective_date',
      key: 'effective_date',
      width: 120,
    },
    {
      title: '到期日期',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
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
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索投保单号、企业名称"
              style={{ width: 300 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="状态"
              style={{ width: 150 }}
              value={searchParams.status}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
              allowClear
            >
              <Select.Option value="草稿">草稿</Select.Option>
              <Select.Option value="待核保">待核保</Select.Option>
              <Select.Option value="核保中">核保中</Select.Option>
              <Select.Option value="已通过">已通过</Select.Option>
              <Select.Option value="已拒绝">已拒绝</Select.Option>
              <Select.Option value="已生效">已生效</Select.Option>
            </Select>
            <RangePicker
              value={searchParams.dateRange}
              onChange={(dates) => setSearchParams({ ...searchParams, dateRange: dates as any })}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={applications}
            loading={loading}
            rowKey="application_id"
            scroll={{ x: 1500 }}
            pagination={{
              total: applications.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      <Modal
        title="投保单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="投保单号">
              {selectedApplication.application_no}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(selectedApplication.status)}
            </Descriptions.Item>
            <Descriptions.Item label="企业名称">
              {selectedApplication.company_name}
            </Descriptions.Item>
            <Descriptions.Item label="产品名称">
              {selectedApplication.product_name}
            </Descriptions.Item>
            <Descriptions.Item label="保司">
              {selectedApplication.insurance_company}
            </Descriptions.Item>
            <Descriptions.Item label="总保费">
              ¥{selectedApplication.total_premium.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="被保人数">
              {selectedApplication.insured_count} 人
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {selectedApplication.effective_date}
            </Descriptions.Item>
            <Descriptions.Item label="到期日期">
              {selectedApplication.expiry_date}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {selectedApplication.created_at}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsList;

