import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  message,
  Tag,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRates } from '../utils/api';

interface Rate {
  rate_id: number;
  product_id?: number;
  product_name: string;
  plan_id?: number;
  plan_name?: string;
  liability_id?: number;
  liability_name: string;
  job_class: string;
  coverage_amount: string;
  base_rate?: number;
  rate_factor?: number;
  monthly_premium?: number;
  annual_premium?: number;
  premium_type: string;
  min_premium?: number;
  max_premium?: number;
  effective_date: string;
  expiry_date?: string;
  status?: string;
}

const RateList: React.FC = () => {
  const [dataSource, setDataSource] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);
  const [productFilter, setProductFilter] = useState<string>('');
  const [premiumTypeFilter, setPremiumTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [productFilter, premiumTypeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (productFilter) params.product_id = productFilter;
      if (premiumTypeFilter) params.premium_type = premiumTypeFilter;
      
      const response = await getRates(params);
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
      console.error('获取费率列表失败:', error);
      message.error('获取费率列表失败: ' + (error.message || '未知错误'));
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Rate> = [
    {
      title: '产品',
      dataIndex: 'product_name',
      width: 150,
    },
    {
      title: '方案',
      dataIndex: 'plan_name',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '责任',
      dataIndex: 'liability_name',
      width: 200,
    },
    {
      title: '职业类别',
      dataIndex: 'job_class',
      width: 120,
    },
    {
      title: '保额',
      dataIndex: 'coverage_amount',
      width: 120,
      render: (text, record) => {
        if (record.premium_type === '固定保费') {
          return <Tag color="blue">固定保费</Tag>;
        }
        return text;
      },
    },
    {
      title: '费率类型',
      dataIndex: 'premium_type',
      width: 120,
      render: (type: string) => (
        <Tag color={type === '固定保费' ? 'green' : 'orange'}>
          {type || '费率计算'}
        </Tag>
      ),
    },
    {
      title: '基础费率',
      dataIndex: 'base_rate',
      width: 120,
      render: (rate, record) => {
        if (record.premium_type === '固定保费') {
          return record.monthly_premium 
            ? `月: ¥${record.monthly_premium} / 年: ¥${record.annual_premium}`
            : '-';
        }
        if (rate == null || rate === undefined || rate === '') return '-';
        const numRate = typeof rate === 'number' ? rate : parseFloat(rate);
        return isNaN(numRate) ? '-' : numRate.toFixed(4);
      },
    },
    {
      title: '费率系数',
      dataIndex: 'rate_factor',
      width: 100,
      render: (factor, record) => {
        if (record.premium_type === '固定保费') return '-';
        if (factor == null || factor === undefined || factor === '') return '-';
        const numFactor = typeof factor === 'number' ? factor : parseFloat(factor);
        return isNaN(numFactor) ? '-' : numFactor.toFixed(4);
      },
    },
    {
      title: '生效日期',
      dataIndex: 'effective_date',
      width: 120,
    },
    {
      title: '失效日期',
      dataIndex: 'expiry_date',
      width: 120,
      render: (date) => date || '-',
    },
    {
      title: '操作',
      width: 150,
      render: (_, _record) => (
        <Button 
          type="link" 
          onClick={() => {
            message.info('编辑功能开发中，如需修改费率请联系管理员');
          }}
        >
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="费率配置"
        extra={
          <Space>
            <Select 
              placeholder="选择产品" 
              style={{ width: 200 }} 
              allowClear
              value={productFilter}
              onChange={setProductFilter}
            >
              <Select.Option value="1">雇主责任险A</Select.Option>
            </Select>
            <Select 
              placeholder="费率类型" 
              style={{ width: 150 }} 
              allowClear
              value={premiumTypeFilter}
              onChange={setPremiumTypeFilter}
            >
              <Select.Option value="费率计算">费率计算</Select.Option>
              <Select.Option value="固定保费">固定保费</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />}>
              添加费率
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="rate_id"
        />
      </Card>
    </div>
  );
};

export default RateList;

