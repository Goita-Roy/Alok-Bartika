import { useState, useEffect, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  ScrollText, ClipboardList, Activity, AlertTriangle, UserCheck,
  RefreshCw, Search, Users, Monitor, FilterX, ChevronLeft,
  ChevronRight, Eye, X, FileDown, FileSpreadsheet, Clock,
  CalendarRange, Shield, Loader2, Globe, KeyRound, Mail,
  ArrowUp, ArrowDown, ArrowUpDown, CheckCircle2, ChevronDown,
  Copy, Check, User, Server, Code2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

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

const PAGE_SIZE_OPTIONS = [20, 50, 100]

// ── Quick date range presets ──────────────────────────────────────────────
type QuickFilterKey = 'today' | 'last7' | 'last30' | 'thisMonth' | 'allTime'

const QUICK_FILTERS: { key: QuickFilterKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'allTime', label: 'All Time' },
]

const toDateInputValue = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

const formatDateOnly = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const humanizeAction = (action: string) => {
  const map: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    login_failed: 'Failed Login',
    role_change: 'Role Change',
    user_delete: 'User Deleted',
    admin_delete: 'Admin Deleted',
    admin_create: 'Admin Created',
    admin_update: 'Admin Updated',
    suspend: 'Account Suspended',
    reset_password: 'Password Reset',
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

const actorLabel = (record: AuditRecord): string => {
  if (!record.actor) return 'System'
  return record.actor.fullName || record.actor.email || `User (${record.actor.id.slice(0, 8)})`
}

const deviceFromUA = (ua: string): string => {
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

function exportCSV(records: AuditRecord[]) {
  const headers = ['Time', 'User', 'Role', 'Action', 'Resource', 'Status', 'Severity', 'IP Address', 'User Agent']
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = records.map((r) => [
    formatDate(r.createdAt),
    actorLabel(r),
    r.actor?.role || r.actorRole || '—',
    humanizeAction(r.action),
    r.resource || '—',
    r.status || 'success',
    SEVERITY_META[severityFor(r)].label,
    r.ip || '—',
    r.userAgent || '—',
  ])
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n')
  downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), 'audit-logs.csv')
}

function exportExcel(records: AuditRecord[]) {
  const escapeXml = (v: string | number) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  const headers = ['Time', 'User', 'Role', 'Action', 'Resource', 'Status', 'Severity', 'IP Address', 'User Agent']
  const rowXml = (values: (string | number)[]) =>
    `<Row>${values.map((v) => `<Cell><Data ss:Type="String">${escapeXml(v)}</Data></Cell>`).join('')}</Row>`
  const tableXml = [
    rowXml(headers),
    ...records.map((r) =>
      rowXml([
        formatDate(r.createdAt),
        actorLabel(r),
        r.actor?.role || r.actorRole || '—',
        humanizeAction(r.action),
        r.resource || '—',
        r.status || 'success',
        SEVERITY_META[severityFor(r)].label,
        r.ip || '—',
        r.userAgent || '—',
      ])
    ),
  ].join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Audit Logs"><Table>${tableXml}</Table></Worksheet>
</Workbook>`
  downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel' }), 'audit-logs.xls')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
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

type Severity = 'critical' | 'warning' | 'info' | 'success'

const CRITICAL_ACTIONS = new Set(['user_delete', 'admin_delete', 'role_change', 'system_settings.update'])
const CRITICAL_CATEGORIES = new Set(['user_delete', 'role_change', 'system_settings'])
const WARNING_ACTIONS = new Set(['login_failed', 'suspend', 'reset_password'])
const INFO_ACTIONS = new Set(['login', 'logout', 'view', 'export'])

// Derives a severity level purely from existing audit record data.
// Explicit action/category rules take precedence, then the generic
// status fallback (any other failed operation is critical).
const severityFor = (record: AuditRecord): Severity => {
  const action = record.action || ''
  const category = record.category || ''
  if (CRITICAL_ACTIONS.has(action) || CRITICAL_CATEGORIES.has(category)) return 'critical'
  if (WARNING_ACTIONS.has(action)) return 'warning'
  if (INFO_ACTIONS.has(action)) return 'info'
  return record.status === 'failed' ? 'critical' : 'success'
}

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.22)' },
  warning: { label: 'Warning', color: '#d97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)' },
  info: { label: 'Info', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.22)' },
  success: { label: 'Success', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.22)' },
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  )
}

// ── Client-side sorting (applies to the currently loaded page only) ──────
type SortKey = 'time' | 'user' | 'role' | 'action' | 'resource' | 'status' | 'severity'
type SortDir = 'asc' | 'desc'

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
}

const STATUS_RANK: Record<string, number> = {
  failed: 0,
  success: 1,
}

const sortValueFor = (record: AuditRecord, key: SortKey): string | number => {
  switch (key) {
    case 'time':
      return new Date(record.createdAt).getTime()
    case 'user':
      return actorLabel(record).toLowerCase()
    case 'role':
      return (record.actor?.role || record.actorRole || '').toLowerCase()
    case 'action':
      return record.action.toLowerCase()
    case 'resource':
      return (record.resource || '').toLowerCase()
    case 'status':
      return STATUS_RANK[record.status] ?? (record.status || '').toLowerCase()
    case 'severity':
      return SEVERITY_RANK[severityFor(record)]
  }
}

function sortRecords(records: AuditRecord[], key: SortKey, dir: SortDir): AuditRecord[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...records].sort((a, b) => {
    const va = sortValueFor(a, key)
    const vb = sortValueFor(b, key)
    if (typeof va === 'number' && typeof vb === 'number') {
      if (va < vb) return -1 * factor
      if (va > vb) return 1 * factor
      return 0
    }
    const sa = String(va)
    const sb = String(vb)
    return sa.localeCompare(sb) * factor
  })
}

function formatDetails(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function SuperAdminAuditLogsPage() {
  const { token } = useAuth()

  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const [logs, setLogs] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const [searchRaw, setSearchRaw] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')
  const [userRaw, setUserRaw] = useState('')
  const [user, setUser] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey | null>(null)

  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const [activeLog, setActiveLog] = useState<AuditRecord | null>(null)
  const [exporting, setExporting] = useState<'current-csv' | 'current-excel' | 'all-csv' | 'all-excel' | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [sortKey, setSortKey] = useState<SortKey>('time')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sortedLogs = useMemo(() => sortRecords(logs, sortKey, sortDir), [logs, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const hasLoadedRef = useRef(false)
  const toastTimerRef = useRef<number | null>(null)
  const lastFilterKeyRef = useRef('')
  const logAbortRef = useRef<AbortController | null>(null)
  const logSeqRef = useRef(0)
  const summaryAbortRef = useRef<AbortController | null>(null)
  const summarySeqRef = useRef(0)

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 3500)
  }

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const loadSummary = async (seq: number = ++summarySeqRef.current) => {
    summaryAbortRef.current?.abort()
    const controller = new AbortController()
    summaryAbortRef.current = controller
    try {
      setSummaryLoading(true)
      setSummaryError(null)
      const res = await fetch(`${API_BASE_URL}/audit/summary`, { headers, signal: controller.signal })
      if (!res.ok) throw new Error('Failed to load audit summary')
      const json = await res.json()
      if (seq !== summarySeqRef.current) return
      setSummary(json.data ?? null)
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      if (seq !== summarySeqRef.current) return
      setSummaryError(e instanceof Error ? e.message : 'Failed to load audit summary')
    } finally {
      if (seq === summarySeqRef.current) {
        setSummaryLoading(false)
      }
    }
  }

  const buildQuery = () => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage))
    params.set('limit', String(pageSize))
    if (search) params.set('search', search)
    if (actionFilter) params.set('action', actionFilter)
    if (resourceFilter) params.set('resource', resourceFilter)
    if (user) params.set('actor', user)
    if (statusFilter) params.set('status', statusFilter)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    return params.toString()
  }

  const loadLogs = async (seq: number = ++logSeqRef.current) => {
    logAbortRef.current?.abort()
    const controller = new AbortController()
    logAbortRef.current = controller
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/audit?${buildQuery()}`, { headers, signal: controller.signal })
      if (!res.ok) throw new Error('Failed to load audit logs')
      const json = await res.json()
      if (seq !== logSeqRef.current) return
      setLogs(json.data || [])
      setTotal(json.total ?? 0)
      setPages(json.pages ?? 1)
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return
      if (seq !== logSeqRef.current) return
      setError(e instanceof Error ? e.message : 'Failed to load audit logs')
    } finally {
      if (seq === logSeqRef.current) {
        setLoading(false)
        hasLoadedRef.current = true
      }
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchRaw)
      setUser(userRaw)
    }, 350)
    return () => clearTimeout(handler)
  }, [searchRaw, userRaw])

  useEffect(() => {
    if (!token) return
    const filterKey = [search, user, actionFilter, resourceFilter, statusFilter, startDate, endDate].join('|')
    if (filterKey !== lastFilterKeyRef.current && currentPage !== 1) {
      lastFilterKeyRef.current = filterKey
      setCurrentPage(1)
      return
    }
    lastFilterKeyRef.current = filterKey
    void loadLogs()
    return () => logAbortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, user, actionFilter, resourceFilter, statusFilter, startDate, endDate, currentPage, pageSize])

  useEffect(() => {
    if (token) void loadSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const refresh = async () => {
    setRefreshing(true)
    setLastRefreshed(new Date())
    try {
      await Promise.all([loadLogs(), loadSummary()])
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!autoRefresh) return
    const interval = window.setInterval(() => {
      void refresh()
    }, 60000)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh])

  const formatLastRefreshed = (d: Date | null) => {
    if (!d) return '—'
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  }

  const resetFilters = () => {
    setSearchRaw('')
    setUserRaw('')
    setActionFilter('')
    setResourceFilter('')
    setStatusFilter('')
    setStartDate('')
    setEndDate('')
    setQuickFilter(null)
    setCurrentPage(1)
  }

  const applyQuickFilter = (key: QuickFilterKey) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (key === 'allTime') {
      setStartDate('')
      setEndDate('')
    } else if (key === 'today') {
      const value = toDateInputValue(today)
      setStartDate(value)
      setEndDate(value)
    } else if (key === 'last7') {
      const start = new Date(today)
      start.setDate(today.getDate() - 6)
      setStartDate(toDateInputValue(start))
      setEndDate(toDateInputValue(today))
    } else if (key === 'last30') {
      const start = new Date(today)
      start.setDate(today.getDate() - 29)
      setStartDate(toDateInputValue(start))
      setEndDate(toDateInputValue(today))
    } else if (key === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      setStartDate(toDateInputValue(start))
      setEndDate(toDateInputValue(today))
    }
    setQuickFilter(key)
    setCurrentPage(1)
  }

  const hasFilters = Boolean(
    search || user || actionFilter || resourceFilter || statusFilter || startDate || endDate
  )

  const handleExport = async (scope: 'current' | 'all', format: 'csv' | 'excel') => {
    const action = `${scope}-${format}` as 'current-csv' | 'current-excel' | 'all-csv' | 'all-excel'
    try {
      setExporting(action)
      setExportOpen(false)

      let records: AuditRecord[]
      if (scope === 'current') {
        records = sortedLogs
      } else {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('limit', '100')
        if (search) params.set('search', search)
        if (actionFilter) params.set('action', actionFilter)
        if (resourceFilter) params.set('resource', resourceFilter)
        if (user) params.set('actor', user)
        if (statusFilter) params.set('status', statusFilter)
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        const res = await fetch(`${API_BASE_URL}/audit?${params.toString()}`, { headers })
        if (!res.ok) throw new Error('Failed to export audit logs')
        const json = await res.json()
        const first = json.data || []
        const collected = [...first]
        for (let p = 2; p <= (json.pages || 1); p++) {
          params.set('page', String(p))
          const more = await fetch(`${API_BASE_URL}/audit?${params.toString()}`, { headers })
          if (!more.ok) break
          const moreJson = await more.json()
          collected.push(...(moreJson.data || []))
        }
        records = collected
      }

      if (format === 'csv') exportCSV(records)
      else exportExcel(records)
      showToast(`Exported ${records.length} log${records.length === 1 ? '' : 's'} as ${format.toUpperCase()}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to export audit logs')
    } finally {
      setExporting(null)
    }
  }

  const startOffset = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endOffset = Math.min(currentPage * pageSize, total)

  const kpiStats = [
    { label: 'Total Logs', value: summary?.totalLogs ?? 0, icon: ClipboardList, color: '#7c3aed' },
    { label: "Today's Activities", value: summary?.todayEvents ?? 0, icon: Activity, color: '#059669' },
    { label: 'Failed Actions', value: summary?.failedActions ?? 0, icon: AlertTriangle, color: '#dc2626' },
    { label: 'Active Users Today', value: summary?.activeUsersToday ?? 0, icon: UserCheck, color: '#f59e0b' },
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
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.30)' }}
              >
                <ScrollText size={26} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Audit Logs
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Track and review all platform activities and administrative actions.
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5" style={{ color: 'var(--color-text-muted)' }}>
                  <CalendarRange size={14} />
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
              {/* ── Auto Refresh toolbar ── */}
              <div className="inline-flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-all duration-200" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setAutoRefresh((v) => !v)}
                  role="switch"
                  aria-checked={autoRefresh}
                  className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${autoRefresh ? 'bg-white' : ''}`}
                  style={{
                    color: autoRefresh ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    boxShadow: autoRefresh ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    border: '1px solid transparent',
                    borderColor: autoRefresh ? 'var(--color-border)' : 'transparent',
                  }}
                  title="Toggle Auto Refresh (every 60s)"
                  aria-label="Toggle Auto Refresh (every 60s)"
                >
                  <span
                    className="relative inline-flex w-7 h-4 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: autoRefresh ? 'var(--color-accent)' : 'var(--color-border)' }}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 shadow-sm"
                      style={{ left: autoRefresh ? 'calc(100% - 14px)' : '2px' }}
                    />
                  </span>
                  Auto Refresh
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md transition-all duration-200 ${autoRefresh ? '' : 'opacity-80'}`}>
                    {autoRefresh ? 'ON' : 'OFF'}
                  </span>
                </button>
                <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="inline-flex items-center gap-1.5 px-2.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }} title="Last Refreshed">
                  {refreshing ? <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-accent)' }} /> : <RefreshCw size={12} />}
                  <span className="hidden lg:inline">Last Refreshed:</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{formatLastRefreshed(lastRefreshed)}</span>
                </div>
                <button
                  onClick={() => void refresh()}
                  className="btn btn-sm btn-ghost px-2.5 transition-transform duration-200 hover:scale-110"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Refresh now"
                  aria-label="Refresh now"
                  disabled={refreshing}
                >
                  <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Overview cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-5"
                style={{ backgroundColor: `${stat.color}12`, borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-4 h-full">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`, boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                  >
                    <Icon size={22} color="#fff" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-1" style={{ color: stat.color, lineHeight: 1.2 }}>
                      {summaryLoading ? <span className="animate-pulse">…</span> : stat.value}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {summaryError && (
          <div className="flex items-center gap-2 text-xs px-4 py-3 rounded-xl"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' }}>
            <AlertTriangle size={16} />
            Summary unavailable: {summaryError}
          </div>
        )}

        {/* ── Filter bar ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-4 sm:p-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input input-sm w-full pl-9"
                  placeholder="Search action, resource…"
                  aria-label="Search audit logs"
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div className="relative">
                <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input input-sm w-full pl-9"
                  placeholder="User (name or email)"
                  aria-label="Search by user"
                  value={userRaw}
                  onChange={(e) => setUserRaw(e.target.value)}
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <select
                className="select select-sm select-bordered w-full"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                aria-label="Action filter"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">All Actions</option>
                {(summary?.actions || []).map((a) => (
                  <option key={a} value={a}>{humanizeAction(a)}</option>
                ))}
              </select>
              <select
                className="select select-sm select-bordered w-full"
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                aria-label="Resource filter"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">All Resources</option>
                {(summary?.resources || []).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                className="select select-sm select-bordered w-full"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Status filter"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <div className="flex flex-col gap-2 lg:col-span-1">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_FILTERS.map((qf) => {
                    const active = quickFilter === qf.key
                    return (
                      <button
                        key={qf.key}
                        onClick={() => applyQuickFilter(qf.key)}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        style={{
                          backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg)',
                          color: active ? '#fff' : 'var(--color-text-muted)',
                          border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          boxShadow: active ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
                        }}
                        aria-pressed={active}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                            e.currentTarget.style.color = 'var(--color-accent)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                            e.currentTarget.style.color = 'var(--color-text-muted)'
                          }
                        }}
                      >
                        {qf.label}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-end gap-2">
                  <input
                    type="date"
                    className="input input-sm w-full"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setQuickFilter(null); setCurrentPage(1) }}
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    title="Start date"
                    aria-label="Start date"
                  />
                  <span className="text-xs pb-2.5" style={{ color: 'var(--color-text-muted)' }}>to</span>
                  <input
                    type="date"
                    className="input input-sm w-full"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setQuickFilter(null); setCurrentPage(1) }}
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    title="End date"
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={refresh}
                  className="btn btn-sm font-semibold gap-1.5"
                  style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
                <button
                  onClick={resetFilters}
                  className="btn btn-sm btn-ghost gap-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <FilterX size={14} />
                  Reset Filters
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => setExportOpen((o) => !o)}
                  disabled={exporting !== null || logs.length === 0}
                  className="btn btn-sm btn-ghost gap-1.5"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-haspopup="menu"
                  aria-expanded={exportOpen}
                >
                  {exporting !== null ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>
                      <FileDown size={14} />
                      Export
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
                {exportOpen && exporting === null && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setExportOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl shadow-lg p-1.5"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      {[
                        { action: 'current' as const, format: 'csv' as const, label: 'Current Page → CSV', icon: FileDown },
                        { action: 'current' as const, format: 'excel' as const, label: 'Current Page → Excel', icon: FileSpreadsheet },
                        { action: 'all' as const, format: 'csv' as const, label: 'All Filtered → CSV', icon: FileDown },
                        { action: 'all' as const, format: 'excel' as const, label: 'All Filtered → Excel', icon: FileSpreadsheet },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={`${item.action}-${item.format}`}
                            onClick={() => void handleExport(item.action, item.format)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 text-left"
                            style={{ color: 'var(--color-text)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                              e.currentTarget.style.color = 'var(--color-accent)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--color-text)'
                            }}
                          >
                            <Icon size={15} className="shrink-0" />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Table card ── */}
        <div
          className="card shadow-sm rounded-2xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading && !hasLoadedRef.current ? (
            <div className="p-4 sm:p-6">
              <div className="space-y-2">
                <div className="h-3 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border)', width: '40%' }} />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
                ))}
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
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Something went wrong</h3>
              <p className="text-xs mb-4 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
              <button
                onClick={() => void loadLogs()}
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
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No audit logs found</p>
              <p className="text-xs mt-1 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                {hasFilters ? 'Try adjusting or clearing the filters above.' : 'Audit events will appear here as platform activity happens.'}
              </p>
              {hasFilters && (
                <button onClick={resetFilters} className="btn btn-sm btn-outline gap-1.5 mt-4" style={{ color: 'var(--color-accent)' }}>
                  <FilterX size={14} />
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto max-h-[560px] overflow-y-auto">
                <table className="table table-sm w-full">
                  <thead className="sticky top-0 z-10">
                    <tr style={{ backgroundColor: 'var(--color-surface)', boxShadow: '0 1px 0 var(--color-border)' }}>
                      {[{ key: 'time', label: 'Time', sortable: true },
                        { key: 'severity', label: 'Severity', sortable: true },
                        { key: 'user', label: 'User', sortable: true },
                        { key: 'role', label: 'Role', sortable: true },
                        { key: 'action', label: 'Action', sortable: true },
                        { key: 'resource', label: 'Resource', sortable: true },
                        { key: 'status', label: 'Status', sortable: true },
                        { key: 'ip', label: 'IP Address', sortable: false },
                        { key: 'actions', label: 'Actions', sortable: false }].map((h) => {
                        const isActive = h.sortable && h.key === sortKey
                        return (
                        <th
                          key={h.key}
                          className="text-xs font-semibold uppercase tracking-wider text-left py-3 px-4 whitespace-nowrap"
                          style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)' }}
                        >
                          {h.sortable ? (
                            <button
                              onClick={() => toggleSort(h.key as SortKey)}
                              className="inline-flex items-center gap-1 uppercase tracking-wider text-xs font-semibold cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] rounded"
                              style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                              title={`Sort by ${h.label}`}
                              aria-label={`Sort by ${h.label}`}
                            >
                              {h.label}
                              {isActive ? (
                                sortDir === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
                              ) : (
                                <ArrowUpDown size={12} />
                              )}
                            </button>
                          ) : (
                            h.label
                          )}
                        </th>
                      )})}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedLogs.map((log, i) => (
                      <tr
                        key={log.id}
                        className="transition-colors duration-150"
                        style={{
                          backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-bg)',
                          borderBottom: '1px solid var(--color-border)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = i % 2 === 0 ? 'transparent' : 'var(--color-bg)' }}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <SeverityBadge severity={severityFor(log)} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.actor ? (
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                              >
                                {(log.actor.fullName || log.actor.email || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                                  {actorLabel(log)}
                                </p>
                                {log.actor.email && (
                                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{log.actor.email}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>System</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                            {log.actor?.role || log.actorRole || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {humanizeAction(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: 'var(--color-text)' }}>
                          {log.resource ? (log.resourceId ? `${log.resource} / ${log.resourceId}` : log.resource) : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={log.status} /></td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>{log.ip || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setActiveLog(log)}
                            className="btn btn-ghost btn-xs"
                            style={{ color: 'var(--color-accent)' }}
                            title="View details"
                            aria-label={`View details of ${humanizeAction(log.action)}`}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {sortedLogs.map((log, i) => (
                  <div key={log.id} className="p-4 space-y-3" style={{ backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-bg)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{humanizeAction(log.action)}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {log.resource ? (log.resourceId ? `${log.resource} / ${log.resourceId}` : log.resource) : '—'} · {formatDateOnly(log.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <SeverityBadge severity={severityFor(log)} />
                        <StatusBadge status={log.status} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                        >
                          {(log.actor?.fullName || log.actor?.email || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {actorLabel(log)}{log.actor?.email ? ` · ${log.actor.email}` : ''}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveLog(log)}
                        className="btn btn-ghost btn-xs"
                        style={{ color: 'var(--color-accent)' }}
                        title="View details"
                        aria-label={`View details of ${humanizeAction(log.action)}`}
                      >
                        <Eye size={14} />
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
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                    aria-label="Rows per page"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
                    style={{ color: currentPage === 1 ? 'var(--color-border)' : 'var(--color-text-muted)' }}
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
                    style={{ color: currentPage >= pages ? 'var(--color-border)' : 'var(--color-text-muted)' }}
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

      {/* ── Audit Inspector drawer ── */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setActiveLog(null)}>
          <div
            className="w-full max-w-xl h-full overflow-y-auto rounded-l-2xl shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between gap-3 px-6 py-4 z-10"
              style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.30)' }}>
                  <ScrollText size={18} color="#fff" />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Audit Inspector</h3>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: SEVERITY_META[severityFor(activeLog)].color }} />
                    {humanizeAction(activeLog.action)}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveLog(null)} className="btn btn-sm btn-ghost btn-square" style={{ color: 'var(--color-text-muted)' }} aria-label="Close inspector">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Status cards ── */}
              <div className="grid grid-cols-2 gap-3">
                <StatusCard icon={Shield} label="Severity">
                  <SeverityBadge severity={severityFor(activeLog)} />
                </StatusCard>
                <StatusCard icon={CheckCircle2} label="Status">
                  <StatusBadge status={activeLog.status} />
                </StatusCard>
                <StatusCard icon={ClipboardList} label="Category">
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{humanizeCategory(activeLog.category)}</span>
                </StatusCard>
                <StatusCard icon={Clock} label="Timestamp">
                  <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{timeOnly(activeLog.createdAt)}</span>
                </StatusCard>
              </div>

              {/* ── Event timeline ── */}
              <section>
                <SectionTitle icon={Activity} title="Event Timeline" />
                <div className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                  <TimelineRow icon={Clock} label="Event Time" color="#7c3aed" value={formatDate(activeLog.createdAt)} />
                  <TimelineRow icon={User} label="User" color="#2563eb" value={actorLabel(activeLog)} />
                  <TimelineRow icon={Shield} label="Role" color="#059669" value={activeLog.actor?.role || activeLog.actorRole || '—'} />
                  <TimelineRow icon={Activity} label="Action" color="#d97706" value={humanizeAction(activeLog.action)} />
                  <TimelineRow icon={Globe} label="Resource" color="#0891b2" value={activeLog.resource || '—'} />
                  <TimelineRow
                    icon={CheckCircle2}
                    label="Status"
                    color={activeLog.status === 'failed' ? '#dc2626' : '#16a34a'}
                    value={activeLog.status === 'failed' ? 'Failed' : 'Success'}
                  />
                  <TimelineRow icon={AlertTriangle} label="Severity" color={SEVERITY_META[severityFor(activeLog)].color}>
                    <SeverityBadge severity={severityFor(activeLog)} />
                  </TimelineRow>
                  <TimelineRow
                    icon={Globe}
                    label="IP Address"
                    color="#7c3aed"
                    value={activeLog.ip || '—'}
                    action={<CopyButton text={activeLog.ip || ''} label="IP Address" onCopied={showToast} />}
                  />
                  <TimelineRow
                    icon={Monitor}
                    label="Browser / Device"
                    color="#db2777"
                    value={deviceFromUA(activeLog.userAgent)}
                    action={<CopyButton text={activeLog.userAgent || ''} label="User Agent" onCopied={showToast} />}
                    isLast
                  />
                </div>
              </section>

              {/* ── User profile ── */}
              <section>
                <SectionTitle icon={Users} title="User" />
                {activeLog.actor ? (
                  <div className="rounded-2xl border p-5 transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-lg font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.30)' }}
                      >
                        {(activeLog.actor.fullName || activeLog.actor.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                          {activeLog.actor.fullName || 'Unknown user'}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {activeLog.actor.email || 'No email'}
                        </p>
                        <span
                          className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                          style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}
                        >
                          <Shield size={10} />
                          {activeLog.actor.role || activeLog.actorRole || 'Member'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>User ID</p>
                        <p className="font-mono text-xs truncate" style={{ color: 'var(--color-text)' }}>{activeLog.actor.id}</p>
                      </div>
                      <CopyButton text={activeLog.actor.id} label="User ID" onCopied={showToast} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border p-5 flex items-center gap-3" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                      <Shield size={18} />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>System action — no user associated.</p>
                  </div>
                )}
              </section>

              {/* ── Resource section ── */}
              <section>
                <SectionTitle icon={Server} title="Resource" />
                {activeLog.resourceId ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border p-3 transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Name</p>
                      <p className="text-sm font-medium break-words" style={{ color: 'var(--color-text)' }}>{activeLog.resource || '—'}</p>
                    </div>
                    <div className="rounded-xl border p-3 transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>Type</p>
                      <p className="text-sm font-medium break-words" style={{ color: 'var(--color-text)' }}>{humanizeCategory(activeLog.category) || '—'}</p>
                    </div>
                    <div className="rounded-xl border p-3 transition-all duration-200 hover:shadow-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>ID</p>
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-mono text-xs truncate" style={{ color: 'var(--color-text)' }}>{activeLog.resourceId}</p>
                        <CopyButton text={activeLog.resourceId} label="Resource ID" onCopied={showToast} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border p-4 text-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    No resource ID recorded for this event.
                  </div>
                )}
              </section>

              {/* ── JSON viewer ── */}
              <section>
                <SectionTitle icon={KeyRound} title="Raw Details" />
                {Object.keys(activeLog.details || {}).length === 0 ? (
                  <div className="rounded-xl border p-4 text-sm" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    No additional details were recorded for this event.
                  </div>
                ) : (
                  <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'rgba(124,58,237,0.05)', borderBottom: '1px solid var(--color-border)' }}>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                        <Code2 size={11} style={{ color: 'var(--color-accent)' }} />
                        application/json
                      </span>
                      <CopyButton text={JSON.stringify(activeLog.details, null, 2)} label="JSON" onCopied={showToast} />
                    </div>
                    <pre className="max-h-72 overflow-y-auto whitespace-pre text-xs leading-relaxed p-4 font-mono" style={{ color: 'var(--color-text)' }}>
                      {highlightJSON(activeLog.details)}
                    </pre>
                  </div>
                )}
              </section>

              {/* ── Record ID ── */}
              <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <Mail size={13} />
                  Record ID
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-xs truncate" style={{ color: 'var(--color-text)' }}>{activeLog.id}</span>
                  <CopyButton text={activeLog.id} label="Record ID" onCopied={showToast} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Export success toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-[toast-in_0.25s_ease-out]"
          style={{ backgroundColor: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.35)', backdropFilter: 'blur(8px)' }}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </SuperAdminLayout>
  )
}

// ── Enterprise Audit Inspector helpers ─────────────────────────────────────
const timeOnly = (iso: string): string => {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  } catch {
    return '—'
  }
}

const humanizeCategory = (category: string): string => {
  if (!category) return '—'
  return category.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function CopyButton({ text, label, onCopied }: { text: string; label: string; onCopied: (message: string) => void }) {
  const [copied, setCopied] = useState(false)
  const resetRef = useRef<number | null>(null)

  useEffect(() => () => { if (resetRef.current) window.clearTimeout(resetRef.current) }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopied(`${label} copied to clipboard`)
      if (resetRef.current) window.clearTimeout(resetRef.current)
      resetRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      onCopied('Could not copy to clipboard')
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 hover:scale-110 shrink-0"
      style={{
        color: copied ? '#16a34a' : 'var(--color-text-muted)',
        backgroundColor: copied ? 'rgba(22,163,74,0.08)' : 'transparent',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

function StatusCard({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div
      className="rounded-xl border p-3 transition-all duration-200 hover:shadow-sm"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
        <Icon size={12} style={{ color: 'var(--color-accent)' }} />
        {label}
      </p>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, action }: { icon: LucideIcon; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
          <Icon size={13} />
        </span>
        {title}
      </p>
      {action}
    </div>
  )
}

function TimelineRow({
  icon: Icon,
  label,
  color,
  value,
  action,
  isLast,
  children,
}: {
  icon: LucideIcon
  label: string
  color: string
  value?: ReactNode
  action?: ReactNode
  isLast?: boolean
  children?: ReactNode
}) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && <span className="absolute left-[10px] top-5 bottom-0 w-px" style={{ backgroundColor: 'var(--color-border)' }} />}
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 relative z-10"
        style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}33` }}
      >
        <Icon size={10} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[11px] font-medium uppercase tracking-wide mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium break-words min-w-0" style={{ color: 'var(--color-text)' }}>
            {value ?? children ?? '—'}
          </span>
          {action}
        </div>
      </div>
    </div>
  )
}

const highlightJSON = (value: Record<string, unknown>): ReactNode[] => {
  const raw = JSON.stringify(value, null, 2)
  const tokenRegex = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(raw))) {
    if (match.index > lastIndex) nodes.push(raw.slice(lastIndex, match.index))
    const [full, str, colon, literal] = match
    if (str !== undefined) {
      if (colon !== undefined) {
        nodes.push(<span key={key++} style={{ color: '#f59e0b' }}>{str}</span>)
        nodes.push(<span key={key++} style={{ color: 'var(--color-text-muted)' }}>:</span>)
      } else {
        nodes.push(<span key={key++} style={{ color: '#22c55e' }}>{str}</span>)
      }
    } else if (literal !== undefined) {
      nodes.push(<span key={key++} style={{ color: '#a78bfa' }}>{full}</span>)
    } else {
      nodes.push(<span key={key++} style={{ color: '#38bdf8' }}>{full}</span>)
    }
    lastIndex = match.index + full.length
  }
  if (lastIndex < raw.length) nodes.push(raw.slice(lastIndex))
  return nodes
}
