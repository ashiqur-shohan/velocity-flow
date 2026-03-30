import { useState, useEffect, useCallback } from 'react'
import { getSprintReport, getResourceReport, getProjectReport, getOrgProductivitySummary } from '../services/reportService'
import { useOrg } from '../contexts/OrgContext'

export const useSprintReport = (sprintId: string | undefined) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(async () => {
    if (!sprintId) return
    try {
      setLoading(true)
      const report = await getSprintReport(sprintId)
      setData(report)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sprintId])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  return { data, loading, error, refetch: fetchReport }
}

export const useOrgReport = () => {
  const { currentOrg } = useOrg()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrgReport = useCallback(async () => {
    if (!currentOrg) return
    try {
      setLoading(true)
      const report = await getOrgProductivitySummary(currentOrg.id)
      setData(report)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentOrg])

  useEffect(() => {
    fetchOrgReport()
  }, [fetchOrgReport])

  return { data, loading, error, refetch: fetchOrgReport }
}

export const useResourceReportHook = (resourceId: string | undefined, startDate?: string, endDate?: string) => {
  const { currentOrg } = useOrg()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResourceReport = useCallback(async () => {
    if (!currentOrg || !resourceId) return
    try {
      setLoading(true)
      const report = await getResourceReport(currentOrg.id, resourceId, startDate, endDate)
      setData(report)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [currentOrg, resourceId, startDate, endDate])

  useEffect(() => {
    fetchResourceReport()
  }, [fetchResourceReport])

  return { data, loading, error, refetch: fetchResourceReport }
}

export const useProjectReportHook = (projectId: string | undefined, startDate?: string, endDate?: string) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjectReport = useCallback(async () => {
    if (!projectId) return
    try {
      setLoading(true)
      const report = await getProjectReport(projectId, startDate, endDate)
      setData(report)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId, startDate, endDate])

  useEffect(() => {
    fetchProjectReport()
  }, [fetchProjectReport])

  return { data, loading, error, refetch: fetchProjectReport }
}
