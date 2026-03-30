import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSprints, getProjects, getResources, getAllocations } from '@/services/api';
import { PageHeader, ProductivityBadge } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation } from '@/types';

const ResourceReport = () => {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [selectedResource, setSelectedResource] = useState('');

  useEffect(() => {
    const load = async () => {
      const [s, p, r, a] = await Promise.all([getSprints(), getProjects(), getResources(), getAllocations()]);
      setSprints(s); setProjects(p); setResources(r); setAllocations(a);
      if (r.length > 0) setSelectedResource(r[0].id);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Skeleton active />;

  const ra = allocations.filter(a => a.resourceId === selectedResource);
  const totalPlanned = ra.reduce((s, a) => s + a.planned, 0);
  const totalActual = ra.reduce((s, a) => s + a.actual, 0);
  const sprintIds = [...new Set(ra.map(a => a.sprintId))];
  const avgPct = sprintIds.length > 0 ? sprintIds.reduce((sum, sid) => {
    const sa = ra.filter(a => a.sprintId === sid);
    return sum + calcProductivity(sa.reduce((s, a) => s + a.planned, 0), sa.reduce((s, a) => s + a.actual, 0));
  }, 0) / sprintIds.length : 0;

  const velocityData = sprints.map(s => {
    const sa = ra.filter(a => a.sprintId === s.id);
    const actual = sa.reduce((sum, a) => sum + a.actual, 0);
    return actual > 0 ? { sprint: s.name.replace('Sprint ', ''), Actual: actual } : null;
  }).filter(Boolean);

  const tableData = sprints.flatMap(s => {
    const sa = ra.filter(a => a.sprintId === s.id);
    return sa.map(a => ({
      key: a.id, sprint: s.name, project: projects.find(p => p.id === a.projectId)?.name || '',
      planned: a.planned, actual: a.actual, pct: calcProductivity(a.planned, a.actual),
    }));
  });

  return (
    <div>
      <PageHeader title="Resource Report" />
      <div className="mb-6">
        <Select value={selectedResource} onChange={setSelectedResource} style={{ width: 240 }}
          options={resources.map(r => ({ value: r.id, label: r.name }))} />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ t: 'Sprints', v: sprintIds.length }, { t: 'Avg Productivity', v: `${avgPct.toFixed(1)}%` }, { t: 'Total Points', v: totalActual }].map(c => (
          <Card key={c.t} className="!rounded-lg"><p className="text-xs text-muted-foreground">{c.t}</p><p className="text-xl font-bold">{c.v}</p></Card>
        ))}
      </div>
      <Card title="Velocity Trend" className="!rounded-lg mb-6">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={velocityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sprint" tick={{ fontSize: 11 }} /><YAxis /><Tooltip />
            <Line type="monotone" dataKey="Actual" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5' }} /></LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Sprint Breakdown" className="!rounded-lg">
        <Table dataSource={tableData} pagination={false} size="small" columns={[
          { title: 'Sprint', dataIndex: 'sprint' }, { title: 'Project', dataIndex: 'project' },
          { title: 'Planned', dataIndex: 'planned' }, { title: 'Actual', dataIndex: 'actual' },
          { title: '%', key: 'pct', render: (_, r) => <ProductivityBadge value={r.pct} /> },
        ]} />
      </Card>
    </div>
  );
};

export default ResourceReport;
