import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Users, Search, Loader2, RefreshCw, Shield, GraduationCap, Baby,
  Eye, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle,
} from 'lucide-react'

interface UserRecord {
  _id: string
  fullName: string
  username?: string
  email: string
  phone?: string
  role: string
  isActive?: boolean
  emailVerified?: boolean
  createdAt: string
  lastActivityTime?: string | null
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

const roleFilterOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
  { value: 'super-admin', label: 'Super Admin' },
] as const

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
] as const

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.10)' },
  inactive: { label: 'Inactive', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  suspended: { label: 'Suspended', color: 'var(--color-error)', bg: 'rgba(226, 75, 74, 0.08)' },
}

const roleLabel = (role: string) => {
  if (role === 'super-admin') return 'Super Admin'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const roleBadgeIcon = (role: string) => {
  const Icon = roleIcons[role] || Users
  return <Icon size={10} />
}

const statusOf = (u: UserRecord): keyof typeof statusConfig => {
  if (u.isActive === false) return 'suspended'
  if (!u.emailVerified) return 'inactive'
  return 'active'
}

export function SuperAdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // View modal
  const [viewTarget, setViewTarget] = useState<UserRecord | null>(null)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const headers = { Authorization: `Bearer ${token}` }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/users`, { headers })
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
  useEffect(() => {
    if (token) loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // ── Derived: filtered + paginated ──
  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch =
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || statusOf(u) === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activePage = Math.min(currentPage, totalPages)
  const pageData = filtered.slice((activePage - 1) * pageSize, activePage * pageSize)

  // ── KPI counts (computed from all loaded users) ──
  const kpiTotal = users.length
  const kpiStudents = users.filter((u) => u.role === 'student').length
  const kpiAdmins = users.filter((u) => u.role === 'admin' || u.role === 'super-admin').length
  const kpiActive = users.filter((u) => statusOf(u) === 'active').length

  // ── Helpers ──
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return '—'
    }
  }

  const roleColor = (role: string) => roleColors[role] || '#6b7280'

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/users/${deleteTarget._id}`, { method: 'DELETE', headers })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to delete user')
      showToast('User deleted successfully', 'success')
      setDeleteTarget(null)
      loadUsers()
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to delete user', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* ── Premium hero header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-5 sm:p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>User Management</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                View and manage all platform users
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadUsers}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--color-text-muted)' }}
                title="Refresh"
                aria-label="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Search + Role + Status filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
            <div className="relative max-w-sm w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                className="input input-sm w-full pl-9"
                placeholder="Search by name, email, phone, role, or username..."
                aria-label="Search users"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {roleFilterOptions.map((opt) => {
                const active = roleFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setRoleFilter(opt.value)
                      setCurrentPage(1)
                    }}
                    className={`btn btn-xs btn-ghost ${active ? 'font-semibold' : ''}`}
                    style={{
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <div
              className="inline-flex items-center gap-1 p-1 rounded-xl"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            >
              {statusOptions.map((opt) => {
                const active = statusFilter === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setStatusFilter(opt.value)
                      setCurrentPage(1)
                    }}
                    className={`btn btn-xs btn-ghost ${active ? 'font-semibold' : ''}`}
                    style={{
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}
                    aria-pressed={active}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                }}
              >
                <Users size={20} color="#fff" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{kpiTotal}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Users</p>
              </div>
            </div>
          </div>

          <div
            className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #3b82f6)',
                }}
              >
                <GraduationCap size={20} color="#fff" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{kpiStudents}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Students</p>
              </div>
            </div>
          </div>

          <div
            className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                }}
              >
                <Shield size={20} color="#fff" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{kpiAdmins}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admins</p>
              </div>
            </div>
          </div>

          <div
            className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="p-4 sm:p-5 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                }}
              >
                <Users size={20} color="#fff" />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{kpiActive}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Active Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main table card ── */}
        <div
          className="card shadow-sm rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading ? (
            /* ── Premium skeleton ── */
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <div
                  className="h-3 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--color-border)', width: '60%' }}
                />
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-border)', width: '100%' }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            /* ── Professional retry card ── */
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shrink-0"
                style={{ backgroundColor: 'rgba(226, 75, 74, 0.08)', color: 'var(--color-error)' }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Something went wrong
              </h3>
              <p className="text-xs mb-4 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                {error}
              </p>
              <button
                onClick={loadUsers}
                className="btn btn-sm font-semibold gap-1.5"
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            /* ── Professional empty illustration ── */
            <div className="card-body items-center text-center py-14">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <Users size={32} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {search || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No users match your search or filters.'
                  : 'There are no user accounts on the platform yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Name', 'Email', 'Role', 'Status', 'Registration Date', 'Last Login', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="text-xs font-semibold uppercase tracking-wider text-left py-3 px-4"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((user) => (
                      <tr
                        key={user._id}
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                            >
                              {user.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {user.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="badge badge-sm font-semibold gap-1"
                            style={{
                              backgroundColor: `${roleColor(user.role)}20`,
                              color: roleColor(user.role),
                              border: 'none',
                            }}
                          >
                            {roleBadgeIcon(user.role)}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {(() => {
                            const cfg = statusConfig[statusOf(user)]
                            return (
                              <span
                                className="badge badge-sm font-semibold"
                                style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
                              >
                                {cfg.label}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {user.lastActivityTime ? formatDate(user.lastActivityTime) : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewTarget(user)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="View"
                              aria-label={`View ${user.fullName}`}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-error)' }}
                              title="Delete"
                              aria-label={`Delete ${user.fullName}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {pageData.map((user) => (
                  <div key={user._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                        >
                          {user.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            {user.fullName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                        </div>
                      </div>
                      {(() => {
                        const cfg = statusConfig[statusOf(user)]
                        return (
                          <span
                            className="badge badge-sm font-semibold"
                            style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
                          >
                            {cfg.label}
                          </span>
                        )
                      })()}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span
                        className="badge badge-sm"
                        style={{
                          backgroundColor: `${roleColor(user.role)}20`,
                          color: roleColor(user.role),
                          border: 'none',
                        }}
                      >
                        {user.role}
                      </span>
                      <span>•</span>
                      <span>Registered: {formatDate(user.createdAt)}</span>
                      <span>•</span>
                      <span>Last login: {user.lastActivityTime ? formatDate(user.lastActivityTime) : 'Never'}</span>
                    </div>

                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => setViewTarget(user)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-accent)' }}
                        title="View"
                        aria-label={`View ${user.fullName}`}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-error)' }}
                        title="Delete"
                        aria-label={`Delete ${user.fullName}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 px-4 sm:px-6"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Rows per page:</span>
                  <select
                    className="select select-sm select-bordered"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    aria-label="Rows per page"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {[10, 20, 50, 100].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {total === 0
                    ? '0–0 of 0'
                    : `${(activePage - 1) * pageSize + 1}–${Math.min(activePage * pageSize, total)} of ${total}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={activePage === 1}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Page {activePage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={activePage === totalPages}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''} matching filters
        </p>

        {/* ── View Modal ── */}
        {viewTarget && (
          <div className="modal modal-open" onClick={() => setViewTarget(null)}>
            <div
              className="modal-box max-w-lg p-0"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  User Details
                </h3>
                <button
                  onClick={() => setViewTarget(null)}
                  className="btn btn-ghost btn-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                  >
                    {viewTarget.fullName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                      {viewTarget.fullName}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{viewTarget.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Username</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.username || '—'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Role</span>
                    <p style={{ color: 'var(--color-text)' }}>{roleLabel(viewTarget.role)}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Status</span>
                    <p style={{ color: 'var(--color-text)' }}>{statusConfig[statusOf(viewTarget)].label}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Email verified</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Phone</span>
                    <p style={{ color: 'var(--color-text)' }}>{viewTarget.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Registration Date</span>
                    <p style={{ color: 'var(--color-text)' }}>{formatDate(viewTarget.createdAt)}</p>
                  </div>
                  <div>
                    <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>Last Login</span>
                    <p style={{ color: 'var(--color-text)' }}>
                      {viewTarget.lastActivityTime ? formatDate(viewTarget.lastActivityTime) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation ── */}
        {deleteTarget && (
          <div className="modal modal-open" onClick={() => !deleting && setDeleteTarget(null)}>
            <div
              className="modal-box max-w-sm"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(226, 75, 74, 0.08)' }}
                >
                  <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Delete User?</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  This action is permanent.{' '}
                  <strong style={{ color: 'var(--color-text)' }}>{deleteTarget.fullName}</strong> (
                  {deleteTarget.email}) will be permanently removed.
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error font-semibold"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
        {toast && (
          <div className="toast toast-end toast-bottom z-50">
            <div
              className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
              style={{ border: 'none' }}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}
