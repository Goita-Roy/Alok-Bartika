import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  HardDrive,
  RefreshCw,
  Database,
  Clock,
  Download,
  Trash2,
  RotateCcw,
  CheckCircle,
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
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import api from '../../config/api'

import type { AxiosError } from 'axios'

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
const MAX_LIMIT = 100

const STATUS_COLOR: Record<string, string> = {
  completed: '#16a34a',
  running: '#3b82f6',
  pending: '#f59e0b',
  failed: '#dc2626',
  deleted: '#6b7280',
}

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

function parsePositiveInt(raw: unknown, fallback: number, max: number): number | null {
  if (raw === undefined || raw === null || raw === '') return fallback
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1) return null
  return Math.min(n, max)
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

function humanSize(bytes: number): string {
  return formatBytes(bytes)
}

function ActorCell({ creator }: { creator: BackupActor | null }) {
  if (!creator) return <span style={{ color: 'var(--color-text-muted)' }}>System</span>
  const name = creator.fullName || creator.email || 'Admin'
  return (
    <span title={creator.email || ''}>
      {creator.fullName ? `${creator.fullName}` : name}
      {creator.email && creator.fullName && (
        <span style={{ color: 'var(--color-text-muted)' }}> 〈{creator.email}〉</span>
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

export function SuperAdminBackupPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_LIMIT)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState<BackupRecord | null>(null)
  const [restorePlan, setRestorePlan] = useState<RestorePlan | null>(null)
  const [restorePlanLoading, setRestorePlanLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackupRecord | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

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

  const listQuery = useQuery({
    queryKey: ['backups', { page, limit, search: debouncedSearch, status, startDate, endDate }],
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(status ? { status } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      }
      const { data } = await api.get<BackupResponse>('/backup', { params })
      return data
    },
    placeholderData: keepPreviousData,
  })

  // While a backup is being created in the background, poll the list so the new
  // row flips from pending → running → completed/failed.
  useEffect(() => {
    if (!creating) return
    const timer = setTimeout(() => {
      void listQuery.refetch()
    }, 2000)
    return () => clearTimeout(timer)
  }, [creating, listQuery])

  const createMutation = useMutation({
    mutationFn: async (notes: string) => {
      const { data } = await api.post<{ success: boolean; message: string; data: BackupRecord }>('/backup', { notes })
      return data
    },
    onSuccess: () => {
      setCreating(true)
      void summaryQuery.refetch()
      showToast('Backup started. It will appear in the history below when ready.', 'success')
    },
    onError: (err: unknown) => {
      showToast(toFriendlyError(err, 'Failed to start backup').message, 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/backup/${id}`),
    onSuccess: () => {
      void listQuery.refetch()
      void summaryQuery.refetch()
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
      const { data, headers } = await api.get(`/backup/${record.id}/download`, { responseType: 'blob' })
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
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const hasFilters = Boolean(search || status || startDate || endDate)
  const records = listQuery.data?.data ?? []
  const total = listQuery.data?.total ?? 0
  const pages = listQuery.data?.pages ?? 1
  const startIdx = (page - 1) * limit
  const endIdx = Math.min(page * limit, total)

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              left: '24px',
              right: '24px',
              zIndex: 50,
              maxWidth: 'calc(100vw - 48px)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '8px',
              backgroundColor: toast.type === 'success' ? 'var(--color-accent-pale)' : 'var(--color-error)',
              color: 'var(--color-text)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} color="var(--color-accent)" /> : <AlertTriangle size={18} color="var(--color-error)" />}
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={24} color="var(--color-accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Backup & Restore</h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                Create, schedule, and restore system data backups
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={createBackup}
              disabled={creating || createMutation.isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
              }}
            >
              {creating ? <Loader2 size={16} className="spin" /> : <Database size={16} />}
              {creating ? 'Creating...' : 'Create Backup'}
            </button>
            <button
              onClick={() => void summaryQuery.refetch()}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-text-muted)' }}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            icon={<Database size={22} style={{ color: '#3b82f6' }} />}
            label="Total Backups"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summaryQuery.data?.totalBackups ?? '—')}
            iconBg="rgba(59,130,246,0.10)"
          />
          <DashboardCard
            icon={<Clock size={22} style={{ color: '#0ea5e9' }} />}
            label="Latest Backup"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summaryQuery.data?.latestBackupAt ? formatTime(summaryQuery.data.latestBackupAt) : '—')}
            iconBg="rgba(14,165,233,0.10)"
          />
          <DashboardCard
            icon={<HardDrive size={22} style={{ color: '#16a34a' }} />}
            label="Total Storage"
            value={summaryQuery.isLoading ? <CardSkeleton /> : humanSize(summaryQuery.data?.totalStorageBytes ?? 0)}
            iconBg="rgba(22,163,74,0.10)"
          />
          <DashboardCard
            icon={<RotateCcw size={22} style={{ color: '#7c3aed' }} />}
            label="Restore Operations"
            value={summaryQuery.isLoading ? <CardSkeleton /> : (summaryQuery.data?.restoreOperations ?? '—')}
            iconBg="rgba(124,58,237,0.10)"
          />
        </div>

        {/* Filters */}
        <div
          className="card shadow-sm"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="card-body p-5">
            <div className="flex items-center gap-10px flex-wrap gap-3">
              <label className="relative block flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search by name…"
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </label>
              <select value={status} onChange={handleStatusChange} style={{ ...inputStyle, width: '160px' }}>
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <label className="relative block">
                <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="date" value={startDate} onChange={handleStartDate} style={{ ...inputStyle, paddingLeft: '32px', width: '150px' }} />
              </label>
              <label className="relative block">
                <Calendar size={14} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
                <input type="date" value={endDate} onChange={handleEndDate} style={{ ...inputStyle, paddingLeft: '32px', width: '150px' }} />
              </label>
              {hasFilters && (
                <button onClick={clearFilters} className="btn btn-sm btn-ghost gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Backup history */}
        <div
          className="card shadow-sm"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="card-body p-6">
            <div className="flex items-center gap-10px mb-5">
              <Clock size={18} color="var(--color-accent)" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)', margin: 0 }}>
                Backup History
              </h2>
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
                </button>
              </div>
            )}

            {listQuery.isLoading && !listQuery.isFetching ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
                ))}
              </div>
            ) : !records || records.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
                  <Shield size={26} color="var(--color-accent)" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No backups found</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {hasFilters ? 'Try adjusting or clearing the filters.' : 'Create your first backup to get started.'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn btn-sm btn-outline gap-1" style={{ color: 'var(--color-accent)' }}>
                    <X size={14} />
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                        <th style={thStyle}>Backup Name</th>
                        <th style={thStyle}>Created By</th>
                        <th style={thStyle}>Created</th>
                        <th style={thStyle}>Size</th>
                        <th style={thStyle}>Docs</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((backup) => {
                        const color = STATUS_COLOR[backup.status] || 'var(--color-text-muted)'
                        const isCompleted = backup.status === 'completed'
                        return (
                          <tr key={backup.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={tdStyle}>
                              <span className="flex items-center gap-2">
                                <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                                <span className="font-medium" style={{ color: 'var(--color-text)' }} title={backup.originalName}>
                                  {backup.originalName}
                                </span>
                              </span>
                            </td>
                            <td style={tdStyle}><ActorCell creator={backup.createdBy} /></td>
                            <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{formatTime(backup.createdAt)}</td>
                            <td style={tdStyle}>{humanSize(backup.size)}</td>
                            <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{backup.documentCount || '—'}</td>
                            <td style={tdStyle}>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: 'rgba(0,0,0,0.04)', color }}
                              >
                                {backup.status === 'completed' && <CheckCircle size={12} />}
                                {backup.status === 'failed' && <AlertTriangle size={12} />}
                                {backup.status === 'running' && <Loader2 size={12} className="spin" />}
                                {backup.status}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  title="Download"
                                  onClick={() => void downloadBackup(backup)}
                                  disabled={!isCompleted}
                                  className="btn btn-xs btn-ghost btn-square"
                                  style={{ color: isCompleted ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                                >
                                  <Download size={14} />
                                </button>
                                <button
                                  title="Restore"
                                  onClick={() => openRestore(backup)}
                                  disabled={!isCompleted}
                                  className="btn btn-xs btn-ghost btn-square"
                                  style={{ color: isCompleted ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                                >
                                  <Upload size={14} />
                                </button>
                                <button
                                  title="Delete"
                                  onClick={() => setDeleteTarget(backup)}
                                  disabled={!isCompleted}
                                  className="btn btn-xs btn-ghost btn-square"
                                  style={{ color: isCompleted ? 'var(--color-error)' : 'var(--color-text-muted)' }}
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

                <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
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
        </div>

        {/* Restore confirmation modal */}
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

        {/* Delete confirmation modal */}
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
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
          @media (max-width: 640px) {
            table { font-size: 13px; }
          }
        `}</style>
      </div>
    </SuperAdminLayout>
  )
}

function DashboardCard({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="card-body p-5 flex flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--color-text)', minWidth: '60px' }}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function CardSkeleton() {
  return <div className="h-6 w-14 rounded bg-current opacity-20 animate-pulse" />
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
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Restore Backup</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost btn-square" style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              You are about to restore <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{backup.originalName}</span>.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              This operation replaces the current live database with the contents of this backup. Data created after this
              backup was taken will be lost. A safety snapshot is taken before the restore so you can recover.
            </p>
          </div>

          {planLoading && (
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Loader2 size={16} className="spin" />
              Validating archive and preparing restore plan…
            </div>
          )}

          {plan && (
            <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Collections</span>
                <span style={{ color: 'var(--color-text)' }}>{plan.collectionCount}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Documents</span>
                <span style={{ color: 'var(--color-text)' }}>{plan.documentCount.toLocaleString()}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Created</span>
                <span style={{ color: 'var(--color-text)' }}>{formatTime(plan.createdAt)}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>Collections</span>
                <span style={{ color: 'var(--color-text)', fontSize: '11px' }}>{plan.collections.join(', ') || '—'}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Shield size={13} style={{ color: '#f59e0b', marginTop: '2px' }} />
            <span>
              This action is irreversible from the UI. Confirm only if you understand it will replace all current data
              with the backup's contents.
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
            {confirming ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
            {confirming ? 'Restoring…' : 'Restore (destructive)'}
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
          <Trash2 size={18} color="var(--color-error)" />
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Delete Backup</h3>
        </div>
        <div className="p-6">
          <p className="text-sm" style={{ color: 'var(--color-text)' }}>
            Delete <span className="font-semibold">{backup.originalName}</span>? This removes the archive from disk and hides it
            from the history. This action cannot be undone.
          </p>
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
            {loading ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
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
}

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '14px',
  color: 'var(--color-text)',
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
