import { supabase } from '../lib/supabase'

export const getSprintGoals = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('sprint_goals')
    .select(`
      *,
      project:project_id (id, name, color_tag),
      owner:owner_resource_id (id, name)
    `)
    .eq('sprint_id', sprintId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export const createGoal = async (payload: any) => {
  const { data, error } = await supabase
    .from('sprint_goals')
    .insert(payload)
    .select(`
      *,
      project:project_id (id, name, color_tag),
      owner:owner_resource_id (id, name)
    `)
    .single()
  if (error) throw error
  return data
}

export const updateGoal = async (goalId: string, payload: any) => {
  const { data, error } = await supabase
    .from('sprint_goals')
    .update(payload)
    .eq('id', goalId)
    .select(`
      *,
      project:project_id (id, name, color_tag),
      owner:owner_resource_id (id, name)
    `)
    .single()
  if (error) throw error
  return data
}

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('sprint_goals')
    .delete()
    .eq('id', goalId)
  if (error) throw error
}

export const getProjectGoals = async (projectId: string) => {
  const { data, error } = await supabase
    .from('sprint_goals')
    .select(`
      *,
      sprint:sprint_id (id, name, start_date, end_date),
      owner:owner_resource_id (id, name)
    `)
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}
