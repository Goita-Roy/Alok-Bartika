import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Users, UserCheck, UserX, Settings, LayoutDashboard, ChevronRight, Loader2 } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const headers = { Authorization: `Bearer ${token}` }

        const [adminsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/admins`, { headers }),
          fetch(`${API_BASE_URL}/users`, { headers }),
        ])

        if (!adminsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const adminsJson = await adminsRes.json()
        const usersJson = await usersRes.json()

        setAdmins(adminsJson.data ?? [])
        setUsers(usersJson.data ?? [])
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

  const stats = [
    {
      label: 'Total Admins',
      value: totalAdmins,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      textColor: '#7c3aed',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      textColor: '#059669',
    },
    {
      label: 'Active Admins',
      value: activeAdmins,
      icon: UserCheck,
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      textColor: '#2563eb',
    },
    {
      label: 'Suspended Admins',
      value: suspendedAdmins,
      icon: UserX,
      gradient: 'linear-gradient(135deg, #dc2626, #f87171)',
      textColor: '#dc2626',
    },
  ]

  const quickActions = [
    {
      label: 'Manage Admins',
      to: '/super-admin/admins',
      icon: Shield,
      color: '#7c3aed',
    },
    {
      label: 'Manage Users',
      to: '/super-admin/users',
      icon: Users,
      color: '#059669',
    },
    {
      label: 'Platform Settings',
      to: '/super-admin/platform',
      icon: Settings,
      color: '#2563eb',
    },
  ]

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--color-accent-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayoutDashboard size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Super Admin Dashboard
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                System-wide overview
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
              gap: '16px',
            }}
          >
            <Loader2
              size={36}
              style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading dashboard…</p>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: 'rgba(220, 38, 38, 0.08)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              color: '#dc2626',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
              }}
            >
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      transition: 'box-shadow 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: stat.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {stat.label}
                      </p>
                      <p
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 700,
                          color: stat.textColor,
                          margin: '4px 0 0',
                          lineHeight: 1.2,
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: '0 0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Settings size={18} style={{ color: 'var(--color-accent)' }} />
                Quick Actions
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        textDecoration: 'none',
                        color: 'var(--color-text)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget
                        el.style.borderColor = action.color
                        el.style.background = 'var(--color-accent-pale)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget
                        el.style.borderColor = 'var(--color-border)'
                        el.style.background = 'var(--color-bg)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} style={{ color: action.color }} />
                        {action.label}
                      </span>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                    </Link>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: '0 0 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Shield size={18} style={{ color: 'var(--color-accent)' }} />
                Admin Summary
              </h2>

              {admins.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  No admins registered yet.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.8rem',
                    }}
                  >
                    <thead>
                      <tr>
                        {['Name', 'Email', 'Status'].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: 'left',
                              padding: '8px 12px',
                              borderBottom: '1px solid var(--color-border)',
                              color: 'var(--color-text-muted)',
                              fontWeight: 500,
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
                        <tr key={admin.id}>
                          <td
                            style={{
                              padding: '8px 12px',
                              borderBottom: '1px solid var(--color-border)',
                              color: 'var(--color-text)',
                            }}
                          >
                            {admin.fullName}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              borderBottom: '1px solid var(--color-border)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {admin.email}
                          </td>
                          <td
                            style={{
                              padding: '8px 12px',
                              borderBottom: '1px solid var(--color-border)',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: admin.isActive
                                  ? 'rgba(5, 150, 105, 0.12)'
                                  : 'rgba(220, 38, 38, 0.12)',
                                color: admin.isActive ? '#059669' : '#dc2626',
                              }}
                            >
                              {admin.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </SuperAdminLayout>
  )
}
