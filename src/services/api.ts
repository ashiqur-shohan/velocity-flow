import { db } from '../mock/db';
import { delay } from '../mock/delay';
import type { Sprint, Resource, PointAllocation, SprintGoal, Member, SprintChangelog } from '@/types';
import { mockMembers, mockChangelogs } from './mockData';

// Sprints
export const getSprints = async (): Promise<Sprint[]> => {
  await delay();
  return db.sprints.map((s: any) => ({
    id: s.id,
    name: s.name,
    startDate: s.start_date,
    endDate: s.end_date,
    status: s.status === 'active' ? 'Active' : s.status === 'completed' ? 'Completed' : 'Planning',
    lengthDays: s.sprint_length_days
  }));
};
export const getSprintById = async (id: string): Promise<Sprint | undefined> => {
  await delay();
  const s = db.sprints.find((x: any) => x.id === id);
  if (!s) return undefined;
  return { id: s.id, name: s.name, startDate: s.start_date, endDate: s.end_date, status: s.status === 'active' ? 'Active' : s.status === 'completed' ? 'Completed' : 'Planning', lengthDays: s.sprint_length_days };
};
export const createSprint = async (data: Omit<Sprint, 'id'>): Promise<Sprint> => {
  await delay();
  const s = {
    id: `sprint-${Date.now()}`,
    organization_id: 'org-001',
    name: data.name,
    start_date: data.startDate,
    end_date: data.endDate,
    sprint_length_days: data.lengthDays,
    status: data.status.toLowerCase(),
    created_at: new Date().toISOString()
  };
  db.sprints.push(s);
  return { ...data, id: s.id };
};
export const updateSprint = async (id: string, data: Partial<Sprint>): Promise<Sprint> => {
  await delay();
  const i = db.sprints.findIndex((x: any) => x.id === id);
  if (data.name) db.sprints[i].name = data.name;
  if (data.startDate) db.sprints[i].start_date = data.startDate;
  if (data.endDate) db.sprints[i].end_date = data.endDate;
  if (data.lengthDays) db.sprints[i].sprint_length_days = data.lengthDays;
  if (data.status) db.sprints[i].status = data.status.toLowerCase();
  const s = db.sprints[i];
  return { id: s.id, name: s.name, startDate: s.start_date, endDate: s.end_date, status: s.status === 'active' ? 'Active' : s.status === 'completed' ? 'Completed' : 'Planning', lengthDays: s.sprint_length_days };
};

// Projects - Note: Project endpoints have moved to projectService.ts for the new schema,
// but we still export them here for any leftover legacy components although Projects is now using projectService.ts directly.
import { getProjects as newGetProjects, createProject as newCreateProject, updateProject as newUpdateProject } from './projectService';
export const getProjects = async () => newGetProjects('org-001');
export const createProject = async (data: any) => newCreateProject('org-001', data);
export const updateProject = async (id: string, data: any) => newUpdateProject(id, data);

// Resources
export const getResources = async (): Promise<Resource[]> => {
  await delay();
  return db.resources.map((r: any) => ({
    id: r.id, name: r.name, designation: r.designation, team: r.team, active: r.is_active, avatar: r.avatar
  }));
};
export const createResource = async (data: Omit<Resource, 'id'>): Promise<Resource> => {
  await delay();
  const r = { id: `res-${Date.now()}`, organization_id: 'org-001', name: data.name, designation: data.designation, team: data.team, is_active: data.active };
  db.resources.push(r);
  return { ...data, id: r.id };
};
export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => {
  await delay();
  const i = db.resources.findIndex((x: any) => x.id === id);
  if (data.name) db.resources[i].name = data.name;
  if (data.designation) db.resources[i].designation = data.designation;
  if (data.team) db.resources[i].team = data.team;
  if (data.active !== undefined) db.resources[i].is_active = data.active;
  const r = db.resources[i];
  return { id: r.id, name: r.name, designation: r.designation, team: r.team, active: r.is_active, avatar: r.avatar };
};

// Allocations
export const getAllocations = async (sprintId?: string): Promise<PointAllocation[]> => {
  await delay();
  let allocs = db.sprint_allocations;
  if (sprintId) allocs = allocs.filter((a: any) => a.sprint_id === sprintId);
  return allocs.map((a: any) => ({
    id: a.id, sprintId: a.sprint_id, projectId: a.project_id, resourceId: a.resource_id,
    planned: a.planned_points, actual: a.actual_points, status: a.status === 'complete' ? 'Complete' : a.status === 'in_progress' ? 'In Progress' : 'Not Started'
  }));
};
export const upsertAllocation = async (data: PointAllocation): Promise<PointAllocation> => {
  await delay();
  const i = db.sprint_allocations.findIndex((a: any) => a.id === data.id);
  const statusFormat = data.status === 'Complete' ? 'complete' : data.status === 'In Progress' ? 'in_progress' : 'not_started';
  if (i >= 0) {
    db.sprint_allocations[i].planned_points = data.planned;
    db.sprint_allocations[i].actual_points = data.actual;
    db.sprint_allocations[i].status = statusFormat;
    return data;
  }
  db.sprint_allocations.push({
    id: data.id || `alloc-${Date.now()}`, sprint_id: data.sprintId, project_id: data.projectId, resource_id: data.resourceId,
    planned_points: data.planned, actual_points: data.actual, status: statusFormat, risk_flag: 'none'
  });
  return data;
};
export const deleteAllocation = async (id: string): Promise<void> => {
  await delay();
  const i = db.sprint_allocations.findIndex((a: any) => a.id === id);
  if (i >= 0) db.sprint_allocations.splice(i, 1);
};

// Goals
export const getGoals = async (sprintId?: string): Promise<SprintGoal[]> => {
  await delay();
  let goals = db.sprint_goals;
  if (sprintId) goals = goals.filter((g: any) => g.sprint_id === sprintId);
  return goals.map((g: any) => ({
    id: g.id, sprintId: g.sprint_id, projectId: g.project_id, goal: g.description,
    status: g.status === 'complete' ? 'Complete' : g.status === 'incomplete' ? 'Incomplete' : g.status === 'in_progress' ? 'In Progress' : 'Not Started',
    ownerId: g.owner_resource_id, bugsIdentified: g.bugs_identified, percentDone: g.percent_done,
    deliverables: g.deliverables || '', isHighlighted: g.is_highlighted
  }));
};
export const createGoal = async (data: Omit<SprintGoal, 'id'>): Promise<SprintGoal> => {
  await delay();
  const statusFormat = data.status === 'Complete' ? 'complete' : data.status === 'Incomplete' ? 'incomplete' : data.status === 'In Progress' ? 'in_progress' : 'not_started';
  const g = {
    id: `goal-${Date.now()}`, sprint_id: data.sprintId, project_id: data.projectId, description: data.goal,
    status: statusFormat, owner_resource_id: data.ownerId, bugs_identified: data.bugsIdentified, percent_done: data.percentDone,
    deliverables: data.deliverables, is_highlighted: data.isHighlighted
  };
  db.sprint_goals.push(g);
  return { ...data, id: g.id };
};
export const updateGoal = async (id: string, data: Partial<SprintGoal>): Promise<SprintGoal> => {
  await delay();
  const i = db.sprint_goals.findIndex((x: any) => x.id === id);
  if (data.goal) db.sprint_goals[i].description = data.goal;
  if (data.status) db.sprint_goals[i].status = data.status === 'Complete' ? 'complete' : data.status === 'Incomplete' ? 'incomplete' : data.status === 'In Progress' ? 'in_progress' : 'not_started';
  if (data.ownerId) db.sprint_goals[i].owner_resource_id = data.ownerId;
  if (data.bugsIdentified !== undefined) db.sprint_goals[i].bugs_identified = data.bugsIdentified;
  if (data.percentDone !== undefined) db.sprint_goals[i].percent_done = data.percentDone;
  if (data.deliverables !== undefined) db.sprint_goals[i].deliverables = data.deliverables;
  if (data.isHighlighted !== undefined) db.sprint_goals[i].is_highlighted = data.isHighlighted;
  
  const g = db.sprint_goals[i];
  return { 
    id: g.id, sprintId: g.sprint_id, projectId: g.project_id, goal: g.description,
    status: g.status === 'complete' ? 'Complete' : g.status === 'incomplete' ? 'Incomplete' : g.status === 'in_progress' ? 'In Progress' : 'Not Started',
    ownerId: g.owner_resource_id, bugsIdentified: g.bugs_identified, percentDone: g.percent_done,
    deliverables: g.deliverables || '', isHighlighted: g.is_highlighted
  };
};
export const deleteGoal = async (id: string): Promise<void> => {
  await delay();
  const i = db.sprint_goals.findIndex((x: any) => x.id === id);
  if (i >= 0) db.sprint_goals.splice(i, 1);
};

// Members (Legacy using mockData)
export const getMembers = async (): Promise<Member[]> => { await delay(); return [...mockMembers]; };
export const createMember = async (data: Omit<Member, 'id'>): Promise<Member> => { await delay(); const m = { ...data, id: `m${Date.now()}` }; mockMembers.push(m); return m; };
export const updateMember = async (id: string, data: Partial<Member>): Promise<Member> => { await delay(); const i = mockMembers.findIndex(m => m.id === id); Object.assign(mockMembers[i], data); return mockMembers[i]; };

// Changelogs (Legacy using mockData)
export const getChangelogs = async (sprintId?: string): Promise<SprintChangelog[]> => { await delay(); return sprintId ? mockChangelogs.filter(c => c.sprintId === sprintId) : [...mockChangelogs]; };
export const createChangelog = async (data: Omit<SprintChangelog, 'id'>): Promise<SprintChangelog> => { await delay(); const c = { ...data, id: `cl${Date.now()}` }; mockChangelogs.push(c); return c; };
export const updateChangelog = async (id: string, data: Partial<SprintChangelog>): Promise<SprintChangelog> => { await delay(); const i = mockChangelogs.findIndex(c => c.id === id); Object.assign(mockChangelogs[i], data); return mockChangelogs[i]; };
export const deleteChangelog = async (id: string): Promise<void> => { await delay(); const i = mockChangelogs.findIndex(c => c.id === id); if (i >= 0) mockChangelogs.splice(i, 1); };
