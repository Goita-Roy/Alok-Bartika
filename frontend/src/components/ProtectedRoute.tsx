import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactElement } from 'react'

type ProtectedRouteProps = {
  allowedRoles: ('student' | 'teacher' | 'parent' | 'admin')[]
  children: ReactElement
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  if (!allowedRoles.includes(user.role as any)) {
    return <Navigate to="/" replace />
  }
  
  return children
}
