import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import { useProjects } from '@/hooks/useProjects';
import { useSprints } from '@/hooks/useSprint';
import { useResources } from '@/hooks/useResources';
import { useProjectReportHook } from '@/hooks/useReports';
import { getProjectGoals } from '@/services/goalService';
import { PageHeader, ProductivityBadge, GoalStatusTag } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal } from '@/types';

const ProjectReport = () => {
  const { sprints, loading: sprintsLoading } = useSprints();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState('');
  const { resources, loading: resourcesLoading } = useResources();
  const { data: allocations, loading: reportLoading } = useProjectReportHook(selectedProject);
  const [goals, setGoals] = useState<any[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, projectsLoading, selectedProject]);

  useEffect(() => {
    if (!selectedProject) return;
    setLoadingGoals(true);
    getProjectGoals(selectedProject).then(g => { setGoals(g); setLoadingGoals(false); });
  }, [selectedProject]);

  const loading = sprintsLoading || projectsLoading || resourcesLoading || reportLoading || loadingGoals;

  if (loading || !allocations) return <Skeleton active />;

  const pa = allocations;
  const pg = goals;
  const sprintIds = [...new Set(pa.map((a: any) => a.sprint_id))];
  const totalPlanned = pa.reduce((s: number, a: any) => s + (a.planned_points || 0), 0);
  const totalActual = pa.reduce((s: number, a: any) => s + (a.actual_points || 0), 0);

  const chartData = sprints.map(s => {
    const sa = pa.filter((a: any) => a.sprint_id === s.id);
    const planned = sa.reduce((sum: number, a: any) => sum + (a.planned_points || 0), 0);
    const actual = sa.reduce((sum: number, a: any) => sum + (a.actual_points || 0), 0);
    return planned > 0 ? { sprint: s.name.replace('Sprint ', ''), Planned: planned, Actual: actual } : null;
  }).filter(Boolean);

  // Group by resource for contributions
  const resourceGrouped = pa.reduce((acc: any, a: any) => {
    const rName = a.resource?.name || 'Unknown';
    if (!acc[rName]) acc[rName] = { planned: 0, actual: 0 };
    acc[rName].planned += (a.planned_points || 0);
    acc[rName].actual += (a.actual_points || 0);
    return acc;
  }, {});

  const resourceData = Object.keys(resourceGrouped).map(name => ({
    name,
    planned: resourceGrouped[name].planned,
    actual: resourceGrouped[name].actual,
    pct: calcProductivity(resourceGrouped[name].planned, resourceGrouped[name].actual)
  }));

  return (
    <div>
      <PageHeader title="Project Report" />
      <div className="mb-6">
        <Select value={selectedProject} onChange={setSelectedProject} style={{ width: 280 }}
          options={projects.map(p => ({ value: p.id, label: p.name }))} />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[{ t: 'Sprints', v: sprintIds.length }, { t: 'Planned', v: totalPlanned }, { t: 'Actual', v: totalActual }, { t: 'Velocity', v: `${calcProductivity(totalPlanned, totalActual)}%` }].map(c => (
          <Card key={c.t} className="!rounded-lg"><p className="text-xs text-muted-foreground">{c.t}</p><p className="text-xl font-bold">{c.v}</p></Card>
        ))}
      </div>
      <Card title="Planned vs Actual per Sprint" className="!rounded-lg mb-6">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sprint" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="Planned" fill="#4F46E5" radius={[4,4,0,0]} /><Line type="monotone" dataKey="Actual" stroke="#10B981" strokeWidth={2} /></ComposedChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Resource Contributions" className="!rounded-lg">
          <Table dataSource={resourceData} pagination={false} size="small" columns={[
            { title: 'Resource', dataIndex: 'name' }, { title: 'Planned', dataIndex: 'planned' },
            { title: 'Actual', dataIndex: 'actual' }, { title: '%', key: 'pct', render: (_, r) => <ProductivityBadge value={r.pct} /> },
          ]} />
        </Card>
        <Card title="Goal History" className="!rounded-lg">
          <Table dataSource={pg.map(g => ({ ...g, key: g.id }))} pagination={false} size="small" columns={[
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
