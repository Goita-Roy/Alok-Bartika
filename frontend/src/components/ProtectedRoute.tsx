import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import type { ReactElement } from 'react'

type ProtectedRouteProps = {
  allowedRoles: ('student' | 'teacher' | 'parent' | 'admin' | 'super-admin')[]
  children: ReactElement
  redirectTo?: string
}

// Routes that are ALWAYS allowed even when feedback is pending.
const FEEDBACK_ALLOWED_PREFIXES = ['/feedback']

export function ProtectedRoute({ allowedRoles, children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (!allowedRoles.includes(user.role as any)) {
    return <ForbiddenPage />
  }

  // ── Mandatory feedback guard ─────────────────────────────────────────────
  // If the user has a pending feedback, ONLY allow /feedback/* routes.
  // Everything else redirects to the feedback page for the pending level.
  const pendingLevel = user.pendingFeedback
  if (pendingLevel) {
    const path = location.pathname
    const isAllowed = FEEDBACK_ALLOWED_PREFIXES.some(p => path.startsWith(p))
    if (!isAllowed) {
      return <Navigate to={`/feedback/${pendingLevel}`} replace />
    }
  }
  
  return children
}

type GuestRouteProps = {
  children: ReactElement
  redirectTo?: string
}

export function GuestRoute({ children, redirectTo = '/dashboard' }: GuestRouteProps) {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
