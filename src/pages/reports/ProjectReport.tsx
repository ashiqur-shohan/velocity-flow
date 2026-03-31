import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton, DatePicker } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { getSprints, getProjects, getResources, getAllocations, getGoals } from '@/services/api';
import { PageHeader, ProductivityBadge, GoalStatusTag } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal } from '@/types';

const ProjectReport = () => {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  useEffect(() => {
    const load = async () => {
      const [s, p, r, a, g] = await Promise.all([getSprints(), getProjects(), getResources(), getAllocations(), getGoals()]);
      setSprints(s); setProjects(p); setResources(r); setAllocations(a); setGoals(g);
      if (p.length > 0) setSelectedProject(p[0].id);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Skeleton active />;

  const filteredSprints = sprints.filter(s => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return true;
    const sprintStart = new Date(s.startDate).getTime();
    const sprintEnd = new Date(s.endDate).getTime();
    const filterStart = dateRange[0].startOf('day').valueOf();
    const filterEnd = dateRange[1].endOf('day').valueOf();
    return (sprintStart >= filterStart && sprintStart <= filterEnd) || (sprintEnd >= filterStart && sprintEnd <= filterEnd) || (sprintStart <= filterStart && sprintEnd >= filterEnd);
  });
  const filteredSprintIds = new Set(filteredSprints.map(s => s.id));

  const pa = allocations.filter(a => a.projectId === selectedProject && filteredSprintIds.has(a.sprintId));
  const pg = goals.filter(g => g.projectId === selectedProject && filteredSprintIds.has(g.sprintId));
  const sprintIds = [...new Set(pa.map(a => a.sprintId))];
  const totalPlanned = pa.reduce((s, a) => s + a.planned, 0);
  const totalActual = pa.reduce((s, a) => s + a.actual, 0);

  const chartData = filteredSprints.map(s => {
    const sa = pa.filter(a => a.sprintId === s.id);
    const planned = sa.reduce((sum, a) => sum + a.planned, 0);
    const actual = sa.reduce((sum, a) => sum + a.actual, 0);
    return planned > 0 ? { sprint: s.name.replace('Sprint ', ''), Planned: planned, Actual: actual } : null;
  }).filter(Boolean);

  const bugChartData = filteredSprints.map(s => {
    const sg = pg.filter(g => g.sprintId === s.id);
    const bugs = sg.reduce((sum, g) => sum + (g.bugsIdentified || 0), 0);
    const sa = pa.filter(a => a.sprintId === s.id);
    const planned = sa.reduce((sum, a) => sum + a.planned, 0);
    return planned > 0 || bugs > 0 ? { sprint: s.name.replace('Sprint ', ''), Bugs: bugs } : null;
  }).filter(Boolean);

  const resourceData = resources.filter(r => r.active).map(r => {
    const ra = pa.filter(a => a.resourceId === r.id);
    const planned = ra.reduce((s, a) => s + a.planned, 0);
    const actual = ra.reduce((s, a) => s + a.actual, 0);
    return planned > 0 ? { key: r.id, name: r.name, planned, actual, pct: calcProductivity(planned, actual) } : null;
  }).filter(Boolean) as { key: string; name: string; planned: number; actual: number; pct: number }[];

  return (
    <div>
      <PageHeader title="Project Report" />
      <div className="mb-6 flex gap-4 flex-wrap">
        <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 280 }}
          options={projects.map(p => ({ value: p.id, label: p.name }))} />
        <DatePicker.RangePicker 
          value={dateRange as any} 
          onChange={(dates) => setDateRange(dates as any)} 
          allowClear 
          style={{ width: 300 }}
        />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ t: 'Sprints', v: sprintIds.length }, { t: 'Planned', v: totalPlanned }, { t: 'Actual', v: totalActual }, { t: 'Velocity', v: `${calcProductivity(totalPlanned, totalActual)}%` }].map(c => (
          <Card key={c.t} className="!rounded-lg"><p className="text-xs text-muted-foreground">{c.t}</p><p className="text-xl font-bold">{c.v}</p></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card title="Planned vs Actual per Sprint" className="!rounded-lg">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sprint" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="Planned" fill="#4F46E5" radius={[4,4,0,0]} /><Line type="monotone" dataKey="Actual" stroke="#10B981" strokeWidth={2} /></ComposedChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Bugs Identified per Sprint" className="!rounded-lg">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bugChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sprint" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Bugs" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Resource Contributions" className="!rounded-lg">
          <Table dataSource={resourceData} pagination={false} size="small" columns={[
            { title: 'Resource', dataIndex: 'name' }, { title: 'Planned', dataIndex: 'planned' },
            { title: 'Actual', dataIndex: 'actual' }, { title: '%', key: 'pct', render: (_, r) => <ProductivityBadge value={r.pct} /> },
          ]} />
        </Card>
        <Card title="Goal History" className="!rounded-lg">
          <Table dataSource={pg.map(g => ({ ...g, key: g.id }))} pagination={false} size="small" columns={[
            { title: 'Sprint', render: (_, g) => sprints.find(s => s.id === g.sprintId)?.name.replace('Sprint ', '') || '' },
            { title: 'Goal', dataIndex: 'goal' },
            { title: 'Status', key: 'status', render: (_, g) => <GoalStatusTag status={g.status} /> },
            { title: '% Done', dataIndex: 'percentDone', render: (v: number) => `${v}%` },
          ]} />
        </Card>
      </div>
    </div>
  );
};

export default ProjectReport;
