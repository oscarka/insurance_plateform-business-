// 数据统计页面
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Space, Button } from 'antd';
import {
  FileTextOutlined,
  BankOutlined,
  UserOutlined,
  DollarOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
// 图表组件 - 如果@ant-design/plots不可用，可以使用其他图表库
// import { Column } from '@ant-design/plots';

const { RangePicker } = DatePicker;

interface StatData {
  totalApplications: number;
  totalCompanies: number;
  totalPremium: number;
  totalInsured: number;
  monthlyData: Array<{
    month: string;
    applications: number;
    premium: number;
  }>;
  productStats: Array<{
    product_name: string;
    count: number;
    premium: number;
  }>;
}

const Statistics: React.FC = () => {
  const [statData, setStatData] = useState<StatData>({
    totalApplications: 0,
    totalCompanies: 0,
    totalPremium: 0,
    totalInsured: 0,
    monthlyData: [],
    productStats: [],
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // TODO: 替换为实际API调用
      const mockData: StatData = {
        totalApplications: 156,
        totalCompanies: 45,
        totalPremium: 1250000,
        totalInsured: 1250,
        monthlyData: [
          { month: '2025-01', applications: 12, premium: 120000 },
          { month: '2025-02', applications: 15, premium: 150000 },
          { month: '2025-03', applications: 18, premium: 180000 },
          { month: '2025-04', applications: 20, premium: 200000 },
          { month: '2025-05', applications: 22, premium: 220000 },
          { month: '2025-06', applications: 25, premium: 250000 },
        ],
        productStats: [
          { product_name: '雇主责任险A', count: 120, premium: 960000 },
          { product_name: '团体意外险B', count: 36, premium: 290000 },
        ],
      };
      setStatData(mockData);
    } catch (error) {
      console.error('获取统计数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    data: statData.monthlyData,
    xField: 'month',
    yField: 'applications',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#AAA',
      },
    },
  };

  const productColumns = [
    {
      title: '产品名称',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: '投保单数',
      dataIndex: 'count',
      key: 'count',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '总保费',
      dataIndex: 'premium',
      key: 'premium',
      render: (value: number) => `¥${value.toLocaleString()}`,
    },
  ];

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchStatistics}>
              刷新
            </Button>
          </Space>
        </Card>

        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总投保单数"
                value={statData.totalApplications}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="企业客户数"
                value={statData.totalCompanies}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总保费"
                value={statData.totalPremium}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                suffix="元"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总被保人数"
                value={statData.totalInsured}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Card title="月度投保趋势" loading={loading}>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>图表功能需要安装 @ant-design/plots 或使用其他图表库</p>
                {/* <Column {...chartConfig} height={300} /> */}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="产品统计" loading={loading}>
              <Table
                columns={productColumns}
                dataSource={statData.productStats}
                pagination={false}
                size="small"
                rowKey="product_name"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Statistics;

