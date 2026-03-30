import { useEffect, useState } from 'react';
import { Card, Skeleton, Table, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Activity, Zap } from 'lucide-react';
import { useSprints } from '@/hooks/useSprint';
import { useProjects } from '@/hooks/useProjects';
import { useResources } from '@/hooks/useResources';
import { getSprintAllocations } from '@/services/allocationService';
import { getSprintGoals } from '@/services/goalService';
import { PageHeader, ProductivityBadge, MiniProgress, GoalStatusTag } from '@/components/shared';
import { calcProductivity, formatDateRange } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal } from '@/types';
import dayjs from 'dayjs';

const Dashboard = () => {
  const { sprints, loading: sprintsLoading } = useSprints();
  const { projects, loading: projectsLoading } = useProjects();
  const { resources, loading: resourcesLoading } = useResources();
  const [sprint, setSprint] = useState<any>();
  const [allocations, setAllocations] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      if (sprintsLoading) return;
      const active = sprints.find(s => s.status === 'Active') || sprints[0];
      setSprint(active);
      if (active) {
        try {
          setLoadingDetails(true);
          const [alloc, gl] = await Promise.all([
            getSprintAllocations(active.id),
            getSprintGoals(active.id)
          ]);
          setAllocations(alloc);
          setGoals(gl);
        } catch (err) {
          console.error('Dashboard load error', err);
        } finally {
          setLoadingDetails(false);
        }
      } else {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [sprints, sprintsLoading]);

  const loading = sprintsLoading || projectsLoading || resourcesLoading || loadingDetails;

  if (loading) return <div className="space-y-4"><Skeleton active /><Skeleton active /><Skeleton active /></div>;

  const totalPlanned = allocations.reduce((s, a) => s + a.planned, 0);
  const totalActual = allocations.reduce((s, a) => s + a.actual, 0);
  const overallPct = calcProductivity(totalPlanned, totalActual);
  const daysLeft = sprint ? dayjs(sprint.endDate).diff(dayjs(), 'day') : 0;

  // Chart data: planned vs actual per project
  const chartData = projects
    .map(p => {
      const pa = allocations.filter(a => a.projectId === p.id);
      const planned = pa.reduce((s, a) => s + a.planned, 0);
      const actual = pa.reduce((s, a) => s + a.actual, 0);
      return planned > 0 ? { name: p.name, Planned: planned, Actual: actual } : null;
    })
    .filter(Boolean);

  // Resource productivity
  const resourceData = resources.filter(r => r.active).map(r => {
    const ra = allocations.filter(a => a.resourceId === r.id);
    const planned = ra.reduce((s, a) => s + a.planned, 0);
    const actual = ra.reduce((s, a) => s + a.actual, 0);
    return { key: r.id, name: r.name, planned, actual, pct: calcProductivity(planned, actual) };
  }).filter(r => r.planned > 0);

  const summaryCards = [
    { title: 'Active Sprint', value: sprint?.name || '—', sub: daysLeft > 0 ? `${daysLeft} days remaining` : 'Ended', icon: <Zap size={20} />, color: '#4F46E5' },
    { title: 'Total Planned', value: totalPlanned, sub: 'Story points', icon: <Target size={20} />, color: '#06B6D4' },
    { title: 'Total Actual', value: totalActual, sub: 'Story points delivered', icon: <TrendingUp size={20} />, color: '#10B981' },
    { title: 'Productivity', value: `${overallPct}%`, sub: overallPct >= 80 ? 'On Track' : 'Needs Attention', icon: <Activity size={20} />, color: overallPct >= 80 ? '#10B981' : overallPct >= 60 ? '#F59E0B' : '#F43F5E' },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={sprint ? formatDateRange(sprint.startDate, sprint.endDate) : ''} />
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        {summaryCards.map(c => (
          <Card key={c.title} className="!rounded-lg border border-border shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{c.title}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: typeof c.value === 'string' && c.value.includes('%') ? c.color : undefined }}>{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: c.color + '15' }}>
                <span style={{ color: c.color }}>{c.icon}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card title="Sprint Productivity" className="col-span-3 !rounded-lg border border-border shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Planned" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Resource Productivity" className="col-span-2 !rounded-lg border border-border shadow-sm">
          <Table
            dataSource={resourceData}
            pagination={false}
            size="small"
            columns={[
              { title: 'Resource', dataIndex: 'name', key: 'name' },
              { title: 'Planned', dataIndex: 'planned', key: 'planned', width: 70 },
              { title: 'Actual', dataIndex: 'actual', key: 'actual', width: 70 },
              { title: '%', key: 'pct', width: 100, render: (_, r) => <ProductivityBadge value={r.pct} /> },
            ]}
          />
        </Card>
      </div>

      <Card title="Sprint Goals Summary" className="!rounded-lg border border-border shadow-sm">
        <Table
          dataSource={goals.map(g => ({ ...g, key: g.id }))}
          pagination={false}
          size="small"
          columns={[
            { title: 'Project', key: 'project', render: (_, g) => projects.find(p => p.id === g.projectId)?.name },
            { title: 'Goal', dataIndex: 'goal', key: 'goal' },
            { title: 'Status', key: 'status', render: (_, g) => <GoalStatusTag status={g.status} /> },
            { title: 'Owner', key: 'owner', render: (_, g) => resources.find(r => r.id === g.ownerId)?.name },
            { title: '% Done', key: 'pct', render: (_, g) => <MiniProgress value={g.percentDone} /> },
          ]}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
