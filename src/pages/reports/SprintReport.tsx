import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSprints, getProjects, getResources, getAllocations, getGoals } from '@/services/api';
import { PageHeader, ProductivityBadge, MiniProgress, GoalStatusTag } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal } from '@/types';
import { Download } from 'lucide-react';

const SprintReport = () => {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [goals, setGoals] = useState<SprintGoal[]>([]);

  useEffect(() => {
    const load = async () => {
      const [s, p, r] = await Promise.all([getSprints(), getProjects(), getResources()]);
      setSprints(s); setProjects(p); setResources(r);
      if (s.length > 0) setSelectedSprint(s[0].id);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedSprint) return;
    Promise.all([getAllocations(selectedSprint), getGoals(selectedSprint)]).then(([a, g]) => { setAllocations(a); setGoals(g); });
  }, [selectedSprint]);

  if (loading) return <Skeleton active />;

  const totalPlanned = allocations.reduce((s, a) => s + a.planned, 0);
  const totalActual = allocations.reduce((s, a) => s + a.actual, 0);
  const pct = calcProductivity(totalPlanned, totalActual);
  const goalsComplete = goals.filter(g => g.status === 'Complete').length;

  const chartData = projects.map(p => {
    const pa = allocations.filter(a => a.projectId === p.id);
    const planned = pa.reduce((s, a) => s + a.planned, 0);
    const actual = pa.reduce((s, a) => s + a.actual, 0);
    return planned > 0 ? { name: p.name, Planned: planned, Actual: actual } : null;
  }).filter(Boolean);

  const resourceData = resources.filter(r => r.active).map(r => {
    const ra = allocations.filter(a => a.resourceId === r.id);
    const planned = ra.reduce((s, a) => s + a.planned, 0);
    const actual = ra.reduce((s, a) => s + a.actual, 0);
    return { key: r.id, name: r.name, planned, actual, pct: calcProductivity(planned, actual) };
  }).filter(r => r.planned > 0);

  return (
    <div>
      <PageHeader title="Sprint Report" actions={<Button icon={<Download size={14} />}>Export CSV</Button>} />
      <div className="mb-6">
        <Select value={selectedSprint} onChange={setSelectedSprint} style={{ width: 300 }} options={sprints.map(s => ({ value: s.id, label: s.name }))} />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ t: 'Planned', v: totalPlanned }, { t: 'Actual', v: totalActual }, { t: 'Productivity', v: `${pct}%` }, { t: 'Goals Complete', v: `${goalsComplete}/${goals.length}` }].map(c => (
          <Card key={c.t} className="!rounded-lg"><p className="text-xs text-muted-foreground">{c.t}</p><p className="text-xl font-bold">{c.v}</p></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card title="Planned vs Actual by Project" className="!rounded-lg">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="Planned" fill="#4F46E5" radius={[4,4,0,0]} /><Bar dataKey="Actual" fill="#10B981" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Resource Productivity" className="!rounded-lg">
          <Table dataSource={resourceData} pagination={false} size="small" columns={[
            { title: 'Resource', dataIndex: 'name' }, { title: 'Planned', dataIndex: 'planned', width: 70 },
            { title: 'Actual', dataIndex: 'actual', width: 70 }, { title: '%', key: 'pct', render: (_, r) => <ProductivityBadge value={r.pct} /> },
          ]} />
        </Card>
      </div>
      <Card title="Sprint Goals" className="!rounded-lg">
        <Table dataSource={goals.map(g => ({ ...g, key: g.id }))} pagination={false} size="small" columns={[
          { title: 'Project', key: 'project', render: (_, g) => projects.find(p => p.id === g.projectId)?.name },
          { title: 'Goal', dataIndex: 'goal' },
          { title: 'Status', key: 'status', render: (_, g) => <GoalStatusTag status={g.status} /> },
          { title: '% Done', key: 'pct', render: (_, g) => <MiniProgress value={g.percentDone} /> },
        ]} />
      </Card>
    </div>
  );
};

export default SprintReport;
