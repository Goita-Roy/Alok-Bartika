import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../state/authStore'
import { useAuthStore } from '../state/authStore'

export function ProtectedRoute({ role }: { role?: UserRole }) {
  const user = useAuthStore((s) => s.user)
  const hydrated = useAuthStore((s) => s.hydrated)

  if (!hydrated) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}

