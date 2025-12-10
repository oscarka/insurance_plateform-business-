// 系统日志页面
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
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface SystemLog {
  log_id: number;
  log_type: string;
  module: string;
  action: string;
  operator: string;
  content: string;
  ip_address: string;
  created_at: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    logType: '',
    module: '',
    dateRange: null as any,
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      const mockData: SystemLog[] = [
        {
          log_id: 1,
          log_type: '操作日志',
          module: '产品管理',
          action: '创建产品',
          operator: 'admin',
          content: '创建产品：雇主责任险A',
          ip_address: '192.168.1.100',
          created_at: '2025-01-01 10:00:00',
        },
        {
          log_id: 2,
          log_type: '操作日志',
          module: '方案管理',
          action: '更新方案',
          operator: 'admin',
          content: '更新方案：方案一',
          ip_address: '192.168.1.100',
          created_at: '2025-01-01 11:00:00',
        },
        {
          log_id: 3,
          log_type: '错误日志',
          module: 'API接口',
          action: '接口调用失败',
          operator: 'system',
          content: '保费计算接口调用失败：参数错误',
          ip_address: '192.168.1.100',
          created_at: '2025-01-01 12:00:00',
        },
      ];
      setLogs(mockData);
    } catch (error) {
      message.error('获取系统日志失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchLogs();
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      logType: '',
      module: '',
      dateRange: null,
    });
    fetchLogs();
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const getLogTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string }> = {
      操作日志: { color: 'blue' },
      错误日志: { color: 'red' },
      登录日志: { color: 'green' },
      系统日志: { color: 'default' },
    };
    const typeInfo = typeMap[type] || { color: 'default' };
    return <Tag color={typeInfo.color}>{type}</Tag>;
  };

  const columns: ColumnsType<SystemLog> = [
    {
      title: '日志ID',
      dataIndex: 'log_id',
      key: 'log_id',
      width: 100,
    },
    {
      title: '日志类型',
      dataIndex: 'log_type',
      key: 'log_type',
      width: 120,
      render: (type) => getLogTypeTag(type),
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 150,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 150,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 150,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
  ];

  return (
    <div>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="搜索内容、操作人"
              style={{ width: 300 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="日志类型"
              style={{ width: 150 }}
              value={searchParams.logType}
              onChange={(value) => setSearchParams({ ...searchParams, logType: value })}
              allowClear
            >
              <Select.Option value="操作日志">操作日志</Select.Option>
              <Select.Option value="错误日志">错误日志</Select.Option>
              <Select.Option value="登录日志">登录日志</Select.Option>
              <Select.Option value="系统日志">系统日志</Select.Option>
            </Select>
            <Select
              placeholder="模块"
              style={{ width: 150 }}
              value={searchParams.module}
              onChange={(value) => setSearchParams({ ...searchParams, module: value })}
              allowClear
            >
              <Select.Option value="产品管理">产品管理</Select.Option>
              <Select.Option value="方案管理">方案管理</Select.Option>
              <Select.Option value="投保单管理">投保单管理</Select.Option>
              <Select.Option value="API接口">API接口</Select.Option>
            </Select>
            <RangePicker
              value={searchParams.dateRange}
              onChange={(dates) => setSearchParams({ ...searchParams, dateRange: dates })}
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="log_id"
            scroll={{ x: 1500 }}
            pagination={{
              total: logs.length,
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default SystemLogs;

