import { useState, useEffect } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { RatingDistributionChart } from '../../components/admin/feedback/RatingDistributionChart'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Search, Star, MessageSquare, TrendingDown, AlertTriangle,
  RefreshCw, Calendar, ChevronLeft, ChevronRight, X, Eye,
} from 'lucide-react'

interface AnalyticsData {
  totalFeedback: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  recommendationPercentage: number
  feedbackByLevel: { [key: string]: number }
  monthlyTrend?: { month: string; count: number }[]
}

interface FeedbackItem {
  _id: string
  userId: string
  studentName: string
  courseTitle: string
  level: string
  examScore: number
  rating: number
  courseExperience: string
  learnedSomething: string
  lessonUnderstanding: string
  favoriteParts: string[]
  improvementSuggestion: string
  futureFeatures: string
  recommendation: string
  additionalSuggestion: string
  submittedAt: string
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
}

const LEVEL_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  beginner: { bg: '#dcfce7', text: '#16a34a' },
  intermediate: { bg: '#dbeafe', text: '#2563eb' },
  advanced: { bg: '#ede9fe', text: '#7c3aed' },
}

const RECOMMENDATION_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  recommended: { bg: '#dcfce7', text: '#15803d' },
  notRecommended: { bg: '#fee2e2', text: '#dc2626' },
}

const RECOMMENDATION_OPTIONS = [
  'Definitely recommend',
  'Probably recommend',
  'Not sure',
  'Would not recommend',
]

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function SuperAdminFeedbackPage() {
  const { token } = useAuth()
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [recommendationFilter, setRecommendationFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selected, setSelected] = useState<FeedbackItem | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const headers = { Authorization: `Bearer ${token}` }

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      const res = await fetch(`${API_BASE_URL}/feedback/admin/analytics`, { headers })
      if (!res.ok) throw new Error('Failed to load analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics Error:', err)
      const message = err instanceof Error ? err.message : 'Failed to load analytics'
      setAnalyticsError(message)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchFeedbacks = async () => {
    setLoading(true)
    setFeedbackError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (levelFilter) params.set('level', levelFilter)
      if (ratingFilter) params.set('rating', ratingFilter)
      if (recommendationFilter) params.set('recommendation', recommendationFilter)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`${API_BASE_URL}/feedback/admin/list?${params}`, { headers })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setFeedbacks(data.feedbacks)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Unable to load feedback records'
      setFeedbackError(message)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (token) {
      fetchFeedbacks()
      fetchAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    setPage(1)
    fetchFeedbacks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, levelFilter, ratingFilter, recommendationFilter, dateFrom, dateTo])

  const resetFilters = () => {
    setSearch('')
    setLevelFilter('')
    setRatingFilter('')
    setRecommendationFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const renderStarVisual = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        className={index < Math.round(rating) ? 'fill-current' : ''}
        style={{ color: index < Math.round(rating) ? '#f59e0b' : 'var(--color-text-muted)' }}
      />
    ))
  }

  const getLevelBadgeStyle = (level: string) =>
    LEVEL_BADGE_STYLES[level] || { bg: 'var(--color-accent-pale)', text: 'var(--color-accent)' }
  const getRecommendationBadgeStyle = (recommendation: string) => {
    const normalized =
      recommendation?.toLowerCase().includes('recommended') ||
      recommendation?.toLowerCase().includes('definitely') ||
      recommendation?.toLowerCase().includes('probably') ||
      recommendation?.toLowerCase().includes('yes') ||
      recommendation?.toLowerCase().includes('likely')
        ? 'recommended'
        : 'notRecommended'
    return RECOMMENDATION_BADGE_STYLES[normalized] || { bg: '#f3f4f6', text: '#6b7280' }
  }

  const ratingDistribution = analytics?.ratingDistribution || {}
  const kpiFiveStar = ratingDistribution[5] || 0
  const kpiLow = (ratingDistribution[1] || 0) + (ratingDistribution[2] || 0)
  const avgRating = analytics?.averageRating ?? 0

  const avatarColor = (name: string) => {
    const colors = ['#3b82f6', '#7c3aed', '#16a34a', '#f59e0b', '#dc2626', '#0d9488']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* ── Premium hero header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-5 sm:p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Student Feedback</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Total {total} feedback entries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAnalytics}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--color-text-muted)' }}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap items-end mt-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                type="text"
                className="input input-sm w-full pl-9"
                placeholder="Search by student or course..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
            <select
              className="select select-sm"
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value)
                setPage(1)
              }}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">All Levels</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              className="select select-sm"
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value)
                setPage(1)
              }}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★</option>
              <option value="3">3 ★</option>
              <option value="2">2 ★</option>
              <option value="1">1 ★</option>
            </select>
            <select
              className="select select-sm"
              value={recommendationFilter}
              onChange={(e) => {
                setRecommendationFilter(e.target.value)
                setPage(1)
              }}
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">All Recommendations</option>
              {RECOMMENDATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="date"
                className="input input-sm"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>From</span>
              <input
                type="date"
                className="input input-sm"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>To</span>
            </div>
            <button
              onClick={resetFilters}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-text-muted)' }}
              title="Reset filters"
            >
              <X size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* ── Statistics cards ── */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="card shadow-sm rounded-2xl border-0 overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="card-body p-6">
                  <div className="animate-pulse flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-3 rounded w-24" style={{ backgroundColor: 'var(--color-border)' }}></div>
                      <div className="h-7 rounded w-16" style={{ backgroundColor: 'var(--color-border)' }}></div>
                    </div>
                    <div className="h-11 w-11 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : analyticsError ? (
          <div
            className="card shadow-sm rounded-2xl border-0 overflow-hidden"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="card-body p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-error)' }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Analytics unavailable</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{analyticsError}</p>
                </div>
              </div>
              <button
                className="btn btn-sm font-semibold"
                onClick={fetchAnalytics}
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<MessageSquare size={20} color="#fff" />}
              iconBg="linear-gradient(135deg, #3b82f6, #06b6d4)"
              value={analytics?.totalFeedback || 0}
              label="Total Feedback"
            />
            <StatCard
              icon={<Star size={20} color="#fff" />}
              iconBg="linear-gradient(135deg, #f59e0b, #fbbf24)"
              value={avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
              label="Average Rating"
            />
            <StatCard
              icon={<Star size={20} color="#fff" />}
              iconBg="linear-gradient(135deg, #eab308, #f59e0b)"
              value={kpiFiveStar}
              label="5★ Reviews"
            />
            <StatCard
              icon={<TrendingDown size={20} color="#fff" />}
              iconBg="linear-gradient(135deg, #ef4444, #f97316)"
              value={kpiLow}
              label="Low Ratings (1-2★)"
            />
          </div>
        )}

        {/* ── Main table card ── */}
        <div
          className="card shadow-sm rounded-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading ? (
            /* ── Premium skeleton ── */
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                <div
                  className="h-3 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--color-border)', width: '60%' }}
                />
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--color-border)', width: '100%' }}
                  />
                ))}
              </div>
            </div>
          ) : feedbackError ? (
            /* ── Professional retry card ── */
            <div className="p-6 flex flex-col items-center text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shrink-0"
                style={{ backgroundColor: 'rgba(226, 75, 74, 0.08)', color: 'var(--color-error)' }}
              >
                <AlertTriangle size={22} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                Something went wrong
              </h3>
              <p className="text-xs mb-4 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>
                {feedbackError}
              </p>
              <button
                onClick={fetchFeedbacks}
                className="btn btn-sm font-semibold gap-1.5"
                style={{ background: 'var(--color-accent)', color: '#fff', border: 'none' }}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          ) : feedbacks.length === 0 ? (
            /* ── Professional empty state ── */
            <div className="card-body items-center text-center py-14">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <MessageSquare size={32} />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {search || levelFilter || ratingFilter || recommendationFilter || dateFrom || dateTo
                  ? 'No feedback matches your search or filters.'
                  : 'There are no student feedback submissions yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-y-auto max-h-[460px]">
                <table className="table table-sm table-zebra w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Student', 'Course', 'Level', 'Score', 'Rating', 'Experience', 'Recommendation', 'Submitted', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="sticky top-0 z-20 text-xs font-semibold uppercase tracking-wider text-left py-3 px-4"
                          style={{
                            color: 'var(--color-text-muted)',
                            backgroundColor: 'var(--color-surface)',
                            boxShadow: '0 1px 0 var(--color-border)',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((f) => (
                      <tr
                        key={f._id}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                        onClick={() => setSelected(f)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                              style={{ backgroundColor: avatarColor(f.studentName) }}
                            >
                              {f.studentName?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                              {f.studentName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>{f.courseTitle}</td>
                        <td className="px-4 py-3">
                          <span
                            className="badge badge-sm font-semibold"
                            style={{
                              backgroundColor: getLevelBadgeStyle(f.level).bg,
                              color: getLevelBadgeStyle(f.level).text,
                              border: 'none',
                            }}
                          >
                            {LEVEL_LABELS[f.level] || f.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {f.examScore}%
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                            {renderStarVisual(f.rating)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {f.courseExperience}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {(() => {
                            const cfg = getRecommendationBadgeStyle(f.recommendation)
                            return (
                              <span
                                className="badge badge-sm font-semibold"
                                style={{ backgroundColor: cfg.bg, color: cfg.text, border: 'none' }}
                              >
                                {f.recommendation}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(f.submittedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelected(f)
                            }}
                            className="btn btn-ghost btn-xs"
                            style={{ color: 'var(--color-accent)' }}
                            title="View"
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
                {feedbacks.map((f) => (
                  <div
                    key={f._id}
                    className="p-4 space-y-3 cursor-pointer"
                    onClick={() => setSelected(f)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ backgroundColor: avatarColor(f.studentName) }}
                        >
                          {f.studentName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            {f.studentName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.courseTitle}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
                        {renderStarVisual(f.rating)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span
                        className="badge badge-sm"
                        style={{
                          backgroundColor: getLevelBadgeStyle(f.level).bg,
                          color: getLevelBadgeStyle(f.level).text,
                          border: 'none',
                        }}
                      >
                        {LEVEL_LABELS[f.level] || f.level}
                      </span>
                      <span>•</span>
                      <span>Score: {f.examScore}%</span>
                      <span>•</span>
                      <span>Submitted: {formatDate(f.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                >
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    Page {page} / {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost btn-xs"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      style={{ color: 'var(--color-text)' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      style={{ color: 'var(--color-text)' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Rating Distribution Chart ── */}
        <RatingDistributionChart
          ratingDistribution={analytics?.ratingDistribution}
          loading={analyticsLoading}
          error={analyticsError}
        />

        {/* ── Detail modal ── */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={() => setSelected(null)}
          >
            <div
              className="rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 flex items-center justify-between p-6 pb-4"
                style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
              >
                <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                  Feedback Details
                </h2>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => setSelected(null)}
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* ── User information section ── */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0"
                    style={{ backgroundColor: avatarColor(selected.studentName) }}
                  >
                    {selected.studentName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{selected.studentName}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selected.courseTitle}</p>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                    {renderStarVisual(selected.rating)}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {selected.rating} / 5 — {RATING_LABELS[selected.rating] || ''}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <DetailRow label="Level" value={LEVEL_LABELS[selected.level] || selected.level} />
                  <DetailRow label="Course" value={selected.courseTitle} />
                  <DetailRow
                    label="Exam Score"
                    value={`${selected.examScore}%`}
                  />
                  <DetailRow
                    label="Recommendation"
                    value={selected.recommendation}
                  />
                  <DetailRow
                    label="Submitted On"
                    value={formatDate(selected.submittedAt)}
                  />
                  <DetailRow label="Student ID" value={selected.userId || '—'} />
                </div>

                {/* ── Comment section ── */}
                <div className="space-y-4 pt-1">
                  <DetailRow label="Course Experience" value={selected.courseExperience} />
                  <DetailRow label="Learned Something" value={selected.learnedSomething} />
                  <DetailRow label="Lesson Understanding" value={selected.lessonUnderstanding} />
                  <DetailRow
                    label="Favorite Topics"
                    value={selected.favoriteParts.length > 0 ? selected.favoriteParts.join(', ') : '—'}
                  />
                  <DetailRow label="Improvement Suggestions" value={selected.improvementSuggestion} />
                  {selected.futureFeatures && <DetailRow label="Future Features" value={selected.futureFeatures} />}
                  {selected.additionalSuggestion && (
                    <DetailRow label="Additional Suggestions" value={selected.additionalSuggestion} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode
  iconBg: string
  value: string | number
  label: string
}) {
  return (
    <div
      className="card shadow-sm rounded-2xl transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className="card-body p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</p>
        </div>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{value}</p>
    </div>
  )
}
