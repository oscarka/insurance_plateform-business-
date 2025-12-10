import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ApiConfig {
  config_id: number;
  company_code: string;
  company_name: string;
  channel_code: string;
  api_base_url: string;
  environment: string;
  status: string;
}

const ApiConfigList: React.FC = () => {
  const [dataSource, setDataSource] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API
      // const response = await api.getApiConfigs();
      // setDataSource(response.data);
      
      // 模拟数据
      setDataSource([
        {
          config_id: 1,
          company_code: 'LIBO',
          company_name: '利宝保险',
          channel_code: 'LEXUAN',
          api_base_url: 'https://api.libo.com',
          environment: 'production',
          status: '启用',
        },
      ]);
    } catch (error) {
      message.error('获取接口配置列表失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ApiConfig> = [
    {
      title: '保司',
      dataIndex: 'company_name',
      width: 150,
    },
    {
      title: '渠道代码',
      dataIndex: 'channel_code',
      width: 150,
    },
    {
      title: '接口地址',
      dataIndex: 'api_base_url',
      width: 250,
    },
    {
      title: '环境',
      dataIndex: 'environment',
      width: 100,
      render: (env: string) => (
        <Tag color={env === 'production' ? 'green' : 'orange'}>
          {env === 'production' ? '生产' : '测试'}
        </Tag>
      ),
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
      render: () => (
        <Button type="link" icon={<EditOutlined />}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="接口配置"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            添加配置
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="config_id"
        />
      </Card>
    </div>
  );
};

export default ApiConfigList;

