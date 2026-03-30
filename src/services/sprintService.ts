import { supabase } from '../lib/supabase'

export const getSprints = async (orgId: string) => {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('organization_id', orgId)
    .order('start_date', { ascending: false })
  if (error) throw error
  return data
}

export const getSprintById = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('id', sprintId)
    .single()
  if (error) throw error
  return data
}

export const getActiveSprint = async (orgId: string) => {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) throw error
  return data
}

export const createSprint = async (orgId: string, payload: any) => {
  const { data, error } = await supabase
    .from('sprints')
    .insert({ ...payload, organization_id: orgId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateSprint = async (sprintId: string, payload: any) => {
  const { data, error } = await supabase
    .from('sprints')
    .update(payload)
    .eq('id', sprintId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateSprintStatus = async (sprintId: string, status: string) => {
  return updateSprint(sprintId, { status })
}
