import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  LayoutDashboard, Users, UserCheck, BookOpen, FileText,
  ClipboardList, Megaphone, Loader2, RefreshCw,
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  totalCourses: number
  totalLessons: number
  totalExams: number
  totalNotices: number
}

export function AdminDashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load dashboard stats')
      const json = await res.json()
      setStats(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const statCards = stats ? [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    { label: 'Active Students', value: stats.activeStudents, icon: UserCheck, color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)' },
    { label: 'Total Lessons', value: stats.totalLessons, icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    { label: 'Total Exams', value: stats.totalExams, icon: ClipboardList, color: '#06b6d4', bg: 'rgba(6,182,212,0.10)' },
    { label: 'Total Notices', value: stats.totalNotices, icon: Megaphone, color: '#ec4899', bg: 'rgba(236,72,153,0.10)' },
  ] : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--color-accent-pale)' }}>
              <LayoutDashboard size={22} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Platform overview at a glance</p>
            </div>
          </div>
          <button onClick={loadStats}
            className="btn btn-sm btn-ghost self-start"
            style={{ color: 'var(--color-text-muted)' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading dashboard…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Stat cards */}
        {!loading && !error && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map(c => {
              const Icon = c.icon
              return (
                <div key={c.label} className="card shadow-sm transition-shadow hover:shadow-md"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="card-body p-5 flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: c.bg }}>
                      <Icon size={22} style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{c.label}</p>
                      <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick summary */}
        {!loading && !error && stats && (
          <div className="card shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6">
              <h2 className="text-base font-semibold flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}>
                <LayoutDashboard size={18} style={{ color: 'var(--color-accent)' }} />
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
                    {stats.totalCourses} courses · {stats.totalLessons} lessons · {stats.totalExams} exams
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
        )}
      </div>
    </AdminLayout>
  )
}
