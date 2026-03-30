import { supabase } from '../lib/supabase'

export const getResources = async (orgId: string) => {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('organization_id', orgId)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export const getActiveResources = async (orgId: string) => {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true)
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

export const createResource = async (orgId: string, payload: any) => {
  const { data, error } = await supabase
    .from('resources')
    .insert({ ...payload, organization_id: orgId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateResource = async (resourceId: string, payload: any) => {
  const { data, error } = await supabase
    .from('resources')
    .update(payload)
    .eq('id', resourceId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deactivateResource = async (resourceId: string) => {
  const { data, error } = await supabase
    .from('resources')
    .update({ is_active: false })
    .eq('id', resourceId)
    .select()
    .single()
  if (error) throw error
  return data
}
