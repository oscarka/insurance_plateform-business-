import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Plan {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  product_name: string;
  company_name: string;
  job_class_range: string;
  status: string;
}

const PlanList: React.FC = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [productFilter, setProductFilter] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [companyFilter, productFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: 调用API获取方案列表
      // const response = await api.getPlans({ company: companyFilter, product: productFilter });
      // setDataSource(response.data);
      
      // 模拟数据
      setDataSource([
        {
          plan_id: 1,
          plan_code: 'PLAN_01',
          plan_name: '方案一',
          product_name: '雇主责任险A',
          company_name: '利宝保险',
          job_class_range: '1~3类',
          status: '启用',
        },
        {
          plan_id: 2,
          plan_code: 'PLAN_02',
          plan_name: '方案二',
          product_name: '雇主责任险A',
          company_name: '利宝保险',
          job_class_range: '4~5类',
          status: '启用',
        },
      ]);
    } catch (error) {
      message.error('获取方案列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigLiability = (planId: number) => {
    navigate(`/admin/plans/${planId}/liabilities`);
  };

  const columns: ColumnsType<Plan> = [
    {
      title: '方案代码',
      dataIndex: 'plan_code',
      width: 150,
    },
    {
      title: '方案名称',
      dataIndex: 'plan_name',
      width: 150,
    },
    {
      title: '保司',
      dataIndex: 'company_name',
      width: 150,
    },
    {
      title: '产品',
      dataIndex: 'product_name',
      width: 200,
    },
    {
      title: '职业类别范围',
      dataIndex: 'job_class_range',
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
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => handleConfigLiability(record.plan_id)}
          >
            配置责任
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
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
        title="方案管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            添加方案
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="选择保司"
            style={{ width: 200 }}
            allowClear
            value={companyFilter}
            onChange={setCompanyFilter}
          >
            <Select.Option value="LIBO">利宝保险</Select.Option>
            <Select.Option value="PINGAN">平安保险</Select.Option>
          </Select>
          <Select
            placeholder="选择产品"
            style={{ width: 200 }}
            allowClear
            value={productFilter}
            onChange={setProductFilter}
          >
            <Select.Option value="PRODUCT_A">雇主责任险A</Select.Option>
          </Select>
          <Button onClick={fetchData}>查询</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="plan_id"
        />
      </Card>
    </div>
  );
};

export default PlanList;

