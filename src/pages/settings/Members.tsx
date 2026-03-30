import { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, Tag, message, Skeleton } from 'antd';
import { Plus } from 'lucide-react';
import { getMembers, createMember } from '@/services/api';
import { PageHeader, ResourceAvatar, ConfirmModal } from '@/components/shared';
import { MEMBER_ROLES } from '@/constants';
import { formatDate } from '@/utils/helpers';
import type { Member } from '@/types';
import type { MemberRole } from '@/constants';

const Members = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('Developer');

  useEffect(() => { getMembers().then(m => { setMembers(m); setLoading(false); }); }, []);

  const invite = async () => {
    if (!email) { message.error('Email required'); return; }
    const m = await createMember({ name: email.split('@')[0], email, role, joinedDate: new Date().toISOString().split('T')[0] });
    setMembers([...members, m]);
    setInviteOpen(false);
    setEmail('');
    message.success('Invitation sent');
  };

  if (loading) return <Skeleton active />;

  const roleColor = (r: MemberRole) => ({ Admin: 'purple', 'Project Manager': 'blue', Developer: 'green', Viewer: 'default' }[r]);

  return (
    <div>
      <PageHeader title="Members & Roles" actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => setInviteOpen(true)}>Invite Member</Button>} />
      <Table dataSource={members.map(m => ({ ...m, key: m.id }))} pagination={false} columns={[
        { title: 'Name', key: 'name', render: (_, m) => <div className="flex items-center gap-2"><ResourceAvatar name={m.name} size={28} />{m.name}</div> },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Role', key: 'role', render: (_, m) => <Tag color={roleColor(m.role)}>{m.role}</Tag> },
        { title: 'Joined', dataIndex: 'joinedDate', render: (d: string) => formatDate(d) },
        { title: 'Actions', key: 'actions', render: () => <Button size="small" danger>Remove</Button> },
      ]} />
      <Modal title="Invite Member" open={inviteOpen} onOk={invite} onCancel={() => setInviteOpen(false)} okText="Send Invite">
        <div className="space-y-4 mt-4">
          <Input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <Select value={role} onChange={setRole} className="w-full" options={MEMBER_ROLES.map(r => ({ value: r, label: r }))} />
        </div>
      </Modal>
    </div>
  );
};

export default Members;
