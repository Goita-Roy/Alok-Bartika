import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users, GraduationCap, Shield, UserCheck,
  BarChart3, Loader2, RefreshCw, PieChart as PieChartIcon,
  UserPlus, CalendarRange, TrendingUp, TrendingDown, Activity,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

interface PlatformAnalyticsData {
  totalUsers: number
  totalStudents: number
  totalAdmins: number
  totalSuperAdmins: number
  activeUsersLast7Days: number
  newUsersThisMonth: number
  userGrowthPercent: number
  userDistribution: { role: string; count: number; color: string }[]
  monthlyUserGrowth: { month: string; users: number }[]
  userActivity: { name: string; count: number; color: string }[]
  userRegistrationByRole: { role: string; count: number; color: string }[]
  adminOverview: { available: boolean; totalAdmins: number; admins: any[] }
}

const PIE_RADIAN = Math.PI / 180

const renderPlatformPieTooltip = ({ active, payload }: any) => {
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
        {entry.value} user{entry.value === 1 ? '' : 's'}
      </p>
    </div>
  )
}

const renderPlatformPieLegend = (props: any) => {
  const { payload } = props
  if (!payload || payload.length === 0) return null
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2">
      {payload.map((entry: any, idx: number) => (
        <li key={idx} className="flex items-center gap-2 text-xs">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span style={{ color: 'var(--color-text)' }}>{entry.value}</span>
          <span className="font-bold" style={{ color: entry.color }}>
            {entry.payload.count}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            user{entry.payload.count === 1 ? '' : 's'}
          </span>
        </li>
      ))}
    </ul>
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

const renderGrowthTooltip = ({ active, payload, label }: any) => {
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
        {payload[0].value} user{payload[0].value === 1 ? '' : 's'}
      </p>
    </div>
  )
}

const renderBarTooltip = ({ active, payload, label }: any) => {
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
      <div className="text-xs" style={{ color: 'var(--color-text)' }}>
        <p>Count: <span className="font-bold">{entry.value}</span></p>
      </div>
    </div>
  )
}

export function SuperAdminPlatformAnalyticsPage() {
  const { token } = useAuth()
  const [data, setData] = useState<PlatformAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPlatformAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = { Authorization: `Bearer ${token}` }
      const res = await fetch(`${API_BASE_URL}/super-admin/analytics/platform`, { headers })
      if (!res.ok) throw new Error('Failed to load platform analytics')
      const json = await res.json()
      setData(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load platform analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadPlatformAnalytics()
    }
  }, [token])

  const refresh = () => {
    loadPlatformAnalytics()
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const kpiStats = data
    ? [
        {
          label: 'Total Users',
          value: data.totalUsers,
          icon: Users,
          gradient: 'linear-gradient(135deg, #059669, #34d399)',
          textColor: '#059669',
          tint: 'rgba(5, 150, 105, 0.06)',
        },
        {
          label: 'Total Students',
          value: data.totalStudents,
          icon: GraduationCap,
          gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
          textColor: '#2563eb',
          tint: 'rgba(37, 99, 235, 0.06)',
        },
        {
          label: 'Total Admins',
          value: data.totalAdmins,
          icon: Shield,
          gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          textColor: '#7c3aed',
          tint: 'rgba(124, 58, 237, 0.06)',
        },
        {
          label: 'Active Users (Last 7 Days)',
          value: data.activeUsersLast7Days,
          icon: UserCheck,
          gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
          textColor: '#16a34a',
          tint: 'rgba(22, 163, 74, 0.06)',
        },
        {
          label: 'New Users This Month',
          value: data.newUsersThisMonth,
          icon: UserPlus,
          gradient: 'linear-gradient(135deg, #0ea5e9, #38bdfa)',
          textColor: '#0ea5e9',
          tint: 'rgba(14, 165, 233, 0.06)',
        },
        {
          label: 'User Growth %',
          value: `${data.userGrowthPercent >= 0 ? '+' : ''}${data.userGrowthPercent}%`,
          icon: data.userGrowthPercent >= 0 ? TrendingUp : TrendingDown,
          gradient: data.userGrowthPercent >= 0
            ? 'linear-gradient(135deg, #16a34a, #4ade80)'
            : 'linear-gradient(135deg, #dc2626, #f87171)',
          textColor: data.userGrowthPercent >= 0 ? '#16a34a' : '#dc2626',
          tint: data.userGrowthPercent >= 0
            ? 'rgba(22, 163, 74, 0.06)'
            : 'rgba(220, 38, 38, 0.06)',
        },
      ]
    : []

  const distributionData = data?.userDistribution || []
  const monthlyGrowthData = data?.monthlyUserGrowth || []
  const activityData = data?.userActivity || []
  const registrationByRoleData = data?.userRegistrationByRole || []
  const adminOverview = data?.adminOverview

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
                <LayoutDashboard size={26} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Platform Analytics
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Platform-wide user insights and reports
                </p>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <CalendarRange size={14} />
                  {today}
                </p>
              </div>
            </div>

            <button
                onClick={refresh}
                className="btn btn-sm btn-ghost transition-transform duration-200 hover:scale-110"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Refresh"
              >
                <RefreshCw size={16} />
              </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={38} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading platform analytics…</p>
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── KPI cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {kpiStats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-5"
                    style={{ backgroundColor: stat.tint, borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center gap-4 h-full">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: stat.gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                      >
                        <Icon size={22} color="#fff" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{ color: 'var(--color-text-muted)' }}>
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold mt-1" style={{ color: stat.textColor, lineHeight: 1.2 }}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── User Distribution (Pie) + Monthly User Growth (Line) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* User Distribution */}
              <div
                className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', boxShadow: '0 4px 14px rgba(59,130,246,0.25)' }}
                      >
                        <PieChartIcon size={20} color="#fff" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          User Distribution
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          Users across all roles
                        </p>
                      </div>
                    </div>
                    <button onClick={loadPlatformAnalytics}
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="Refresh">
                        <RefreshCw size={14} />
                      </button>
                  </div>

                  {distributionData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 mt-4">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No user data available</span>
                    </div>
                  ) : (
                    <div style={{ height: 280, width: '100%' }} className="mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={distributionData}
                            dataKey="count"
                            nameKey="role"
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
                            {distributionData.map((entry) => (
                              <Cell key={entry.role} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={renderPlatformPieTooltip} />
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={10}
                            content={renderPlatformPieLegend}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly User Growth */}
              <div
                className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdfa)', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}
                      >
                        <TrendingUp size={20} color="#fff" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          Monthly User Growth
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          New registrations over the last 12 months
                        </p>
                      </div>
                    </div>
                    <button onClick={loadPlatformAnalytics}
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="Refresh">
                        <RefreshCw size={14} />
                      </button>
                  </div>

                  {monthlyGrowthData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 mt-4">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No registration data found.</span>
                    </div>
                  ) : (
                    <div style={{ height: 320, width: '100%' }} className="mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                          <defs>
                            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveEnd"
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={renderGrowthTooltip} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Area
                            type="monotone"
                            dataKey="users"
                            name="Users"
                            stroke="none"
                            fill="url(#growthGradient)"
                            legendType="none"
                          />
                          <Line
                            type="monotone"
                            dataKey="users"
                            name="Users"
                            stroke="#0ea5e9"
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#0ea5e9', stroke: 'var(--color-surface)', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── User Activity (Bar) + User Registration by Role (Bar) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

              {/* User Activity */}
              <div
                className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}
                      >
                        <Activity size={20} color="#fff" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          User Activity
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          Active vs inactive users
                        </p>
                      </div>
                    </div>
                    <button onClick={loadPlatformAnalytics}
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="Refresh">
                        <RefreshCw size={14} />
                      </button>
                  </div>

                  {activityData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 mt-4">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No user activity data available</span>
                    </div>
                  ) : (
                    <div style={{ height: 280, width: '100%' }} className="mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={activityData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={renderBarTooltip} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
                          <Bar dataKey="count" name="Users" barSize={48} radius={[6, 6, 0, 0]}>
                            {activityData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* User Registration by Role */}
              <div
                className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full flex flex-col"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
                      >
                        <Users size={20} color="#fff" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                          User Registration by Role
                        </h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          Total users per role
                        </p>
                      </div>
                    </div>
                    <button onClick={loadPlatformAnalytics}
                        className="btn btn-sm btn-ghost"
                        style={{ color: 'var(--color-text-muted)' }}
                        aria-label="Refresh">
                        <RefreshCw size={14} />
                      </button>
                  </div>

                  {registrationByRoleData.length === 0 ? (
                    <div className="flex items-center justify-center py-12 mt-4">
                      <span className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>No user data available</span>
                    </div>
                  ) : (
                    <div style={{ height: 280, width: '100%' }} className="mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={registrationByRoleData}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis
                            dataKey="role"
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={renderBarTooltip} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
                          <Bar dataKey="count" name="Users" barSize={48} radius={[6, 6, 0, 0]}>
                            {registrationByRoleData.map((entry) => (
                              <Cell key={entry.role} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Admin Overview ── */}
            <div
              className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="p-6 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}
                    >
                      <Shield size={20} color="#fff" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                        Admin Overview
                      </h2>
                      <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Total administrators and their managed students
                      </p>
                    </div>
                  </div>
                  <button onClick={loadPlatformAnalytics}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--color-text-muted)' }}
                      aria-label="Refresh">
                      <RefreshCw size={14} />
                    </button>
                </div>

                <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: '#2563eb' }} />
                    <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Total Admins</p>
                  </div>
                  <p className="text-2xl font-bold mt-1" style={{ color: '#2563eb' }}>
                    {adminOverview?.totalAdmins ?? 0}
                  </p>
                </div>

                {!adminOverview?.available ? (
                  <div className="mt-4 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    Student assignment data is not available.
                  </div>
                ) : (
                  <div style={{ height: 320, width: '100%' }} className="mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={adminOverview.admins.map((a: any) => ({
                          name: a.fullName || a.email,
                          managedStudents: a.managedStudents || 0,
                        }))}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={renderBarTooltip} cursor={{ fill: 'rgba(128,128,128,0.06)' }} />
                        <Bar dataKey="managedStudents" name="Students" barSize={24} radius={[0, 6, 6, 0]} fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* ── Summary ── */}
            <div
              className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="p-6">
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <BarChart3 size={18} style={{ color: 'var(--color-accent)' }} />
                  Platform Summary
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#3b82f6' }}>User Activity Breakdown</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {data && data.totalUsers > 0
                        ? `${data.activeUsersLast7Days} of ${data.totalUsers} platform users were active in the last 7 days`
                        : 'No user data yet'}
                    </p>
                    <div className="w-full h-2 rounded-full mt-2" style={{ background: 'rgba(59,130,246,0.12)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${data && data.totalUsers > 0 ? (data.activeUsersLast7Days / data.totalUsers) * 100 : 0}%`,
                        background: '#3b82f6',
                      }} />
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <p className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Role Distribution</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {data
                        ? `${data.totalStudents} students \u0026bull; ${data.totalAdmins} admins \u0026bull; ${data.totalSuperAdmins} super admins`
                        : 'No data yet'}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
                        {data?.totalStudents ?? 0} Students
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(124,58,237,0.15)', color: '#7c3aed' }}>
                        {data?.totalAdmins ?? 0} Admins
                      </span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                        {data?.totalSuperAdmins ?? 0} Super Admins
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SuperAdminLayout>
  )
}
