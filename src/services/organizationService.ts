import { supabase } from '../lib/supabase'

export const createOrganization = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name })
    .select()
    .single()
  
  if (error) throw error

  // Join the org as admin
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: data.id,
      user_id: userId,
      role: 'Admin'
    })
  
  if (memberError) throw memberError
  return data
}

export const getOrganization = async (orgId: string) => {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
  if (error) throw error
  return data
}

export const getOrganizationMembers = async (orgId: string) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      user:user_id (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('organization_id', orgId)
  if (error) throw error
  return data
}

export const inviteMember = async (orgId: string, _email: string, role: string) => {
  // Supabase invite via auth admin — handle in backend/edge function
  // For now, insert directly if user exists
  const { data, error } = await supabase
    .from('organization_members')
    .insert({ organization_id: orgId, role })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateMemberRole = async (orgId: string, userId: string, role: string) => {
  const { data, error } = await supabase
    .from('organization_members')
    .update({ role })
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
