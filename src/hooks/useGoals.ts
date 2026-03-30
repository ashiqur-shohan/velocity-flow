import { useState, useEffect, useCallback } from 'react'
import { getSprintGoals } from '../services/goalService'

export const useGoals = (sprintId: string | undefined) => {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    if (!sprintId) return
    try {
      setLoading(true)
      const data = await getSprintGoals(sprintId)
      setGoals(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return { goals, setGoals, loading, error, refetch: fetchGoals }
}
