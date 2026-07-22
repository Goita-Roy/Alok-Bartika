import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactElement } from 'react'

type ProtectedRouteProps = {
  allowedRoles: ('student' | 'teacher' | 'parent' | 'admin' | 'super-admin')[]
  children: ReactElement
  redirectTo?: string
}

export function ProtectedRoute({ allowedRoles, children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  
  if (!user) return <Navigate to={redirectTo} replace state={{ from: location }} />

  if (!allowedRoles.includes(user.role as any)) {
    return <Navigate to="/" replace />
  }
  
  return children
}
