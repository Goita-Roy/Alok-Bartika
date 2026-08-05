import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  LayoutDashboard, Users, BookOpen, FileText,
  ClipboardList, Star, BarChart3, Loader2, RefreshCw,
  Trophy, Gauge, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  UserPlus, CalendarRange, GraduationCap, AlertTriangle, Target,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  totalCourses: number
  totalLessons: number
  totalExams: number
  totalNotices: number
  totalFeedback: number
  averageRating: number
}

interface ProgressDistribution {
  totalStudents: number
  buckets: {
    notStarted: number
    completedBeginner: number
    completedIntermediate: number
    completedAll: number
  }
  completedAll: number
  completionRate: number
  averageProgress: number
}

type BucketKey =
  | 'notStarted'
  | 'completedBeginner'
  | 'completedIntermediate'
  | 'completedAll'

interface RegistrationTrend {
  totalStudents: number
  growthRate: number
  data: { month: string; students: number }[]
}

interface DropoutProgress {
  totalStudents: number
  active: number
  atRisk: number
  dropout: number
  activePercentage: number
  atRiskPercentage: number
  dropoutPercentage: number
}

interface ExamPassRate {
  totalAttempts: number
  passed: number
  failed: number
  passRate: number
  averageScore: number
}

interface WeakLevelStat {
  level: string
  attempts: number
  passed: number
  failed: number
  failureRate: number
}

interface WeakestLevel {
  levels: WeakLevelStat[]
  weakestLevel: string | null
}

const PROGRESS_CATEGORIES: { key: BucketKey; label: string; color: string }[] = [
  { key: 'notStarted', label: 'Not Started', color: '#6b7280' },
  { key: 'completedBeginner', label: 'Completed Beginner', color: '#3b82f6' },
  {
    key: 'completedIntermediate',
    label: 'Completed Intermediate',
    color: '#f59e0b',
  },
  { key: 'completedAll', label: 'Completed All Levels', color: '#22c55e' },
]

const PIE_RADIAN = Math.PI / 180

const WEAK_LEVEL_COLORS: Record<string, string> = {
  beginner: '#3b82f6',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

const renderWeakLevelTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <div className="text-xs space-y-0.5" style={{ color: 'var(--color-text)' }}>
        <p>Attempts: <span className="font-bold">{entry.payload.attempts}</span></p>
        <p>Passed: <span className="font-bold">{entry.payload.passed}</span></p>
        <p>Failed: <span className="font-bold">{entry.payload.failed}</span></p>
        <p className="font-bold" style={{ color: entry.payload.color }}>
          Failure Rate: {entry.payload.failureRate}%
        </p>
      </div>
    </div>
  )
}

const renderPieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value } = props
  if (!percent || percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * PIE_RADIAN)
  const y = cy + radius * Math.sin(-midAngle * PIE_RADIAN)
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={12} fontWeight={700}>
      <tspan x={x} dy="-1">{`${(percent * 100).toFixed(0)}%`}</tspan>
      <tspan x={x} dy="13" fontSize={10.5} fontWeight={600}>{`${value}`}</tspan>
    </text>
  )
}

const renderPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.payload.color }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{entry.name}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {entry.value} student{entry.value === 1 ? '' : 's'} &bull; {entry.payload.percentage}%
      </p>
    </div>
  )
}

const renderPieLegend = (props: any) => {
  const { payload } = props
  if (!payload || payload.length === 0) return null
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
      {payload.map((entry: any, idx: number) => (
        <li key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span style={{ color: 'var(--color-text)' }}>{entry.value}</span>
          <span className="font-bold whitespace-nowrap" style={{ color: entry.color }}>
            {entry.payload.percentage}%
          </span>
          <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
            {entry.payload.count} student{entry.payload.count === 1 ? '' : 's'}
          </span>
        </li>
      ))}
    </ul>
  )
}

const renderExamTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const entry = payload[0]
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.payload.color }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{entry.name}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
        {entry.value} attempt{entry.value === 1 ? '' : 's'} &bull; {entry.payload.percentage}%
      </p>
    </div>
  )
}

const renderExamLegend = (props: any) => {
  const { payload } = props
  if (!payload || payload.length === 0) return null
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
      {payload.map((entry: any, idx: number) => (
        <li key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span style={{ color: 'var(--color-text)' }}>{entry.value}</span>
          <span className="font-bold whitespace-nowrap" style={{ color: entry.color }}>
            {entry.payload.percentage}%
          </span>
          <span className="text-[11px] whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
            {entry.payload.count} attempt{entry.payload.count === 1 ? '' : 's'}
          </span>
        </li>
      ))}
    </ul>
  )
}

const renderTrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-sm font-bold mt-1" style={{ color: '#3b82f6' }}>
        {payload[0].value} student{payload[0].value === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export function AdminAnalyticsPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [distribution, setDistribution] = useState<ProgressDistribution | null>(null)
  const [distributionLoading, setDistributionLoading] = useState(true)
  const [distributionError, setDistributionError] = useState<string | null>(null)
  const [trend, setTrend] = useState<RegistrationTrend | null>(null)
  const [trendLoading, setTrendLoading] = useState(true)
  const [trendError, setTrendError] = useState<string | null>(null)
  const [dropout, setDropout] = useState<DropoutProgress | null>(null)
  const [dropoutLoading, setDropoutLoading] = useState(true)
  const [dropoutError, setDropoutError] = useState<string | null>(null)
  const [passRate, setPassRate] = useState<ExamPassRate | null>(null)
  const [passRateLoading, setPassRateLoading] = useState(true)
  const [passRateError, setPassRateError] = useState<string | null>(null)
  const [weakest, setWeakest] = useState<WeakestLevel | null>(null)
  const [weakestLoading, setWeakestLoading] = useState(true)
  const [weakestError, setWeakestError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load analytics data')
      const json = await res.json()
      setStats(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadDistribution = async () => {
    try {
      setDistributionLoading(true)
      setDistributionError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/student-progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load student progress')
      const json = await res.json()
      setDistribution(json.data)
    } catch (e: unknown) {
      setDistributionError(e instanceof Error ? e.message : 'Failed to load student progress')
    } finally {
      setDistributionLoading(false)
    }
  }

  const loadTrend = async () => {
    try {
      setTrendLoading(true)
      setTrendError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/student-registration-trend`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load registration trend')
      const json = await res.json()
      setTrend(json.data)
    } catch (e: unknown) {
      setTrendError(e instanceof Error ? e.message : 'Failed to load registration trend')
    } finally {
      setTrendLoading(false)
    }
  }

  const loadDropout = async () => {
    try {
      setDropoutLoading(true)
      setDropoutError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/student-dropout-progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load dropout progress')
      const json = await res.json()
      setDropout(json.data)
    } catch (e: unknown) {
      setDropoutError(e instanceof Error ? e.message : 'Failed to load dropout progress')
    } finally {
      setDropoutLoading(false)
    }
  }

  const loadPassRate = async () => {
    try {
      setPassRateLoading(true)
      setPassRateError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/exam-pass-rate`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load exam pass rate')
      const json = await res.json()
      setPassRate(json.data)
    } catch (e: unknown) {
      setPassRateError(e instanceof Error ? e.message : 'Failed to load exam pass rate')
    } finally {
      setPassRateLoading(false)
    }
  }

  const loadWeakest = async () => {
    try {
      setWeakestLoading(true)
      setWeakestError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/weakest-level`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load weakest level')
      const json = await res.json()
      setWeakest(json.data)
    } catch (e: unknown) {
      setWeakestError(e instanceof Error ? e.message : 'Failed to load weakest level')
    } finally {
      setWeakestLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadStats()
      loadDistribution()
      loadTrend()
      loadDropout()
      loadPassRate()
      loadWeakest()
    }
  }, [token])

  const refresh = () => {
    loadStats()
    loadDistribution()
    loadTrend()
    loadDropout()
    loadPassRate()
    loadWeakest()
  }

  const chartData = distribution
    ? PROGRESS_CATEGORIES.map((c) => {
        const count = distribution.buckets[c.key] || 0
        const percentage = distribution.totalStudents > 0
          ? ((count / distribution.totalStudents) * 100).toFixed(1)
          : '0.0'
        return { name: c.label, count, percentage, color: c.color }
      })
    : []

  const hasTrendData = !!trend && trend.data.some((d) => d.students > 0)
  const newThisMonth =
    trend && trend.data.length > 0
      ? trend.data[trend.data.length - 1].students
      : 0
  const averagePerMonth =
    trend && trend.data.length > 0
      ? Math.round(
          (trend.data.reduce((sum, d) => sum + d.students, 0) / trend.data.length) * 10,
        ) / 10
      : 0

  const dropoutRows = dropout
    ? [
        { label: 'Active', color: '#22c55e', count: dropout.active, percentage: dropout.activePercentage },
        { label: 'At Risk', color: '#f59e0b', count: dropout.atRisk, percentage: dropout.atRiskPercentage },
        { label: 'Dropout', color: '#ef4444', count: dropout.dropout, percentage: dropout.dropoutPercentage },
      ]
    : []
  const dropoutData = dropoutRows.map((row) => ({
    name: row.label,
    count: row.count,
    percentage: row.percentage,
    color: row.color,
  }))

  const passRateData = passRate
    ? [
        {
          name: 'Passed',
          count: passRate.passed,
          percentage: passRate.totalAttempts > 0 ? passRate.passRate : 0,
          color: '#22c55e',
        },
        {
          name: 'Failed',
          count: passRate.failed,
          percentage:
            passRate.totalAttempts > 0
              ? Math.round((passRate.failed / passRate.totalAttempts) * 1000) / 10
              : 0,
          color: '#ef4444',
        },
      ]
    : []

  const weakestChartData = weakest
    ? weakest.levels.map((l) => ({
        name: l.level.charAt(0).toUpperCase() + l.level.slice(1),
        failureRate: l.failureRate,
        attempts: l.attempts,
        passed: l.passed,
        failed: l.failed,
        color: WEAK_LEVEL_COLORS[l.level] || '#6b7280',
      }))
    : []
  const weakestStat = weakest?.levels.find((l) => l.level === weakest.weakestLevel) || null
  const weakestColor = weakestStat ? WEAK_LEVEL_COLORS[weakestStat.level] || '#6b7280' : '#6b7280'

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm opacity-60">Platform insights and reports</p>
          </div>
          <button onClick={refresh}
            className="btn btn-sm btn-ghost"
            style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</p>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.10)' }}>
                    <Users size={22} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Students</p>
                    <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.totalStudents}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.10)' }}>
                    <Users size={22} style={{ color: '#22c55e' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Active Students</p>
                    <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{stats.activeStudents}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.10)' }}>
                    <BookOpen size={22} style={{ color: '#7c3aed' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Courses</p>
                    <p className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{stats.totalCourses}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    <FileText size={22} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Lessons</p>
                    <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{stats.totalLessons}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.10)' }}>
                    <ClipboardList size={22} style={{ color: '#06b6d4' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Exams</p>
                    <p className="text-2xl font-bold" style={{ color: '#06b6d4' }}>{stats.totalExams}</p>
                  </div>
                </div>
              </div>
              <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-5 flex flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    <Star size={22} style={{ color: '#F59E0B' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Avg Rating</p>
                    <p className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stats.averageRating}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Registration Trend */}
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                      <span className="text-lg leading-none">📈</span>
                      Student Registration Trend
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      New student registrations over the last 12 months
                    </p>
                  </div>
                  <button onClick={loadTrend}
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <RefreshCw size={14} />
                  </button>
                </div>

                {trendError ? (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-4"
                    style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                    <span>{trendError}</span>
                    <button onClick={loadTrend} className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }}>
                      <RefreshCw size={14} />
                      Retry
                    </button>
                  </div>
                ) : trendLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                    <div className="lg:col-span-3 h-80 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      ))}
                    </div>
                  </div>
                ) : trend && !hasTrendData ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.10)' }}>
                        <TrendingUp size={34} style={{ color: '#3b82f6' }} />
                      </div>
                      <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                        +
                      </span>
                    </div>
                    <p className="font-semibold mt-1" style={{ color: 'var(--color-text-muted)' }}>No registration data found.</p>
                  </div>
                ) : trend ? (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
                    {/* Chart */}
                    <div className="lg:col-span-3">
                      <div style={{ height: 320, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trend.data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                            <defs>
                              <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                            <XAxis
                              dataKey="month"
                              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                              tickLine={false}
                              axisLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip content={renderTrendTooltip} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Area
                              type="monotone"
                              dataKey="students"
                              name="Students"
                              stroke="none"
                              fill="url(#registrationGradient)"
                              legendType="none"
                            />
                            <Line
                              type="monotone"
                              dataKey="students"
                              name="Students"
                              stroke="#3b82f6"
                              strokeWidth={2.5}
                              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: '#3b82f6', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
                      <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                        <div className="flex items-center gap-2">
                          <Users size={16} style={{ color: '#3b82f6' }} />
                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Students</p>
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#3b82f6' }}>{trend.totalStudents}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <div className="flex items-center gap-2">
                          <UserPlus size={16} style={{ color: '#22c55e' }} />
                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>New This Month</p>
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#22c55e' }}>{newThisMonth}</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} style={{ color: '#7c3aed' }} />
                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Growth Rate</p>
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#7c3aed' }}>{trend.growthRate}%</p>
                      </div>
                      <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div className="flex items-center gap-2">
                          <CalendarRange size={16} style={{ color: '#f59e0b' }} />
                          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Average Registrations / Month</p>
                        </div>
                        <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{averagePerMonth}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Progress + Dropout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Student Progress Distribution */}
              <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <PieChartIcon size={18} style={{ color: 'var(--color-accent)' }} />
                        Student Progress Distribution
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        How many students are currently at each learning stage
                      </p>
                    </div>
                    <button onClick={loadDistribution}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {distributionError ? (
                    <div className="px-4 py-3 rounded-xl text-sm font-semibold mt-4"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      {distributionError}
                    </div>
                  ) : distributionLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading student progress...</p>
                    </div>
                  ) : distribution && distribution.totalStudents === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No student data available</span>
                    </div>
                  ) : distribution ? (
                    <>
                      <div style={{ height: 280, width: '100%' }} className="mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="46%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                              label={renderPieLabel}
                              labelLine={false}
                              animationDuration={700}
                              animationEasing="ease-out"
                            >
                              {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={renderPieTooltip} />
                            <Legend
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              iconSize={10}
                              content={renderPieLegend}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Users size={16} style={{ color: '#3b82f6' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Students</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#3b82f6' }}>{distribution.totalStudents}</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Trophy size={16} style={{ color: '#22c55e' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Completed All Levels</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#22c55e' }}>{distribution.completedAll}</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Gauge size={16} style={{ color: '#7c3aed' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Completion Rate</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#7c3aed' }}>{distribution.completionRate}%</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} style={{ color: '#f59e0b' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Average Progress</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{distribution.averageProgress}%</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Student Dropout Progress */}
              <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <TrendingDown size={18} style={{ color: 'var(--color-accent)' }} />
                        Student Dropout Progress
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Students who stop engaging with the platform
                      </p>
                    </div>
                    <button onClick={loadDropout}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {dropoutError ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-4"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <span>{dropoutError}</span>
                      <button onClick={loadDropout} className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }}>
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </div>
                  ) : dropoutLoading ? (
                    <div className="mt-4 space-y-3">
                      <div className="h-64 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      ))}
                    </div>
                  ) : dropout && dropout.totalStudents === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No student data available.</span>
                    </div>
                  ) : dropout ? (
                    <>
                      <div style={{ height: 280, width: '100%' }} className="mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={dropoutData}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="46%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                              label={renderPieLabel}
                              labelLine={false}
                              animationDuration={700}
                              animationEasing="ease-out"
                            >
                              {dropoutData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={renderPieTooltip} />
                            <Legend
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              iconSize={10}
                              content={renderPieLegend}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="mt-4 space-y-2">
                        {dropoutRows.map((row) => (
                          <div key={row.label}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background: `${row.color}0f`, border: `1px solid ${row.color}26` }}>
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{row.label}</span>
                            <span className="ml-auto text-sm font-bold" style={{ color: row.color }}>{row.count}</span>
                            <span className="text-xs font-semibold w-12 text-right" style={{ color: 'var(--color-text-muted)' }}>{row.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Exam Pass Rate + Weakest Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Exam Pass vs Fail Rate */}
              <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <GraduationCap size={18} style={{ color: 'var(--color-accent)' }} />
                        Exam Pass vs Fail Rate
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Pass/fail ratio across all completed exam attempts
                      </p>
                    </div>
                    <button onClick={loadPassRate}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {passRateError ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-4"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <span>{passRateError}</span>
                      <button onClick={loadPassRate} className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }}>
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </div>
                  ) : passRateLoading ? (
                    <div className="mt-4 space-y-3">
                      <div className="h-56 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                        ))}
                      </div>
                    </div>
                  ) : passRate && passRate.totalAttempts === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No exam attempts recorded.</span>
                    </div>
                  ) : passRate ? (
                    <>
                      <div style={{ height: 280, width: '100%' }} className="mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={passRateData}
                              dataKey="count"
                              nameKey="name"
                              cx="50%"
                              cy="46%"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                              label={renderPieLabel}
                              labelLine={false}
                              animationDuration={700}
                              animationEasing="ease-out"
                            >
                              {passRateData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={renderExamTooltip} />
                            <Legend
                              verticalAlign="bottom"
                              align="center"
                              iconType="circle"
                              iconSize={10}
                              content={renderExamLegend}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <ClipboardList size={16} style={{ color: '#3b82f6' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Attempts</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#3b82f6' }}>{passRate.totalAttempts}</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Trophy size={16} style={{ color: '#22c55e' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Passed</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#22c55e' }}>{passRate.passed}</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Failed</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#ef4444' }}>{passRate.failed}</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Gauge size={16} style={{ color: '#7c3aed' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Pass Rate</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#7c3aed' }}>{passRate.passRate}%</p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} style={{ color: '#f59e0b' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Average Score</p>
                          </div>
                          <p className="text-2xl font-bold mt-1" style={{ color: '#f59e0b' }}>{passRate.averageScore}%</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Weakest Level Analysis */}
              <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <AlertTriangle size={18} style={{ color: 'var(--color-accent)' }} />
                        Weakest Level Analysis
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Which exam level has the highest failure rate
                      </p>
                    </div>
                    <button onClick={loadWeakest}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {weakestError ? (
                    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-4"
                      style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                      <span>{weakestError}</span>
                      <button onClick={loadWeakest} className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }}>
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </div>
                  ) : weakestLoading ? (
                    <div className="mt-4 space-y-3">
                      <div className="h-56 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                      <div className="grid grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'rgba(128,128,128,0.12)' }} />
                        ))}
                      </div>
                    </div>
                  ) : weakest && weakest.levels.every((l) => l.attempts === 0) ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No exam attempts recorded.</span>
                    </div>
                  ) : weakest ? (
                    <>
                      <div style={{ height: 220, width: '100%' }} className="mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={weakestChartData}
                            layout="vertical"
                            margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                            <XAxis
                              type="number"
                              domain={[0, 100]}
                              tickFormatter={(v: number) => `${v}%`}
                              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                              tickLine={false}
                              axisLine={false}
                              allowDecimals={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={92}
                              tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip content={renderWeakLevelTooltip} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
                            <Bar dataKey="failureRate" name="Failure Rate" barSize={28} radius={[0, 6, 6, 0]}>
                              {weakestChartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="rounded-xl p-4" style={{ background: `${weakestColor}12`, border: `1px solid ${weakestColor}2e` }}>
                          <div className="flex items-center gap-2">
                            <Target size={16} style={{ color: weakestColor }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Weakest Level</p>
                          </div>
                          <p className="text-lg font-bold mt-1 capitalize" style={{ color: weakestColor }}>
                            {weakestStat ? weakestStat.level : 'None'}
                          </p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Gauge size={16} style={{ color: '#ef4444' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Failure Rate</p>
                          </div>
                          <p className="text-lg font-bold mt-1" style={{ color: '#ef4444' }}>
                            {weakestStat ? `${weakestStat.failureRate}%` : '—'}
                          </p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <ClipboardList size={16} style={{ color: '#3b82f6' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Attempts</p>
                          </div>
                          <p className="text-lg font-bold mt-1" style={{ color: '#3b82f6' }}>
                            {weakestStat ? weakestStat.attempts : '—'}
                          </p>
                        </div>
                        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                          <div className="flex items-center gap-2">
                            <Users size={16} style={{ color: '#f59e0b' }} />
                            <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Failed Students</p>
                          </div>
                          <p className="text-lg font-bold mt-1" style={{ color: '#f59e0b' }}>
                            {weakestStat ? weakestStat.failed : '—'}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body p-6">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                  Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#3b82f6' }}>Student Activity</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {stats.activeStudents} of {stats.totalStudents} students are active
                      ({stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%)
                    </p>
                    <div className="w-full h-2 rounded-full mt-2" style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents) * 100 : 0}%`,
                        background: '#3b82f6',
                      }} />
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Content Overview</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {stats.totalCourses} courses &bull; {stats.totalLessons} lessons &bull; {stats.totalExams} exams
                    </p>
                    <div className="flex gap-3 mt-2">
                      {[
                        { label: 'Courses', value: stats.totalCourses, color: '#7c3aed' },
                        { label: 'Lessons', value: stats.totalLessons, color: '#f59e0b' },
                        { label: 'Exams', value: stats.totalExams, color: '#06b6d4' },
                      ].map(item => (
                        <span key={item.label} className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ background: `${item.color}15`, color: item.color }}>
                          {item.value} {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
