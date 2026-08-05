import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Users, UserCheck, UserX, Settings, LayoutDashboard, ChevronRight, Loader2, Star, CalendarDays } from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface Admin {
  id: string
  fullName: string
  email: string
  isActive: boolean
}

interface User {
  id: string
  fullName: string
  email: string
}

export function SuperAdminDashboardPage() {
  const { token } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [feedbackStats, setFeedbackStats] = useState<{ totalFeedback: number; averageRating: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers = { Authorization: `Bearer ${token}` }

        const [adminsRes, usersRes, feedbackRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admins`, { headers }),
          fetch(`${API_BASE_URL}/users`, { headers }),
          fetch(`${API_BASE_URL}/admin/dashboard`, { headers }),
        ])

        if (!adminsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const adminsJson = await adminsRes.json()
        const usersJson = await usersRes.json()
        const feedbackJson = await feedbackRes.json()

        setAdmins(adminsJson.data ?? [])
        setUsers(usersJson.data ?? [])
        setFeedbackStats(feedbackJson.data ?? null)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading the dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchData()
    }
  }, [token])

  const totalAdmins = admins.length
  const totalUsers = users.length
  const activeAdmins = admins.filter((a) => a.isActive).length
  const suspendedAdmins = admins.filter((a) => !a.isActive).length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const stats = [
    {
      label: 'Total Admins',
      value: totalAdmins,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      textColor: '#7c3aed',
      tint: 'rgba(124, 58, 237, 0.06)',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      textColor: '#059669',
      tint: 'rgba(5, 150, 105, 0.06)',
    },
    {
      label: 'Active Admins',
      value: activeAdmins,
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      textColor: '#2563eb',
      tint: 'rgba(37, 99, 235, 0.06)',
    },
    {
      label: 'Suspended Admins',
      value: suspendedAdmins,
      icon: UserX,
      gradient: 'linear-gradient(135deg, #dc2626, #f87171)',
      textColor: '#dc2626',
      tint: 'rgba(220, 38, 38, 0.06)',
    },
  ]

  const quickActions = [
    {
      label: 'Manage Admins',
      description: 'Add and manage admin accounts',
      to: '/super-admin/admins',
      icon: Shield,
      color: '#7c3aed',
    },
    {
      label: 'Manage Users',
      description: 'Monitor and manage platform users',
      to: '/super-admin/users',
      icon: Users,
      color: '#059669',
    },
    {
      label: 'Platform Settings',
      description: 'Configure platform preferences',
      to: '/super-admin/platform',
      icon: Settings,
      color: '#2563eb',
    },
    {
      label: 'Student Feedback',
      description: 'Review ratings and feedback',
      to: '/admin/feedback',
      icon: Star,
      color: '#F59E0B',
    },
  ]

  return (
    <SuperAdminLayout>
      <div className="space-y-6">

        {/* ── Premium hero header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-6 lg:p-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <LayoutDashboard size={26} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Super Admin Dashboard
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Monitor and manage the entire platform.
                </p>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <CalendarDays size={14} />
                  {today}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.30)',
                }}
              >
                <Shield size={26} color="#fff" strokeWidth={2.25} />
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={38} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard…</p>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-5"
                    style={{ backgroundColor: stat.tint, borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center gap-4 h-full">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: stat.gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                      >
                        <Icon size={22} color="#fff" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{ color: 'var(--color-text-muted)' }}>
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold mt-1" style={{ color: stat.textColor, lineHeight: 1.2 }}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Quick Actions ── */}
            <div
              className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-6"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Section header: icon chip + title + muted description */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200"
                  style={{
                    backgroundColor: 'var(--color-accent-pale)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Settings size={21} />
                </div>
                <div>
                  <h2 className="text-base font-semibold leading-tight" style={{ color: 'var(--color-text)' }}>
                    Quick Actions
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    Jump to common management tasks
                  </p>
                </div>
              </div>

              {/* Premium quick action cards (1 mobile / 2 tablet / 4 desktop, equal height) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group flex flex-col justify-between h-full rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      style={{
                        background: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = action.color
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                          style={{ background: `${action.color}1A` }}
                        >
                          <Icon size={20} style={{ color: action.color }} aria-hidden="true" />
                        </div>
                        <ChevronRight
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-1 shrink-0"
                          style={{ color: 'var(--color-text-muted)' }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {action.label}
                        </p>
                        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* ── Feedback Analytics ── */}
            {feedbackStats && (
              <div className="card shadow-sm rounded-2xl"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <Star size={18} style={{ color: '#F59E0B' }} />
                      Feedback Analytics
                    </h2>
                    <Link
                      to="/admin/feedback"
                      className="inline-flex items-center gap-1 text-xs font-semibold transition-all duration-200"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      View all
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                    <div className="rounded-2xl p-5 text-center"
                      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        Total Feedback
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: '#F59E0B', lineHeight: 1.2 }}>
                        {feedbackStats.totalFeedback}
                      </p>
                    </div>
                    <div className="rounded-2xl p-5 text-center"
                      style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        Average Rating
                      </p>
                      <div className="flex items-center justify-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i <= Math.round(feedbackStats.averageRating) ? '#F59E0B' : 'transparent'}
                            style={{ color: '#F59E0B' }}
                          />
                        ))}
                      </div>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#F59E0B', lineHeight: 1.2 }}>
                        {feedbackStats.averageRating}
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}> / 5</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Admin Summary ── */}
            <div className="card shadow-sm rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Shield size={18} style={{ color: 'var(--color-accent)' }} />
                    Admin Summary
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                    {admins.length} registered
                  </span>
                </div>

                {admins.length === 0 ? (
                  <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    No admins registered yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Name', 'Email', 'Status'].map((h) => (
                            <th
                              key={h}
                              className="text-xs font-semibold uppercase tracking-wider text-left py-3 px-4"
                              style={{
                                color: 'var(--color-text-muted)',
                                borderBottom: '1px solid var(--color-border)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {admins.slice(0, 5).map((admin) => (
                          <tr key={admin.id} className="transition-colors duration-150"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                            <td className="py-3 px-4 font-semibold" style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}>
                              {admin.fullName}
                            </td>
                            <td className="py-3 px-4" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                              {admin.email}
                            </td>
                            <td className="py-3 px-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{
                                  background: admin.isActive ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
                                  color: admin.isActive ? '#059669' : '#dc2626',
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: admin.isActive ? '#059669' : '#dc2626' }}
                                />
                                {admin.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Link
                    to="/super-admin/admins"
                    className="inline-flex items-center gap-1 text-xs font-semibold transition-all duration-200"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Manage all admins
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  )
}
