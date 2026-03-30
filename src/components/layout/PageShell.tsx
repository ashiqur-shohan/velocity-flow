import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { useAppStore } from '@/store/appStore';

const PageShell = () => {
  const collapsed = useAppStore(s => s.sidebarCollapsed);

  return (
    <Layout className="min-h-screen">
      <AppSidebar />
      <Layout className="transition-all duration-200" style={{ marginLeft: collapsed ? 80 : 240 }}>
        <TopBar />
        <Layout.Content className="p-6 bg-background min-h-[calc(100vh-64px)]">
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default PageShell;
