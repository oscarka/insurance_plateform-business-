import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
} from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  ApiOutlined,
  ImportOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  BlockOutlined,
  BarChartOutlined,
  FileSearchOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuProps['items'] = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'config',
      icon: <AppstoreOutlined />,
      label: '配置管理',
      children: [
        {
          key: '/admin/insurance-companies',
          icon: <BankOutlined />,
          label: '保司管理',
        },
        {
          key: '/admin/liabilities',
          icon: <SafetyOutlined />,
          label: '责任管理',
        },
        {
          key: '/admin/clauses',
          icon: <FileProtectOutlined />,
          label: '条款管理',
        },
        {
          key: '/admin/products',
          icon: <FileTextOutlined />,
          label: '产品管理',
        },
        {
          key: '/admin/plans',
          icon: <FileTextOutlined />,
          label: '方案管理',
        },
        {
          key: '/admin/rates',
          icon: <CalculatorOutlined />,
          label: '费率配置',
        },
        {
          key: '/admin/api-configs',
          icon: <ApiOutlined />,
          label: '接口配置',
        },
      ],
    },
    {
      key: '/admin/config-import',
      icon: <ImportOutlined />,
      label: '配置导入',
    },
    {
      key: 'business',
      icon: <FileTextOutlined />,
      label: '业务管理',
      children: [
        {
          key: '/admin/applications',
          icon: <FileTextOutlined />,
          label: '投保单管理',
        },
        {
          key: '/admin/companies',
          icon: <TeamOutlined />,
          label: '企业客户管理',
        },
      ],
    },
    {
      key: '/admin/interception-rules',
      icon: <BlockOutlined />,
      label: '拦截规则管理',
    },
    {
      key: '/admin/statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
    {
      key: '/admin/system-logs',
      icon: <FileSearchOutlined />,
      label: '系统日志',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('admin_token');
      navigate('/login');
    } else if (key === 'profile') {
      // 跳转到个人中心
    } else {
      navigate(key);
    }
  };

  const handleMenuSelect = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={240}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {!collapsed ? (
            <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
              保险平台管理
            </Text>
          ) : (
            <Text strong style={{ fontSize: 20 }}>
              管理
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuSelect}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div></div>
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <Text>管理员</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

