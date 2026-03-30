import { useState, useEffect } from 'react'
import { getSprints, getSprintById } from '../services/sprintService'
import { useOrg } from '../contexts/OrgContext'

export const useSprints = () => {
  const { currentOrg } = useOrg()
  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrg) return
    fetchSprints()
  }, [currentOrg])

  const fetchSprints = async () => {
    try {
      setLoading(true)
      const data = await getSprints(currentOrg.id)
      setSprints(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { sprints, loading, error, refetch: fetchSprints }
}

export const useSprintDetail = (sprintId: string | undefined) => {
  const [sprint, setSprint] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sprintId) return
    fetchSprint()
  }, [sprintId])

  const fetchSprint = async () => {
    try {
      setLoading(true)
      const data = await getSprintById(sprintId!)
      setSprint(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { sprint, loading, error, refetch: fetchSprint }
}
