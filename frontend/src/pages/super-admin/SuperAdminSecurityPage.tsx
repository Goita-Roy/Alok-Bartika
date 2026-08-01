import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { keepPreviousData } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  Shield,
  Clock,
  UserCheck,
  LogIn,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Ban,
  Activity,
  Database,
  UserX,
  UserCog,
  BookOpen,
  FileText,
  Settings,
  FilterX,
  Monitor,
  KeyRound,
  Mail,
  CalendarClock,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import api from '../../config/api'

interface AuditActor {
  id: string
  fullName: string | null
  email: string | null
  role: string | null
}

interface AuditRecord {
  id: string
  actor: AuditActor | null
  actorRole: string
  action: string
  category: string
  resource: string
  resourceId: string | null
  status: string
  ip: string
  userAgent: string
  createdAt: string
  details: Record<string, unknown>
}

interface AuditResponse {
  success: boolean
  page: number
  limit: number
  total: number
  pages: number
  data: AuditRecord[]
}

interface AuditSummary {
  totalLogs: number
  todayEvents: number
  failedActions: number
  activeUsersToday: number
  actions: string[]
  resources: string[]
}

interface Filters {
  search: string
  action: string
  actor: string
  resource: string
  status: string
  startDate: string
  endDate: string
}

const DEFAULT_LIMIT = 20

// Defensive client-side mirror of the backend sanitizer: even though the API
// already strips sensitive keys, the UI re-checks before rendering anything.
const SENSITIVE_KEY = /password|passwd|secret|token|otp|hash|jwt|credential|api[_ -]?key/i

function stripSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSensitive)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key)) continue
      out[key] = stripSensitive(val)
    }
    return out
  }
  return value
}

function toFriendlyError(err: unknown, fallback: string): Error {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 403) return new Error('Access denied. Super Admin privileges required.')
    if (status === 401) return new Error('Session expired. Please log in again.')
    const message = err.response?.data?.message
    if (typeof message === 'string' && message) return new Error(message)
    if (status === 400) return new Error('Invalid filter values')
    return new Error(fallback)
  }
  return err instanceof Error ? err : new Error(fallback)
}

async function fetchAuditLogs(params: {
  page: number
  limit: number
  search?: string
  action?: string
  actor?: string
  resource?: string
  status?: string
  startDate?: string
  endDate?: string
}): Promise<AuditResponse> {
  try {
    const { data } = await api.get<AuditResponse>('/audit', { params })
    return data
  } catch (err) {
    throw toFriendlyError(err, 'Failed to load audit logs')
  }
}

async function fetchAuditSummary(): Promise<AuditSummary> {
  try {
    const { data } = await api.get<{ success: boolean; data: AuditSummary }>('/audit/summary')
    return data.data
  } catch (err) {
    throw toFriendlyError(err, 'Failed to load audit summary')
  }
}

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    login: 'Login',
    login_failed: 'Failed Login',
    role_change: 'Role Change',
    user_delete: 'User Deleted',
    'course.create': 'Course Created',
    'course.update': 'Course Updated',
    'course.delete': 'Course Deleted',
    'exam.create': 'Exam Created',
    'exam.update': 'Exam Updated',
    'system_settings.update': 'Settings Updated',
  }
  if (map[action]) return map[action]
  return action
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function deviceFromUA(ua: string): string {
  if (!ua) return 'Unknown device'
  const parts: string[] = []
  if (/Android/i.test(ua)) parts.push('Android')
  else if (/iPhone|iPad|iPod/i.test(ua)) parts.push('iOS')
  else if (/Windows/i.test(ua)) parts.push('Windows')
  else if (/Mac OS X/i.test(ua)) parts.push('macOS')
  else if (/Linux/i.test(ua)) parts.push('Linux')
  if (/Edg\//i.test(ua)) parts.push('Edge')
  else if (/OPR\//i.test(ua)) parts.push('Opera')
  else if (/Chrome\//i.test(ua)) parts.push('Chrome')
  else if (/Firefox\//i.test(ua)) parts.push('Firefox')
  else if (/Safari\//i.test(ua)) parts.push('Safari')
  return parts.join(' · ') || 'Unknown device'
}

function actorLabel(actor: AuditRecord['actor']): string {
  if (!actor) return 'System'
  return actor.fullName || actor.email || `User (${actor.id.slice(0, 8)})`
}

function actionIcon(action: string, category: string) {
  const size = 16
  const common = { color: 'var(--color-accent)' }
  if (action === 'login') return <LogIn size={size} style={{ color: '#3b82f6' }} />
  if (action === 'login_failed') return <Ban size={size} style={{ color: '#dc2626' }} />
  if (action === 'role_change') return <UserCog size={size} style={{ color: '#7c3aed' }} />
  if (action === 'user_delete') return <UserX size={size} style={{ color: '#dc2626' }} />
  if (category === 'course') return <BookOpen size={size} style={{ color: '#16a34a' }} />
  if (category === 'exam') return <FileText size={size} style={{ color: '#0ea5e9' }} />
  if (category === 'system_settings') return <Settings size={size} style={common} />
  return <Activity size={size} style={common} />
}

function StatusBadge({ status }: { status: string }) {
  const failed = status === 'failed'
  const bg = failed ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)'
  const color = failed ? '#dc2626' : '#16a34a'
  const border = failed ? 'rgba(220,38,38,0.2)' : 'rgba(22,163,74,0.2)'
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {failed ? 'Failed' : 'Success'}
    </span>
  )
}

function CardSkeleton() {
  return <div className="h-7 w-10 rounded bg-current opacity-20 animate-pulse" />
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  color: string
  bg: string
}) {
  return (
    <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="card-body p-5 flex flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold leading-tight" style={{ color }}>{value}</p>
        </div>
      </div>
    </div>
  )
}

export function SuperAdminSecurityPage() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    action: '',
    actor: '',
    resource: '',
    status: '',
    startDate: '',
    endDate: '',
  })
  const [selected, setSelected] = useState<AuditRecord | null>(null)

  const debouncedSearch = useDebouncedValue(filters.search)
  const debouncedActor = useDebouncedValue(filters.actor)

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const hasFilters = Boolean(
    filters.search || filters.action || filters.actor || filters.resource || filters.status || filters.startDate || filters.endDate
  )

  const resetFilters = () => {
    setFilters({ search: '', action: '', actor: '', resource: '', status: '', startDate: '', endDate: '' })
    setPage(1)
  }

  const summaryQuery = useQuery({
    queryKey: ['audit-summary'],
    queryFn: fetchAuditSummary,
    staleTime: 30_000,
  })

  const logsQuery = useQuery({
    queryKey: ['audit-logs', { page, limit, search: debouncedSearch, action: filters.action, actor: debouncedActor, resource: filters.resource, status: filters.status, startDate: filters.startDate, endDate: filters.endDate }],
    queryFn: () =>
      fetchAuditLogs({
        page,
        limit,
        search: debouncedSearch || undefined,
        action: filters.action || undefined,
        actor: debouncedActor || undefined,
        resource: filters.resource || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
    placeholderData: keepPreviousData,
  })

  const refreshAll = () => {
    void summaryQuery.refetch()
    void logsQuery.refetch()
  }

  const summary = summaryQuery.data
  const logs = logsQuery.data
  const pages = logs?.pages ?? 1
  const isFirstLoad = logsQuery.isLoading
  const isRefreshing = logsQuery.isFetching && !logsQuery.isLoading

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
              <Shield size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Security & Audit Logs</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Monitor platform security and activity</p>
            </div>
          </div>
          <button onClick={refreshAll} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }} disabled={isRefreshing}>
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {summaryQuery.isError && (
          <div className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <AlertTriangle size={16} />
            Dashboard summary unavailable: {summaryQuery.error instanceof Error ? summaryQuery.error.message : 'Unknown error'}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Database size={22} style={{ color: '#3b82f6' }} />}
            label="Total Logs"
            color="#3b82f6"
            bg="rgba(59,130,246,0.10)"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summary?.totalLogs ?? '—')}
          />
          <StatCard
            icon={<CalendarClock size={22} style={{ color: '#0ea5e9' }} />}
            label="Today's Events"
            color="#0ea5e9"
            bg="rgba(14,165,233,0.10)"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summary?.todayEvents ?? '—')}
          />
          <StatCard
            icon={<AlertTriangle size={22} style={{ color: '#f59e0b' }} />}
            label="Failed Actions"
            color="#f59e0b"
            bg="rgba(245,158,11,0.10)"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summary?.failedActions ?? '—')}
          />
          <StatCard
            icon={<UserCheck size={22} style={{ color: '#16a34a' }} />}
            label="Unique Active Users Today"
            color="#16a34a"
            bg="rgba(22,163,74,0.10)"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summary?.activeUsersToday ?? '—')}
          />
        </div>

        <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="card-body p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                  Audit Log
                </h2>
                {hasFilters && (
                  <button onClick={resetFilters} className="btn btn-xs btn-ghost gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <FilterX size={14} />
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <label className="relative block">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilter('search', e.target.value)}
                    placeholder="Search action, resource…"
                    style={inputStyle}
                    className="pl-9"
                  />
                </label>
                <label className="relative block">
                  <Monitor size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    value={filters.actor}
                    onChange={(e) => setFilter('actor', e.target.value)}
                    placeholder="Actor (name or email)"
                    style={inputStyle}
                    className="pl-9"
                  />
                </label>
                <select value={filters.action} onChange={(e) => setFilter('action', e.target.value)} style={inputStyle}>
                  <option value="">All actions</option>
                  {(summary?.actions ?? []).map((a) => (
                    <option key={a} value={a}>{humanizeAction(a)}</option>
                  ))}
                </select>
                <select value={filters.resource} onChange={(e) => setFilter('resource', e.target.value)} style={inputStyle}>
                  <option value="">All resources</option>
                  {(summary?.resources ?? []).map((r) => (
                    <option key={r} value={r}>{r || 'System'}</option>
                  ))}
                </select>
                <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} style={inputStyle}>
                  <option value="">All statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
                <label>
                  <span className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>From</span>
                  <input type="date" value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)} style={inputStyle} />
                </label>
                <label>
                  <span className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>To</span>
                  <input type="date" value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)} style={inputStyle} />
                </label>
              </div>

              {isRefreshing && (
                <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--color-border)' }}>
                  <div className="h-full w-1/3 rounded-full animate-pulse" style={{ background: 'var(--color-accent)' }} />
                </div>
              )}

              {logsQuery.isError && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)' }}>
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
                    <AlertTriangle size={16} />
                    {logsQuery.error instanceof Error ? logsQuery.error.message : 'Failed to load audit logs'}
                  </span>
                  <button onClick={() => void logsQuery.refetch()} className="btn btn-xs btn-ghost" style={{ color: 'var(--color-error)' }}>
                    <RefreshCw size={14} />
                    Retry
                  </button>
                </div>
              )}

              {isFirstLoad ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
                  ))}
                </div>
              ) : !logs || logs.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
                    <Shield size={26} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No audit events found</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {hasFilters ? 'Try adjusting or clearing the filters above.' : 'Audit events will appear here as platform activity happens.'}
                  </p>
                  {hasFilters && (
                    <button onClick={resetFilters} className="btn btn-sm btn-outline gap-1" style={{ color: 'var(--color-accent)' }}>
                      <FilterX size={14} />
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                          <th className="whitespace-nowrap">Time</th>
                          <th className="whitespace-nowrap">Actor</th>
                          <th className="whitespace-nowrap">Role</th>
                          <th className="whitespace-nowrap">Action</th>
                          <th className="whitespace-nowrap">Resource</th>
                          <th className="whitespace-nowrap">Status</th>
                          <th className="whitespace-nowrap">IP</th>
                          <th className="whitespace-nowrap">Device</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.data.map((record) => (
                          <tr
                            key={record.id}
                            className="cursor-pointer hover:opacity-80"
                            style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
                            onClick={() => setSelected(record)}
                          >
                            <td className="whitespace-nowrap text-xs">{formatTime(record.createdAt)}</td>
                            <td className="whitespace-nowrap text-sm font-semibold">{actorLabel(record.actor)}</td>
                            <td className="whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>{record.actorRole || '—'}</td>
                            <td className="whitespace-nowrap">
                              <span className="flex items-center gap-2 text-sm">
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-accent-pale)' }}>
                                  {actionIcon(record.action, record.category)}
                                </span>
                                {humanizeAction(record.action)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap text-sm">{record.resource || '—'}</td>
                            <td className="whitespace-nowrap"><StatusBadge status={record.status} /></td>
                            <td className="whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>{record.ip || '—'}</td>
                            <td className="whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>{deviceFromUA(record.userAgent)}</td>
                            <td className="whitespace-nowrap">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelected(record) }}
                                className="btn btn-xs btn-ghost"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Showing {(page - 1) * limit + 1}–{Math.min(page * limit, logs.total)} of {logs.total} events
                    </p>
                    <div className="flex items-center gap-3">
                      <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
                        style={{ ...inputStyle, width: 'auto' }}
                        aria-label="Page size"
                      >
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn btn-sm btn-ghost btn-square" style={{ color: page <= 1 ? 'var(--color-border)' : 'var(--color-text)' }}>
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs px-2" style={{ color: 'var(--color-text-muted)' }}>Page {page} of {pages}</span>
                        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="btn btn-sm btn-ghost btn-square" style={{ color: page >= pages ? 'var(--color-border)' : 'var(--color-text)' }}>
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <AuditDetailModal
          record={selected}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </SuperAdminLayout>
  )
}

function AuditDetailModal({ record, onClose }: { record: AuditRecord; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const details = stripSensitive(record.details) as Record<string, unknown>
  const hasBefore = 'before' in details
  const hasAfter = 'after' in details

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(record.details, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — ignore.
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
              {actionIcon(record.action, record.category)}
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{humanizeAction(record.action)}</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(record.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-square" style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <StatusBadge status={record.status} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{record.action}</span>
          </div>

          <DetailRow label="Actor" value={record.actor ? (record.actor.fullName || '—') : 'System'} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {record.actor && (
              <>
                <DetailRow label="Email" value={record.actor.email || '—'} />
                <DetailRow label="Actor Role" value={record.actor.role || '—'} />
              </>
            )}
            <DetailRow label="Action Category" value={record.category || '—'} />
            <DetailRow label="Resource" value={record.resource || '—'} />
          </div>
          {record.resourceId && <DetailRow label="Resource ID" value={record.resourceId} mono />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailRow label="IP Address" value={record.ip || '—'} />
            <DetailRow label="Device" value={deviceFromUA(record.userAgent)} />
          </div>
          <DetailRow label="User Agent" value={record.userAgent || '—'} mono small />

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                <KeyRound size={15} style={{ color: 'var(--color-accent)' }} />
                Details
              </span>
              <button onClick={copyDetails} className="btn btn-xs btn-ghost" style={{ color: 'var(--color-accent)' }}>
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>

            {Object.keys(details).length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No additional details were recorded for this event.</p>
            ) : (
              <div className="space-y-3">
                {(hasBefore || hasAfter) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hasBefore && (
                      <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>Before</p>
                        <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{stringify(details.before)}</pre>
                      </div>
                    )}
                    {hasAfter && (
                      <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>After</p>
                        <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{stringify(details.after)}</pre>
                      </div>
                    )}
                  </div>
                )}
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  {Object.entries(details)
                    .filter(([key]) => key !== 'before' && key !== 'after')
                    .map(([key, value]) => (
                      <div key={key} className="grid grid-cols-[160px_1fr] gap-3">
                        <span className="text-xs font-semibold break-words" style={{ color: 'var(--color-text-muted)' }}>{key}</span>
                        <span className="text-xs break-words" style={{ color: 'var(--color-text)' }}>{stringify(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Mail size={13} />
            Record ID: <span className="font-mono">{record.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, mono, small }: { label: string; value: string; mono?: boolean; small?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p
        className={`break-words ${small ? 'text-xs' : 'text-sm'}`}
        style={{ color: 'var(--color-text)', fontFamily: mono ? 'monospace' : 'inherit' }}
      >
        {value}
      </p>
    </div>
  )
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}
