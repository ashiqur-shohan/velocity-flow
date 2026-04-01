import { useEffect, useState } from 'react';
import { Button, Select, Drawer, Input, message, Skeleton, Progress, Table, Radio } from 'antd';
import { Plus, LayoutGrid, List, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject } from '@/services/projectService';
import { PageHeader, EmptyState } from '@/components/shared';

const PROJECT_STATUSES = ['active', 'on_hold', 'archived'];

const COLOR_OPTIONS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#F97316', '#6B7280',
];

const progressColor = (pct: number) => {
  if (pct >= 80) return '#10B981';   // green
  if (pct >= 50) return '#F59E0B';   // amber
  return '#F43F5E';                  // red
};

const Projects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<string | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Create Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color_tag: COLOR_OPTIONS[0], status: 'active' });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const p = await getProjects('org-001');
        setProjects(p);
      } catch (err: any) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', color_tag: COLOR_OPTIONS[0], status: 'active' });
    setDrawerOpen(true);
  };

  const saveCreate = async () => {
    if (!form.name) { message.error('Name required'); return; }
    try {
      const p = await createProject('org-001', form);
      setProjects([p, ...projects]);
      setDrawerOpen(false);
      message.success('Project created');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  return (
    <div>
      <PageHeader
        title="Projects"
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>New Project</Button>}
      />
      <div className="mb-4 flex justify-between items-center bg-card p-3 rounded-lg border border-border shadow-sm">
        <Select
          value={filter}
          onChange={setFilter}
          style={{ width: 160 }}
          className="rounded-md"
          options={[
            { value: 'All', label: 'All Status' },
            ...PROJECT_STATUSES.map(s => ({ value: s, label: s.toUpperCase().replace('_', ' ') }))
          ]}
        />
        <Radio.Group 
          value={viewMode} 
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
          className="flex items-center"
        >
          <Radio.Button value="grid" className="flex items-center justify-center">
            <LayoutGrid size={16} className={viewMode === 'grid' ? 'text-white' : 'text-muted-foreground'} />
          </Radio.Button>
          <Radio.Button value="list" className="flex items-center justify-center">
            <List size={16} className={viewMode === 'list' ? 'text-white' : 'text-muted-foreground'} />
          </Radio.Button>
        </Radio.Group>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Create your first project"
          action={<Button type="primary" onClick={openCreate}>Create Project</Button>}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <div
              key={project.id}
              className="p-6 rounded-xl border border-border bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-offset-background transition-all" style={{ backgroundColor: project.color_tag }} />
                <span className="font-bold text-lg text-foreground group-hover:text-[#818CF8] transition-colors">{project.name}</span>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  project.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                  project.status === 'on_hold' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-slate-500/10 text-slate-500'
                }`}>
                  {project.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-5 line-clamp-2 min-h-[40px] leading-relaxed">
                {project.description}
              </p>

              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                    {project.achieved_points} / {project.total_points} Points
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-background border border-border shadow-sm" style={{ color: progressColor(project.progress_pct) }}>
                    {project.progress_pct}%
                  </span>
                </div>
                <Progress
                  percent={project.progress_pct}
                  showInfo={false}
                  strokeColor={progressColor(project.progress_pct)}
                  size="small"
                  trailColor="rgba(0,0,0,0.05)"
                  className="mb-0"
                />
              </div>

              <div className="flex justify-between items-center mt-5 pt-4 border-t border-border/50 text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1.5"><LayoutGrid size={12} /> {project.total_sprints || 0} Sprints</span>
                <span className="flex items-center gap-1.5"><Users size={12} /> {project.manager?.name || '—'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table
            dataSource={filtered}
            rowKey="id"
            pagination={false}
            className="custom-list-table"
            onRow={(record) => ({
              onClick: () => navigate(`/projects/${record.id}`),
              className: 'cursor-pointer hover:bg-muted/50 transition-colors group'
            })}
            columns={[
              {
                title: 'PROJECT',
                key: 'project',
                render: (_, p) => (
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color_tag }} />
                    <span className="font-bold text-foreground group-hover:text-[#818CF8] transition-colors">{p.name}</span>
                  </div>
                ),
                width: '25%'
              },
              {
                title: 'STATUS',
                dataIndex: 'status',
                render: (s) => (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    s === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 
                    s === 'on_hold' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {s.toUpperCase().replace('_', ' ')}
                  </span>
                ),
                width: '15%'
              },
              {
                title: 'PROGRESS',
                key: 'progress',
                render: (_, p) => (
                  <div className="w-full max-w-[200px]">
                    <div className="flex justify-between text-[10px] mb-1 font-bold text-muted-foreground">
                      <span>{p.achieved_points}/{p.total_points}</span>
                      <span style={{ color: progressColor(p.progress_pct) }}>{p.progress_pct}%</span>
                    </div>
                    <Progress 
                      percent={p.progress_pct} 
                      size="small" 
                      showInfo={false} 
                      strokeColor={progressColor(p.progress_pct)} 
                      trailColor="rgba(0,0,0,0.05)"
                    />
                  </div>
                ),
                width: '30%'
              },
              {
                title: 'SPRINTS',
                key: 'sprints',
                render: (_, p) => <span className="font-bold text-muted-foreground">{p.total_sprints || 0}</span>,
                align: 'center',
                width: '15%'
              },
              {
                title: 'MANAGER',
                key: 'manager',
                render: (_, p) => <span className="font-bold text-foreground">{p.manager?.name || '—'}</span>,
                width: '15%'
              }
            ]}
          />
        </div>
      )}

      <Drawer title="New Project" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input.TextArea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color Tag</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color_tag: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all cursor-pointer"
                  style={{ backgroundColor: c, borderColor: form.color_tag === c ? '#0F172A' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={form.status}
              onChange={v => setForm({ ...form, status: v })}
              className="w-full"
              options={PROJECT_STATUSES.map(s => ({ value: s, label: s.toUpperCase().replace('_', ' ') }))}
            />
          </div>
          <Button type="primary" block onClick={saveCreate}>Save</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Projects;
