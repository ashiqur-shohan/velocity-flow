import { useEffect, useState } from 'react';
import { Button, Select, Drawer, Input, message, Skeleton } from 'antd';
import { Plus } from 'lucide-react';
import { getProjects, createProject, updateProject, getAllocations, getSprints } from '@/services/api';
import { PageHeader, EmptyState } from '@/components/shared';
import { PROJECT_COLORS, PROJECT_STATUSES } from '@/constants';
import type { Project, PointAllocation, Sprint } from '@/types';
import type { ProjectStatus } from '@/constants';

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allocations, setAllocations] = useState<PointAllocation[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | 'All'>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], status: 'Active' as ProjectStatus });

  useEffect(() => {
    const load = async () => {
      const [p, a, s] = await Promise.all([getProjects(), getAllocations(), getSprints()]);
      setProjects(p); setAllocations(a); setSprints(s); setLoading(false);
    };
    load();
  }, []);

  const openCreate = () => { setEditProject(null); setForm({ name: '', description: '', color: PROJECT_COLORS[0], status: 'Active' }); setDrawerOpen(true); };
  const openEdit = (p: Project) => { setEditProject(p); setForm({ name: p.name, description: p.description, color: p.color, status: p.status }); setDrawerOpen(true); };

  const save = async () => {
    if (!form.name) { message.error('Name required'); return; }
    if (editProject) {
      await updateProject(editProject.id, form);
      setProjects(projects.map(p => p.id === editProject.id ? { ...p, ...form } : p));
    } else {
      const p = await createProject(form);
      setProjects([...projects, p]);
    }
    setDrawerOpen(false);
    message.success('Saved');
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  const filtered = filter === 'All' ? projects : projects.filter(p => p.status === filter);

  return (
    <div>
      <PageHeader title="Projects" actions={<Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>New Project</Button>} />
      <div className="mb-4">
        <Select value={filter} onChange={setFilter} style={{ width: 160 }} options={[{ value: 'All', label: 'All' }, ...PROJECT_STATUSES.map(s => ({ value: s, label: s }))]} />
      </div>
      {filtered.length === 0 ? <EmptyState title="No projects" description="Create your first project" action={<Button type="primary" onClick={openCreate}>Create Project</Button>} /> : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(project => {
            const pa = allocations.filter(a => a.projectId === project.id);
            const totalActual = pa.reduce((s, a) => s + a.actual, 0);
            const sprintCount = [...new Set(pa.map(a => a.sprintId))].length;
            const lastSprint = sprints.find(s => pa.some(a => a.sprintId === s.id));
            return (
              <div key={project.id} className="p-5 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => openEdit(project)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="font-semibold text-foreground">{project.name}</span>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${project.status === 'Active' ? 'bg-success/10 text-success' : project.status === 'On Hold' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{project.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{sprintCount} sprints</span>
                  <span>{totalActual} points delivered</span>
                </div>
                {lastSprint && <p className="text-xs text-muted-foreground mt-1">Last: {lastSprint.name}</p>}
              </div>
            );
          })}
        </div>
      )}
      <Drawer title={editProject ? 'Edit Project' : 'New Project'} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={400}>
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
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: form.color === c ? '#0F172A' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={form.status} onChange={v => setForm({ ...form, status: v })} className="w-full" options={PROJECT_STATUSES.map(s => ({ value: s, label: s }))} />
          </div>
          <Button type="primary" block onClick={save}>Save</Button>
        </div>
      </Drawer>
    </div>
  );
};

export default Projects;
