import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import { Users, Search, Loader2, RefreshCw, Shield, GraduationCap, Baby } from 'lucide-react'

interface UserRecord {
  _id: string
  fullName: string
  email: string
  phone?: string
  role: string
  isActive?: boolean
  createdAt: string
}

const roleColors: Record<string, string> = {
  student: '#3b82f6',
  admin: '#7c3aed',
  'super-admin': '#dc2626',
  teacher: '#16a34a',
  parent: '#f59e0b',
}

const roleIcons: Record<string, typeof Users> = {
  student: GraduationCap,
  admin: Shield,
  'super-admin': Shield,
  teacher: Users,
  parent: Baby,
}

export function SuperAdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load users')
      const json = await res.json()
      setUsers(json.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (token) loadUsers() }, [token])

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '—' }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>User Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>View and manage all platform users</p>
          </div>
          <button onClick={loadUsers} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" className="input input-sm w-full pl-9" placeholder="Search by name, email, phone, or role..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        <div className="card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-body items-center text-center py-16">
              <Users size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {search ? 'No users match your search' : 'No users found'}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined'].map(h => (
                        <th key={h} className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => {
                      const RoleIcon = roleIcons[user.role] || Users
                      return (
                        <tr key={user._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                                {user.fullName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{user.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{user.email}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{user.phone || '—'}</td>
                          <td className="px-4 py-3">
                            <span className="badge badge-sm font-semibold gap-1" style={{ backgroundColor: `${roleColors[user.role] || '#6b7280'}20`, color: roleColors[user.role] || '#6b7280', border: 'none' }}>
                              <RoleIcon size={10} />
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge badge-sm font-semibold ${user.isActive !== false ? 'badge-success' : 'badge-error'}`} style={{ border: 'none' }}>
                              {user.isActive !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{formatDate(user.createdAt)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filtered.map(user => (
                  <div key={user._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                          {user.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user.fullName}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                      <span className={`badge badge-sm font-semibold ${user.isActive !== false ? 'badge-success' : 'badge-error'}`} style={{ border: 'none' }}>
                        {user.isActive !== false ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pl-[46px] text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="badge badge-sm" style={{ backgroundColor: `${roleColors[user.role] || '#6b7280'}20`, color: roleColors[user.role] || '#6b7280', border: 'none' }}>{user.role}</span>
                      {user.phone && <span>{user.phone}</span>}
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''} total</p>
      </div>
    </SuperAdminLayout>
  )
}
