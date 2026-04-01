import { Layout, Avatar, Badge, Dropdown } from 'antd';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

const TopBar = () => {
  const toggleSidebar = useAppStore(s => s.toggleSidebar);

  return (
    <Layout.Header className="flex items-center justify-between px-6 bg-card border-b border-border" style={{ height: 64, lineHeight: '64px', padding: '0 24px' }}>
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-muted transition-colors">
          <Menu size={20} className="text-muted-foreground" />
        </button>
        {/* <span className="text-sm font-medium text-muted-foreground">Ze</span> */}
      </div>
      <div className="flex items-center gap-4">
        <Badge count={3} size="small">
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <Bell size={18} className="text-muted-foreground" />
          </button>
        </Badge>
        <Dropdown menu={{
          items: [
            { key: 'profile', icon: <User size={14} />, label: 'Profile' },
            { type: 'divider' },
            { key: 'logout', icon: <LogOut size={14} />, label: 'Sign Out', danger: true },
          ]
        }}>
          <Avatar style={{ backgroundColor: '#4F46E5', cursor: 'pointer' }} size={36}>AU</Avatar>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default TopBar;
