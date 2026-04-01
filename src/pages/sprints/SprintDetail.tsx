import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Button, Skeleton, Popover, InputNumber, Select, Table, Input, message, Tooltip, Modal, Tag } from 'antd';
import { Plus, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover as ShadcnPopover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getSprintById, getProjects, getResources, getAllocations, getGoals, upsertAllocation, updateGoal, createGoal, deleteGoal, getChangelogs, createChangelog, updateChangelog, deleteChangelog } from '@/services/api';
import { closeSprint, getSprintCloseLog } from '@/services/sprintService';
import { PageHeader, SprintStatusTag, ProductivityBadge, GoalStatusTag, MiniProgress, ResourceAvatar, ResourceSprintComment } from '@/components/shared';
import { getSprintResourceComments, upsertSprintResourceComment, type SprintResourceComment } from '@/services/commentService';
import { formatDateRange, calcProductivity } from '@/utils/helpers';
import { GOAL_STATUSES, ALLOCATION_STATUSES, getProductivityColor } from '@/constants';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal, SprintChangelog } from '@/types';
import type { GoalStatus, AllocationStatus } from '@/constants';

const SprintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sprint, setSprint] = useState<Sprint>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [comments, setComments] = useState<SprintResourceComment[]>([]);

  // Close Sprint feature
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingNote, setClosingNote] = useState('');
  const [closing, setClosing] = useState(false);
  const [closeLog, setCloseLog] = useState<any>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [s, prj, res, alloc, gl, cmts] = await Promise.all([
      getSprintById(id), getProjects(), getResources(), getAllocations(id), getGoals(id), getSprintResourceComments(id)
    ]);
    setSprint(s);
    setProjects(prj);
    setResources(res.filter(r => r.active));
    setAllocations(alloc);
    setGoals(gl);
    setComments(cmts);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (sprint?.status?.toLowerCase() === 'completed' || sprint?.status?.toLowerCase() === 'archived') {
      if (id) getSprintCloseLog(id).then(setCloseLog).catch(() => {});
    }
  }, [sprint, id]);

  const handleCloseSprint = async () => {
    if (!id) return;
    try {
      setClosing(true);
      await closeSprint(id, closingNote);
      message.success('Sprint closed successfully');
      setCloseModalOpen(false);
      const s = await getSprintById(id);
      if (s) setSprint(s);
    } catch (err: any) {
      message.error(err.message || 'Failed to close sprint');
    } finally {
      setClosing(false);
    }
  };

  if (loading || !sprint) return <Skeleton active paragraph={{ rows: 12 }} />;

  const isSprintLocked = sprint?.status?.toLowerCase() === 'completed' || sprint?.status?.toLowerCase() === 'archived';

  // Determine which projects and resources are in this sprint
  const sprintProjectIds = [...new Set(allocations.map(a => a.projectId))];
  const sprintResourceIds = [...new Set(allocations.map(a => a.resourceId))];
  const sprintProjects = projects.filter(p => sprintProjectIds.includes(p.id));
  const sprintResources = resources.filter(r => sprintResourceIds.includes(r.id));

  const totalPlanned = allocations.reduce((s, a) => s + a.planned, 0);
  const totalActual = allocations.reduce((s, a) => s + a.actual, 0);
  const overallPct = calcProductivity(totalPlanned, totalActual);

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        onClick={() => navigate('/sprints')}
        className="mb-4"
      >
        Back to Sprints
      </Button>
      <PageHeader
        title={sprint.name}
        subtitle={formatDateRange(sprint.startDate, sprint.endDate)}
        actions={
          <div className="flex items-center gap-2">
            <SprintStatusTag status={sprint.status} />

            {sprint.status?.toLowerCase() === 'active' ? (
              <Button
                type="primary"
                danger
                icon={<LockOutlined />}
                onClick={() => setCloseModalOpen(true)}
              >
                Close Sprint
              </Button>
            ) : isSprintLocked ? (
               <Tag color="default" icon={<CheckCircleOutlined />}>
                 Sprint Closed {closeLog?.closed_at ? ` · ${format(new Date(closeLog.closed_at), 'PP')}` : ''}
               </Tag>
            ) : null}

            {!isSprintLocked && (
              <Button icon={<Pencil size={14} />} onClick={() => navigate(`/sprints/${id}/edit`)}>Edit Sprint</Button>
            )}
          </div>
        }
      />
      <Tabs
        defaultActiveKey="allocation"
        items={[
          {
            key: 'allocation',
            label: 'Point Allocation',
            children: (
              <AllocationGrid
                sprint={sprint}
                projects={sprintProjects}
                allProjects={projects}
                resources={sprintResources}
                allResources={resources}
                allocations={allocations}
                setAllocations={setAllocations}
                totalPlanned={totalPlanned}
                totalActual={totalActual}
                overallPct={overallPct}
                comments={comments}
                setComments={setComments}
                isReadOnly={isSprintLocked}
              />
            ),
          },
          {
            key: 'goals',
            label: 'Sprint Goals',
            children: (
              <GoalsTab sprint={sprint} projects={projects} resources={resources} goals={goals} setGoals={setGoals} isReadOnly={isSprintLocked} />
            ),
          },
        ]}
      />

      <Modal
        title={<div><LockOutlined className="mr-2" /> Close Sprint</div>}
        open={closeModalOpen}
        onCancel={() => setCloseModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCloseModalOpen(false)}>Cancel</Button>,
          <Button key="submit" type="primary" danger loading={closing} onClick={handleCloseSprint}>
            🔒 Close Sprint
          </Button>
        ]}
      >
        <p>Are you sure you want to close <strong>"{sprint.name}"</strong>?</p>
        <p>This will:</p>
        <ul className="list-disc pl-5 mb-4 space-y-1 mt-2">
          <li>Mark the sprint as Completed</li>
          <li>Lock all point allocations</li>
          <li>Save a productivity snapshot</li>
          <li>Record open bugs at closing time</li>
        </ul>
        <p className="mb-2">Closing Note (optional)</p>
        <Input.TextArea
          rows={3}
          maxLength={500}
          placeholder='e.g. "2 bugs deferred to next sprint"'
          value={closingNote}
          onChange={(e) => setClosingNote(e.target.value)}
        />
        <p className="text-red-500 mt-4 text-sm font-semibold">⚠️ This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

// Point Allocation Grid
const AllocationGrid = ({
  sprint, projects, allProjects, resources, allResources, allocations, setAllocations, totalPlanned, totalActual, overallPct, comments, setComments, isReadOnly
}: {
  sprint: Sprint; projects: Project[]; allProjects: Project[]; resources: Resource[]; allResources: Resource[];
  allocations: PointAllocation[]; setAllocations: (a: PointAllocation[]) => void;
  totalPlanned: number; totalActual: number; overallPct: number;
  comments: SprintResourceComment[]; setComments: (c: SprintResourceComment[]) => void;
  isReadOnly?: boolean;
}) => {
  const [editCell, setEditCell] = useState<{ projectId: string; resourceId: string } | null>(null);
  const [editPlanned, setEditPlanned] = useState(0);
  const [editActual, setEditActual] = useState(0);
  const [editStatus, setEditStatus] = useState<AllocationStatus>('Not Started');
  const [localProjects, setLocalProjects] = useState(projects);
  const [localResources, setLocalResources] = useState(resources);
  const [sprintBugs, setSprintBugs] = useState<Record<string, number>>({});

  const openEdit = (projectId: string, resourceId: string) => {
    if (isReadOnly) return;
    const alloc = allocations.find(a => a.projectId === projectId && a.resourceId === resourceId);
    setEditPlanned(alloc?.planned || 0);
    setEditActual(alloc?.actual || 0);
    setEditStatus(alloc?.status || 'Not Started');
    setEditCell({ projectId, resourceId });
  };

  const saveEdit = async () => {
    if (!editCell) return;
    const existing = allocations.find(a => a.projectId === editCell.projectId && a.resourceId === editCell.resourceId);
    const alloc: PointAllocation = {
      id: existing?.id || `a${Date.now()}`,
      sprintId: sprint.id,
      projectId: editCell.projectId,
      resourceId: editCell.resourceId,
      planned: editPlanned,
      actual: editActual,
      status: editStatus,
    };
    await upsertAllocation(alloc);
    const updated = existing
      ? allocations.map(a => a.id === existing.id ? alloc : a)
      : [...allocations, alloc];
    setAllocations(updated);
    setEditCell(null);
    message.success('Saved');
  };

  const addProject = () => {
    const available = allProjects.filter(p => !localProjects.find(lp => lp.id === p.id));
    if (available.length > 0) {
      setLocalProjects([...localProjects, available[0]]);
    }
  };

  const addResource = () => {
    const available = allResources.filter(r => !localResources.find(lr => lr.id === r.id));
    if (available.length > 0) {
      setLocalResources([...localResources, available[0]]);
    }
  };

  // Recalculate totals
  const getProjectTotal = (projectId: string) => {
    const pa = allocations.filter(a => a.projectId === projectId);
    return { planned: pa.reduce((s, a) => s + a.planned, 0), actual: pa.reduce((s, a) => s + a.actual, 0) };
  };

  const getResourceTotal = (resourceId: string) => {
    const ra = allocations.filter(a => a.resourceId === resourceId);
    return { planned: ra.reduce((s, a) => s + a.planned, 0), actual: ra.reduce((s, a) => s + a.actual, 0) };
  };

  const tPlanned = allocations.reduce((s, a) => s + a.planned, 0);
  const tActual = allocations.reduce((s, a) => s + a.actual, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left p-3 bg-muted font-semibold border border-border min-w-[180px]">Project</th>
            {localResources.map(r => {
              const rComment = comments.find(c => c.resource_id === r.id)?.comment || '';
              return (
                <th key={r.id} className="text-center p-3 bg-muted font-semibold border border-border min-w-[140px] align-top">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <ResourceSprintComment 
                      sprintId={sprint.id}
                      resourceId={r.id}
                      comment={rComment}
                      onSave={async (text) => {
                        if (isReadOnly) return;
                        const newCmt = await upsertSprintResourceComment(sprint.id, r.id, text);
                        if (newCmt) {
                          const idx = comments.findIndex(c => c.resource_id === r.id);
                          if (idx >= 0) {
                            setComments([...comments.slice(0, idx), newCmt, ...comments.slice(idx + 1)]);
                          } else {
                            setComments([...comments, newCmt]);
                          }
                        }
                      }}
                    />
                    <ResourceAvatar name={r.name} size={28} />
                    <span className="text-xs">{r.name}</span>
                  </div>
                </th>
              );
            })}
            <th className="text-center p-3 bg-muted font-bold border border-border min-w-[120px]">Bugs Identified</th>
            <th className="text-center p-3 bg-muted font-bold border border-border min-w-[100px]">Total</th>
          </tr>
        </thead>
        <tbody>
          {localProjects.map(project => {
            const pt = getProjectTotal(project.id);
            return (
              <tr key={project.id}>
                <td className="p-3 border border-border font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </div>
                </td>
                {localResources.map(resource => {
                  const alloc = allocations.find(a => a.projectId === project.id && a.resourceId === resource.id);
                  const isEditing = editCell?.projectId === project.id && editCell?.resourceId === resource.id;
                  return (
                    <td key={resource.id} className="text-center p-2 border border-border cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => openEdit(project.id, resource.id)}>
                      {isEditing ? (
                        <Popover
                          open
                          onOpenChange={(open) => !open && setEditCell(null)}
                          content={
                            <div className="space-y-2 w-48">
                              <div>
                                <label className="text-xs text-muted-foreground">Planned</label>
                                <InputNumber size="small" value={editPlanned} onChange={v => setEditPlanned(v || 0)} className="w-full" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Actual</label>
                                <InputNumber size="small" value={editActual} onChange={v => setEditActual(v || 0)} className="w-full" />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Status</label>
                                <Select size="small" value={editStatus} onChange={setEditStatus} className="w-full" options={ALLOCATION_STATUSES.map(s => ({ value: s, label: s }))} />
                              </div>
                              <Button type="primary" size="small" block onClick={saveEdit}>Save</Button>
                            </div>
                          }
                          trigger="click"
                        >
                          <span className="font-mono">{alloc ? `${alloc.actual}/${alloc.planned}` : '—'}</span>
                        </Popover>
                      ) : (
                        <span className="font-mono text-sm">{alloc ? `${alloc.actual}/${alloc.planned}` : '—'}</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center p-2 border border-border bg-accent/30">
                  <InputNumber 
                    size="small" 
                    min={0} 
                    value={sprintBugs[project.id] || 0} 
                    onChange={v => setSprintBugs(prev => ({ ...prev, [project.id]: v || 0 }))} 
                    disabled={isReadOnly} 
                    className="w-16 mx-auto" 
                  />
                </td>
                <td className="text-center p-2 border border-border font-semibold font-mono bg-accent/30">
                  {pt.actual}/{pt.planned}
                </td>
              </tr>
            );
          })}
          {/* Total Row */}
          <tr className="bg-accent/50">
            <td className="p-3 border border-border font-bold">Total</td>
            {localResources.map(r => {
              const rt = getResourceTotal(r.id);
              return (
                <td key={r.id} className="text-center p-2 border border-border font-bold font-mono">
                  {rt.actual}/{rt.planned}
                </td>
              );
            })}
            <td className="text-center p-2 border border-border font-bold" style={{ backgroundColor: '#E0F2FE' }}>
              {Object.values(sprintBugs).reduce((a, b) => a + b, 0)}
            </td>
            <td className="text-center p-2 border border-border font-bold font-mono" style={{ backgroundColor: '#E0F2FE' }}>
              {tActual}/{tPlanned}
            </td>
          </tr>
          {/* Productivity Row */}
          <tr>
            <td className="p-3 border border-border font-bold">Productivity %</td>
            {localResources.map(r => {
              const rt = getResourceTotal(r.id);
              const pct = calcProductivity(rt.planned, rt.actual);
              return (
                <td key={r.id} className="text-center p-2 border border-border">
                  <ProductivityBadge value={pct} />
                </td>
              );
            })}
            <td className="text-center p-2 border border-border"></td>
            <td className="text-center p-2 border border-border">
              <div className="inline-flex items-center px-3 py-2 rounded-md text-lg font-bold" style={{ backgroundColor: getProductivityColor(calcProductivity(tPlanned, tActual)) + '20', color: getProductivityColor(calcProductivity(tPlanned, tActual)) }}>
                {calcProductivity(tPlanned, tActual)}%
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex gap-3 mt-4">
        <Button onClick={addProject} icon={<Plus size={14} />}>Add Project Row</Button>
        <Button onClick={addResource} icon={<Plus size={14} />}>Add Resource Column</Button>
      </div>

      <SprintChangelogsPanel sprintId={sprint.id} allProjects={allProjects} />
    </div>
  );
};

const SprintChangelogsPanel = ({ sprintId, allProjects }: { sprintId: string, allProjects: Project[] }) => {
  const [changelogs, setChangelogs] = useState<SprintChangelog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChangelogs(sprintId).then(data => {
      setChangelogs(data);
      setLoading(false);
    });
  }, [sprintId]);

  const handleAdd = async () => {
    const newCL = await createChangelog({
      sprintId,
      date: new Date().toISOString().split('T')[0],
      projectId: allProjects[0]?.id || '',
      description: '',
      type: 'Task',
      trackingId: '',
      pointsUpdate: 0,
      finalSprintPoints: 0,
    });
    setChangelogs([...changelogs, newCL]);
  };

  const handleUpdate = async (id: string, field: keyof SprintChangelog, value: any) => {
    await updateChangelog(id, { [field]: value });
    setChangelogs(changelogs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDelete = async (id: string) => {
    await deleteChangelog(id);
    setChangelogs(changelogs.filter(c => c.id !== id));
  };

  const columns = [
    { 
      title: 'Date', dataIndex: 'date', width: 170,
      render: (text: string, record: SprintChangelog) => {
        const dateValue = text ? new Date(text) : undefined;
        return (
          <ShadcnPopover>
            <PopoverTrigger asChild>
              <div className="w-full flex items-center h-[32px] px-[11px] bg-white border border-[#d9d9d9] hover:border-[#4096ff] rounded-[6px] cursor-pointer text-sm transition-colors">
                <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 flex-shrink-0" />
                {dateValue ? <span className="text-gray-800 truncate">{format(dateValue, "PP")}</span> : <span className="text-gray-400">Select</span>}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[1050]" align="start">
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  if (date) {
                    handleUpdate(record.id, 'date', format(date, 'yyyy-MM-dd'));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </ShadcnPopover>
        );
      }
    },
    { 
      title: 'Project', dataIndex: 'projectId', width: 160,
      render: (text: string, record: SprintChangelog) => (
        <Select 
          value={text} 
          onChange={val => handleUpdate(record.id, 'projectId', val)}
          options={allProjects.map(p => ({ label: p.name, value: p.id }))}
          className="w-full"
        />
      )
    },
    { 
      title: 'Description', dataIndex: 'description', 
      render: (text: string, record: SprintChangelog) => (
        <Input value={text} onChange={e => handleUpdate(record.id, 'description', e.target.value)} />
      )
    },
    { 
      title: 'Type', dataIndex: 'type', width: 110,
      render: (text: string, record: SprintChangelog) => (
        <Select 
          value={text || undefined} 
          onChange={val => handleUpdate(record.id, 'type', val)}
          options={[{label: 'Task', value: 'Task'}, {label: 'CR', value: 'CR'}]}
          className="w-full"
          allowClear
        />
      )
    },
    { 
      title: 'Tracking id', dataIndex: 'trackingId', width: 130,
      render: (text: string, record: SprintChangelog) => (
        <Input value={text} onChange={e => handleUpdate(record.id, 'trackingId', e.target.value)} />
      )
    },
    { 
      title: 'Points Update', dataIndex: 'pointsUpdate', width: 120,
      render: (text: number, record: SprintChangelog) => (
        <InputNumber value={text} onChange={val => handleUpdate(record.id, 'pointsUpdate', val || 0)} className="w-full" />
      )
    },
    { 
      title: 'Final Sprint Points', dataIndex: 'finalSprintPoints', width: 150,
      render: (text: number, record: SprintChangelog) => (
        <InputNumber value={text} onChange={val => handleUpdate(record.id, 'finalSprintPoints', val || 0)} className="w-full" />
      )
    },
    { 
      title: '', key: 'actions', width: 60, align: 'center' as const,
      render: (_: any, record: SprintChangelog) => (
        <Button size="small" danger type="text" onClick={() => handleDelete(record.id)}>✕</Button>
      )
    }
  ];

  return (
    <div className="mt-10 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sprint Changelog</h3>
        <Button type="primary" onClick={handleAdd} icon={<Plus size={14} />}>Add Change</Button>
      </div>
      <Table 
        dataSource={changelogs.map(c => ({ ...c, key: c.id }))}
        columns={columns}
        pagination={false}
        size="small"
        loading={loading}
        bordered
      />
    </div>
  );
};

// Goals Tab
const GoalsTab = ({
  sprint, projects, resources, goals, setGoals, isReadOnly
}: {
  sprint: Sprint; projects: Project[]; resources: Resource[];
  goals: SprintGoal[]; setGoals: (g: SprintGoal[]) => void;
  isReadOnly?: boolean;
}) => {
  const handleStatusChange = async (goalId: string, status: GoalStatus) => {
    await updateGoal(goalId, { status });
    setGoals(goals.map(g => g.id === goalId ? { ...g, status } : g));
  };

  const handleDelete = async (goalId: string) => {
    await deleteGoal(goalId);
    setGoals(goals.filter(g => g.id !== goalId));
    message.success('Goal deleted');
  };

  const addGoal = async (projectId: string) => {
    const g = await createGoal({
      sprintId: sprint.id, projectId, goal: 'New Goal', status: 'TBD',
      ownerId: resources[0]?.id || '', bugsIdentified: 0, percentDone: 0,
      deliverables: '', isHighlighted: false,
    });
    setGoals([...goals, g]);
  };

  // Group by project
  const grouped = projects.filter(p => goals.some(g => g.projectId === p.id)).map(p => ({
    project: p,
    goals: goals.filter(g => g.projectId === p.id),
  }));

  const columns = [
    { title: 'Sprint Goal', dataIndex: 'goal', key: 'goal', width: 250 },
    {
      title: 'Status', key: 'status', width: 140,
      render: (_: unknown, g: SprintGoal) => (
        <Select size="small" value={g.status} onChange={(v: GoalStatus) => handleStatusChange(g.id, v)} className="w-full"
          options={GOAL_STATUSES.map(s => ({ value: s, label: s }))} disabled={isReadOnly} />
      ),
    },
    { title: 'Owner', key: 'owner', width: 120, render: (_: unknown, g: SprintGoal) => resources.find(r => r.id === g.ownerId)?.name || '—' },
    { title: 'Bugs', dataIndex: 'bugsIdentified', key: 'bugs', width: 70 },
    { title: '% Done', key: 'pct', width: 120, render: (_: unknown, g: SprintGoal) => <MiniProgress value={g.percentDone} /> },
    {
      title: 'Deliverables', dataIndex: 'deliverables', key: 'deliverables', width: 200, ellipsis: true,
      render: (text: string) => <Tooltip title={text}><span>{text}</span></Tooltip>,
    },
    {
      title: '', key: 'actions', width: 60,
      render: (_: unknown, g: SprintGoal) => !isReadOnly && <Button size="small" danger type="text" onClick={() => handleDelete(g.id)}>✕</Button>,
    },
  ];

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="bg-muted text-muted-foreground p-3 rounded-md text-sm text-center mb-4 border border-border">
          This sprint is closed. Data is read-only.
        </div>
      )}
      {grouped.map(({ project, goals: pGoals }) => (
        <div key={project.id}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="font-semibold">{project.name}</span>
            </div>
            {!isReadOnly && <Button size="small" icon={<Plus size={12} />} onClick={() => addGoal(project.id)}>Add Goal</Button>}
          </div>
          <Table
            dataSource={pGoals.map(g => ({ ...g, key: g.id }))}
            columns={columns}
            pagination={false}
            size="small"
            rowClassName={(r) => r.isHighlighted ? '!bg-warning/10' : ''}
          />
        </div>
      ))}
    </div>
  );
};

export default SprintDetail;
