import { supabase } from '../lib/supabase'

// Sprint-wise report — uses the pre-built views
export const getSprintReport = async (sprintId: string) => {
  const [
    { data: sprintData, error: sprintError },
    { data: resourceProductivity, error: rpError },
    { data: projectSummary, error: psError },
    { data: goals, error: goalsError }
  ] = await Promise.all([
    supabase.from('sprints').select('*').eq('id', sprintId).single(),
    supabase.from('v_sprint_resource_productivity').select('*').eq('sprint_id', sprintId),
    supabase.from('v_sprint_project_summary').select('*').eq('sprint_id', sprintId),
    supabase.from('sprint_goals').select('*, project:project_id(name), owner:owner_resource_id(name)').eq('sprint_id', sprintId)
  ])

  if (sprintError || rpError || psError || goalsError) {
    throw (sprintError || rpError || psError || goalsError)
  }

  return { sprint: sprintData, resourceProductivity, projectSummary, goals }
}

// Resource-wise report across multiple sprints
export const getResourceReport = async (_orgId: string, resourceId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('sprint_allocations')
    .select(`
      *,
      sprint:sprint_id (id, name, start_date, end_date),
      project:project_id (id, name, color_tag)
    `)
    .eq('resource_id', resourceId)

  if (startDate) query = query.gte('sprint.start_date', startDate)
  if (endDate) query = query.lte('sprint.end_date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Project-wise report across multiple sprints
export const getProjectReport = async (projectId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('sprint_allocations')
    .select(`
      *,
      sprint:sprint_id (id, name, start_date, end_date),
      resource:resource_id (id, name)
    `)
    .eq('project_id', projectId)

  if (startDate) query = query.gte('sprint.start_date', startDate)
  if (endDate) query = query.lte('sprint.end_date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Org-wide productivity summary (uses the overall view)
export const getOrgProductivitySummary = async (_orgId: string) => {
  const { data, error } = await supabase
    .from('v_sprint_overall_productivity')
    .select('*')
    .order('start_date', { ascending: false })
  if (error) throw error
  return data
}
