import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, FolderOpen, Users, BarChart3, Settings, FileText, UserCog, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

const { Sider } = Layout;

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = useAppStore(s => s.sidebarCollapsed);
  const toggleSidebar = useAppStore(s => s.toggleSidebar);

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
      <div className={`h-16 flex items-center border-b border-sidebar-border transition-all duration-300 ${collapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
        <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? 'w-auto' : 'w-full'}`}>
          <button 
            onClick={collapsed ? toggleSidebar : undefined}
            className={`transition-all duration-500 transform outline-none border-none bg-transparent p-0 ${collapsed ? 'scale-110 cursor-pointer hover:brightness-125 flex items-center justify-center' : 'scale-100 rotate-[360deg] cursor-default'}`}
          >
            <Zap size={24} fill="#818CF8" style={{ color: '#818CF8' }} />
          </button>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-[#818CF8] whitespace-nowrap animate-in fade-in slide-in-from-left-4 duration-500">
              Zeus
            </span>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={toggleSidebar} 
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
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
