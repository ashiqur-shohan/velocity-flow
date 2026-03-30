import { supabase } from '../lib/supabase'

// Get all resource sprint comments for a sprint
export const getSprintResourceComments = async (sprintId: string) => {
  const { data, error } = await supabase
    .from('sprint_resource_comments')
    .select('*')
    .eq('sprint_id', sprintId)
  if (error) throw error
  return data
}

// Upsert a comment (creates if not exists, updates if exists)
export const upsertSprintResourceComment = async (sprintId: string, resourceId: string, comment: string) => {
  const { data, error } = await supabase
    .from('sprint_resource_comments')
    .upsert(
      {
        sprint_id: sprintId,
        resource_id: resourceId,
        comment: comment,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'sprint_id,resource_id' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}
