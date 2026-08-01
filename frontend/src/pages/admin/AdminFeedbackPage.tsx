import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { RatingDistributionChart } from '../../components/admin/feedback/RatingDistributionChart'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import {
  Search, Star, MessageSquare, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, Calendar, Filter,
  TrendingUp, Users, BarChart3, Activity,
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
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মাঝারি',
  advanced: 'উন্নত',
}

const RATING_LABELS: Record<number, string> = {
  1: 'খারাপ',
  2: 'গড়',
  3: 'ভালো',
  4: 'খুব ভালো',
  5: 'চমৎকার',
}

const LEVEL_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  beginner: { bg: '#dcfce7', text: '#16a34a' },
  intermediate: { bg: '#dbeafe', text: '#2563eb' },
  advanced: { bg: '#ede9fe', text: '#7c3aed' },
}

const RATING_BADGE_STYLES: Record<number, { bg: string; text: string }> = {
  5: { bg: '#dcfce7', text: '#15803d' },
  4: { bg: '#dbeafe', text: '#2563eb' },
  3: { bg: '#fef3c7', text: '#d97706' },
  2: { bg: '#ffedd5', text: '#ea580c' },
  1: { bg: '#fee2e2', text: '#dc2626' },
}

const RECOMMENDATION_BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  recommended: { bg: '#dcfce7', text: '#15803d' },
  notRecommended: { bg: '#fee2e2', text: '#dc2626' },
}

export function AdminFeedbackPage() {
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

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      const res = await fetch(`${API_BASE_URL}/feedback/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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

      const res = await fetch(`${API_BASE_URL}/feedback/admin/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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

  useEffect(() => {
    if (token) {
      fetchFeedbacks()
      fetchAnalytics()
    }
  }, [token])

  useEffect(() => {
    setPage(1)
    fetchFeedbacks()
  }, [search, levelFilter, ratingFilter, recommendationFilter, dateFrom, dateTo])

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const averageRating = analytics?.averageRating ?? 0
  const recommendationPercentage = analytics?.recommendationPercentage ?? 0

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

  const getLevelBadgeStyle = (level: string) => LEVEL_BADGE_STYLES[level] || { bg: 'var(--color-accent-pale)', text: 'var(--color-accent)' }
  const getRatingBadgeStyle = (rating: number) => RATING_BADGE_STYLES[rating] || { bg: '#f3f4f6', text: '#6b7280' }
  const getRecommendationBadgeStyle = (recommendation: string) => {
    const normalized = recommendation?.toLowerCase().includes('অবশ্যই') || recommendation?.toLowerCase().includes('সম্ভবত')
      ? 'recommended'
      : 'notRecommended'
    return RECOMMENDATION_BADGE_STYLES[normalized] || { bg: '#f3f4f6', text: '#6b7280' }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              শিক্ষার্থীর মতামত
            </h1>
            <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-text-muted)' }}>
              মোট {total} টি মতামত
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        {analyticsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="animate-pulse flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-3 rounded w-24" style={{ backgroundColor: 'var(--color-border)' }}></div>
                      <div className="h-8 rounded w-20" style={{ backgroundColor: 'var(--color-border)' }}></div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl" style={{ backgroundColor: 'var(--color-border)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : analyticsError ? (
          <div className="card shadow-sm rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Analytics unavailable</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{analyticsError}</p>
                </div>
              </div>
              <button className="btn btn-sm" onClick={fetchAnalytics} style={{ backgroundColor: 'var(--color-accent)', color: '#fff', border: 'none' }}>
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>মোট মতামত</p>
                      <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>{analytics?.totalFeedback || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                      <MessageSquare size={20} color="#fff" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>গড় রেটিং</p>
                      <p className="text-3xl font-bold" style={{ color: '#f59e0b' }}>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                      <Star size={20} color="#fff" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>সুপারিশ %</p>
                      <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{recommendationPercentage > 0 ? recommendationPercentage : 0}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                      <TrendingUp size={20} color="#fff" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative card shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl border-0 overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>লেভেল অনুযায়ী</p>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                            <Users size={14} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{analytics?.feedbackByLevel?.beginner || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                            <Users size={14} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{analytics?.feedbackByLevel?.intermediate || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1" style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
                            <Users size={14} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{analytics?.feedbackByLevel?.advanced || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input input-sm w-full pl-9"
              placeholder="শিক্ষার্থী বা কোর্স দ্বারা অনুসন্ধান..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <select
            className="select select-sm"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="">সব লেভেল</option>
            <option value="beginner">শিক্ষানবিশ</option>
            <option value="intermediate">মাঝারি</option>
            <option value="advanced">উন্নত</option>
          </select>
          <select
            className="select select-sm"
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="">সব রেটিং</option>
            <option value="5">৫ ★</option>
            <option value="4">৪ ★</option>
            <option value="3">৩ ★</option>
            <option value="2">২ ★</option>
            <option value="1">১ ★</option>
          </select>
          <select
            className="select select-sm"
            value={recommendationFilter}
            onChange={e => setRecommendationFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="">সব সুপারিশ</option>
            <option value="অবশ্যই করব">অবশ্যই করব</option>
            <option value="সম্ভবত করব">সম্ভবত করব</option>
            <option value="নিশ্চিত নই">নিশ্চিত নই</option>
            <option value="না, করব না">না, করব না</option>
          </select>
          <div className="flex items-center gap-2">
            <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="date"
              className="input input-sm"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>থেকে</span>
            <input
              type="date"
              className="input input-sm"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        </div>

        {/* Content */}
        <div
          className="card shadow-sm overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="card-body items-center text-center py-16">
              <MessageSquare size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                কোনো মতামত পাওয়া যায়নি
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['শিক্ষার্থী', 'কোর্স', 'লেভেল', 'স্কোর', 'রেটিং', 'অভিজ্ঞতা', 'সুপারিশ', 'তারিখ'].map(h => (
                      <th
                        key={h}
                        className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                        style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(f => (
                    <tr
                      key={f._id}
                      style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
                      onClick={() => setSelected(f)}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {f.studentName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text)' }}>
                        {f.courseTitle}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="badge badge-sm font-semibold"
                          style={{
                            backgroundColor: 'var(--color-accent-pale)',
                            color: 'var(--color-accent)',
                            border: 'none',
                          }}
                        >
                          {LEVEL_LABELS[f.level] || f.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        {f.examScore}%
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#F59E0B' }}>
                        {renderStars(f.rating)}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {f.courseExperience}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {f.recommendation}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(f.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                পৃষ্ঠা {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-xs"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ color: 'var(--color-text)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ color: 'var(--color-text)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rating Distribution Chart */}
        <RatingDistributionChart
          ratingDistribution={analytics?.ratingDistribution}
          loading={analyticsLoading}
          error={analyticsError}
        />

        {/* Detail modal */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelected(null)}
          >
            <div
              className="rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 flex items-center justify-between p-6 pb-4" style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
                  মতামতের বিবরণ
                </h2>
                <button className="btn btn-ghost btn-xs" onClick={() => setSelected(null)} style={{ color: 'var(--color-text-muted)' }}>
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <DetailRow label="শিক্ষার্থীর নাম" value={selected.studentName} />
                <DetailRow label="কোর্স" value={selected.courseTitle} />
                <DetailRow label="লেভেল" value={LEVEL_LABELS[selected.level] || selected.level} />
                <DetailRow label="পরীক্ষার স্কোর" value={`${selected.examScore}%`} />
                <DetailRow
                  label="রেটিং"
                  value={`${renderStars(selected.rating)} (${RATING_LABELS[selected.rating] || selected.rating})`}
                />
                <DetailRow label="কোর্সের অভিজ্ঞতা" value={selected.courseExperience} />
                <DetailRow label="শেখার অভিজ্ঞতা" value={selected.learnedSomething} />
                <DetailRow label="পাঠ বোঝার মাত্রা" value={selected.lessonUnderstanding} />
                <DetailRow
                  label="পছন্দের বিষয়"
                  value={selected.favoriteParts.length > 0 ? selected.favoriteParts.join(', ') : '—'}
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    উন্নতির পরামর্শ
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {selected.improvementSuggestion}
                  </p>
                </div>
                {selected.futureFeatures && (
                  <DetailRow label="ভবিষ্যতের ফিচার" value={selected.futureFeatures} />
                )}
                <DetailRow label="সুপারিশ" value={selected.recommendation} />
                {selected.additionalSuggestion && (
                  <DetailRow label="অতিরিক্ত পরামর্শ" value={selected.additionalSuggestion} />
                )}
                <DetailRow label="জমা দেওয়ার তারিখ" value={formatDate(selected.submittedAt)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
        {value}
      </p>
    </div>
  )
}
