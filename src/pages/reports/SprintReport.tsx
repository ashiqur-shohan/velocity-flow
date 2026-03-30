import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSprints } from '@/hooks/useSprint';
import { useProjects } from '@/hooks/useProjects';
import { useResources } from '@/hooks/useResources';
import { useSprintReport } from '@/hooks/useReports';
import { PageHeader, ProductivityBadge, MiniProgress, GoalStatusTag } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal } from '@/types';
import { Download } from 'lucide-react';

const SprintReport = () => {
  const { sprints, loading: sprintsLoading } = useSprints();
  const { projects, loading: projectsLoading } = useProjects();
  const { resources, loading: resourcesLoading } = useResources();
  const [selectedSprint, setSelectedSprint] = useState('');
  
  const { data, loading: reportLoading } = useSprintReport(selectedSprint);

  useEffect(() => {
    if (!sprintsLoading && sprints.length > 0 && !selectedSprint) {
      setSelectedSprint(sprints[0].id);
    }
  }, [sprints, sprintsLoading, selectedSprint]);

  const loading = sprintsLoading || projectsLoading || resourcesLoading || reportLoading;

  if (loading || !data) return <Skeleton active />;

  const goals = data.goals || [];
  const projectSummary = data.projectSummary || [];
  const resourceProductivity = data.resourceProductivity || [];
  
  const totalPlanned = projectSummary.reduce((s: number, p: any) => s + (p.planned || 0), 0);
  const totalActual = projectSummary.reduce((s: number, p: any) => s + (p.actual || 0), 0);
  const pct = calcProductivity(totalPlanned, totalActual);
  const goalsComplete = goals.filter((g: any) => g.status === 'Complete').length;

  const chartData = projectSummary.map((p: any) => ({
    name: p.project_name,
    Planned: p.planned,
    Actual: p.actual
  }));

  const resourceTableData = resourceProductivity.map((r: any) => ({
    key: r.resource_id,
    name: r.resource_name,
    planned: r.planned,
    actual: r.actual,
    pct: r.productivity_pct
  }));

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
          <Table dataSource={resourceTableData} pagination={false} size="small" columns={[
            { title: 'Resource', dataIndex: 'name' }, { title: 'Planned', dataIndex: 'planned', width: 70 },
            { title: 'Actual', dataIndex: 'actual', width: 70 }, { title: '%', key: 'pct', render: (_, r: any) => <ProductivityBadge value={r.pct} /> },
          ]} />
        </Card>
      </div>
      <Card title="Sprint Goals" className="!rounded-lg">
        <Table dataSource={goals.map((g: any) => ({ ...g, key: g.id }))} pagination={false} size="small" columns={[
          { title: 'Project', key: 'project', render: (_, g: any) => g.project?.name || '—' },
          { title: 'Goal', dataIndex: 'goal' },
          { title: 'Status', key: 'status', render: (_, g: any) => <GoalStatusTag status={g.status} /> },
          { title: '% Done', key: 'pct', render: (_, g: any) => <MiniProgress value={g.percent_done || g.percentDone} /> },
        ]} />
      </Card>
    </div>
  );
};

export default SprintReport;
