import { useState, useEffect, useCallback } from 'react'
import { getSprintAllocations } from '../services/allocationService'

export const useAllocations = (sprintId: string | undefined) => {
  const [allocations, setAllocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllocations = useCallback(async () => {
    if (!sprintId) return
    try {
      setLoading(true)
      const data = await getSprintAllocations(sprintId)
      setAllocations(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetchAllocations()
  }, [fetchAllocations])

  return { allocations, loading, error, refetch: fetchAllocations }
}
