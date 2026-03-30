import { useEffect, useState } from 'react';
import { Select, Card, Table, Skeleton } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSprints } from '@/hooks/useSprint';
import { useResources } from '@/hooks/useResources';
import { useResourceReportHook } from '@/hooks/useReports';
import { PageHeader, ProductivityBadge } from '@/components/shared';
import { calcProductivity } from '@/utils/helpers';
import type { Sprint, Project, Resource, PointAllocation } from '@/types';

const ResourceReport = () => {
  const { sprints, loading: sprintsLoading } = useSprints();
  const { resources, loading: resourcesLoading } = useResources();
  const [selectedResource, setSelectedResource] = useState('');
  const { data: allocations, loading: reportLoading } = useResourceReportHook(selectedResource);

  useEffect(() => {
    if (!resourcesLoading && resources.length > 0 && !selectedResource) {
      setSelectedResource(resources[0].id);
    }
  }, [resources, resourcesLoading, selectedResource]);

  const loading = sprintsLoading || resourcesLoading || reportLoading;

  if (loading || !allocations) return <Skeleton active />;

  const ra = allocations;
  const totalPlanned = ra.reduce((s: number, a: any) => s + (a.planned_points || 0), 0);
  const totalActual = ra.reduce((s: number, a: any) => s + (a.actual_points || 0), 0);
  const avgPct = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
  const sprintIds = [...new Set(ra.map((a: any) => a.sprint_id))];
  
  // Group by sprint for Trend
  const sprintGrouped = ra.reduce((acc: any, a: any) => {
    const sName = a.sprint?.name || 'Unknown';
    if (!acc[sName]) acc[sName] = 0;
    acc[sName] += (a.actual_points || 0);
    return acc;
  }, {});

  const velocityData = Object.keys(sprintGrouped).map(name => ({
    sprint: name.replace('Sprint ', ''),
    Actual: sprintGrouped[name]
  }));

  const tableData = ra.map((a: any) => ({
    key: a.id,
    sprint: a.sprint?.name,
    project: a.project?.name,
    planned: a.planned_points,
    actual: a.actual_points,
    pct: calcProductivity(a.planned_points, a.actual_points),
  }));

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
