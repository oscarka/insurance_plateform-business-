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
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getApplications, getApplication } from '../utils/api';

const { RangePicker } = DatePicker;

interface Application {
  application_id: number;
  application_no: string;
  company_id: number;
  company_name: string;
  credit_code?: string;
  product_id: number;
  product_name: string;
  product_code?: string;
  total_premium: number;
  insured_count: number;
  status: string;
  effective_date: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
  insurance_company_code?: string;
  insurance_company_name?: string;
  insurance_company?: string; // 兼容旧字段名
  submitted_at?: string;
  underwritten_at?: string;
  draft_data?: any; // 草稿数据
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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, [pagination.current, pagination.pageSize]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      
      if (searchParams.keyword) {
        params.keyword = searchParams.keyword;
      }
      if (searchParams.status) {
        params.status = searchParams.status;
      }
      if (searchParams.dateRange && searchParams.dateRange[0] && searchParams.dateRange[1]) {
        params.start_date = searchParams.dateRange[0].format('YYYY-MM-DD');
        params.end_date = searchParams.dateRange[1].format('YYYY-MM-DD');
      }
      
      const result = await getApplications(params);
      
      if (result.success && result.data) {
        setApplications(result.data);
        if (result.pagination) {
          setPagination({
            current: result.pagination.page,
            pageSize: result.pagination.page_size,
            total: result.pagination.total,
          });
        }
      } else {
        setApplications([]);
      }
    } catch (error: any) {
      console.error('获取投保单列表失败:', error);
      message.error('获取投保单列表失败: ' + (error.message || '未知错误'));
      setApplications([]);
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

  const handleViewDetail = async (record: Application) => {
    try {
      const detail = await getApplication(record.application_id);
      if (detail.success && detail.data) {
        setSelectedApplication(detail.data);
      } else {
        setSelectedApplication(record);
      }
      setDetailVisible(true);
    } catch (error: any) {
      console.error('获取投保单详情失败:', error);
      message.warning('获取详情失败，显示基本信息');
      setSelectedApplication(record);
      setDetailVisible(true);
    }
  };
  
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
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
      dataIndex: 'insurance_company_name',
      key: 'insurance_company_name',
      width: 120,
      render: (text) => text || '-',
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
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
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
              {selectedApplication.insurance_company_name || selectedApplication.insurance_company_code || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="总保费">
              ¥{selectedApplication.total_premium.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="被保人数">
              {selectedApplication.insured_count} 人
            </Descriptions.Item>
            <Descriptions.Item label="生效日期">
              {selectedApplication.effective_date ? dayjs(selectedApplication.effective_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="到期日期">
              {selectedApplication.expiry_date ? dayjs(selectedApplication.expiry_date).format('YYYY-MM-DD') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {selectedApplication.created_at ? dayjs(selectedApplication.created_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {selectedApplication.updated_at ? dayjs(selectedApplication.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
            </Descriptions.Item>
            {selectedApplication.credit_code && (
              <Descriptions.Item label="统一社会信用代码" span={2}>
                {selectedApplication.credit_code}
              </Descriptions.Item>
            )}
            {selectedApplication.product_code && (
              <Descriptions.Item label="产品代码">
                {selectedApplication.product_code}
              </Descriptions.Item>
            )}
            {selectedApplication.submitted_at && (
              <Descriptions.Item label="提交时间">
                {dayjs(selectedApplication.submitted_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedApplication.underwritten_at && (
              <Descriptions.Item label="核保时间" span={2}>
                {dayjs(selectedApplication.underwritten_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsList;

