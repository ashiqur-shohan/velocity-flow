import { useEffect, useState } from 'react';
import { Button, Select, Drawer, Input, message, Skeleton, Progress } from 'antd';
import { Plus } from 'lucide-react';
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
      <div className="mb-4">
        <Select
          value={filter}
          onChange={setFilter}
          style={{ width: 160 }}
          options={[
            { value: 'All', label: 'All' },
            ...PROJECT_STATUSES.map(s => ({ value: s, label: s.toUpperCase().replace('_', ' ') }))
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects"
          description="Create your first project"
          action={<Button type="primary" onClick={openCreate}>Create Project</Button>}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(project => (
            <div
              key={project.id}
              className="p-5 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color_tag }} />
                <span className="font-semibold text-foreground">{project.name}</span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  project.status === 'active' ? 'bg-success/10 text-success' : 
                  project.status === 'on_hold' ? 'bg-warning/10 text-warning' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {project.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[40px]">
                {project.description}
              </p>

              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">
                    {project.achieved_points} / {project.total_points} pts
                  </span>
                  <span className="text-xs font-semibold" style={{ color: progressColor(project.progress_pct) }}>
                    {project.progress_pct}%
                  </span>
                </div>
                <Progress
                  percent={project.progress_pct}
                  showInfo={false}
                  strokeColor={progressColor(project.progress_pct)}
                  size="small"
                />
              </div>

              <div className="flex gap-4 mt-3 text-xs text-gray-400">
                <span>📅 {project.total_sprints || 0} sprints</span>
                <span>👤 {project.manager?.name || '—'}</span>
              </div>
            </div>
          ))}
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
