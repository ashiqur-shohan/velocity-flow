import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Skeleton } from 'antd'

const ProtectedRoute = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="p-8"><Skeleton active /></div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
