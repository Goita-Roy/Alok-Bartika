import { useState, useEffect } from 'react'
import type { ReactNode, ComponentType } from 'react'
import {
  ClipboardList, Loader2, RefreshCw, AlertTriangle, Search,
  Shield, Users, UserCheck, TrendingUp, CheckCircle,
  ChevronLeft, ChevronRight, MapPin,
  Globe, Monitor, FileJson, Eye, X,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface AuditActor {
  id: string
  fullName: string | null
  email: string | null
  role: string | null
}

interface AuditLog {
  id: string
  actor: AuditActor | null
  actorRole: string
  action: string
  category: string
  resource: string
  resourceId: string | null
  status: 'success' | 'failed'
  ip: string
  userAgent: string
  createdAt: string
  details: unknown
}

interface AuditSummary {
  totalLogs: number
  todayEvents: number
  failedActions: number
  activeUsersToday: number
  actions: string[]
  resources: string[]
}

type Severity = { label: string; color: string; bg: string; icon: typeof AlertTriangle }

const CRITICAL_CATEGORIES = new Set(['role_change', 'user_delete', 'system_settings'])

const severityFor = (log: AuditLog): Severity => {
  if (log.status === 'failed') {
    return { label: 'Critical', color: '#ef4444', bg: 'rgba(220,38,38,0.08)', icon: AlertTriangle }
  }
  if (CRITICAL_CATEGORIES.has(log.category)) {
    return { label: 'Warning', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: AlertTriangle }
  }
  return { label: 'Info', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', icon: CheckCircle }
}

const categoryColor = (category: string): string => {
  const map: Record<string, string> = {
    login: '#059669',
    role_change: '#7c3aed',
    user_delete: '#dc2626',
    course: '#3b82f6',
    exam: '#16a34a',
    system_settings: '#f59e0b',
    feedback: '#f59e0b',
  }
  return map[category] || '#6b7280'
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const formatDateRange = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export function SuperAdminActivityLogsPage() {
  const { token } = useAuth()

  // ── Summary / KPI data ──
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // ── Logs list ──
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  // ── Filters ──
  const [searchRaw, setSearchRaw] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')
  const [user, setUser] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  // ── Detail modal ──
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null)

  const headers = { Authorization: `Bearer ${token}` }

  const loadSummary = async () => {
    try {
      setSummaryLoading(true)
      setSummaryError(null)
      const res = await fetch(`${API_BASE_URL}/audit/summary`, { headers })
      if (!res.ok) throw new Error('Failed to load audit summary')
      const json = await res.json()
      setSummary(json.data ?? null)
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : 'Failed to load audit summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const buildQuery = () => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage))
    params.set('limit', String(pageSize))
    if (search) params.set('search', search)
    if (actionFilter) params.set('action', actionFilter)
    if (user) params.set('actor', user)
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return params.toString()
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/audit?${buildQuery()}`, { headers })
      if (!res.ok) throw new Error('Failed to load activity logs')
      const json = await res.json()
      setLogs(json.data || [])
      setTotal(json.total ?? 0)
      setPages(json.pages ?? 1)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  // Debounce text filters (search + user) to avoid firing on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchRaw)
      setUser(userFilter)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchRaw, userFilter])

  // Fetch logs whenever filters / pagination change.
  useEffect(() => {
    if (token) loadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, user, actionFilter, statusFilter, startDate, endDate, currentPage, pageSize])

  useEffect(() => {
    if (token) loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const resetPage = () => setCurrentPage(1)

  const applyFilters = () => {
    resetPage()
  }

  const clearFilters = () => {
    setSearchRaw('')
    setActionFilter('')
    setUserFilter('')
    setStatusFilter('all')
    setStartDate('')
    setEndDate('')
    resetPage()
  }

  const refresh = () => {
    loadSummary()
    loadLogs()
  }

  const startOffset = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endOffset = Math.min(currentPage * pageSize, total)

  const kpiStats = [
    { label: 'Total Logs', value: summary?.totalLogs ?? 0, icon: ClipboardList, color: '#7c3aed' },
    { label: "Today's Events", value: summary?.todayEvents ?? 0, icon: TrendingUp, color: '#059669' },
    { label: 'Failed Actions', value: summary?.failedActions ?? 0, icon: AlertTriangle, color: '#dc2626' },
    { label: 'Active Users (Today)', value: summary?.activeUsersToday ?? 0, icon: UserCheck, color: '#f59e0b' },
  ]

  const toggleStatusFilter = (value: string) => setStatusFilter(value)

  const renderSkeletonRows = (n = pageSize) =>
    Array.from({ length: Math.min(n, 8) }).map((_, i) => (
      <tr key={i}>
        <td className="px-4 py-3"><div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
        <td className="px-4 py-3"><div className="h-3 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
        <td className="px-4 py-3"><div className="h-3 w-20 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
        <td className="px-4 py-3"><div className="h-3 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
        <td className="px-4 py-3"><div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
        <td className="px-4 py-3"><div className="h-3 w-28 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} /></td>
      </tr>
    ))

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
                <ClipboardList size={26} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Activity Logs
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Audit trail of privileged and sensitive platform actions
                </p>
              </div>
            </div>

            <button
              onClick={refresh}
              className="btn btn-sm btn-ghost transition-transform duration-200 hover:scale-110"
              style={{ color: 'var(--color-text-muted)' }}
              title="Refresh"
              aria-label="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* ── KPI summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-5"
              style={{ backgroundColor: `${stat.color}12`, borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-4 h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
                  }}
                >
                  <stat.icon size={22} color="#fff" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider truncate"
                    style={{ color: 'var(--color-text-muted)' }}>
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold mt-1" style={{ color: stat.color, lineHeight: 1.2 }}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Premium filter bar ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-4 sm:p-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3">
              {/* Search */}
              <div className="relative max-w-sm w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input input-sm w-full pl-9"
                  placeholder="Search action, category, resource..."
                  aria-label="Search activity logs"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Action filter */}
              <div className="min-w-[160px] w-full sm:w-auto">
                <select
                  className="select select-sm select-bordered w-full"
                  value={actionFilter}
                  onChange={(e) => { setActionFilter(e.target.value); resetPage() }}
                  aria-label="Action filter"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  disabled={summaryLoading || !summary}
                >
                  <option value="">All Actions</option>
                  {(summary?.actions || []).map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* User filter */}
              <div className="relative max-w-sm w-full sm:w-60">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input input-sm w-full pl-9"
                  placeholder="Actor name, email, or role..."
                  aria-label="Filter by actor"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Date filter */}
              <div className="flex items-end gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="date"
                    className="input input-sm"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); resetPage() }}
                    aria-label="Start date"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>to</span>
                <div className="relative">
                  <input
                    type="date"
                    className="input input-sm"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); resetPage() }}
                    aria-label="End date"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              {/* Status / Severity filter */}
              <div
                className="inline-flex items-center gap-1 p-1 rounded-xl"
                style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
              >
                {STATUS_OPTIONS.map((opt) => {
                  const active = statusFilter === opt.value
                  const activeColor = opt.value === 'failed' ? '#dc2626' : opt.value === 'success' ? '#16a34a' : 'var(--color-accent)'
                  return (
                    <button
                      key={opt.value}
                      onClick={() => { toggleStatusFilter(opt.value); resetPage() }}
                      className="btn btn-xs btn-ghost"
                      style={{
                        color: active ? activeColor : 'var(--color-text-muted)',
                        fontWeight: active ? 600 : 400,
                      }}
                      aria-pressed={active}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={applyFilters}
                className="btn btn-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Clear
              </button>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {`${total} result${total !== 1 ? 's' : ''}`} (page {currentPage} of {pages})
              </span>
            </div>
          </div>
        </div>

        {/* ── Activity table card ── */}
        <div
          className="card shadow-sm rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading ? (
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <div className="h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)', width: '40%' }} />
                <table className="table table-sm w-full">
                  <tbody>
                    {renderSkeletonRows()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(226,75,74,0.08)', color: 'var(--color-error)' }}
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
                onClick={loadLogs}
                className="btn btn-sm font-semibold gap-1.5"
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="card-body items-center text-center py-14">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <Shield size={32} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No activity log entries match your filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {[{ key: 'status', label: 'Severity' },
                        { key: 'action', label: 'Action' },
                        { key: 'category', label: 'Category' },
                        { key: 'actor', label: 'Actor' },
                        { key: 'resource', label: 'Resource' },
                        { key: 'ip', label: 'IP' },
                        { key: 'createdAt', label: 'Date' },
                        { key: 'view', label: 'View' }].map((h) => (
                        <th
                          key={h.key}
                          className="text-xs font-semibold uppercase tracking-wider text-left py-3 px-4 sticky top-0"
                          style={{
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-surface)',
                            borderBottom: '1px solid var(--color-border)',
                            zIndex: 10,
                          }}
                        >
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => {
                      const sev = severityFor(log)
                      const Icon = sev.icon
                      return (
                        <tr
                          key={log.id}
                          style={{
                            backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-bg)',
                            borderBottom: '1px solid var(--color-border)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--color-bg)' }}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{ backgroundColor: sev.bg, color: sev.color, border: 'none' }}
                            >
                              <Icon size={10} />
                              {sev.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{log.action || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="badge badge-sm font-semibold"
                              style={{
                                backgroundColor: `${categoryColor(log.category)}20`,
                                color: categoryColor(log.category),
                                border: 'none',
                              }}
                            >
                              {log.category || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {log.actor ? (
                              <div className="flex items-center gap-2.5">
                                <div
                                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                  style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                                >
                                  {log.actor.fullName?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                    {log.actor.fullName || '—'}
                                  </p>
                                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {log.actor.email || '—'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>System</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                              {log.resource ? `${log.resource}${log.resourceId ? ` / ${log.resourceId}` : ''}` : '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{log.ip || '—'}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>{formatDate(log.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setActiveLog(log)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--color-accent)' }}
                              title="View details"
                              aria-label={`View details of ${log.action || 'activity'}`}
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {logs.map((log, i) => {
                  const sev = severityFor(log)
                  const Icon = sev.icon
                  return (
                    <div key={log.id} className="p-4 space-y-3" style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-bg)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: sev.bg, color: sev.color, border: 'none' }}
                        >
                          <Icon size={10} />
                          {sev.label}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDateRange(log.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{log.action || '—'}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.category || '—'} · {log.resource || '—'}</p>
                        </div>
                        <button
                          onClick={() => setActiveLog(log)}
                          className="btn btn-ghost btn-xs"
                          style={{ color: 'var(--color-accent)' }}
                          title="View details"
                          aria-label={`View details of ${log.action || 'activity'}`}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                      {log.actor && (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                          >
                            {log.actor.fullName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {log.actor.fullName || '—'} · {log.actor.email || '—'}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
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
                    onChange={(e) => { setPageSize(Number(e.target.value)); resetPage() }}
                    aria-label="Rows per page"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {total === 0 ? '0–0 of 0' : `${startOffset}–${endOffset} of ${total}`}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-ghost btn-xs"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Page {currentPage} of {Math.max(1, pages)}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.max(1, pages), p + 1))}
                    disabled={currentPage >= pages}
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
      </div>

      {/* ── Timeline detail modal ── */}
      {activeLog && (
        <div className="modal modal-open" onClick={() => setActiveLog(null)}>
          <div
            className="modal-box max-w-2xl p-0"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Log Detail</h3>
              <button
                onClick={() => setActiveLog(null)}
                className="btn btn-ghost btn-xs"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="relative pl-5">
                <div
                  className="absolute left-5 top-0 bottom-0 w-px"
                  style={{ backgroundColor: 'var(--color-border)' }}
                />
                <TimelineItem
                  icon={AlertTriangle}
                  iconColor={severityFor(activeLog).color}
                  title={activeLog.action || 'Unknown action'}
                  subtitle={`${activeLog.category ? `Category: ${activeLog.category}` : ''} ${activeLog.status === 'failed' ? '(failed)' : '(success)'}`}
                  meta={formatDate(activeLog.createdAt)}
                >
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: severityFor(activeLog).bg, color: severityFor(activeLog).color }}
                  >
                    {activeLog.status === 'failed' ? 'Failed' : 'Success'}
                  </span>
                </TimelineItem>

                <TimelineItem
                  icon={UserCheck}
                  iconColor="var(--color-accent)"
                  title="Actor"
                  subtitle={activeLog.actor ? `${activeLog.actor.fullName || '—'} (${activeLog.actor.email || '—'})` : 'System'}
                  meta={activeLog.actorRole ? `Role: ${activeLog.actorRole}` : ''}
                />

                <TimelineItem
                  icon={MapPin}
                  iconColor="#3b82f6"
                  title="Resource"
                  subtitle={activeLog.resource ? `${activeLog.resource}${activeLog.resourceId ? ` / ${activeLog.resourceId}` : ''}` : '—'}
                  meta=""
                />

                <TimelineItem
                  icon={Globe}
                  iconColor="#16a34a"
                  title="Source IP"
                  subtitle={activeLog.ip || '—'}
                  meta=""
                />

                <TimelineItem
                  icon={Monitor}
                  iconColor="#7c3aed"
                  title="User Agent"
                  subtitle={activeLog.userAgent || '—'}
                  meta=""
                />

                <TimelineItem
                  icon={FileJson}
                  iconColor="#f59e0b"
                  title="Details"
                  subtitle="Structured metadata captured for this event"
                  meta=""
                >
                  <pre
                    className="mt-2 text-[11px] overflow-x-auto rounded-lg p-3"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {JSON.stringify(activeLog.details ?? {}, null, 2)}
                  </pre>
                </TimelineItem>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}

interface TimelineItemProps {
  icon: ComponentType<any>
  iconColor: string
  title: string
  subtitle: string
  meta: string
  children?: ReactNode
}

function TimelineItem({ icon: Icon, iconColor, title, subtitle, meta, children }: TimelineItemProps) {
  return (
    <div className="relative mb-5 last:mb-0 last:pb-0">
      <div
        className="absolute left-0 top-1 flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
      >
        <Icon size={17} />
      </div>
      <div className="ml-14">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
            )}
            {meta && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{meta}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
