import { useState, useEffect, useCallback } from 'react'
import { getSprintResourceComments } from '../services/commentService'

export const useComments = (sprintId: string | undefined) => {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!sprintId) return
    try {
      setLoading(true)
      const data = await getSprintResourceComments(sprintId)
      setComments(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, setComments, loading, error, refetch: fetchComments }
}
