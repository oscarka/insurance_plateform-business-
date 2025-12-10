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

interface Product {
  product_id: number;
  product_code: string;
  product_name: string;
  product_type: string;
  company_name: string;
  status: string;
}

const ProductList: React.FC = () => {
  const [dataSource, setDataSource] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [companyFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API
      // const response = await api.getProducts({ company: companyFilter });
      // setDataSource(response.data);
      
      // 模拟数据
      setDataSource([
        {
          product_id: 1,
          product_code: 'PRODUCT_A',
          product_name: '雇主责任险A',
          product_type: '雇主责任险',
          company_name: '利宝保险',
          status: '启用',
        },
      ]);
    } catch (error) {
      message.error('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: '产品代码',
      dataIndex: 'product_code',
      width: 150,
    },
    {
      title: '产品名称',
      dataIndex: 'product_name',
      width: 200,
    },
    {
      title: '产品类型',
      dataIndex: 'product_type',
      width: 150,
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
        title="产品管理"
        extra={
          <Space>
            <Select
              placeholder="选择保司"
              style={{ width: 200 }}
              allowClear
              value={companyFilter}
              onChange={setCompanyFilter}
            >
              <Select.Option value="LIBO">利宝保险</Select.Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />}>
              添加产品
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="product_id"
        />
      </Card>
    </div>
  );
};

export default ProductList;

