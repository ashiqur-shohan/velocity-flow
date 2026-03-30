import { supabase } from '../lib/supabase'

export const getProjects = async (orgId: string, status = null) => {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('name', { ascending: true })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getProjectById = async (projectId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()
  if (error) throw error
  return data
}

export const createProject = async (orgId: string, payload: any) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...payload, organization_id: orgId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateProject = async (projectId: string, payload: any) => {
  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const archiveProject = async (projectId: string) => {
  return updateProject(projectId, { status: 'archived' })
}
