import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import {
  RefreshCw, Search, Eye, X, Loader2, ChevronLeft, ChevronRight,
  Activity, CalendarCheck, Flag, ShieldAlert, AlertTriangle,
  FileSpreadsheet, FileText, Download, Mail, Clock, Timer,
  CheckCircle2, XCircle, GraduationCap, ClipboardCheck, Users, Target,
} from 'lucide-react'

interface MonitoringOverview {
  totalAttempts: number
  running: number
  flagged: number
  highRisk: number
}

type RiskLevel = 'clean' | 'low' | 'medium' | 'high'
type ActivityStatus = 'running' | 'completed' | 'terminated'

interface ActivityRow {
  id: string
  student: { id: string; fullName: string; email: string; profilePicture: string | null }
  exam: { id: string; title: string; level: string }
  level: string
  startedAt: string
  submittedAt: string
  durationSeconds: number
  durationLabel: string
  score: number
  passed: boolean
  status: ActivityStatus
  terminationReason: string | null
  violationsCount: number
  risk: RiskLevel
  riskScore: number
  riskBadge: string
}

interface CheatingEvent {
  timestamp: string | null
  eventType: string
  eventLabel: string
  timeLabel: string
  severity?: number
  metadata: Record<string, unknown>
}

interface ActivityDetail extends Omit<ActivityRow, 'risk' | 'student' | 'exam'> {
  student: ActivityRow['student'] & {
    username: string
    phone: string
    createdAt: string | null
  }
  exam: {
    id: string
    title: string
    level: string
    passingScore: number
    timeLimitMinutes: number
    description: string
    questionsCount: number
  }
  risk: { level: RiskLevel; badge: string; score: number; count: number }
  summary: Record<string, number>
  events: CheatingEvent[]
}

interface Pagination { page: number; limit: number; total: number; pages: number }

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#3b82f6',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

const RISK_STYLES: Record<RiskLevel, { bg: string; color: string }> = {
  clean: { bg: 'rgba(34,197,94,0.10)', color: '#22c55e' },
  low: { bg: 'rgba(59,130,246,0.10)', color: '#3b82f6' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  high: { bg: 'rgba(239,68,68,0.10)', color: '#ef4444' },
}

const STATUS_STYLES: Record<ActivityStatus, { bg: string; color: string }> = {
  running: { bg: 'rgba(59,130,246,0.10)', color: '#3b82f6' },
  completed: { bg: 'rgba(34,197,94,0.10)', color: '#22c55e' },
  terminated: { bg: 'rgba(239,68,68,0.10)', color: '#ef4444' },
}

const EVENT_DOT_COLORS: Record<string, string> = {
  tab_switch: '#f59e0b',
  fullscreen_exit: '#f59e0b',
  copy: '#ef4444',
  paste: '#ef4444',
  right_click: '#dc2626',
  devtools: '#7c3aed',
  window_blur: '#3b82f6',
  keyboard_shortcut: '#8b5cf6',
  multiple_monitor: '#06b6d4',
}

const SUMMARY_TILES = [
  { key: 'tabSwitch', label: 'Tab Switches', color: '#f59e0b' },
  { key: 'fullscreenExit', label: 'Fullscreen Exits', color: '#f59e0b' },
  { key: 'copy', label: 'Copy Attempts', color: '#ef4444' },
  { key: 'paste', label: 'Paste Attempts', color: '#ef4444' },
  { key: 'rightClick', label: 'Right Click Attempts', color: '#dc2626' },
  { key: 'windowBlur', label: 'Window Blur', color: '#3b82f6' },
  { key: 'devtools', label: 'DevTools Detection', color: '#7c3aed' },
  { key: 'keyboardShortcut', label: 'Keyboard Shortcut Attempts', color: '#8b5cf6' },
  { key: 'multipleMonitor', label: 'Multiple Monitor', color: '#06b6d4' },
]

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const toCSVText = (rows: ActivityRow[]) => {
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = [
    'Student', 'Email', 'Exam', 'Level', 'Started At', 'Submitted At',
    'Duration', 'Score', 'Result', 'Status', 'Violations', 'Risk',
  ].map(esc).join(',')
  const lines = rows.map((r) =>
    [
      r.student.fullName, r.student.email, r.exam.title, r.level,
      formatDateTime(r.startedAt), formatDateTime(r.submittedAt),
      r.durationLabel, r.score, r.passed ? 'Pass' : 'Fail',
      r.status, r.violationsCount, r.riskBadge,
    ].map(esc).join(',')
  )
  return [header, ...lines].join('\r\n')
}

const LevelBadge = ({ level }: { level: string }) => {
  const color = LEVEL_COLORS[level] || '#6b7280'
  return (
    <span className="badge badge-sm font-semibold capitalize" style={{ backgroundColor: `${color}1a`, color, border: 'none' }}>
      {level}
    </span>
  )
}

const RiskBadge = ({ risk, label }: { risk: RiskLevel; label: string }) => {
  const s = RISK_STYLES[risk]
  return (
    <span className="badge badge-sm font-semibold" style={{ backgroundColor: s.bg, color: s.color, border: 'none' }}>
      {label}
    </span>
  )
}

const StatusBadge = ({ status }: { status: ActivityStatus }) => {
  const s = STATUS_STYLES[status]
  return (
    <span className="badge badge-sm font-semibold capitalize" style={{ backgroundColor: s.bg, color: s.color, border: 'none' }}>
      {status}
    </span>
  )
}

export function AdminExamMonitoringPage() {
  const [overview, setOverview] = useState<MonitoringOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 1 })

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [level, setLevel] = useState<string>('all')
  const [risk, setRisk] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [panelOpen, setPanelOpen] = useState(false)
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ActivityDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    try {
      setOverviewLoading(true)
      setOverviewError(null)
      const res = await api.get('/admin/exam-monitoring/overview')
      setOverview(res.data.data)
    } catch (e) {
      setOverviewError(e instanceof Error ? e.message : 'Failed to load overview')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const loadActivities = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const params: Record<string, string> = { page: String(page), limit: '25' }
      if (debouncedSearch) params.search = debouncedSearch
      if (status !== 'all') params.status = status
      if (level !== 'all') params.level = level
      if (risk !== 'all') params.risk = risk
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo
      const res = await api.get('/admin/exam-monitoring/activities', { params })
      setActivities(res.data.data.activities)
      setPagination(res.data.data.pagination)
      setSelected(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load exam activity')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, status, level, risk, dateFrom, dateTo])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    loadActivities(1)
  }, [loadActivities])

  const refresh = () => {
    loadOverview()
    loadActivities(pagination.page)
  }

  const openDetail = async (id: string) => {
    setPanelOpen(true)
    setActiveDetailId(id)
    setDetailLoading(true)
    setDetailError(null)
    setDetail(null)
    try {
      const res = await api.get(`/admin/exam-monitoring/activities/${encodeURIComponent(id)}`)
      setDetail(res.data.data.activity)
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Failed to load activity detail')
    } finally {
      setDetailLoading(false)
    }
  }

  const closePanel = () => {
    setPanelOpen(false)
    setActiveDetailId(null)
    setDetail(null)
    setDetailError(null)
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const allSelected = activities.length > 0 && activities.every((a) => prev.has(a.id))
      const next = new Set(prev)
      activities.forEach((a) => {
        if (allSelected) next.delete(a.id)
        else next.add(a.id)
      })
      return next
    })
  }

  const handleExport = async (kind: 'all-csv' | 'all-xls' | 'selected-csv' | 'selected-xls') => {
    const date = new Date().toISOString().slice(0, 10)
    try {
      if (kind === 'all-csv' || kind === 'all-xls') {
        const format = kind === 'all-xls' ? 'xls' : 'csv'
        const res = await api.get('/admin/exam-monitoring/export', {
          params: {
            search: debouncedSearch || undefined,
            status: status === 'all' ? undefined : status,
            level: level === 'all' ? undefined : level,
            risk: risk === 'all' ? undefined : risk,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            format,
          },
          responseType: 'blob',
        })
        downloadBlob(res.data as Blob, `exam-monitoring-${date}.${format === 'xls' ? 'xls' : 'csv'}`)
      } else {
        const rows = activities.filter((a) => selected.has(a.id))
        if (rows.length === 0) return
        const text = toCSVText(rows)
        const blob = new Blob(
          [kind === 'selected-xls' ? '\uFEFF' + text : text],
          { type: kind === 'selected-xls' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8' }
        )
        downloadBlob(blob, `exam-monitoring-selected-${date}.${kind === 'selected-xls' ? 'xls' : 'csv'}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to export data')
    }
  }

  const hasActiveFilters =
    debouncedSearch !== '' || status !== 'all' || level !== 'all' || risk !== 'all' || dateFrom !== '' || dateTo !== ''

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setLevel('all')
    setRisk('all')
    setDateFrom('')
    setDateTo('')
  }

  const allSelectedOnPage = activities.length > 0 && activities.every((a) => selected.has(a.id))
  const startIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Exam Monitoring</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Live proctoring insights across all exam attempts</p>
          </div>
          <button onClick={refresh} className="btn btn-sm btn-ghost self-start sm:self-auto" style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Overview cards */}
        {overviewError ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
            <AlertTriangle size={16} /> {overviewError}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.10)' }}>
                  <ClipboardCheck size={22} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Attempts</p>
                  <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                    {overviewLoading ? '…' : overview?.totalAttempts ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(6,182,212,0.10)' }}>
                  <Activity size={22} style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Running</p>
                  <p className="text-2xl font-bold" style={{ color: '#06b6d4' }}>
                    {overviewLoading ? '…' : overview?.running ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <Flag size={22} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Flagged</p>
                  <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>
                    {overviewLoading ? '…' : overview?.flagged ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.10)' }}>
                  <ShieldAlert size={22} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>High Risk</p>
                  <p className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                    {overviewLoading ? '…' : overview?.highRisk ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="card-body p-4">
            <div className="flex flex-col xl:flex-row gap-3 xl:items-end">
              <div className="flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Search Student</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input input-sm w-full pl-9"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <select className="select select-sm" value={status} onChange={(e) => setStatus(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Level</label>
                <select className="select select-sm" value={level} onChange={(e) => setLevel(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Risk</label>
                <select className="select select-sm" value={risk} onChange={(e) => setRisk(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>From</label>
                  <input type="date" className="input input-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>To</label>
                  <input type="date" className="input input-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
              </div>

              <button onClick={refresh} className="btn btn-sm self-start xl:self-end" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Export toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider mr-1" style={{ color: 'var(--color-text-muted)' }}>Export</span>
          <button className="btn btn-sm btn-ghost" disabled={selected.size === 0} onClick={() => handleExport('selected-csv')}
            style={{ color: selected.size === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
            <FileText size={14} /> Selected CSV
          </button>
          <button className="btn btn-sm btn-ghost" disabled={selected.size === 0} onClick={() => handleExport('selected-xls')}
            style={{ color: selected.size === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
            <FileSpreadsheet size={14} /> Selected Excel
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => handleExport('all-csv')}
            style={{ color: 'var(--color-accent)' }}>
            <Download size={14} /> All CSV
          </button>
          <button className="btn btn-sm btn-ghost" onClick={() => handleExport('all-xls')}
            style={{ color: 'var(--color-accent)' }}>
            <Download size={14} /> All Excel
          </button>
          {selected.size > 0 && (
            <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(59,130,246,0.10)', color: '#3b82f6' }}>
              {selected.size} selected
            </span>
          )}
        </div>

        {error && !loading && (
          <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Exam monitoring unavailable</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => { loadOverview(); loadActivities(pagination.page) }}
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6 space-y-3">
              <div className="h-10 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && activities.length === 0 && (
          <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-10 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-2xl absolute -top-3 -left-3" style={{ backgroundColor: 'rgba(59,130,246,0.08)' }} />
                <div className="w-24 h-24 rounded-2xl absolute -bottom-3 -right-3" style={{ backgroundColor: 'rgba(245,158,11,0.10)' }} />
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                  <ClipboardCheck size={34} />
                </div>
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>No exam activity found.</h3>
              <p className="text-sm mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                {hasActiveFilters
                  ? 'No attempts match the current filters. Try adjusting or clearing them.'
                  : 'Completed or flagged exam attempts will appear here once students take exams.'}
              </p>
              {hasActiveFilters && (
                <button className="btn btn-sm btn-ghost mt-4" onClick={clearFilters} style={{ color: 'var(--color-accent)' }}>
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && activities.length > 0 && (
          <div className="hidden md:block card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>
                      <input type="checkbox" className="checkbox checkbox-sm" checked={allSelectedOnPage} onChange={toggleSelectAll} />
                    </th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Student</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Email</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Exam</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Level</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Started At</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Submitted At</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Duration</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Violations</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Risk</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Status</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((row) => (
                    <tr key={row.id} className="transition-colors duration-150" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="px-4 py-3">
                        <input type="checkbox" className="checkbox checkbox-sm" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {row.student.profilePicture ? (
                            <img src={row.student.profilePicture} alt={row.student.fullName} className="w-8 h-8 rounded-xl object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                              {row.student.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-semibold text-sm whitespace-nowrap">{row.student.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{row.student.email}</td>
                      <td className="px-4 py-3 text-sm max-w-[220px] truncate">{row.exam.title}</td>
                      <td className="px-4 py-3"><LevelBadge level={row.level} /></td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(row.startedAt)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(row.submittedAt)}</td>
                      <td className="px-4 py-3 text-sm">{row.durationLabel}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: row.violationsCount > 0 ? '#f59e0b' : 'var(--color-text-muted)' }}>
                          {row.violationsCount}
                        </span>
                      </td>
                      <td className="px-4 py-3"><RiskBadge risk={row.risk} label={row.riskBadge} /></td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(row.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-accent)' }}>
                          <Eye size={15} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile cards */}
        {!loading && !error && activities.length > 0 && (
          <div className="md:hidden space-y-3">
            {activities.map((row) => (
              <div key={row.id} className="card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {row.student.profilePicture ? (
                        <img src={row.student.profilePicture} alt={row.student.fullName} className="w-9 h-9 rounded-xl object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                          {row.student.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{row.student.fullName}</p>
                        <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                          <Mail size={11} /> {row.student.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <GraduationCap size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-medium flex-1 truncate">{row.exam.title}</p>
                    <LevelBadge level={row.level} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Submitted</span>
                      <span className="ml-auto font-semibold">{formatDateTime(row.submittedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      <Timer size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Duration</span>
                      <span className="ml-auto font-semibold">{row.durationLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Score</span>
                      <span className="font-bold" style={{ color: row.passed ? '#22c55e' : '#ef4444' }}>
                        {row.score}% {row.passed ? <CheckCircle2 size={14} className="inline" /> : <XCircle size={14} className="inline" />}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RiskBadge risk={row.risk} label={row.riskBadge} />
                      <button onClick={() => openDetail(row.id)} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-accent)' }}>
                        <Eye size={14} /> View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {startIndex}–{endIndex} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button className="btn btn-sm btn-ghost" disabled={pagination.page <= 1} onClick={() => loadActivities(pagination.page - 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i
                if (pageNum > pagination.pages) return null
                return (
                  <button key={pageNum} className={`btn btn-sm ${pageNum === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => loadActivities(pageNum)}
                    style={pageNum === pagination.page ? {} : { color: 'var(--color-text-muted)' }}>
                    {pageNum}
                  </button>
                )
              })}
              <button className="btn btn-sm btn-ghost" disabled={pagination.page >= pagination.pages} onClick={() => loadActivities(pagination.page + 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Detail slide panel */}
        {panelOpen && (
          <>
            <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={closePanel} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl shadow-xl transform transition-all duration-300 ease-in-out"
              style={{ backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}>
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                  <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Eye size={18} style={{ color: 'var(--color-accent)' }} /> Exam Activity Details
                  </h2>
                  <button className="btn btn-sm btn-ghost" onClick={closePanel}><X size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {detailLoading && (
                    <div className="space-y-3">
                      <div className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      <div className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      <div className="h-40 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      <div className="h-40 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                    </div>
                  )}

                  {detailError && !detailLoading && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <span>{detailError}</span>
                      <button className="btn btn-sm btn-ghost" onClick={() => activeDetailId && openDetail(activeDetailId)} style={{ color: '#dc2626' }}>
                        <RefreshCw size={14} /> Retry
                      </button>
                    </div>
                  )}

                  {detail && !detailLoading && (
                    <>
                      {/* Student information */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                          <Users size={14} /> Student Information
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          {detail.student.profilePicture ? (
                            <img src={detail.student.profilePicture} alt={detail.student.fullName} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                              {detail.student.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold" style={{ color: 'var(--color-text)' }}>{detail.student.fullName}</p>
                            <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{detail.student.email}</p>
                            {detail.student.phone && (
                              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{detail.student.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <Target size={13} /> Username: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{detail.student.username || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <CalendarCheck size={13} /> Joined: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatDateTime(detail.student.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Exam information */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                          <GraduationCap size={14} /> Exam Information
                        </p>
                        <p className="font-semibold mt-2" style={{ color: 'var(--color-text)' }}>{detail.exam.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <LevelBadge level={detail.exam.level} />
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(59,130,246,0.10)', color: '#3b82f6' }}>
                            Passing Score: {detail.exam.passingScore}%
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: '#7c3aed' }}>
                            {detail.exam.questionsCount} Questions
                          </span>
                          {detail.exam.timeLimitMinutes > 0 && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                              {detail.exam.timeLimitMinutes} min limit
                            </span>
                          )}
                        </div>
                        {detail.exam.description && (
                          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{detail.exam.description}</p>
                        )}
                      </div>

                      {/* Attempt */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Attempt</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Score</p>
                            <p className="text-3xl font-black" style={{ color: detail.passed ? '#22c55e' : '#ef4444' }}>
                              {detail.score}%
                            </p>
                          </div>
                          <div>
                            <span className="badge badge-sm font-bold" style={{
                              backgroundColor: detail.passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                              color: detail.passed ? '#22c55e' : '#ef4444',
                              border: 'none',
                            }}>
                              {detail.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <Timer size={14} /> Duration: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{detail.durationLabel}</span>
                          </div>
                          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock size={14} /> Status: <StatusBadge status={detail.status} />
                          </div>
                          <div className="col-span-2 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <CalendarCheck size={14} /> Started: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatDateTime(detail.startedAt)}</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                            <CheckCircle2 size={14} /> Submitted: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatDateTime(detail.submittedAt)}</span>
                          </div>
                        </div>
                        {detail.terminationReason && (
                          <div className="mt-3 px-3 py-2 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            {detail.terminationReason}
                          </div>
                        )}
                      </div>

                        {/* Risk score */}
                        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                              <ShieldAlert size={14} /> Risk Level
                            </p>
                            <RiskBadge risk={detail.risk.level} label={detail.risk.badge} />
                          </div>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: 'rgba(128,128,128,0.15)' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{
                                width: `${detail.risk.score}%`,
                                backgroundColor: RISK_STYLES[detail.risk.level].color,
                              }} />
                            </div>
                            <span className="font-bold text-lg" style={{ color: RISK_STYLES[detail.risk.level].color }}>{detail.risk.score} / 100</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                            <span>Total Risk Score</span>
                            <span className="font-bold" style={{ color: RISK_STYLES[detail.risk.level].color }}>{detail.risk.score}</span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            Total Violations: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{detail.risk.count}</span>
                          </p>
                        </div>

                      {/* Cheating events timeline */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                          <ShieldAlert size={14} /> Cheating Events
                        </p>
                        {detail.events.length === 0 ? (
                          <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>No cheating events detected.</p>
                        ) : (
                          <div className="mt-4 space-y-0">
                            {detail.events.map((ev, idx) => (
                              <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                                <div className="flex flex-col items-center shrink-0">
                                  <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: EVENT_DOT_COLORS[ev.eventType] || '#6b7280' }} />
                                  {idx < detail.events.length - 1 && (
                                    <span className="w-px flex-1 my-1" style={{ backgroundColor: 'var(--color-border)' }} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono font-semibold" style={{ color: 'var(--color-text-muted)' }}>{ev.timeLabel}</p>
                                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{ev.eventLabel}</p>
                                  <p className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                                    Severity: {ev.severity ?? 1}
                                  </p>
                                  {Object.keys(ev.metadata).length > 0 && (
                                    <p className="text-xs mt-0.5 break-words" style={{ color: 'var(--color-text-muted)' }}>
                                      {JSON.stringify(ev.metadata)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Summary counters */}
                      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Summary</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {SUMMARY_TILES.map((tile) => (
                            <div key={tile.key} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                              style={{ backgroundColor: `${tile.color}0d`, border: `1px solid ${tile.color}24` }}>
                              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{tile.label}</span>
                              <span className="text-sm font-bold" style={{ color: tile.color }}>{detail.summary[tile.key] ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
