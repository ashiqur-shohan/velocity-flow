import { mockSprints, mockProjects, mockResources, mockAllocations, mockGoals, mockMembers, mockChangelogs } from './mockData';
import type { Sprint, Project, Resource, PointAllocation, SprintGoal, Member, SprintChangelog } from '@/types';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// Sprints
export const getSprints = async (): Promise<Sprint[]> => { await delay(); return [...mockSprints]; };
export const getSprintById = async (id: string): Promise<Sprint | undefined> => { await delay(); return mockSprints.find(s => s.id === id); };
export const createSprint = async (data: Omit<Sprint, 'id'>): Promise<Sprint> => { await delay(); const s = { ...data, id: `s${Date.now()}` }; mockSprints.push(s); return s; };
export const updateSprint = async (id: string, data: Partial<Sprint>): Promise<Sprint> => { await delay(); const i = mockSprints.findIndex(s => s.id === id); Object.assign(mockSprints[i], data); return mockSprints[i]; };

// Projects
export const getProjects = async (): Promise<Project[]> => { await delay(); return [...mockProjects]; };
export const createProject = async (data: Omit<Project, 'id'>): Promise<Project> => { await delay(); const p = { ...data, id: `p${Date.now()}` }; mockProjects.push(p); return p; };
export const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => { await delay(); const i = mockProjects.findIndex(p => p.id === id); Object.assign(mockProjects[i], data); return mockProjects[i]; };

// Resources
export const getResources = async (): Promise<Resource[]> => { await delay(); return [...mockResources]; };
export const createResource = async (data: Omit<Resource, 'id'>): Promise<Resource> => { await delay(); const r = { ...data, id: `r${Date.now()}` }; mockResources.push(r); return r; };
export const updateResource = async (id: string, data: Partial<Resource>): Promise<Resource> => { await delay(); const i = mockResources.findIndex(r => r.id === id); Object.assign(mockResources[i], data); return mockResources[i]; };

// Allocations
export const getAllocations = async (sprintId?: string): Promise<PointAllocation[]> => { await delay(); return sprintId ? mockAllocations.filter(a => a.sprintId === sprintId) : [...mockAllocations]; };
export const upsertAllocation = async (data: PointAllocation): Promise<PointAllocation> => { await delay(); const i = mockAllocations.findIndex(a => a.id === data.id); if (i >= 0) { Object.assign(mockAllocations[i], data); return mockAllocations[i]; } mockAllocations.push(data); return data; };
export const deleteAllocation = async (id: string): Promise<void> => { await delay(); const i = mockAllocations.findIndex(a => a.id === id); if (i >= 0) mockAllocations.splice(i, 1); };

// Goals
export const getGoals = async (sprintId?: string): Promise<SprintGoal[]> => { await delay(); return sprintId ? mockGoals.filter(g => g.sprintId === sprintId) : [...mockGoals]; };
export const createGoal = async (data: Omit<SprintGoal, 'id'>): Promise<SprintGoal> => { await delay(); const g = { ...data, id: `g${Date.now()}` }; mockGoals.push(g); return g; };
export const updateGoal = async (id: string, data: Partial<SprintGoal>): Promise<SprintGoal> => { await delay(); const i = mockGoals.findIndex(g => g.id === id); Object.assign(mockGoals[i], data); return mockGoals[i]; };
export const deleteGoal = async (id: string): Promise<void> => { await delay(); const i = mockGoals.findIndex(g => g.id === id); if (i >= 0) mockGoals.splice(i, 1); };

// Members
export const getMembers = async (): Promise<Member[]> => { await delay(); return [...mockMembers]; };
export const createMember = async (data: Omit<Member, 'id'>): Promise<Member> => { await delay(); const m = { ...data, id: `m${Date.now()}` }; mockMembers.push(m); return m; };
export const updateMember = async (id: string, data: Partial<Member>): Promise<Member> => { await delay(); const i = mockMembers.findIndex(m => m.id === id); Object.assign(mockMembers[i], data); return mockMembers[i]; };

// Changelogs
export const getChangelogs = async (sprintId?: string): Promise<SprintChangelog[]> => { await delay(); return sprintId ? mockChangelogs.filter(c => c.sprintId === sprintId) : [...mockChangelogs]; };
export const createChangelog = async (data: Omit<SprintChangelog, 'id'>): Promise<SprintChangelog> => { await delay(); const c = { ...data, id: `cl${Date.now()}` }; mockChangelogs.push(c); return c; };
export const updateChangelog = async (id: string, data: Partial<SprintChangelog>): Promise<SprintChangelog> => { await delay(); const i = mockChangelogs.findIndex(c => c.id === id); Object.assign(mockChangelogs[i], data); return mockChangelogs[i]; };
export const deleteChangelog = async (id: string): Promise<void> => { await delay(); const i = mockChangelogs.findIndex(c => c.id === id); if (i >= 0) mockChangelogs.splice(i, 1); };
