import { db } from '../mock/db'
import { delay } from '../mock/delay'

export const getProjects = async (orgId: string, status: string | null = null) => {
  await delay()
  let projects = db.projects.filter((p: any) => p.organization_id === orgId)
  if (status) projects = projects.filter((p: any) => p.status === status)
  // Enrich with computed fields
  return projects.map((p: any) => enrichProject(p))
}

export const getProjectById = async (projectId: string) => {
  await delay()
  const project = db.projects.find((p: any) => p.id === projectId)
  if (!project) throw new Error('Project not found')
  return enrichProject(project)
}

// Enrich project with sprint history and computed progress
const enrichProject = (project: any) => {
  // Get all allocations for this project across all sprints
  const allocations = db.sprint_allocations.filter((a: any) => a.project_id === project.id)

  // Compute achieved points from allocations (sum of actual_points)
  const achieved_from_allocations = allocations.reduce((sum: number, a: any) => sum + a.actual_points, 0)

  // Sprint history for this project
  const sprintIds = [...new Set(allocations.map((a: any) => a.sprint_id))] as string[];
  const sprint_history = sprintIds.map((sid: string) => {
    const sprint = db.sprints.find((s: any) => s.id === sid)
    const sprintAllocs = allocations.filter((a: any) => a.sprint_id === sid)
    const planned = sprintAllocs.reduce((s: number, a: any) => s + a.planned_points, 0)
    const actual  = sprintAllocs.reduce((s: number, a: any) => s + a.actual_points, 0)
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
  }).sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())

  // Manager info
  const manager = db.resources.find((r: any) => r.id === project.manager_id) || null

  // Progress %
  const progress_pct = project.total_points > 0
    ? Math.min(Math.round((project.achieved_points / project.total_points) * 100), 100)
    : 0

  return {
    ...project,
    achieved_points: project.achieved_points, // using the actual set value, though maybe we just keep it
    progress_pct,
    manager,
    sprint_history,
    total_sprints: sprintIds.length,
  }
}

export const createProject = async (orgId: string, payload: any) => {
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

export const updateProject = async (projectId: string, payload: any) => {
  await delay()
  const index = db.projects.findIndex((p: any) => p.id === projectId)
  if (index === -1) throw new Error('Project not found')
  db.projects[index] = {
    ...db.projects[index],
    ...payload,
    updated_at: new Date().toISOString(),
  }
  return enrichProject(db.projects[index])
}

// Update total_points with audit log entry
export const updateProjectPoints = async (projectId: string, newTotalPoints: number, note: string, changedByResource: any) => {
  await delay()
  const index = db.projects.findIndex((p: any) => p.id === projectId)
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

export const archiveProject = async (projectId: string) => {
  return updateProject(projectId, { status: 'archived' })
}

// Get points audit log for a project (newest first)
export const getProjectPointsAuditLog = async (projectId: string) => {
  await delay()
  return db.project_points_audit
    .filter((a: any) => a.project_id === projectId)
    .sort((a: any, b: any) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
}

// Get project analytics (for the detail page charts)
export const getProjectAnalytics = async (projectId: string) => {
  await delay()
  const allocations = db.sprint_allocations.filter((a: any) => a.project_id === projectId)

  // Velocity per sprint
  const sprintIds = [...new Set(allocations.map((a: any) => a.sprint_id))] as string[];
  const velocity_by_sprint = sprintIds.map((sid: string) => {
    const sprint = db.sprints.find((s: any) => s.id === sid)
    const sprintAllocs = allocations.filter((a: any) => a.sprint_id === sid)
    const planned = sprintAllocs.reduce((s: number, a: any) => s + a.planned_points, 0)
    const actual  = sprintAllocs.reduce((s: number, a: any) => s + a.actual_points, 0)
    return {
      sprint_name: sprint?.name || sid,
      planned,
      actual,
      productivity_pct: planned > 0 ? Math.round((actual / planned) * 100) : 0,
    }
  }).sort((a: any, b: any) => a.sprint_name.localeCompare(b.sprint_name))

  // Resource contribution
  const resourceIds = [...new Set(allocations.map((a: any) => a.resource_id))] as string[];
  const resource_contribution = resourceIds.map((rid: string) => {
    const resource = db.resources.find((r: any) => r.id === rid)
    const resourceAllocs = allocations.filter((a: any) => a.resource_id === rid)
    return {
      resource_name: resource?.name || rid,
      total_actual:  resourceAllocs.reduce((s: number, a: any) => s + a.actual_points,  0),
    }
  }).sort((a: any, b: any) => b.total_actual - a.total_actual)

  // Bug summary for this project
  const bugs = db.sprint_bugs.filter((b: any) => b.project_id === projectId)
  const bug_summary = {
    total:    bugs.length,
    open:     bugs.filter((b: any) => b.status === 'open').length,
    resolved: bugs.filter((b: any) => b.status === 'resolved').length,
    critical: bugs.filter((b: any) => b.severity === 'critical').length,
    high:     bugs.filter((b: any) => b.severity === 'high').length,
  }

  // Goal completion history
  const goals = db.sprint_goals.filter((g: any) => g.project_id === projectId)
  const goal_summary = {
    total:     goals.length,
    complete:  goals.filter((g: any) => g.status === 'complete').length,
    incomplete: goals.filter((g: any) => g.status === 'incomplete').length,
  }

  return { velocity_by_sprint, resource_contribution, bug_summary, goal_summary }
}
