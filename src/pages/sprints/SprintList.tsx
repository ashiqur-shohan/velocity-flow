import { useEffect, useState } from 'react';
import { Button, Select, DatePicker, Skeleton, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil } from 'lucide-react';
import { getSprints, getAllocations } from '@/services/api';
import { PageHeader, SprintStatusTag, ProductivityBadge, EmptyState } from '@/components/shared';
import { formatDateRange, calcProductivity } from '@/utils/helpers';
import type { Sprint, PointAllocation } from '@/types';
import type { SprintStatus } from '@/constants';
import { SPRINT_STATUSES } from '@/constants';

const SprintList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [statusFilter, setStatusFilter] = useState<SprintStatus | 'All'>('All');

  useEffect(() => {
    const load = async () => {
      const [s, a] = await Promise.all([getSprints(), getAllocations()]);
      setSprints(s);
      setAllocations(a);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  const filtered = statusFilter === 'All' ? sprints : sprints.filter(s => s.status === statusFilter);

  return (
    <div>
      <PageHeader
        title="Sprints"
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/sprints/new')}>New Sprint</Button>}
      />
      <div className="flex items-center gap-3 mb-6">
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 160 }} options={[{ value: 'All', label: 'All Statuses' }, ...SPRINT_STATUSES.map(s => ({ value: s, label: s }))]} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No sprints found" description="Create your first sprint to get started." action={<Button type="primary" onClick={() => navigate('/sprints/new')}>Create Sprint</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map(sprint => {
            const sa = allocations.filter(a => a.sprintId === sprint.id);
            const planned = sa.reduce((s, a) => s + a.planned, 0);
            const actual = sa.reduce((s, a) => s + a.actual, 0);
            const pct = calcProductivity(planned, actual);
            return (
              <div key={sprint.id} className="p-4 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{sprint.name}</span>
                        <SprintStatusTag status={sprint.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDateRange(sprint.startDate, sprint.endDate)} · {sprint.lengthDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Points</p>
                      <p className="font-mono text-sm font-semibold">{actual}<span className="text-muted-foreground">/{planned}</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Productivity</p>
                      <ProductivityBadge value={pct} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="small" icon={<Eye size={14} />} onClick={() => navigate(`/sprints/${sprint.id}`)}>View</Button>
                      <Button size="small" icon={<Pencil size={14} />} onClick={() => navigate(`/sprints/${sprint.id}/edit`)}>Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SprintList;
