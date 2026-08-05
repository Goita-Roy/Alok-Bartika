import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import {
  RefreshCw, Search, Eye, X, Loader2, ChevronLeft, ChevronRight,
  Activity, CalendarCheck, Flag, ShieldAlert, Shield, ShieldCheck,
  TriangleAlert, AlertTriangle, Inbox, SearchX,
  FileSpreadsheet, FileText, Download, Mail, Clock, Timer,
  CheckCircle2, XCircle, GraduationCap, ClipboardCheck, Users, Target,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

const RISK_ICONS: Record<RiskLevel, LucideIcon> = {
  clean: ShieldCheck,
  low: Shield,
  medium: ShieldAlert,
  high: TriangleAlert,
}

// Severity badge colors for the event timeline (severity = event weight).
const severityStyle = (sev: number) => {
  if (sev >= 8) return { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' }
  if (sev >= 5) return { bg: 'rgba(124,58,237,0.12)', color: '#7c3aed' }
  if (sev >= 4) return { bg: 'rgba(249,115,22,0.12)', color: '#f97316' }
  if (sev >= 3) return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' }
  return { bg: 'rgba(59,130,246,0.10)', color: '#3b82f6' }
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
  const Icon = RISK_ICONS[risk]
  return (
    <span className="badge badge-sm gap-1 font-semibold transition-all duration-200" style={{ backgroundColor: s.bg, color: s.color, border: 'none' }}>
      <Icon size={12} /> {label}
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
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(59,130,246,0.05))', color: '#3b82f6' }}>
                  <ClipboardCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Attempts</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: '#3b82f6' }}>
                    {overviewLoading ? '…' : overview?.totalAttempts ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.16), rgba(6,182,212,0.05))', color: '#06b6d4' }}>
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Running</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: '#06b6d4' }}>
                    {overviewLoading ? '…' : overview?.running ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))', color: '#f59e0b' }}>
                  <Flag size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Flagged</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: '#f59e0b' }}>
                    {overviewLoading ? '…' : overview?.flagged ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 rounded-2xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-5 flex flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.16), rgba(239,68,68,0.05))', color: '#ef4444' }}>
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>High Risk</p>
                  <p className="text-2xl font-bold tracking-tight" style={{ color: '#ef4444' }}>
                    {overviewLoading ? '…' : overview?.highRisk ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="card shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="card-body p-5">
            <div className="flex flex-col xl:flex-row gap-3 xl:items-end">
              <div className="flex-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Search Student</label>
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input input-sm w-full pl-10 rounded-xl transition-all duration-200 focus:ring-2"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <select className="select select-sm rounded-xl" value={status} onChange={(e) => setStatus(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Level</label>
                <select className="select select-sm rounded-xl" value={level} onChange={(e) => setLevel(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Risk</label>
                <select className="select select-sm rounded-xl" value={risk} onChange={(e) => setRisk(e.target.value)}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>From</label>
                  <input type="date" className="input input-sm rounded-xl" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--color-text-muted)' }}>To</label>
                  <input type="date" className="input input-sm rounded-xl" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>
              </div>

              <button onClick={refresh} className="btn btn-sm rounded-xl self-start xl:self-end gap-1.5 font-semibold transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Export toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: 'rgba(128,128,128,0.04)', border: '1px solid var(--color-border)' }}>
          <span className="text-xs font-semibold uppercase tracking-wider mr-1 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <Download size={13} /> Export
          </span>
          <button className="btn btn-sm btn-ghost rounded-lg transition-all duration-200 hover:bg-base-200" disabled={selected.size === 0} onClick={() => handleExport('selected-csv')}
            style={{ color: selected.size === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
            <FileText size={14} /> Selected CSV
          </button>
          <button className="btn btn-sm btn-ghost rounded-lg transition-all duration-200 hover:bg-base-200" disabled={selected.size === 0} onClick={() => handleExport('selected-xls')}
            style={{ color: selected.size === 0 ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
            <FileSpreadsheet size={14} /> Selected Excel
          </button>
          <button className="btn btn-sm btn-ghost rounded-lg transition-all duration-200 hover:bg-base-200" onClick={() => handleExport('all-csv')}
            style={{ color: 'var(--color-accent)' }}>
            <Download size={14} /> All CSV
          </button>
          <button className="btn btn-sm btn-ghost rounded-lg transition-all duration-200 hover:bg-base-200" onClick={() => handleExport('all-xls')}
            style={{ color: 'var(--color-accent)' }}>
            <Download size={14} /> All Excel
          </button>
          {selected.size > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(59,130,246,0.10)', color: '#3b82f6' }}>
              {selected.size} selected
            </span>
          )}
        </div>

        {error && !loading && (
          <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.16), rgba(220,38,38,0.05))', color: '#dc2626' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Exam monitoring unavailable</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
                </div>
              </div>
              <button className="btn btn-sm rounded-xl font-semibold transition-all duration-200 hover:opacity-90" onClick={() => { loadOverview(); loadActivities(pagination.page) }}
                style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="card shadow-sm rounded-2xl" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6 space-y-3">
              <div className="h-10 rounded-xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.10), rgba(128,128,128,0.18), rgba(128,128,128,0.10))' }} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.08), rgba(128,128,128,0.15), rgba(128,128,128,0.08))' }} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && activities.length === 0 && (
          <div className="card shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-3xl absolute -top-3 -left-3" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(59,130,246,0.02))' }} />
                <div className="w-28 h-28 rounded-3xl absolute -bottom-3 -right-3" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.02))' }} />
                <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--color-accent-pale), transparent)', color: 'var(--color-accent)' }}>
                  {hasActiveFilters ? <SearchX size={42} /> : <Inbox size={42} />}
                </div>
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {hasActiveFilters ? 'No matching attempts.' : 'No exam activity found.'}
              </h3>
              <p className="text-sm mt-1.5 max-w-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {hasActiveFilters
                  ? 'No attempts match the current filters. Try adjusting or clearing them.'
                  : 'Completed or flagged exam attempts will appear here once students take exams.'}
              </p>
              {hasActiveFilters && (
                <button className="btn btn-sm btn-ghost rounded-xl mt-5 gap-1.5 transition-all duration-200 hover:bg-base-200" onClick={clearFilters} style={{ color: 'var(--color-accent)' }}>
                  <X size={14} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Desktop table */}
        {!loading && !error && activities.length > 0 && (
          <div className="hidden md:block card shadow-sm rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="overflow-x-auto max-h-[calc(100vh-22rem)]">
              <table className="table table-sm w-full">
                <thead className="sticky top-0 z-10">
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 0 rgba(128,128,128,0.08)' }}>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>
                      <input type="checkbox" className="checkbox checkbox-sm" checked={allSelectedOnPage} onChange={toggleSelectAll} />
                    </th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Student</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Email</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Exam</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Level</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Started At</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Submitted At</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Duration</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Violations</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Risk</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Status</th>
                    <th className="text-xs font-semibold uppercase tracking-wider py-3.5 px-4" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((row, idx) => (
                    <tr key={row.id} className="transition-colors duration-150 hover:bg-[rgba(128,128,128,0.06)]"
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: selected.has(row.id)
                          ? 'rgba(59,130,246,0.06)'
                          : idx % 2 === 1 ? 'rgba(128,128,128,0.03)' : 'transparent',
                      }}>
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="checkbox checkbox-sm" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {row.student.profilePicture ? (
                            <img src={row.student.profilePicture} alt={row.student.fullName} className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                              {row.student.fullName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-semibold text-sm whitespace-nowrap">{row.student.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm">{row.student.email}</td>
                      <td className="px-4 py-3.5 text-sm max-w-[220px] truncate">{row.exam.title}</td>
                      <td className="px-4 py-3.5"><LevelBadge level={row.level} /></td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap">{formatDateTime(row.startedAt)}</td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap">{formatDateTime(row.submittedAt)}</td>
                      <td className="px-4 py-3.5 text-sm">{row.durationLabel}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold" style={{ color: row.violationsCount > 0 ? '#f59e0b' : 'var(--color-text-muted)' }}>
                          {row.violationsCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5"><RiskBadge risk={row.risk} label={row.riskBadge} /></td>
                      <td className="px-4 py-3.5"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => openDetail(row.id)} className="btn btn-sm btn-ghost rounded-lg gap-1 transition-all duration-200 hover:bg-base-200" style={{ color: 'var(--color-accent)' }}>
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
              <div key={row.id} className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5">
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
              <button className="btn btn-sm btn-ghost rounded-lg" disabled={pagination.page <= 1} onClick={() => loadActivities(pagination.page - 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i
                if (pageNum > pagination.pages) return null
                return (
                  <button key={pageNum}
                    className={`btn btn-sm rounded-lg transition-all duration-200 ${pageNum === pagination.page ? 'btn-primary shadow-md' : 'btn-ghost hover:bg-base-200'}`}
                    onClick={() => loadActivities(pageNum)}
                    style={pageNum === pagination.page ? {} : { color: 'var(--color-text-muted)' }}>
                    {pageNum}
                  </button>
                )
              })}
              <button className="btn btn-sm btn-ghost rounded-lg" disabled={pagination.page >= pagination.pages} onClick={() => loadActivities(pagination.page + 1)} style={{ color: 'var(--color-text-muted)' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Detail slide panel */}
        {panelOpen && (
          <>
            <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={closePanel} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl shadow-2xl transform transition-transform duration-300 ease-in-out"
              style={{ backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}>
              <div className="flex flex-col h-full">
                <div className="px-5 py-4 border-b shrink-0 flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                  <h2 className="text-lg font-semibold flex items-center gap-2.5" style={{ color: 'var(--color-text)' }}>
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                      <Eye size={18} />
                    </span>
                    Exam Activity Details
                  </h2>
                  <button className="btn btn-sm btn-ghost rounded-lg transition-all duration-200 hover:bg-base-200" onClick={closePanel}><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {detailLoading && (
                    <div className="space-y-4">
                      <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.08), rgba(128,128,128,0.15), rgba(128,128,128,0.08))' }} />
                      <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.08), rgba(128,128,128,0.15), rgba(128,128,128,0.08))' }} />
                      <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.08), rgba(128,128,128,0.15), rgba(128,128,128,0.08))' }} />
                      <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(90deg, rgba(128,128,128,0.08), rgba(128,128,128,0.15), rgba(128,128,128,0.08))' }} />
                    </div>
                  )}

                  {detailError && !detailLoading && (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-semibold"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <span>{detailError}</span>
                      <button className="btn btn-sm btn-ghost rounded-lg" onClick={() => activeDetailId && openDetail(activeDetailId)} style={{ color: '#dc2626' }}>
                        <RefreshCw size={14} /> Retry
                      </button>
                    </div>
                  )}

                  {detail && !detailLoading && (
                    <>
                      {/* Student information */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                            <Users size={14} />
                          </span>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Student Information</p>
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-center gap-3">
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
                          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                              <Target size={13} /> Username: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{detail.student.username || '—'}</span>
                            </div>
                            <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
                              <CalendarCheck size={13} /> Joined: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatDateTime(detail.student.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Exam information */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
                            <GraduationCap size={14} />
                          </span>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Exam Information</p>
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{detail.exam.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
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
                            <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>{detail.exam.description}</p>
                          )}
                        </div>
                      </section>

                      {/* Attempt */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                            <Target size={14} />
                          </span>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Attempt</p>
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Score</p>
                              <p className="text-3xl font-black tracking-tight" style={{ color: detail.passed ? '#22c55e' : '#ef4444' }}>
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
                      </section>

                      {/* Risk score */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: RISK_STYLES[detail.risk.level].bg, color: RISK_STYLES[detail.risk.level].color }}>
                              <ShieldAlert size={14} />
                            </span>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Risk Level</p>
                          </div>
                          <RiskBadge risk={detail.risk.level} label={detail.risk.badge} />
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: 'rgba(128,128,128,0.15)' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{
                                width: `${detail.risk.score}%`,
                                background: `linear-gradient(90deg, ${RISK_STYLES[detail.risk.level].color}, ${RISK_STYLES[detail.risk.level].color}66)`,
                                boxShadow: `0 0 12px ${RISK_STYLES[detail.risk.level].color}55`,
                              }} />
                            </div>
                            <span className="font-bold text-lg tabular-nums" style={{ color: RISK_STYLES[detail.risk.level].color }}>{detail.risk.score} / 100</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: `${RISK_STYLES[detail.risk.level].color}0d`, border: `1px solid ${RISK_STYLES[detail.risk.level].color}24` }}>
                              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Risk Score</p>
                              <p className="text-xl font-black tabular-nums" style={{ color: RISK_STYLES[detail.risk.level].color }}>{detail.risk.score}</p>
                            </div>
                            <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'rgba(128,128,128,0.06)', border: '1px solid var(--color-border)' }}>
                              <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Violations</p>
                              <p className="text-xl font-black tabular-nums" style={{ color: 'var(--color-text)' }}>{detail.risk.count}</p>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Cheating events timeline */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: '#ef4444' }}>
                            <ShieldAlert size={14} />
                          </span>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Cheating Events</p>
                        </div>
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          {detail.events.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No cheating events detected.</p>
                          ) : (
                            <div className="space-y-0">
                              {detail.events.map((ev, idx) => {
                                const sev = severityStyle(ev.severity ?? 1)
                                return (
                                  <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                                    <div className="flex flex-col items-center shrink-0">
                                      <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: EVENT_DOT_COLORS[ev.eventType] || '#6b7280' }} />
                                      {idx < detail.events.length - 1 && (
                                        <span className="w-px flex-1 my-1" style={{ backgroundColor: 'var(--color-border)' }} />
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <p className="text-xs font-mono font-semibold" style={{ color: 'var(--color-text-muted)' }}>{ev.timeLabel}</p>
                                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md" style={{ backgroundColor: sev.bg, color: sev.color }}>
                                          Severity {ev.severity ?? 1}
                                        </span>
                                      </div>
                                      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>{ev.eventLabel}</p>
                                      {Object.keys(ev.metadata).length > 0 && (
                                        <p className="text-xs mt-0.5 break-words" style={{ color: 'var(--color-text-muted)' }}>
                                          {JSON.stringify(ev.metadata)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Summary counters */}
                      <section className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                            <ClipboardCheck size={14} />
                          </span>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Summary</p>
                        </div>
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ borderColor: 'var(--color-border)' }}>
                          {SUMMARY_TILES.map((tile) => (
                            <div key={tile.key} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-200 hover:brightness-110"
                              style={{ backgroundColor: `${tile.color}0d`, border: `1px solid ${tile.color}24` }}>
                              <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{tile.label}</span>
                              <span className="text-sm font-bold" style={{ color: tile.color }}>{detail.summary[tile.key] ?? 0}</span>
                            </div>
                          ))}
                        </div>
                      </section>
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
