import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'
import {
  HardDrive,
  RefreshCw,
  Database,
  Clock,
  Download,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Shield,
  Calendar,
  Upload,
  Plus,
  History,
  Timer,
  Info,
  HardDriveDownload,
  CalendarClock,
  Gauge,
  FileArchive,
  FilterX,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import api from '../../config/api'

interface BackupActor {
  id: string
  fullName: string | null
  email: string | null
  role: string | null
}

interface BackupRecord {
  id: string
  filename: string
  originalName: string
  size: number
  type: string
  status: string
  checksum: string
  documentCount: number
  collectionCount: number
  restoreStatus: string | null
  notes: string
  error: string | null
  restoreError: string | null
  createdAt: string
  updatedAt: string
  createdBy: BackupActor | null
  restoredAt: string | null
  restoredBy: { id: string } | null
  deletedAt: string | null
}

interface BackupResponse {
  success: boolean
  page: number
  limit: number
  total: number
  pages: number
  data: BackupRecord[]
}

interface RestorePlan {
  backupId: string
  filename: string
  originalName: string
  createdAt: string
  documentCount: number
  collectionCount: number
  collections: string[]
  confirmationToken: string
  expiresIn: number
}

interface BackupSummary {
  totalBackups: number
  latestBackup: string | null
  latestBackupAt: string | null
  completedBackups: number
  totalStorageBytes: number
  restoreOperations: number
}

const DEFAULT_LIMIT = 20

// Safety cap for the creation-poll loop (~5 minutes at 2s intervals) so a
// backup that never appears in the list cannot trigger an infinite poll.
const MAX_POLL_ATTEMPTS = 150

// ── Status / type presentation metadata ─────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  completed: { label: 'Success', color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.22)' },
  running: { label: 'Running', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.22)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  failed: { label: 'Failed', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.22)' },
  deleted: { label: 'Deleted', color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' },
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  manual: { label: 'Manual', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.22)' },
  scheduled: { label: 'Auto', color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.25)' },
  safety: { label: 'Safety', color: '#d97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)' },
}

const STATUS_ORDER: Record<string, number> = { failed: 0, running: 1, pending: 2, completed: 3, deleted: 4 }

function toFriendlyError(err: unknown, fallback: string): Error {
  if (isAxiosError(err)) {
    const status = err.response?.status
    if (status === 403) return new Error('Access denied. Super Admin privileges required.')
    if (status === 401) return new Error('Session expired. Please log in again.')
    const message = err.response?.data?.message
    if (typeof message === 'string' && message) return new Error(message)
    if (status === 400) return new Error('Invalid request values')
    return new Error(fallback)
  }
  return err instanceof Error ? err : new Error(fallback)
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatTimeOnly(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.deleted
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      {status === 'running' && <Loader2 size={11} className="animate-spin" />}
      {status === 'completed' && <CheckCircle2 size={11} />}
      {status === 'failed' && <AlertTriangle size={11} />}
      {status === 'pending' && <Clock size={11} />}
      {meta.label}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type] || { label: type || 'Manual', color: '#2563eb', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.22)' }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
    >
      {meta.label}
    </span>
  )
}

function BackupProgress({ status }: { status: string }) {
  if (status !== 'running' && status !== 'pending') return null
  const running = status === 'running'
  return (
    <div className="mt-2 w-full max-w-[260px]">
      <div className="flex items-center gap-2 mb-1.5">
        {running ? (
          <Loader2 size={12} className="animate-spin" style={{ color: '#3b82f6' }} />
        ) : (
          <Clock size={12} style={{ color: '#f59e0b' }} />
        )}
        <span className="text-[11px] font-medium" style={{ color: running ? '#3b82f6' : '#f59e0b' }}>
          {running ? 'Preparing backup archive…' : 'Queued — waiting to start'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: running ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)' }}>
        <div
          className="h-full rounded-full indeterminate-bar"
          style={{ background: running ? 'linear-gradient(90deg,#3b82f6,#60a5fa)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
        />
      </div>
    </div>
  )
}

function ActorLabel({ creator }: { creator: BackupActor | null }) {
  if (!creator) return <span style={{ color: 'var(--color-text-muted)' }}>System</span>
  const name = creator.fullName || creator.email || 'Admin'
  return (
    <span title={creator.email || ''}>
      <span className="font-medium" style={{ color: 'var(--color-text)' }}>{creator.fullName || name}</span>
      {creator.email && creator.fullName && (
        <span style={{ color: 'var(--color-text-muted)' }}> · {creator.email}</span>
      )}
    </span>
  )
}

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SuperAdminBackupRestorePage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState<BackupRecord | null>(null)
  const [restorePlan, setRestorePlan] = useState<RestorePlan | null>(null)
  const [restorePlanLoading, setRestorePlanLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackupRecord | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Tracks the backup that is currently being created in the background so the
  // polling loop can stop once it reaches a terminal state.
  const createdBackupIdRef = useRef<string | null>(null)
  const pollAttemptsRef = useRef(0)
  const pollTimerRef = useRef<number | null>(null)

  const debouncedSearch = useDebouncedValue(search, 400)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const summaryQuery = useQuery<BackupSummary, AxiosError>({
    queryKey: ['backup-summary'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: BackupSummary }>('/backup/summary')
      return data.data
    },
  })

  // Reuses the exact existing list endpoint with the failed status filter to
  // surface a "Failed Backups" KPI without inventing new backend logic.
  const failedQuery = useQuery<number, AxiosError>({
    queryKey: ['backup-summary', 'failed'],
    queryFn: async () => {
      const { data } = await api.get<BackupResponse>('/backup', { params: { status: 'failed', limit: 1, page: 1 } })
      return data.total
    },
  })

  const listQuery = useQuery({
    queryKey: ['backups', { page, limit, search: debouncedSearch, status, type, startDate, endDate }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      }
      const { data } = await api.get<BackupResponse>('/backup', { params })
      return data
    },
    placeholderData: keepPreviousData,
  })

  // While a backup is being created in the background, poll the list so the
  // new row flips from pending → running → completed/failed. Polling stops as
  // soon as the created backup reaches a terminal state (or the attempt cap).
  useEffect(() => {
    if (!creating) return
    pollAttemptsRef.current = 0
    let cancelled = false

    const poll = async () => {
      pollAttemptsRef.current += 1
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        setCreating(false)
        return
      }
      try {
        const result = await listQuery.refetch()
        if (cancelled) return
        const createdId = createdBackupIdRef.current
        const record = result.data?.data?.find((b) => b.id === createdId)
        if (createdId && record && (record.status === 'completed' || record.status === 'failed' || record.status === 'deleted')) {
          createdBackupIdRef.current = null
          setCreating(false)
          return
        }
      } catch {
        if (cancelled) return
      }
      pollTimerRef.current = window.setTimeout(() => {
        void poll()
      }, 2000)
    }

    pollTimerRef.current = window.setTimeout(() => {
      void poll()
    }, 2000)
    return () => {
      cancelled = true
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating])

  const createMutation = useMutation({
    mutationFn: async (notes: string) => {
      const { data } = await api.post<{ success: boolean; message: string; data: BackupRecord }>('/backup', { notes })
      return data
    },
    onSuccess: (result) => {
      createdBackupIdRef.current = result?.data?.id ?? null
      setCreating(true)
      void summaryQuery.refetch()
      showToast('Backup started. It will appear in the history below when ready.', 'success')
    },
    onError: (err: unknown) => {
      createdBackupIdRef.current = null
      showToast(toFriendlyError(err, 'Failed to start backup').message, 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/backup/${id}`),
    onSuccess: () => {
      void listQuery.refetch()
      void summaryQuery.refetch()
      void failedQuery.refetch()
      showToast('Backup deleted', 'success')
      setDeleteTarget(null)
    },
    onError: (err: unknown) => showToast(toFriendlyError(err, 'Failed to delete backup').message, 'error'),
  })

  const restoreMutation = useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      api.post<{ success: boolean; message: string; data: unknown }>(`/backup/${id}/restore`, { confirmationToken: token }),
    onSuccess: () => {
      void listQuery.refetch()
      void summaryQuery.refetch()
      void failedQuery.refetch()
      showToast('Restore completed successfully', 'success')
    },
    onError: (err: unknown) => showToast(toFriendlyError(err, 'Restore failed').message, 'error'),
  })

  const createBackup = () => {
    const notes = `Manual backup created from admin panel`
    createMutation.mutate(notes)
  }

  const openRestore = async (record: BackupRecord) => {
    setRestoreOpen(record)
    setRestorePlan(null)
    setRestorePlanLoading(true)
    try {
      const { data } = await api.get<{ success: boolean; data: RestorePlan }>(`/backup/${record.id}/restore-plan`)
      setRestorePlan(data.data)
    } catch (err) {
      showToast(toFriendlyError(err, 'Could not load restore plan').message, 'error')
    } finally {
      setRestorePlanLoading(false)
    }
  }

  const confirmRestore = () => {
    if (!restoreOpen || !restorePlan) return
    setConfirming(true)
    restoreMutation.mutate(
      { id: restoreOpen.id, token: restorePlan.confirmationToken },
      {
        onSettled: () => {
          setConfirming(false)
          setRestoreOpen(null)
          setRestorePlan(null)
        },
      }
    )
  }

  const downloadBackup = async (record: BackupRecord) => {
    try {
      const { data } = await api.get(`/backup/${record.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = record.originalName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      showToast(toFriendlyError(err, 'Download failed').message, 'error')
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value)
    setPage(1)
  }
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value)
    setPage(1)
  }
  const handleStartDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
    setPage(1)
  }
  const handleEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
    setPage(1)
  }
  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setType('')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const hasFilters = Boolean(search || status || type || startDate || endDate)
  const records = listQuery.data?.data ?? []
  const total = listQuery.data?.total ?? 0
  const pages = listQuery.data?.pages ?? 1
  const startIdx = (page - 1) * limit
  const endIdx = Math.min(page * limit, total)

  const summary = summaryQuery.data

  const kpiCards = [
    { label: 'Total Backups', value: summary?.totalBackups ?? 0, icon: Database, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    { label: 'Successful Backups', value: summary?.completedBackups ?? 0, icon: CheckCircle2, gradient: 'linear-gradient(135deg, #16a34a, #4ade80)' },
    { label: 'Failed Backups', value: failedQuery.data ?? 0, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #f87171)' },
    { label: 'Storage Used', value: formatBytes(summary?.totalStorageBytes ?? 0), icon: Gauge, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
  ]

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {toast && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-[toast-in_0.25s_ease-out]"
            style={{
              backgroundColor: toast.type === 'success' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(22,163,74,0.35)' : 'rgba(220,38,38,0.35)'}`,
              backdropFilter: 'blur(8px)',
            }}
            role="status"
            aria-live="polite"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
            ) : (
              <AlertTriangle size={18} style={{ color: '#dc2626' }} />
            )}
            <span className="text-sm font-semibold" style={{ color: toast.type === 'success' ? '#16a34a' : '#dc2626' }}>
              {toast.message}
            </span>
          </div>
        )}

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
                <HardDrive size={26} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Backup &amp; Restore
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Create, download, and restore complete system data backups.
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Calendar size={14} />
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={createBackup}
                disabled={creating || createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 12px rgba(124,58,237,0.30)' }}
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creating ? 'Creating…' : 'Create Backup'}
              </button>
              <button
                onClick={() => {
                  void summaryQuery.refetch()
                  void failedQuery.refetch()
                  void listQuery.refetch()
                }}
                className="btn btn-sm btn-ghost btn-square transition-transform duration-200 hover:scale-110"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Overview KPI cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 p-5 flex items-center gap-4"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: card.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
              >
                <card.icon size={22} color="#fff" />
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
                {summaryQuery.isLoading || failedQuery.isLoading ? (
                  <div className="h-7 w-16 rounded bg-current opacity-20 animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {card.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Schedule & Retention ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Schedule backup */}
          <div className="rounded-2xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                  <CalendarClock size={13} />
                </span>
                Schedule Backup
              </p>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: 'rgba(245,158,11,0.10)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}
              >
                <Info size={11} />
                Read-only
              </span>
            </div>
            <div className="flex items-start gap-3 rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                <Timer size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Not configurable in current backend</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  The current API exposes no scheduling endpoint. Automated schedules would require backend support; no
                  fake controls are shown here.
                </p>
              </div>
            </div>
          </div>

          {/* Retention policy */}
          <div className="rounded-2xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(22,163,74,0.10)', color: '#16a34a' }}>
                  <HardDriveDownload size={13} />
                </span>
                Retention Policy
              </p>
              {summary && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                  <History size={12} />
                  {summary.restoreOperations ?? 0} restore ops
                </span>
              )}
            </div>
            <div className="flex items-start gap-3 rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(22,163,74,0.10)', color: '#16a34a' }}>
                <FileArchive size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Not available from current backend.</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  The API does not expose retention days or an auto-delete policy. Backups are retained indefinitely until
                  manually deleted.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search & filters ── */}
        <div
          className="rounded-2xl border shadow-sm p-5"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center flex-wrap gap-3">
            <label className="relative block flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name…"
                aria-label="Search backups"
                style={{ ...inputStyle, paddingLeft: '36px' }}
              />
            </label>
            <select value={status} onChange={handleStatusChange} style={{ ...inputStyle, width: '160px' }} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="completed">Success</option>
              <option value="running">Running</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select value={type} onChange={handleTypeChange} style={{ ...inputStyle, width: '140px' }} aria-label="Filter by type">
              <option value="">All types</option>
              <option value="manual">Manual</option>
              <option value="scheduled">Auto</option>
              <option value="safety">Safety</option>
            </select>
            <label className="relative block">
              <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input type="date" value={startDate} onChange={handleStartDate} aria-label="Start date" style={{ ...inputStyle, paddingLeft: '32px', width: '150px' }} />
            </label>
            <label className="relative block">
              <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input type="date" value={endDate} onChange={handleEndDate} aria-label="End date" style={{ ...inputStyle, paddingLeft: '32px', width: '150px' }} />
            </label>
            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-sm btn-ghost gap-1" style={{ color: 'var(--color-text-muted)' }}>
                <FilterX size={14} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Backup history ── */}
        <div
          className="rounded-2xl border shadow-sm p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock size={18} style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)', margin: 0 }}>
                Backup History
              </h2>
              {!listQuery.isLoading && listQuery.data && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                  {total} total
                </span>
              )}
            </div>
            {listQuery.isFetching && !listQuery.isLoading && (
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                <RefreshCw size={12} className="animate-spin" />
                Refreshing…
              </span>
            )}
          </div>

          {listQuery.isError && !listQuery.isLoading && (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)' }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
                <AlertTriangle size={16} />
                {listQuery.error instanceof Error ? listQuery.error.message : 'Failed to load backups'}
              </span>
              <button onClick={() => void listQuery.refetch()} className="btn btn-xs btn-ghost" style={{ color: 'var(--color-error)' }}>
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}
              >
                <FileArchive size={30} color="#fff" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {hasFilters ? 'No backups match your filters' : 'No backups yet'}
              </p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                {hasFilters
                  ? 'Try adjusting or clearing the filters to see more results.'
                  : 'Create your first backup to start protecting your platform data.'}
              </p>
              {hasFilters ? (
                <button onClick={clearFilters} className="btn btn-sm btn-outline gap-1" style={{ color: 'var(--color-accent)' }}>
                  <FilterX size={14} />
                  Clear filters
                </button>
              ) : (
                <button onClick={createBackup} className="btn btn-sm gap-1 text-white" style={{ background: 'var(--color-accent)' }}>
                  <Plus size={14} />
                  Create backup
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden lg:block rounded-xl border overflow-y-auto max-h-[560px]" style={{ borderColor: 'var(--color-border)' }}>
                <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
                  <thead>
                    <tr
                      style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        backgroundColor: 'var(--color-surface)',
                        boxShadow: '0 1px 0 var(--color-border)',
                      }}
                    >
                      <th style={thStyle}>Backup Name</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Size</th>
                      <th style={thStyle}>Created</th>
                      <th style={thStyle}>Status</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((backup) => {
                      const isCompleted = backup.status === 'completed'
                      const actionColor = isCompleted ? 'var(--color-text-muted)' : 'var(--color-border)'
                      return (
                        <tr key={backup.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={tdStyle}>
                            <div className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                                  <FileText size={14} />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium truncate" style={{ color: 'var(--color-text)' }} title={backup.originalName}>
                                    {backup.originalName}
                                  </p>
                                  <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                                    <ActorLabel creator={backup.createdBy} />
                                  </p>
                                </div>
                              </span>
                            </div>
                          </td>
                          <td style={tdStyle}><TypeBadge type={backup.type} /></td>
                          <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{formatBytes(backup.size)}</td>
                          <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{formatTime(backup.createdAt)}</td>
                          <td style={tdStyle}>
                            <StatusBadge status={backup.status} />
                            <BackupProgress status={backup.status} />
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                aria-label={`Download ${backup.originalName}`}
                                onClick={() => void downloadBackup(backup)}
                                disabled={!isCompleted}
                                className="btn btn-xs btn-ghost btn-square transition-transform duration-200 hover:scale-110"
                                style={{ color: actionColor }}
                              >
                                <Download size={14} />
                              </button>
                              <button
                                aria-label={`Restore ${backup.originalName}`}
                                onClick={() => openRestore(backup)}
                                disabled={!isCompleted}
                                className="btn btn-xs btn-ghost btn-square transition-transform duration-200 hover:scale-110"
                                style={{ color: actionColor }}
                              >
                                <Upload size={14} />
                              </button>
                              <button
                                aria-label={`Delete ${backup.originalName}`}
                                onClick={() => setDeleteTarget(backup)}
                                disabled={!isCompleted}
                                className="btn btn-xs btn-ghost btn-square transition-transform duration-200 hover:scale-110"
                                style={{ color: actionColor }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden space-y-3">
                {records.map((backup) => {
                  const isCompleted = backup.status === 'completed'
                  const actionColor = isCompleted ? 'var(--color-text-muted)' : 'var(--color-border)'
                  return (
                    <div
                      key={backup.id}
                      className="rounded-2xl border p-4 transition-all duration-200 hover:shadow-sm"
                      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                            <FileText size={14} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{backup.originalName}</p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                              <ActorLabel creator={backup.createdBy} />
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={backup.status} />
                      </div>
                      <BackupProgress status={backup.status} />
                      <div className="flex items-center justify-between gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          <span className="flex items-center gap-1"><TypeBadge type={backup.type} /></span>
                          <span className="flex items-center gap-1 tabular-nums">{formatBytes(backup.size)}</span>
                          <span className="flex items-center gap-1">{formatTimeOnly(backup.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button aria-label={`Download ${backup.originalName}`} onClick={() => void downloadBackup(backup)} disabled={!isCompleted} className="btn btn-xs btn-ghost btn-square" style={{ color: actionColor }}>
                            <Download size={14} />
                          </button>
                          <button aria-label={`Restore ${backup.originalName}`} onClick={() => openRestore(backup)} disabled={!isCompleted} className="btn btn-xs btn-ghost btn-square" style={{ color: actionColor }}>
                            <Upload size={14} />
                          </button>
                          <button aria-label={`Delete ${backup.originalName}`} onClick={() => setDeleteTarget(backup)} disabled={!isCompleted} className="btn btn-xs btn-ghost btn-square" style={{ color: actionColor }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between gap-3 flex-wrap pt-4">
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Showing {endIdx === 0 ? 0 : startIdx + 1}–{endIdx} of {total} backups
                </p>
                <div className="flex items-center gap-3">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value))
                      setPage(1)
                    }}
                    style={{ ...inputStyle, width: 'auto' }}
                    aria-label="Page size"
                  >
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="btn btn-sm btn-ghost btn-square"
                      style={{ color: page <= 1 ? 'var(--color-border)' : 'var(--color-text)' }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs px-2" style={{ color: 'var(--color-text-muted)' }}>
                      Page {page} of {pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page >= pages}
                      aria-label="Next page"
                      className="btn btn-sm btn-ghost btn-square"
                      style={{ color: page >= pages ? 'var(--color-border)' : 'var(--color-text)' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Restore confirmation modal ── */}
        {restoreOpen && (
          <RestoreModal
            backup={restoreOpen}
            plan={restorePlan}
            planLoading={restorePlanLoading}
            confirming={confirming}
            onClose={() => {
              setRestoreOpen(null)
              setRestorePlan(null)
            }}
            onConfirm={confirmRestore}
          />
        )}

        {/* ── Delete confirmation modal ── */}
        {deleteTarget && (
          <DeleteModal
            backup={deleteTarget}
            loading={deleteMutation.isPending}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              void deleteMutation.mutateAsync(deleteTarget.id)
            }}
          />
        )}

        <style>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translate(-50%, 8px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          @keyframes indeterminate-slide {
            0% { transform: translateX(-100%); width: 40%; }
            100% { transform: translateX(300%); width: 40%; }
          }
          .indeterminate-bar {
            animation: indeterminate-slide 1.4s ease-in-out infinite;
          }
          .history-table tbody tr:nth-child(even) { background: rgba(124,58,237,0.03); }
          .history-table tbody tr { transition: background 0.15s ease; }
          .history-table tbody tr:hover { background: rgba(124,58,237,0.07) !important; }
          @media (max-width: 1024px) { .history-table { font-size: 13px; } }
        `}</style>
      </div>
    </SuperAdminLayout>
  )
}

function RestoreModal({
  backup,
  plan,
  planLoading,
  confirming,
  onClose,
  onConfirm,
}: {
  backup: BackupRecord
  plan: RestorePlan | null
  planLoading: boolean
  confirming: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  const canConfirm = !planLoading && !!plan && !confirming
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
              <RotateCcw size={17} />
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Restore Backup</h3>
          </div>
          <button onClick={onClose} aria-label="Close" className="btn btn-sm btn-ghost btn-square" style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoBox label="Backup Name" value={backup.originalName} />
            <InfoBox label="Backup Date" value={formatTime(backup.createdAt)} />
            <InfoBox label="Backup Size" value={formatBytes(backup.size)} />
          </div>

          <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#d97706' }}>Destructive operation</p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                This operation replaces the current live database with the contents of this backup. Data created after this
                backup was taken will be lost. A safety snapshot is taken before the restore so you can recover.
              </p>
            </div>
          </div>

          {planLoading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Loader2 size={16} className="animate-spin" />
              Validating archive and preparing restore plan…
            </div>
          )}

          {plan && (
            <div className="rounded-xl p-4" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>Restore plan</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Collections</p>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{plan.collectionCount}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Documents</p>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{plan.documentCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Created</p>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatTime(plan.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Collections</p>
                  <p className="text-[11px] break-words" style={{ color: 'var(--color-text)' }}>{plan.collections.join(', ') || '—'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Shield size={13} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
            <span>
              This action is irreversible from the UI. Confirm only if you understand it will replace all current data with
              the backup's contents.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={onClose} disabled={confirming} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="btn btn-sm btn-primary"
            style={{
              backgroundColor: !canConfirm ? 'var(--color-border)' : '#dc2626',
              color: '#fff',
              cursor: !canConfirm ? 'default' : 'pointer',
            }}
          >
            {confirming ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
            {confirming ? 'Restoring…' : 'Restore Backup'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({
  backup,
  loading,
  onClose,
  onConfirm,
}: {
  backup: BackupRecord
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
            <Trash2 size={17} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Delete Backup</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>This action cannot be undone</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            Delete <span className="font-semibold">{backup.originalName}</span>? This removes the archive from disk and hides
            it from the history.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <InfoBox label="Created" value={formatTime(backup.createdAt)} />
            <InfoBox label="Size" value={formatBytes(backup.size)} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={onClose} disabled={loading} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-text-muted)' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-sm btn-primary"
            style={{ backgroundColor: loading ? 'var(--color-border)' : 'var(--color-error)', color: '#fff' }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-sm font-semibold break-words" style={{ color: 'var(--color-text)' }}>{value}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '14px',
  color: 'var(--color-text)',
  verticalAlign: 'top',
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
