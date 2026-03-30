import { useState, useEffect, useCallback } from 'react'
import { getProjects } from '../services/projectService'
import { useOrg } from '../contexts/OrgContext'

export const useProjects = (status: any = null) => {
  const { currentOrg } = useOrg()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!currentOrg) return
    try {
      setLoading(true)
      const data = await getProjects(currentOrg.id, status)
      setProjects(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentOrg, status])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}
