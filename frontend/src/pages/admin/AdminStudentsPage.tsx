import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Search, Users, GraduationCap, UserX, UserCheck, Trash2,
  AlertTriangle, Eye, X, RefreshCw, Loader2, Calendar,
  ChevronLeft, ChevronRight, BookOpen, Trophy, Star,
} from 'lucide-react'

interface Student {
  id: string
  fullName: string
  username: string
  email: string
  phone?: string
  role: string
  isActive: boolean
  emailVerified: boolean
  phoneVerified: boolean
  skillLevel: string
  currentStage: string
  xp: number
  level: number
  badges: number
  completedLessons: number
  createdAt: string
  lastActivityTime?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

const stageColors: Record<string, string> = {
  beginner: '#3b82f6',
  intermediate: '#f59e0b',
  advanced: '#dc2626',
}

export function AdminStudentsPage() {
  const { token } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 })

  const [detailTarget, setDetailTarget] = useState<Student | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<Student | null>(null)
  const [suspending, setSuspending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadStudents = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '25')
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`${API_BASE_URL}/students?${params.toString()}`, { headers })
      if (!res.ok) throw new Error('Failed to load students')
      const json = await res.json()
      setStudents(json.data || [])
      setPagination(json.pagination || { page: 1, limit: 25, total: 0, pages: 0 })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load students')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, dateFrom, dateTo, token])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const handleSuspend = async () => {
    if (!suspendTarget) return
    setSuspending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/students/${suspendTarget.id}/suspend`, {
        method: 'PATCH',
        headers,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast(json.message, 'success')
      setSuspendTarget(null)
      loadStudents(pagination.page)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setSuspending(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/students/${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast('Student deleted', 'success')
      setDeleteTarget(null)
      const remaining = pagination.total - 1
      const maxPage = Math.max(1, Math.ceil(remaining / pagination.limit))
      loadStudents(Math.min(pagination.page, maxPage))
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
    catch { return '—' }
  }

  const formatDateTime = (d?: string) => {
    if (!d) return '—'
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return '—' }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Student Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>View, manage, and monitor student accounts</p>
          </div>
          <button onClick={() => loadStudents(pagination.page)}
            className="btn btn-sm btn-ghost self-start"
            style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Students', value: pagination.total, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
            { label: 'Active', value: statusFilter === 'suspended' ? '—' : (statusFilter === 'active' ? pagination.total : '—'), icon: UserCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
            { label: 'Suspended', value: statusFilter === 'active' ? '—' : (statusFilter === 'suspended' ? pagination.total : '—'), icon: UserX, color: '#dc2626', bg: 'rgba(220,38,38,0.10)' },
            { label: 'Page', value: `${pagination.page}/${pagination.pages || 1}`, icon: GraduationCap, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
          ].map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="card shadow-sm"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-4 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                    <Icon size={18} style={{ color: c.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.label}</p>
                    <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" className="input input-sm w-full pl-9"
              placeholder="Search name, email, username, phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          </div>
          <select className="select select-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input type="date" className="input input-sm"
              value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              placeholder="From"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>to</span>
            <input type="date" className="input input-sm"
              value={dateTo} onChange={e => setDateTo(e.target.value)}
              placeholder="To"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : students.length === 0 ? (
            <div className="card-body items-center text-center py-16">
              <Users size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {debouncedSearch || statusFilter !== 'all' || dateFrom || dateTo
                  ? 'No students match your filters' : 'No students registered yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Student', 'Email', 'Username', 'Phone', 'Stage', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                              {s.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{s.fullName}</span>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Lv.{s.level} · {s.xp} XP</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{s.email}</td>
                        <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>{s.username}</td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{s.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="badge badge-sm font-semibold capitalize" style={{
                            backgroundColor: `${stageColors[s.currentStage] || '#6b7280'}20`,
                            color: stageColors[s.currentStage] || '#6b7280',
                            border: 'none',
                          }}>
                            {s.currentStage}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge badge-sm font-semibold ${s.isActive ? 'badge-success' : 'badge-error'}`}
                            style={{ border: 'none' }}>
                            {s.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{formatDate(s.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDetailTarget(s)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="View details">
                              <Eye size={14} />
                            </button>
                            <button onClick={() => setSuspendTarget(s)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: s.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}
                              title={s.isActive ? 'Suspend' : 'Reactivate'}>
                              {s.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button onClick={() => setDeleteTarget(s)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-error)' }}
                              title="Delete">
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
                {students.map(s => (
                  <div key={s.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                          {s.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{s.fullName}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.email}</p>
                        </div>
                      </div>
                      <span className={`badge badge-sm font-semibold ${s.isActive ? 'badge-success' : 'badge-error'}`}
                        style={{ border: 'none' }}>
                        {s.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pl-[46px] flex-wrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="font-mono">@{s.username}</span>
                      <span className="badge badge-sm capitalize" style={{
                        backgroundColor: `${stageColors[s.currentStage] || '#6b7280'}20`,
                        color: stageColors[s.currentStage] || '#6b7280',
                        border: 'none',
                      }}>{s.currentStage}</span>
                      {s.phone && <span>{s.phone}</span>}
                      <span>{formatDate(s.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 pl-[46px]">
                      <button onClick={() => setDetailTarget(s)} className="btn btn-ghost btn-xs" style={{ color: 'var(--color-accent)' }}><Eye size={14} /></button>
                      <button onClick={() => setSuspendTarget(s)} className="btn btn-ghost btn-xs"
                        style={{ color: s.isActive ? 'var(--color-warning, #f59e0b)' : '#22c55e' }}>
                        {s.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button onClick={() => setDeleteTarget(s)} className="btn btn-ghost btn-xs" style={{ color: 'var(--color-error)' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button className="btn btn-sm btn-ghost" disabled={pagination.page <= 1}
                onClick={() => loadStudents(pagination.page - 1)}
                style={{ color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let page: number
                if (pagination.pages <= 5) { page = i + 1 }
                else if (pagination.page <= 3) { page = i + 1 }
                else if (pagination.page >= pagination.pages - 2) { page = pagination.pages - 4 + i }
                else { page = pagination.page - 2 + i }
                return (
                  <button key={page}
                    className={`btn btn-sm ${page === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => loadStudents(page)}
                    style={page === pagination.page ? { border: 'none' } : { color: 'var(--color-text-muted)' }}>
                    {page}
                  </button>
                )
              })}
              <button className="btn btn-sm btn-ghost" disabled={pagination.page >= pagination.pages}
                onClick={() => loadStudents(pagination.page + 1)}
                style={{ color: 'var(--color-text-muted)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {detailTarget && (
        <div className="modal modal-open" onClick={() => setDetailTarget(null)}>
          <div className="modal-box max-w-lg p-0"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Student Details</h3>
              <button onClick={() => setDetailTarget(null)} className="btn btn-ghost btn-xs"
                style={{ color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                  {detailTarget.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h4 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{detailTarget.fullName}</h4>
                  <p className="text-sm font-mono" style={{ color: 'var(--color-text-muted)' }}>@{detailTarget.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-sm font-semibold ${detailTarget.isActive ? 'badge-success' : 'badge-error'}`}
                      style={{ border: 'none' }}>
                      {detailTarget.isActive ? 'Active' : 'Suspended'}
                    </span>
                    <span className="badge badge-sm font-semibold capitalize" style={{
                      backgroundColor: `${stageColors[detailTarget.currentStage] || '#6b7280'}20`,
                      color: stageColors[detailTarget.currentStage] || '#6b7280',
                      border: 'none',
                    }}>
                      {detailTarget.currentStage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Star, label: 'XP', value: detailTarget.xp, color: '#f59e0b' },
                  { icon: Trophy, label: 'Level', value: detailTarget.level, color: '#7c3aed' },
                  { icon: BookOpen, label: 'Lessons', value: detailTarget.completedLessons, color: '#3b82f6' },
                ].map(st => {
                  const Icon = st.icon
                  return (
                    <div key={st.label} className="rounded-xl p-3 text-center"
                      style={{ background: `${st.color}10`, border: `1px solid ${st.color}30` }}>
                      <Icon size={16} style={{ color: st.color, margin: '0 auto 4px' }} />
                      <p className="text-lg font-bold" style={{ color: st.color }}>{st.value}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{st.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* Info rows */}
              <div className="space-y-3">
                {[
                  { label: 'Email', value: detailTarget.email },
                  { label: 'Phone', value: detailTarget.phone || '—' },
                  { label: 'Skill Level', value: detailTarget.skillLevel },
                  { label: 'Badges', value: detailTarget.badges },
                  { label: 'Email Verified', value: detailTarget.emailVerified ? 'Yes' : 'No' },
                  { label: 'Phone Verified', value: detailTarget.phoneVerified ? 'Yes' : 'No' },
                  { label: 'Joined', value: formatDate(detailTarget.createdAt) },
                  { label: 'Last Active', value: formatDateTime(detailTarget.lastActivityTime) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Suspend / Reactivate Confirmation ── */}
      {suspendTarget && (
        <div className="modal modal-open" onClick={() => !suspending && setSuspendTarget(null)}>
          <div className="modal-box max-w-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: suspendTarget.isActive ? 'rgba(226,75,74,0.10)' : 'rgba(34,197,94,0.10)' }}>
                {suspendTarget.isActive
                  ? <UserX size={24} style={{ color: 'var(--color-error)' }} />
                  : <UserCheck size={24} style={{ color: '#22c55e' }} />}
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                {suspendTarget.isActive ? 'Suspend Student?' : 'Reactivate Student?'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {suspendTarget.isActive
                  ? `${suspendTarget.fullName} will lose access to the platform and their progress will be frozen.`
                  : `${suspendTarget.fullName} will regain access to the platform.`}
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setSuspendTarget(null)} disabled={suspending}>Cancel</button>
              <button className={`btn btn-sm font-semibold ${suspendTarget.isActive ? 'btn-error' : 'btn-success'}`}
                onClick={handleSuspend} disabled={suspending}>
                {suspending ? <Loader2 size={14} className="animate-spin" /> : suspendTarget.isActive ? 'Suspend' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="modal modal-open" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal-box max-w-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}>
                <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Delete Student?</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                This action is permanent. All data for <strong>{deleteTarget.fullName}</strong> ({deleteTarget.email}) will be permanently removed, including their progress, XP, badges, and notes.
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <button className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}
                onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-sm btn-error font-semibold"
                onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
            style={{ border: 'none' }}>
            {toast.message}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
