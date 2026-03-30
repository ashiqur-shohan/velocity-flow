import { Layout, Avatar, Badge, Dropdown, message } from 'antd';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '@/contexts/AuthContext';
import { useOrg } from '@/contexts/OrgContext';

const TopBar = () => {
  const navigate = useNavigate();
  const toggleSidebar = useAppStore(s => s.toggleSidebar);
  const { user, signOut } = useAuth();
  const { currentOrg } = useOrg();

  const handleLogout = async () => {
    try {
      await signOut();
      message.success('Signed out');
      navigate('/login');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const menuItems = {
    items: [
      { key: 'profile', icon: <User size={14} />, label: 'Profile' },
      { type: 'divider' } as any,
      { key: 'logout', icon: <LogOut size={14} />, label: 'Sign Out', danger: true, onClick: handleLogout },
    ]
  };

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'VT';

  return (
    <Layout.Header className="flex items-center justify-between px-6 bg-card border-b border-border" style={{ height: 64, lineHeight: '64px', padding: '0 24px' }}>
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-muted transition-colors">
          <Menu size={20} className="text-muted-foreground" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">{currentOrg?.name || 'VeloTrack Organization'}</span>
      </div>
      <div className="flex items-center gap-4">
        <Badge count={0} size="small">
          <button className="p-2 rounded-md hover:bg-muted transition-colors">
            <Bell size={18} className="text-muted-foreground" />
          </button>
        </Badge>
        <Dropdown menu={menuItems}>
          <Avatar style={{ backgroundColor: '#4F46E5', cursor: 'pointer' }} size={36}>{initials}</Avatar>
        </Dropdown>
      </div>
    </Layout.Header>
  );
};

export default TopBar;
