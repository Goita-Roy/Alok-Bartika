import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import { BarChart3, Users, GraduationCap, Shield, Loader2, RefreshCw } from 'lucide-react'

interface UserRecord {
  _id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

const roleColors: Record<string, string> = {
  student: '#3b82f6',
  admin: '#7c3aed',
  'super-admin': '#dc2626',
  teacher: '#16a34a',
  parent: '#f59e0b',
}

export function SuperAdminAnalyticsPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load analytics data')
      const json = await res.json()
      setUsers(json.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (token) loadUsers() }, [token])

  const roleDistribution: Record<string, number> = {}
  users.forEach(u => {
    roleDistribution[u.role] = (roleDistribution[u.role] || 0) + 1
  })

  const sortedRoles = Object.entries(roleDistribution).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(...Object.values(roleDistribution), 1)

  const signupsByMonth: Record<string, number> = {}
  users.forEach(u => {
    const d = new Date(u.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    signupsByMonth[key] = (signupsByMonth[key] || 0) + 1
  })
  const sortedMonths = Object.entries(signupsByMonth).sort((a, b) => a[0].localeCompare(b[0])).slice(-6)
  const maxMonthly = Math.max(...sortedMonths.map(m => m[1]), 1)

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
              <BarChart3 size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>System Analytics</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Platform growth and user metrics</p>
            </div>
          </div>
          <button onClick={loadUsers} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading analytics…</p>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>
                    <Users size={22} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Users</p>
                    <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)' }}>
                    <GraduationCap size={22} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Students</p>
                    <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{roleDistribution['student'] || 0}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    <Shield size={22} style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admins</p>
                    <p className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{(roleDistribution['admin'] || 0) + (roleDistribution['super-admin'] || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                  Role Distribution
                </h2>
                {sortedRoles.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No user data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedRoles.map(([role, count]) => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="text-xs font-semibold w-24 text-right capitalize" style={{ color: 'var(--color-text-muted)' }}>{role}</span>
                        <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                          <div className="h-full rounded-lg flex items-center px-3" style={{
                            width: `${Math.max((count / maxCount) * 100, 8)}%`,
                            background: `${roleColors[role] || '#6b7280'}20`,
                            border: `1px solid ${roleColors[role] || '#6b7280'}40`,
                          }}>
                            <span className="text-xs font-bold" style={{ color: roleColors[role] || '#6b7280' }}>{count}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold w-10" style={{ color: 'var(--color-text-muted)' }}>
                          {users.length > 0 ? Math.round((count / users.length) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                  Signups by Month (Last 6)
                </h2>
                {sortedMonths.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No signup data yet.</p>
                ) : (
                  <div className="flex items-end gap-3 h-48">
                    {sortedMonths.map(([month, count]) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{count}</span>
                        <div className="w-full rounded-t-lg" style={{
                          height: `${Math.max((count / maxMonthly) * 100, 4)}%`,
                          background: 'var(--color-accent)',
                          opacity: 0.8,
                          minHeight: '4px',
                        }} />
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{month.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  )
}
