import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CalendarOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '../auth/AuthGuard';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrganization?: boolean;
  allowedRoles?: string[];
}

export function AppLayout({
  children,
  requireAuth = true,
  requireOrganization = true,
  allowedRoles = [],
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, organization, signOut } = useAuth();
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/appointments',
      icon: <CalendarOutlined />,
      label: <Link href="/appointments">Agendamentos</Link>,
    },
    {
      key: '/customers',
      icon: <TeamOutlined />,
      label: <Link href="/customers">Clientes</Link>,
    },
    {
      key: '/services',
      icon: <ShopOutlined />,
      label: <Link href="/services">Serviços</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Configurações</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'organization',
      icon: <ShopOutlined />,
      label: 'Minha Organização',
      onClick: () => router.push('/organization'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: signOut,
    },
  ];

  return (
    <AuthGuard
      requireAuth={requireAuth}
      requireOrganization={requireOrganization}
      allowedRoles={allowedRoles}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="p-4">
            <h1 className="text-white text-xl font-bold truncate">
              {organization?.name || 'ChronosApp'}
            </h1>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[router.pathname]}
            items={menuItems}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <div className="flex justify-between items-center px-4 h-full">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {user?.full_name}
                </span>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Avatar
                    className="cursor-pointer"
                    icon={<UserOutlined />}
                  />
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: colorBgContainer,
              borderRadius: 8,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </AuthGuard>
  );
}
