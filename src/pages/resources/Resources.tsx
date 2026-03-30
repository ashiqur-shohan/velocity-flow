import { useEffect, useState } from 'react';
import { Table, Button, Drawer, Input, Switch, Tag, message, Skeleton } from 'antd';
import { Plus } from 'lucide-react';
import { useResources } from '@/hooks/useResources';
import { createResource, updateResource } from '@/services/resourceService';
import { useOrg } from '@/contexts/OrgContext';
import { PageHeader, ResourceAvatar } from '@/components/shared';
import type { Resource } from '@/types';

const Resources = () => {
  const { currentOrg } = useOrg();
  const { resources, loading: resourcesLoading, refetch: refetchResources } = useResources();
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRes, setEditRes] = useState<Resource | null>(null);
  const [form, setForm] = useState({ name: '', designation: '', team: '', active: true });

  const openCreate = () => { setEditRes(null); setForm({ name: '', designation: '', team: '', active: true }); setDrawerOpen(true); };
  const openEdit = (r: Resource) => { setEditRes(r); setForm({ name: r.name, designation: r.designation, team: r.team, active: r.active }); setDrawerOpen(true); };

  const save = async () => {
    if (!form.name || !currentOrg) { message.error('Name required'); return; }
    try {
      setLoading(true);
      if (editRes) {
        await updateResource(editRes.id, form);
      } else {
        await createResource(currentOrg.id, form);
      }
      await refetchResources();
      setDrawerOpen(false);
      message.success('Saved');
    } catch (err: any) {
      message.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (resourcesLoading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div>
      <PageHeader title="Resources" actions={<Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>Add Resource</Button>} />
      <Table
        dataSource={resources.map(r => ({ ...r, key: r.id }))}
        rowClassName={(r) => !r.active ? 'opacity-50' : ''}
        columns={[
          { title: 'Name', key: 'name', render: (_, r) => (
            <div className="flex items-center gap-2">
              <ResourceAvatar name={r.name} size={28} />
              <span className={!r.active ? 'line-through' : ''}>{r.name}</span>
            </div>
          )},
          { title: 'Designation', dataIndex: 'designation' },
          { title: 'Team', dataIndex: 'team' },
          { title: 'Status', key: 'status', render: (_, r) => <Tag color={r.active ? 'green' : 'default'}>{r.active ? 'Active' : 'Inactive'}</Tag> },
          { title: 'Actions', key: 'actions', render: (_, r) => <Button size="small" onClick={() => openEdit(r)}>Edit</Button> },
        ]}
        pagination={false}
      />
      <Drawer title={editRes ? 'Edit Resource' : 'Add Resource'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Designation</label><Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Team</label><Input value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} /></div>
          <div className="flex items-center gap-2"><Switch checked={form.active} onChange={v => setForm({ ...form, active: v })} /><span>Active</span></div>
          <Button type="primary" block onClick={save}>Save</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Resources;
