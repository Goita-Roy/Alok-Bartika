import { useState, useEffect } from 'react'
import {
  HeartPulse,
  RefreshCw,
  Server,
  Cpu,
  Gauge,
  Activity,
  Wifi,
  Database,
  Network,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Clock,
  HardDrive,
  Zap,
  History,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { API_BASE_URL } from '../../config/api'

interface HealthCheckResult {
  timestamp: number
  ok: boolean
  statusText: string
  responseTime: number | null
}

type HealthLevel = 'ok' | 'degraded' | 'down' | 'unavailable' | 'unknown'

const AUTO_REFRESH_MS = 30000

function HealthBadge({ level, label }: { level: HealthLevel; label: string }) {
  const meta: Record<HealthLevel, { color: string; bg: string; border: string }> = {
    ok: { color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.22)' },
    degraded: { color: '#d97706', bg: 'rgba(217,119,6,0.10)', border: 'rgba(217,119,6,0.25)' },
    down: { color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.22)' },
    unavailable: { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' },
    unknown: { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.25)' },
  }
  const m = meta[level]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
    >
      {level === 'ok' && <CheckCircle2 size={11} />}
      {level === 'degraded' && <AlertTriangle size={11} />}
      {level === 'down' && <AlertTriangle size={11} />}
      {label}
    </span>
  )
}

function Unavailable() {
  return (
    <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
      Not available from current backend.
    </p>
  )
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

function HealthTimelineChart({ checks }: { checks: HealthCheckResult[] }) {
  if (checks.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
          <Activity size={22} />
        </div>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Collecting health samples…</p>
        <p className="text-xs max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
          The timeline fills in as automatic health checks complete.
        </p>
      </div>
    )
  }

  const W = 720
  const H = 180
  const pad = 10
  const maxT = Math.max(...checks.map((c) => c.responseTime ?? 0), 50)
  const stepX = checks.length > 1 ? (W - pad * 2) / (checks.length - 1) : 0
  const points = checks.map((c, i) => ({
    x: pad + i * stepX,
    y: H - pad - ((c.responseTime ?? 0) / maxT) * (H - pad * 2),
    ok: c.ok,
    rt: c.responseTime,
    time: c.timestamp,
  }))
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  const first = points[0]

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Health timeline chart">
        <defs>
          <linearGradient id="healthArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={`${linePath} L${last.x.toFixed(1)},${H - pad} L${pad},${H - pad} Z`} fill="url(#healthArea)" />
        <path d={linePath} fill="none" stroke="#7c3aed" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={p.ok ? '#16a34a' : '#dc2626'}
            stroke="var(--color-surface)"
            strokeWidth={1.5}
          >
            <title>{`${formatClock(p.time)} — ${p.ok ? 'ok' : 'failed'} · ${p.rt != null ? p.rt + ' ms' : 'n/a'}`}</title>
          </circle>
        ))}
        <circle cx={last.x} cy={last.y} r={5} fill={last.ok ? '#16a34a' : '#dc2626'} stroke="var(--color-surface)" strokeWidth={2}>
          <title>Latest check</title>
        </circle>
      </svg>
      <div className="flex items-center justify-between gap-3 mt-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        <span>{formatClock(first.time)}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#16a34a' }} /> OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#dc2626' }} /> Failed
          </span>
          <span className="hidden sm:inline">{maxT} ms max</span>
        </span>
        <span>{formatClock(last.time)}</span>
      </div>
    </div>
  )
}

export function SuperAdminSystemHealthPage() {
  const [checks, setChecks] = useState<HealthCheckResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const runCheck = async (): Promise<HealthCheckResult> => {
    const start = performance.now()
    let responseTime: number | null = null
    let ok = false
    let statusText = 'down'
    try {
      const res = await fetch(`${API_BASE_URL}/health`)
      responseTime = Math.round(performance.now() - start)
      ok = res.ok
      statusText = ok ? 'ok' : `http ${res.status}`
      if (res.ok) {
        try {
          const json = await res.json()
          if (json && typeof json.status === 'string' && json.status) statusText = json.status
        } catch {
          /* body is not JSON — keep the generic status */
        }
      }
    } catch {
      responseTime = Math.round(performance.now() - start)
      ok = false
      statusText = 'unreachable'
    }
    return { timestamp: Date.now(), ok, statusText, responseTime }
  }

  const doRefresh = async () => {
    setRefreshing(true)
    try {
      const result = await runCheck()
      setChecks((prev) => [...prev.slice(-59), result])
      if (result.ok) {
        setError(null)
      } else {
        setError(`Health endpoint did not respond successfully (${result.statusText}). The dashboard will keep retrying.`)
      }
    } finally {
      setLastRefreshed(new Date())
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    void doRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = window.setInterval(() => {
      void doRefresh()
    }, AUTO_REFRESH_MS)
    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh])

  const lastCheck = checks.length ? checks[checks.length - 1] : null
  const overallStatus: HealthLevel = !lastCheck
    ? 'unknown'
    : !lastCheck.ok
      ? 'down'
      : lastCheck.responseTime != null && lastCheck.responseTime > 1500
        ? 'degraded'
        : 'ok'

  const okCount = checks.filter((c) => c.ok).length
  const availability = checks.length ? Math.round((okCount / checks.length) * 100) : 0
  const avgRt = checks.length ? Math.round(checks.reduce((s, c) => s + (c.responseTime ?? 0), 0) / checks.length) : null
  const monitorStart = checks.length ? checks[0].timestamp : null

  const kpiRowOne = [
    {
      label: 'Server Status',
      icon: Server,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      content: lastCheck ? (
        <HealthBadge level={overallStatus === 'degraded' ? 'degraded' : overallStatus === 'ok' ? 'ok' : 'down'} label={overallStatus === 'ok' ? 'Operational' : overallStatus === 'degraded' ? 'Degraded' : 'Offline'} />
      ) : null,
    },
    {
      label: 'API Status',
      icon: Wifi,
      gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      content: lastCheck ? (
        <HealthBadge level={lastCheck.ok ? 'ok' : 'down'} label={lastCheck.ok ? `Online · ${lastCheck.statusText}` : 'Offline'} />
      ) : null,
    },
    {
      label: 'Response Time',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      content: lastCheck ? (
        <div>
          <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: 'var(--color-text)' }}>
            {lastCheck.responseTime != null ? `${lastCheck.responseTime} ms` : '—'}
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Client-observed</p>
        </div>
      ) : null,
    },
    {
      label: 'Database Status',
      icon: Database,
      gradient: 'linear-gradient(135deg, #0d9488, #2dd4bf)',
      content: <Unavailable />,
    },
  ]

  const kpiRowTwo = [
    { label: 'Uptime', icon: Timer, gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)', content: <Unavailable /> },
    { label: 'Memory Usage', icon: Cpu, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)', content: <Unavailable /> },
    { label: 'CPU Usage', icon: Gauge, gradient: 'linear-gradient(135deg, #ea580c, #fb923c)', content: <Unavailable /> },
    { label: 'Disk Usage', icon: HardDrive, gradient: 'linear-gradient(135deg, #db2777, #f472b6)', content: <Unavailable /> },
  ]

  const kpiRowThree = [
    {
      label: 'Active Connections',
      icon: Network,
      gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
      content: <Unavailable />,
    },
    {
      label: 'Health Checks',
      icon: Activity,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      content: <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: 'var(--color-text)' }}>{checks.length}</p>,
    },
    {
      label: 'Avg Response',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      content: (
        <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: 'var(--color-text)' }}>
          {avgRt != null ? `${avgRt} ms` : '—'}
        </p>
      ),
    },
    {
      label: 'Availability',
      icon: CheckCircle2,
      gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
      content: <p className="text-2xl font-bold leading-tight tabular-nums" style={{ color: 'var(--color-text)' }}>{checks.length ? `${availability}%` : '—'}</p>,
    },
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
                <HeartPulse size={26} color="#fff" />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  System Health
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Monitor live status of the platform server and API.
                </p>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={14} />
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl px-1.5 py-1.5 shrink-0 self-start sm:self-auto" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setAutoRefresh((v) => !v)}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${autoRefresh ? 'bg-white' : ''}`}
                style={{
                  color: autoRefresh ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  boxShadow: autoRefresh ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  border: '1px solid transparent',
                  borderColor: autoRefresh ? 'var(--color-border)' : 'transparent',
                }}
                title="Toggle Auto Refresh (every 30s)"
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
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md">
                  {autoRefresh ? 'ON' : 'OFF'}
                </span>
              </button>
              <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="inline-flex items-center gap-1.5 px-2.5 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }} title="Last Refreshed">
                {refreshing ? <Loader2 size={12} className="animate-spin" style={{ color: 'var(--color-accent)' }} /> : <RefreshCw size={12} />}
                <span className="hidden lg:inline">Last Refreshed:</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
                  {lastRefreshed ? formatClock(lastRefreshed.getTime()) : '—'}
                </span>
              </div>
              <button
                onClick={() => void doRefresh()}
                className="btn btn-sm btn-ghost px-2.5 transition-transform duration-200 hover:scale-110"
                style={{ color: 'var(--color-text-muted)' }}
                title="Refresh now"
                disabled={refreshing}
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Overall status banner ── */}
        {loading ? (
          <div className="h-14 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
        ) : lastCheck ? (
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl border shadow-sm"
            style={{
              backgroundColor: overallStatus === 'ok' ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
              borderColor: overallStatus === 'ok' ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: overallStatus === 'ok' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)', color: overallStatus === 'ok' ? '#16a34a' : '#dc2626' }}
              >
                {overallStatus === 'ok' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: overallStatus === 'ok' ? '#16a34a' : '#dc2626' }}>
                  {overallStatus === 'ok' ? 'All systems operational' : overallStatus === 'degraded' ? 'System degraded' : 'System offline'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Last check: {lastCheck.ok ? `healthy (${lastCheck.responseTime != null ? lastCheck.responseTime + ' ms' : 'n/a'})` : `failed (${lastCheck.statusText})`}
                </p>
              </div>
            </div>
            <button onClick={() => void doRefresh()} disabled={refreshing} className="btn btn-sm btn-ghost gap-1 self-start sm:self-auto" style={{ color: 'var(--color-text-muted)' }}>
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Run check
            </button>
          </div>
        ) : null}

        {/* ── Error / retry card ── */}
        {error && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border"
            style={{ backgroundColor: 'rgba(226,75,74,0.08)', borderColor: 'rgba(226,75,74,0.2)' }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
              <AlertTriangle size={16} />
              {error}
            </span>
            <button onClick={() => void doRefresh()} className="btn btn-xs btn-ghost shrink-0" style={{ color: 'var(--color-error)' }}>
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* ── KPI cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiRowOne.map((card) => (
                <KpiCard key={card.label} icon={card.icon} gradient={card.gradient} label={card.label}>
                  {card.content}
                </KpiCard>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiRowTwo.map((card) => (
                <KpiCard key={card.label} icon={card.icon} gradient={card.gradient} label={card.label}>
                  {card.content}
                </KpiCard>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiRowThree.map((card) => (
                <KpiCard key={card.label} icon={card.icon} gradient={card.gradient} label={card.label}>
                  {card.content}
                </KpiCard>
              ))}
            </div>
          </>
        )}

        {/* ── Health timeline ── */}
        <div
          className="rounded-2xl border shadow-sm p-6 transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div className="flex items-center gap-2">
              <History size={18} style={{ color: 'var(--color-accent)' }} />
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)', margin: 0 }}>
                Health Timeline
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(124,58,237,0.10)', color: 'var(--color-accent)' }}>
                {checks.length} samples
              </span>
            </div>
            {monitorStart && (
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Monitoring for {formatDuration(Date.now() - monitorStart)} (this session)
              </span>
            )}
          </div>
          {checks.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}
              >
                <Activity size={26} color="#fff" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No health samples yet</p>
              <button onClick={() => void doRefresh()} className="btn btn-sm btn-ghost gap-1" style={{ color: 'var(--color-accent)' }}>
                <RefreshCw size={14} />
                Run first check
              </button>
            </div>
          ) : (
            <HealthTimelineChart checks={checks} />
          )}
        </div>

        <style>{`
          @media (max-width: 640px) {
            .health-chart { font-size: 12px; }
          }
        `}</style>
      </div>
    </SuperAdminLayout>
  )
}

function KpiCard({
  icon: Icon,
  gradient,
  label,
  children,
}: {
  icon: LucideIcon
  gradient: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 p-5"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          <Icon size={13} color="#fff" />
        </span>
        {label}
      </p>
      {children}
    </div>
  )
}
