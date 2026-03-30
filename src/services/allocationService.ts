import { supabase } from '../lib/supabase'

// Get all allocations for an organization across all sprints
export const getOrgAllocations = async (orgId: string) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .select(`
      *,
      sprint!inner (id, name, start_date, end_date, organization_id),
      project:project_id (id, name, color_tag),
      resource:resource_id (id, name, designation)
    `)
    .eq('sprint.organization_id', orgId)
  if (error) throw error
  return data
}

// Get all allocations for a sprint — with project and resource details joined
export const getSprintAllocations = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .select(`
      *,
      project:project_id (id, name, color_tag),
      resource:resource_id (id, name, designation)
    `)
    .eq('sprint_id', sprintId)
  if (error) throw error
  return data
}

// Get the pre-built productivity view for a sprint
export const getSprintResourceProductivity = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('v_sprint_resource_productivity')
    .select('*')
    .eq('sprint_id', sprintId)
  if (error) throw error
  return data
}

// Get the project summary view for a sprint
export const getSprintProjectSummary = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('v_sprint_project_summary')
    .select('*')
    .eq('sprint_id', sprintId)
  if (error) throw error
  return data
}

// Create a new allocation (a new cell in the grid)
export const createAllocation = async (sprintId: string, projectId: string, resourceId: string, plannedPoints = 0) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .insert({
      sprint_id: sprintId,
      project_id: projectId,
      resource_id: resourceId,
      planned_points: plannedPoints,
      actual_points: 0,
      status: 'not_started'
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Update an existing allocation (planned points, actual points, or status)
export const updateAllocation = async (allocationId: string, payload: any) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .update(payload)
    .eq('id', allocationId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Upsert — insert if not exists, update if exists
export const upsertAllocation = async (sprintId: string, projectId: string, resourceId: string, payload: any) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .upsert(
      {
        sprint_id: sprintId,
        project_id: projectId,
        resource_id: resourceId,
        ...payload
      },
      { onConflict: 'sprint_id,project_id,resource_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteAllocation = async (allocationId: string) => {
  const { error } = await supabase
    .from('sprint_allocations')
    .delete()
    .eq('id', allocationId)
  if (error) throw error
}

// Update risk flag on a resource column
export const updateAllocationRiskFlag = async (sprintId: string, resourceId: string, riskFlag: boolean) => {
  const { data, error } = await supabase
    .from('sprint_allocations')
    .update({ risk_flag: riskFlag })
    .eq('sprint_id', sprintId)
    .eq('resource_id', resourceId)
    .select()
  if (error) throw error
  return data
}
