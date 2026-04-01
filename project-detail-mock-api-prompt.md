# Coding Agent Prompt — Project Detail Page + Mock API Layer
# VeloTrack React Project

## Core Principle — Mock Data as API Layer

Before touching any feature, restructure ALL data access to go through a service layer.
Mock data must never be imported directly into components.
Every service function must look and behave exactly like a real API call (async, try/catch, delay simulation) so that in the future, replacing mock with a real backend requires only editing the service files — zero component changes.

---

## Part 1 — Set Up the Mock API Architecture

### Folder Structure to Create

```
src/
├── mock/
│   ├── db.js              ← single source of truth for all mock data
│   └── delay.js           ← simulates network latency
├── services/
│   ├── projectService.js
│   ├── sprintService.js
│   ├── resourceService.js
│   ├── allocationService.js
│   ├── goalService.js
│   ├── bugService.js
│   └── commentService.js
```

---

### `src/mock/delay.js`

```js
// Simulates real API network delay
// Replace this entire file's usage with nothing when connecting real backend
export const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms))
```

---

### `src/mock/db.js`

This is the single mock database. All service files read from and write to this object.
It is mutable in memory — changes persist for the session (like a real API would).

```js
// ─────────────────────────────────────────────
// VeloTrack Mock Database
// Single source of truth for all mock data.
// DO NOT import this directly into components.
// Always go through service files.
// ─────────────────────────────────────────────

export const db = {

  organizations: [
    {
      id: 'org-001',
      name: 'VeloTrack Organization',
      slug: 'velotrack',
      created_at: '2025-01-01T00:00:00Z',
    }
  ],

  resources: [
    { id: 'res-001', organization_id: 'org-001', name: 'Tausif',    designation: 'Senior Developer', team: 'Backend',  is_active: true },
    { id: 'res-002', organization_id: 'org-001', name: 'Tarek',     designation: 'Developer',        team: 'Backend',  is_active: true },
    { id: 'res-003', organization_id: 'org-001', name: 'Mirza',     designation: 'Developer',        team: 'Frontend', is_active: true },
    { id: 'res-004', organization_id: 'org-001', name: 'Shohan',    designation: 'Developer',        team: 'Backend',  is_active: true },
    { id: 'res-005', organization_id: 'org-001', name: 'Farhan',    designation: 'QA Engineer',      team: 'QA',       is_active: true },
    { id: 'res-006', organization_id: 'org-001', name: 'Asif',      designation: 'Developer',        team: 'Frontend', is_active: true },
    { id: 'res-007', organization_id: 'org-001', name: 'Rusat',     designation: 'Developer',        team: 'Backend',  is_active: false },
    { id: 'res-008', organization_id: 'org-001', name: 'Mahafujul', designation: 'Developer',        team: 'Frontend', is_active: true },
  ],

  projects: [
    {
      id: 'proj-001',
      organization_id: 'org-001',
      name: 'Estate Link',
      description: 'Property management and tenant portal with service fee tracking, mobile app, and Paystation integration.',
      color_tag: '#4F46E5',
      status: 'active',
      total_points: 500,        // ← PM-assigned total project points
      achieved_points: 320,     // ← sum of actual points across all sprints
      manager_id: 'res-001',
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
    },
    {
      id: 'proj-002',
      organization_id: 'org-001',
      name: 'Saudi ERP',
      description: 'Enterprise resource planning system for Saudi client with VAT invoice compliance.',
      color_tag: '#10B981',
      status: 'active',
      total_points: 300,
      achieved_points: 45,
      manager_id: 'res-002',
      created_at: '2025-03-01T00:00:00Z',
      updated_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'proj-003',
      organization_id: 'org-001',
      name: 'S.Ali Project Accounting',
      description: 'Custom accounting module for S.Ali client including CR management and training.',
      color_tag: '#F59E0B',
      status: 'active',
      total_points: 200,
      achieved_points: 168,
      manager_id: 'res-004',
      created_at: '2025-04-10T00:00:00Z',
      updated_at: '2026-02-10T00:00:00Z',
    },
    {
      id: 'proj-004',
      organization_id: 'org-001',
      name: 'Salon ERP',
      description: 'ERP system for salon chain management with booking and inventory modules.',
      color_tag: '#EC4899',
      status: 'active',
      total_points: 150,
      achieved_points: 80,
      manager_id: 'res-004',
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2026-01-20T00:00:00Z',
    },
    {
      id: 'proj-005',
      organization_id: 'org-001',
      name: 'DubaiERP',
      description: 'ERP platform for Dubai-based operations with multi-currency support.',
      color_tag: '#8B5CF6',
      status: 'active',
      total_points: 400,
      achieved_points: 210,
      manager_id: 'res-001',
      created_at: '2025-02-01T00:00:00Z',
      updated_at: '2026-02-15T00:00:00Z',
    },
    {
      id: 'proj-006',
      organization_id: 'org-001',
      name: 'AvailOrtho',
      description: 'Orthopaedic clinic management system with version-controlled documentation.',
      color_tag: '#06B6D4',
      status: 'on_hold',
      total_points: 250,
      achieved_points: 60,
      manager_id: 'res-006',
      created_at: '2025-06-01T00:00:00Z',
      updated_at: '2025-12-01T00:00:00Z',
    },
    {
      id: 'proj-007',
      organization_id: 'org-001',
      name: 'ARAH',
      description: 'Internal ARAH platform — scope TBD.',
      color_tag: '#F97316',
      status: 'active',
      total_points: 100,
      achieved_points: 0,
      manager_id: 'res-003',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'proj-008',
      organization_id: 'org-001',
      name: 'GuruERP',
      description: 'Guru platform revamp with new UI and performance improvements.',
      color_tag: '#84CC16',
      status: 'active',
      total_points: 180,
      achieved_points: 40,
      manager_id: 'res-002',
      created_at: '2025-08-01T00:00:00Z',
      updated_at: '2026-01-10T00:00:00Z',
    },
    {
      id: 'proj-009',
      organization_id: 'org-001',
      name: 'Others',
      description: 'Miscellaneous tasks and support work not tied to a specific project.',
      color_tag: '#6B7280',
      status: 'active',
      total_points: 200,
      achieved_points: 90,
      manager_id: 'res-001',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2026-02-01T00:00:00Z',
    },
  ],

  // Points update audit log — one entry per update event
  project_points_audit: [
    {
      id: 'audit-001',
      project_id: 'proj-001',
      changed_by_name: 'Tausif',
      changed_by_id: 'res-001',
      previous_total_points: 400,
      new_total_points: 500,
      note: 'Scope extended to include Paystation integration module.',
      changed_at: '2026-01-15T10:30:00Z',
    },
    {
      id: 'audit-002',
      project_id: 'proj-001',
      changed_by_name: 'Tausif',
      changed_by_id: 'res-001',
      previous_total_points: 350,
      new_total_points: 400,
      note: 'Added mobile app scope.',
      changed_at: '2025-11-10T09:00:00Z',
    },
    {
      id: 'audit-003',
      project_id: 'proj-002',
      changed_by_name: 'Tarek',
      changed_by_id: 'res-002',
      previous_total_points: 200,
      new_total_points: 300,
      note: 'VAT compliance module added to scope.',
      changed_at: '2026-01-20T14:00:00Z',
    },
  ],

  sprints: [
    {
      id: 'sprint-001',
      organization_id: 'org-001',
      name: 'Sprint Feb 22 – Mar 25',
      start_date: '2026-02-22',
      end_date: '2026-03-25',
      sprint_length_days: 31,
      status: 'active',
      created_at: '2026-02-20T00:00:00Z',
    },
    {
      id: 'sprint-002',
      organization_id: 'org-001',
      name: 'Sprint Jan 20 – Feb 21',
      start_date: '2026-01-20',
      end_date: '2026-02-21',
      sprint_length_days: 32,
      status: 'completed',
      created_at: '2026-01-18T00:00:00Z',
    },
    {
      id: 'sprint-003',
      organization_id: 'org-001',
      name: 'Sprint Mar 26 – Apr 25',
      start_date: '2026-03-26',
      end_date: '2026-04-25',
      sprint_length_days: 30,
      status: 'planning',
      created_at: '2026-03-20T00:00:00Z',
    },
  ],

  sprint_allocations: [
    // Sprint 1 — Estate Link
    { id: 'alloc-001', sprint_id: 'sprint-001', project_id: 'proj-001', resource_id: 'res-001', planned_points: 31, actual_points: 31, status: 'complete',     risk_flag: 'none' },
    { id: 'alloc-002', sprint_id: 'sprint-001', project_id: 'proj-001', resource_id: 'res-002', planned_points: 42, actual_points: 31, status: 'complete',     risk_flag: 'high' },
    { id: 'alloc-003', sprint_id: 'sprint-001', project_id: 'proj-001', resource_id: 'res-003', planned_points: 40, actual_points: 33, status: 'complete',     risk_flag: 'none' },
    { id: 'alloc-004', sprint_id: 'sprint-001', project_id: 'proj-001', resource_id: 'res-004', planned_points:  4, actual_points:  4, status: 'complete',     risk_flag: 'none' },
    // Sprint 1 — Saudi ERP
    { id: 'alloc-005', sprint_id: 'sprint-001', project_id: 'proj-002', resource_id: 'res-002', planned_points: 10, actual_points:  0, status: 'in_progress',  risk_flag: 'high' },
    // Sprint 1 — S.Ali Accounting
    { id: 'alloc-006', sprint_id: 'sprint-001', project_id: 'proj-003', resource_id: 'res-004', planned_points: 34, actual_points: 34, status: 'complete',     risk_flag: 'none' },
    // Sprint 1 — Others
    { id: 'alloc-007', sprint_id: 'sprint-001', project_id: 'proj-009', resource_id: 'res-001', planned_points: 20, actual_points: 20, status: 'complete',     risk_flag: 'none' },
    { id: 'alloc-008', sprint_id: 'sprint-001', project_id: 'proj-009', resource_id: 'res-004', planned_points: 10, actual_points: 10, status: 'complete',     risk_flag: 'none' },
    // Sprint 2 (completed) — Estate Link
    { id: 'alloc-009', sprint_id: 'sprint-002', project_id: 'proj-001', resource_id: 'res-001', planned_points: 30, actual_points: 28, status: 'complete',     risk_flag: 'none' },
    { id: 'alloc-010', sprint_id: 'sprint-002', project_id: 'proj-001', resource_id: 'res-002', planned_points: 35, actual_points: 35, status: 'complete',     risk_flag: 'none' },
    // Sprint 2 — DubaiERP
    { id: 'alloc-011', sprint_id: 'sprint-002', project_id: 'proj-005', resource_id: 'res-003', planned_points: 40, actual_points: 35, status: 'complete',     risk_flag: 'none' },
    { id: 'alloc-012', sprint_id: 'sprint-002', project_id: 'proj-005', resource_id: 'res-006', planned_points: 20, actual_points: 20, status: 'complete',     risk_flag: 'none' },
  ],

  sprint_resource_comments: [
    { id: 'src-001', sprint_id: 'sprint-001', resource_id: 'res-001', comment: 'Testing 5, In progress 10', updated_at: '2026-02-22T00:00:00Z' },
    { id: 'src-002', sprint_id: 'sprint-001', resource_id: 'res-002', comment: 'Testing 17',               updated_at: '2026-02-22T00:00:00Z' },
    { id: 'src-003', sprint_id: 'sprint-001', resource_id: 'res-003', comment: 'Testing 1, In progress 7', updated_at: '2026-02-22T00:00:00Z' },
  ],

  sprint_goals: [
    { id: 'goal-001', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Service Fee is done',               status: 'complete',   owner_resource_id: 'res-002', bugs_identified: 100, percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-002', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Service Fee Mobile is done',        status: 'complete',   owner_resource_id: 'res-003', bugs_identified: 0,   percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-003', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Accounting feedback incorporated',  status: 'complete',   owner_resource_id: 'res-001', bugs_identified: 0,   percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-004', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Paystation Integration is done',   status: 'complete',   owner_resource_id: 'res-003', bugs_identified: 0,   percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-005', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Playstore release',                status: 'complete',   owner_resource_id: 'res-001', bugs_identified: 0,   percent_done: 100, deliverables: 'APK on Playstore',     is_highlighted: false },
    { id: 'goal-006', sprint_id: 'sprint-001', project_id: 'proj-001', description: 'Android and Apple account',        status: 'complete',   owner_resource_id: 'res-001', bugs_identified: 0,   percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-007', sprint_id: 'sprint-001', project_id: 'proj-003', description: 'CR from Salah Uddin',              status: 'complete',   owner_resource_id: 'res-004', bugs_identified: 0,   percent_done: 100, deliverables: null,                   is_highlighted: false },
    { id: 'goal-008', sprint_id: 'sprint-001', project_id: 'proj-003', description: 'Training done by Shohan',          status: 'incomplete', owner_resource_id: 'res-004', bugs_identified: 0,   percent_done: 0,   deliverables: null,                   is_highlighted: true  },
    { id: 'goal-009', sprint_id: 'sprint-001', project_id: 'proj-004', description: 'New release',                      status: 'complete',   owner_resource_id: 'res-004', bugs_identified: 0,   percent_done: 100, deliverables: 'v2.1.0 released',      is_highlighted: false },
  ],

  sprint_bugs: [
    { id: 'bug-001', organization_id: 'org-001', sprint_id: 'sprint-001', project_id: 'proj-001', title: 'Service fee incorrect for partial months', description: 'Prorated fee calculation wrong for mid-month joins.', severity: 'high',     status: 'open',      source: 'internal_testing', reported_by: 'res-002', assigned_to: 'res-001', resolved_at: null,                   resolution_note: null,               created_at: '2026-03-01T10:00:00Z' },
    { id: 'bug-002', organization_id: 'org-001', sprint_id: 'sprint-001', project_id: 'proj-001', title: 'Playstore build crashes on Android 12',    description: 'APK launch crash on Android 12 devices only.',        severity: 'critical', status: 'resolved',  source: 'internal_testing', reported_by: 'res-001', assigned_to: 'res-003', resolved_at: '2026-03-05T16:00:00Z', resolution_note: 'Fixed gradle config', created_at: '2026-02-28T09:00:00Z' },
    { id: 'bug-003', organization_id: 'org-001', sprint_id: 'sprint-001', project_id: 'proj-002', title: 'Invoice export missing VAT column',         description: 'PDF export does not include VAT breakdown.',          severity: 'medium',   status: 'open',      source: 'client_reported',  reported_by: 'res-002', assigned_to: 'res-002', resolved_at: null,                   resolution_note: null,               created_at: '2026-03-10T11:00:00Z' },
    { id: 'bug-004', organization_id: 'org-001', sprint_id: 'sprint-001', project_id: 'proj-003', title: 'Training recording not saved',              description: 'Screen recording not saved to server after session.', severity: 'low',      status: 'wont_fix',  source: 'sprint_review',    reported_by: 'res-004', assigned_to: null,      resolved_at: null,                   resolution_note: 'Out of scope',     created_at: '2026-03-15T14:00:00Z' },
  ],

  sprint_close_log: [],
}
```

---

## Part 2 — Service Files (Mock API Pattern)

Every service function must:
1. `await delay()` — simulate network latency
2. Operate on `db` object (read, mutate, return cloned data)
3. Be `async` and throw errors on failure
4. Return data in the same shape a real REST API or Supabase would return

### `src/services/projectService.js`

```js
import { db } from '../mock/db'
import { delay } from '../mock/delay'

export const getProjects = async (orgId, status = null) => {
  await delay()
  let projects = db.projects.filter(p => p.organization_id === orgId)
  if (status) projects = projects.filter(p => p.status === status)
  // Enrich with computed fields
  return projects.map(p => enrichProject(p))
}

export const getProjectById = async (projectId) => {
  await delay()
  const project = db.projects.find(p => p.id === projectId)
  if (!project) throw new Error('Project not found')
  return enrichProject(project)
}

// Enrich project with sprint history and computed progress
const enrichProject = (project) => {
  // Get all allocations for this project across all sprints
  const allocations = db.sprint_allocations.filter(a => a.project_id === project.id)

  // Compute achieved points from allocations (sum of actual_points)
  const achieved_from_allocations = allocations.reduce((sum, a) => sum + a.actual_points, 0)

  // Sprint history for this project
  const sprintIds = [...new Set(allocations.map(a => a.sprint_id))]
  const sprint_history = sprintIds.map(sid => {
    const sprint = db.sprints.find(s => s.id === sid)
    const sprintAllocs = allocations.filter(a => a.sprint_id === sid)
    const planned = sprintAllocs.reduce((s, a) => s + a.planned_points, 0)
    const actual  = sprintAllocs.reduce((s, a) => s + a.actual_points, 0)
    return {
      sprint_id: sid,
      sprint_name: sprint?.name,
      start_date: sprint?.start_date,
      end_date: sprint?.end_date,
      status: sprint?.status,
      planned_points: planned,
      actual_points: actual,
      productivity_pct: planned > 0 ? Math.round((actual / planned) * 100) : 0,
    }
  }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date))

  // Manager info
  const manager = db.resources.find(r => r.id === project.manager_id) || null

  // Progress %
  const progress_pct = project.total_points > 0
    ? Math.min(Math.round((project.achieved_points / project.total_points) * 100), 100)
    : 0

  return {
    ...project,
    achieved_points: project.achieved_points,
    progress_pct,
    manager,
    sprint_history,
    total_sprints: sprintIds.length,
  }
}

export const createProject = async (orgId, payload) => {
  await delay()
  const newProject = {
    id: `proj-${Date.now()}`,
    organization_id: orgId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_points: 0,
    achieved_points: 0,
    status: 'active',
    ...payload,
  }
  db.projects.push(newProject)
  return enrichProject(newProject)
}

export const updateProject = async (projectId, payload) => {
  await delay()
  const index = db.projects.findIndex(p => p.id === projectId)
  if (index === -1) throw new Error('Project not found')
  db.projects[index] = {
    ...db.projects[index],
    ...payload,
    updated_at: new Date().toISOString(),
  }
  return enrichProject(db.projects[index])
}

// Update total_points with audit log entry
export const updateProjectPoints = async (projectId, newTotalPoints, note, changedByResource) => {
  await delay()
  const index = db.projects.findIndex(p => p.id === projectId)
  if (index === -1) throw new Error('Project not found')

  const previousPoints = db.projects[index].total_points

  // Update project
  db.projects[index] = {
    ...db.projects[index],
    total_points: newTotalPoints,
    updated_at: new Date().toISOString(),
  }

  // Write audit log
  const auditEntry = {
    id: `audit-${Date.now()}`,
    project_id: projectId,
    changed_by_id: changedByResource?.id || 'unknown',
    changed_by_name: changedByResource?.name || 'Unknown',
    previous_total_points: previousPoints,
    new_total_points: newTotalPoints,
    note: note || null,
    changed_at: new Date().toISOString(),
  }
  db.project_points_audit.push(auditEntry)

  return {
    project: enrichProject(db.projects[index]),
    audit_entry: auditEntry,
  }
}

export const archiveProject = async (projectId) => {
  return updateProject(projectId, { status: 'archived' })
}

// Get points audit log for a project (newest first)
export const getProjectPointsAuditLog = async (projectId) => {
  await delay()
  return db.project_points_audit
    .filter(a => a.project_id === projectId)
    .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at))
}

// Get project analytics (for the detail page charts)
export const getProjectAnalytics = async (projectId) => {
  await delay()
  const allocations = db.sprint_allocations.filter(a => a.project_id === projectId)

  // Velocity per sprint
  const sprintIds = [...new Set(allocations.map(a => a.sprint_id))]
  const velocity_by_sprint = sprintIds.map(sid => {
    const sprint = db.sprints.find(s => s.id === sid)
    const sprintAllocs = allocations.filter(a => a.sprint_id === sid)
    const planned = sprintAllocs.reduce((s, a) => s + a.planned_points, 0)
    const actual  = sprintAllocs.reduce((s, a) => s + a.actual_points, 0)
    return {
      sprint_name: sprint?.name || sid,
      planned,
      actual,
      productivity_pct: planned > 0 ? Math.round((actual / planned) * 100) : 0,
    }
  }).sort((a, b) => a.sprint_name.localeCompare(b.sprint_name))

  // Resource contribution
  const resourceIds = [...new Set(allocations.map(a => a.resource_id))]
  const resource_contribution = resourceIds.map(rid => {
    const resource = db.resources.find(r => r.id === rid)
    const resourceAllocs = allocations.filter(a => a.resource_id === rid)
    return {
      resource_name: resource?.name || rid,
      total_planned: resourceAllocs.reduce((s, a) => s + a.planned_points, 0),
      total_actual:  resourceAllocs.reduce((s, a) => s + a.actual_points,  0),
    }
  }).sort((a, b) => b.total_actual - a.total_actual)

  // Bug summary for this project
  const bugs = db.sprint_bugs.filter(b => b.project_id === projectId)
  const bug_summary = {
    total:    bugs.length,
    open:     bugs.filter(b => b.status === 'open').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    critical: bugs.filter(b => b.severity === 'critical').length,
    high:     bugs.filter(b => b.severity === 'high').length,
  }

  // Goal completion history
  const goals = db.sprint_goals.filter(g => g.project_id === projectId)
  const goal_summary = {
    total:     goals.length,
    complete:  goals.filter(g => g.status === 'complete').length,
    incomplete: goals.filter(g => g.status === 'incomplete').length,
  }

  return { velocity_by_sprint, resource_contribution, bug_summary, goal_summary }
}
```

---

## Part 3 — Routing Change

### Update `App.jsx` (or your router file)

**Remove** any existing route that opens a drawer on project click.

**Add** a new route for the project detail page:

```jsx
import ProjectDetailPage from './pages/projects/ProjectDetailPage'

// In your routes:
<Route path="/projects"          element={<ProjectsPage />} />
<Route path="/projects/:id"      element={<ProjectDetailPage />} />
```

### Update Project Card Click in `ProjectsPage`

**Remove** the drawer open logic.
**Replace** with React Router navigation:

```jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// On card click:
onClick={() => navigate(`/projects/${project.id}`)}
```

Keep a separate "⋮" menu or small edit icon on the card for quick edit without navigating (optional — see Part 5).

---

## Part 4 — Project Card Update (Projects List Page)

Update each project card to show a **progress bar**.

### Updated Card Layout

```
┌─────────────────────────────────────────────────┐
│  🔵  Estate Link                    [Active ▼]  │
│  Property management and tenant portal...        │
│                                                 │
│  ████████████░░░░░░  64%                        │
│  320 / 500 pts                                  │
│                                                 │
│  📅 3 sprints   👤 Tausif   🐛 2 bugs          │
└─────────────────────────────────────────────────┘
```

```jsx
// Inside the project card component, add below description:

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

// Footer row:
<div className="flex gap-4 mt-3 text-xs text-gray-400">
  <span>📅 {project.total_sprints} sprints</span>
  <span>👤 {project.manager?.name || '—'}</span>
</div>
```

Progress color helper:
```js
const progressColor = (pct) => {
  if (pct >= 80) return '#10B981'   // green
  if (pct >= 50) return '#F59E0B'   // amber
  return '#F43F5E'                   // red
}
```

---

## Part 5 — Project Detail Page

Create new file: `src/pages/projects/ProjectDetailPage.jsx`

### Full Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Projects                                              │
│                                                                  │
│  🔵 Estate Link                              [Edit Project]      │
│  Property management platform                [Active]           │
│  Manager: Tausif · Created Jan 15, 2025                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [ Total Points Progress ]                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Total Points: 500      Achieved: 320     Remaining: 180   │  │
│  │  ████████████████████░░░░░░░░░░   64%                      │  │
│  │                              [✏️ Update Points]            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [ Analytics Row — 4 stat cards ]                                │
│  [ Total Sprints: 3 ] [ Avg Productivity: 87% ] [ Total Bugs: 2] │
│  [ Goals Complete: 6/7 ]                                         │
│                                                                  │
│  [ Charts Row — 2 columns ]                                      │
│  Left: Sprint Velocity (bar chart — planned vs actual per sprint)│
│  Right: Resource Contribution (horizontal bar chart)             │
│                                                                  │
│  [ Sprint History Table ]                                        │
│  Sprint | Planned | Actual | Productivity% | Status             │
│                                                                  │
│  [ Points Audit Log ]                                            │
│  Timeline of total_points changes with who/when/why             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### Section 1 — Page Header

```jsx
// Back button
<Button
  icon={<ArrowLeftOutlined />}
  type="text"
  onClick={() => navigate('/projects')}
>
  Back to Projects
</Button>

// Project name + status + edit button
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div
      className="w-4 h-4 rounded-full"
      style={{ backgroundColor: project.color_tag }}
    />
    <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
    <Tag color={statusTagColor(project.status)}>
      {project.status.replace('_', ' ').toUpperCase()}
    </Tag>
  </div>
  <Button icon={<EditOutlined />} onClick={() => setEditDrawerOpen(true)}>
    Edit Project
  </Button>
</div>

<p className="text-gray-500 mt-1">{project.description}</p>
<div className="flex gap-4 text-sm text-gray-400 mt-2">
  <span>👤 Manager: {project.manager?.name || '—'}</span>
  <span>📅 Created: {dayjs(project.created_at).format('MMM D, YYYY')}</span>
  <span>🔄 Updated: {dayjs(project.updated_at).format('MMM D, YYYY')}</span>
</div>
```

---

### Section 2 — Total Points Progress Card

```
┌─────────────────────────────────────────────────────────┐
│  Project Points Progress                                │
│                                                         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Total Points │ │  Achieved    │ │  Remaining   │   │
│  │     500      │ │     320      │ │     180      │   │
│  └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                         │
│  ████████████████████░░░░░░░░░░░░   64%                │
│                                                         │
│                          [✏️ Update Total Points]       │
└─────────────────────────────────────────────────────────┘
```

"Update Total Points" button → opens a **modal** (NOT inline, NOT a drawer):

**Update Points Modal:**
```
┌──────────────────────────────────────┐
│  Update Total Project Points    [X]  │
├──────────────────────────────────────┤
│                                      │
│  Current Total Points:  500          │
│                                      │
│  New Total Points *                  │
│  [ number input, min: 1 ]            │
│                                      │
│  Reason for change *                 │
│  [ textarea, required ]              │
│                                      │
│       [Cancel]  [Save Changes]       │
└──────────────────────────────────────┘
```

On submit:
```js
const result = await updateProjectPoints(
  project.id,
  newPoints,
  reason,
  currentUser  // pass the logged-in resource/user object
)
// Update local state with result.project
// Prepend result.audit_entry to local auditLog state
// Show message.success('Points updated')
```

---

### Section 3 — Analytics Stat Cards

Four cards in a row using Ant Design `Statistic`:

```jsx
<Row gutter={16}>
  <Col span={6}>
    <Card><Statistic title="Total Sprints"       value={analytics.velocity_by_sprint.length} /></Card>
  </Col>
  <Col span={6}>
    <Card><Statistic title="Avg Productivity"    value={avgProductivity} suffix="%" valueStyle={{ color: '#10B981' }} /></Card>
  </Col>
  <Col span={6}>
    <Card><Statistic title="Total Bugs"          value={analytics.bug_summary.total}    /></Card>
  </Col>
  <Col span={6}>
    <Card><Statistic title="Goals Completed"
      value={`${analytics.goal_summary.complete} / ${analytics.goal_summary.total}`}
    /></Card>
  </Col>
</Row>
```

---

### Section 4 — Analytics Charts (Recharts)

Two charts side by side:

**Left — Sprint Velocity Bar Chart:**
- X-axis: Sprint names (shortened)
- Y-axis: Points
- Two bars per sprint: `planned` (indigo `#4F46E5`) and `actual` (emerald `#10B981`)
- Data from: `analytics.velocity_by_sprint`

**Right — Resource Contribution Horizontal Bar:**
- Y-axis: Resource names
- X-axis: Points
- Single bar per resource showing `total_actual`
- Color: indigo gradient
- Data from: `analytics.resource_contribution`

```jsx
// Sprint Velocity
<BarChart data={analytics.velocity_by_sprint} width={500} height={250}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="sprint_name" tick={{ fontSize: 11 }} />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="planned" name="Planned" fill="#4F46E5" radius={[4,4,0,0]} />
  <Bar dataKey="actual"  name="Actual"  fill="#10B981" radius={[4,4,0,0]} />
</BarChart>

// Resource Contribution
<BarChart
  layout="vertical"
  data={analytics.resource_contribution}
  width={400} height={250}
>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis type="category" dataKey="resource_name" width={70} tick={{ fontSize: 12 }} />
  <Tooltip />
  <Bar dataKey="total_actual" name="Points Delivered" fill="#4F46E5" radius={[0,4,4,0]} />
</BarChart>
```

---

### Section 5 — Sprint History Table

Ant Design Table showing every sprint this project appeared in:

| Column | Field |
|---|---|
| Sprint | `sprint_name` |
| Dates | `start_date – end_date` |
| Planned | `planned_points` |
| Actual | `actual_points` |
| Productivity | `productivity_pct` with colored badge |
| Status | sprint status tag |

Clicking a sprint row → `navigate('/sprints/' + row.sprint_id)`

---

### Section 6 — Points Audit Log

Timeline component showing every time `total_points` was changed.

Use Ant Design `Timeline`:

```jsx
<Timeline>
  {auditLog.map(entry => (
    <Timeline.Item
      key={entry.id}
      color={entry.new_total_points > entry.previous_total_points ? 'green' : 'red'}
    >
      <div className="flex flex-col">
        <span className="font-medium text-gray-700">
          Points changed: {entry.previous_total_points} → {entry.new_total_points}
          <Tag className="ml-2" color={entry.new_total_points > entry.previous_total_points ? 'green' : 'red'}>
            {entry.new_total_points > entry.previous_total_points ? '▲' : '▼'}
            {Math.abs(entry.new_total_points - entry.previous_total_points)} pts
          </Tag>
        </span>
        {entry.note && (
          <span className="text-gray-500 text-sm mt-0.5">"{entry.note}"</span>
        )}
        <span className="text-gray-400 text-xs mt-0.5">
          by {entry.changed_by_name} · {dayjs(entry.changed_at).format('MMM D, YYYY h:mm A')}
        </span>
      </div>
    </Timeline.Item>
  ))}
</Timeline>
```

If `auditLog` is empty, show:
```jsx
<Empty description="No points updates recorded yet" />
```

---

### Section 7 — Edit Project Drawer

Triggered by "Edit Project" button in the page header.
Use Ant Design `Drawer` from the right, width: `480px`.

**Form fields:**
```
Project Name *           [Input]
Description              [TextArea, 4 rows]
Status *                 [Select: active / on_hold / archived]
Color Tag                [8 color swatches — radio group]
Project Manager          [Select from resources list]
```

On submit → `updateProject(project.id, formValues)` → update local state → show success message → close drawer.

**Color swatches:**
```js
const COLOR_OPTIONS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#F97316', '#6B7280',
]
```

---

### Data Loading in ProjectDetailPage

```jsx
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProjectById,
  getProjectAnalytics,
  getProjectPointsAuditLog,
  updateProject,
  updateProjectPoints,
} from '../../services/projectService'

const { id } = useParams()

// State
const [project,   setProject]   = useState(null)
const [analytics, setAnalytics] = useState(null)
const [auditLog,  setAuditLog]  = useState([])
const [loading,   setLoading]   = useState(true)

// Load everything in parallel
useEffect(() => {
  const load = async () => {
    try {
      setLoading(true)
      const [proj, anal, audit] = await Promise.all([
        getProjectById(id),
        getProjectAnalytics(id),
        getProjectPointsAuditLog(id),
      ])
      setProject(proj)
      setAnalytics(anal)
      setAuditLog(audit)
    } catch (err) {
      message.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [id])

// Show Skeleton while loading
if (loading) return <PageSkeleton />
if (!project) return <Result status="404" title="Project not found" />
```

---

## Summary of Changes

| Action | File |
|---|---|
| CREATE | `src/mock/db.js` |
| CREATE | `src/mock/delay.js` |
| CREATE | `src/services/projectService.js` (full version above) |
| CREATE | `src/pages/projects/ProjectDetailPage.jsx` |
| MODIFY | `src/App.jsx` — add `/projects/:id` route |
| MODIFY | `src/pages/projects/ProjectsPage.jsx` — card click → navigate, remove drawer, add progress bar |
| MODIFY | All other existing service files — import from `mock/db` and `mock/delay` instead of local mock arrays |

---

## Acceptance Criteria

### Mock API Architecture
- [ ] No component imports mock data directly — always via a service function
- [ ] All service functions are `async` and use `await delay()`
- [ ] Changes made via service functions persist in `db` for the session (adding a project appears immediately in the list)
- [ ] All existing features (sprints, resources, goals) continue to work using the same `db` object

### Projects Page
- [ ] Clicking a project card navigates to `/projects/:id` (no drawer)
- [ ] Each card shows progress bar with `achieved / total pts` and `%`
- [ ] Progress bar color: green ≥ 80%, amber ≥ 50%, red < 50%
- [ ] Card shows manager name and total sprint count

### Project Detail Page
- [ ] Page loads all data in parallel with loading skeleton
- [ ] Header shows project name, color dot, status tag, manager, dates
- [ ] "Edit Project" drawer opens and saves changes correctly
- [ ] Points progress card shows total / achieved / remaining + progress bar
- [ ] "Update Total Points" modal requires both new value and reason
- [ ] Saving points update adds entry to audit log immediately (no page reload)
- [ ] Points audit log shows timeline with change direction, amount, note, who, when
- [ ] Analytics stat cards show correct computed values
- [ ] Sprint velocity bar chart renders with planned vs actual bars
- [ ] Resource contribution horizontal bar chart renders
- [ ] Sprint history table is clickable → navigates to that sprint
- [ ] Empty state shown when no sprint history exists
- [ ] Back button navigates to `/projects`
