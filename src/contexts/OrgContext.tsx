import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface OrgContextType {
  currentOrg: any | null
  loading: boolean
  refetch: () => Promise<void>
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export const OrgProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()
  const [currentOrg, setCurrentOrg] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setCurrentOrg(null)
      setLoading(false)
      return
    }
    fetchUserOrg()
  }, [user])

  const fetchUserOrg = async () => {
    try {
      setLoading(true)
      // Get the first org the user belongs to
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(*)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setCurrentOrg(data.organizations)
      } else {
        // Handle case where user is not in any org
        setCurrentOrg(null)
      }
    } catch (err) {
      console.error('Error fetching org:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrgContext.Provider value={{ currentOrg, loading, refetch: fetchUserOrg }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => {
  const context = useContext(OrgContext)
  if (!context) throw new Error('useOrg must be used inside OrgProvider')
  return context
}
