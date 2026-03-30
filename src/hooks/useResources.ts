import { useState, useEffect, useCallback } from 'react'
import { getResources, getActiveResources } from '../services/resourceService'
import { useOrg } from '../contexts/OrgContext'

export const useResources = () => {
  const { currentOrg } = useOrg()
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    if (!currentOrg) return
    try {
      setLoading(true)
      const data = await getResources(currentOrg.id)
      setResources(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentOrg])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return { resources, loading, error, refetch: fetchResources }
}

export const useActiveResources = () => {
  const { currentOrg } = useOrg()
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveResources = useCallback(async () => {
    if (!currentOrg) return
    try {
      setLoading(true)
      const data = await getActiveResources(currentOrg.id)
      setResources(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentOrg])

  useEffect(() => {
    fetchActiveResources()
  }, [fetchActiveResources])

  return { resources, loading, error, refetch: fetchActiveResources }
}
