import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, FolderOpen, Users, BarChart3, Settings, FileText, UserCog } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

const { Sider } = Layout;

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore(s => s.sidebarCollapsed);

  const menuItems = [
    { key: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { key: '/sprints', icon: <Zap size={18} />, label: 'Sprints' },
    { key: '/projects', icon: <FolderOpen size={18} />, label: 'Projects' },
    { key: '/resources', icon: <Users size={18} />, label: 'Resources' },
    {
      key: 'reports', icon: <BarChart3 size={18} />, label: 'Reports',
      children: [
        { key: '/reports/sprint', icon: <FileText size={16} />, label: 'Sprint Report' },
        { key: '/reports/resource', icon: <UserCog size={16} />, label: 'Resource Report' },
        { key: '/reports/project', icon: <FolderOpen size={16} />, label: 'Project Report' },
      ],
    },
    {
      key: 'settings', icon: <Settings size={18} />, label: 'Settings',
      children: [
        { key: '/settings', icon: <Settings size={16} />, label: 'Organization' },
        { key: '/settings/members', icon: <Users size={16} />, label: 'Members & Roles' },
      ],
    },
  ];

  const selectedKey = menuItems.flatMap(i => i.children ? i.children.map(c => c.key) : [i.key])
    .find(k => location.pathname === k || (k !== '/dashboard' && location.pathname.startsWith(k))) || '/dashboard';

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      collapsedWidth={80}
      className="fixed left-0 top-0 bottom-0 z-50"
      style={{ background: '#0F172A', borderRight: '1px solid #1E293B' }}
    >
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight" style={{ color: '#818CF8' }}>
            Velo<span style={{ color: '#F8FAFC' }}>Track</span>
          </span>
        )}
        {collapsed && <span className="text-xl font-bold" style={{ color: '#818CF8' }}>V</span>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['reports', 'settings']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ background: 'transparent', borderRight: 0, color: '#94A3B8', marginTop: 8 }}
        theme="dark"
      />
    </Sider>
  );
};

export default AppSidebar;
