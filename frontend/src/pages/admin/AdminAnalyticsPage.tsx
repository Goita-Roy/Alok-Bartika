import { useState, useEffect } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  LayoutDashboard, Users, BookOpen, FileText,
  ClipboardList, Star, BarChart3, Loader2, RefreshCw,
} from 'lucide-react'

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

export function AdminAnalyticsPage() {
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
      if (!res.ok) throw new Error('Failed to load analytics data')
      const json = await res.json()
      setStats(json.data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadStats()
    }
  }, [token])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm opacity-60">Platform insights and reports</p>
          </div>
          <button onClick={loadStats}
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
        )}

        {!loading && !error && stats && (
          <div className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
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
        )}
      </div>
    </AdminLayout>
  )
}
