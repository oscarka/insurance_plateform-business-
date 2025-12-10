import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  BankOutlined,
  FileTextOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>仪表盘</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="保司数量"
              value={5}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品数量"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="方案数量"
              value={36}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已配置责任"
              value={128}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;

