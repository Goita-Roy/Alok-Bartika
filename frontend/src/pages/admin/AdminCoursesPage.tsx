import { useState, useEffect, useCallback } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { ThumbnailPreview } from '../../components/admin/ThumbnailPreview'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'
import type { Course, CourseStatus } from '../../types/course'
import {
  BookOpen, Edit3, Loader2, Trash2, Search,
  AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
  CheckSquare, Square,
} from 'lucide-react'

interface CourseSummary {
  total: number
  beginner: number
  intermediate: number
  advanced: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface CourseItem {
  _id: string
  title: string
  level: string
  description: string
  thumbnailUrl: string
  status: string
  createdAt?: string
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const emptyForm: CourseItem = {
  _id: '',
  title: '',
  level: 'beginner',
  description: '',
  thumbnailUrl: '',
  status: 'draft',
  createdAt: '',
}

function toCourse(item: any): Course {
  return {
    _id: item._id,
    title: item.title,
    level: item.level,
    description: item.description,
    thumbnailUrl: item.thumbnailUrl,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lessonCount: item.lessonCount,
    status: item.status || 'draft',
  }
}

export function AdminCoursesPage() {
  const { token } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<CourseItem>(emptyForm)

  // Search / filter / sort / pagination state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 })
  const [summary, setSummary] = useState<CourseSummary>({ total: 0, beginner: 0, intermediate: 0, advanced: 0 })

  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkActionTarget, setBulkActionTarget] = useState<{ action: 'delete'; ids: string[] } | null>(null)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider py-3 px-4 text-left transition-colors"
      style={{
        color: 'var(--color-text-muted)',
        backgroundColor: 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
      }}
    >
      {label}
      {sortBy === field && (
        <span style={{ color: 'var(--color-accent)' }}>
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  )

  const loadCourses = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '25')
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (levelFilter !== 'all') params.set('level', levelFilter)
      params.set('status', statusFilter)
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('sortOrder', sortOrder)

      const res = await fetch(`${API_BASE_URL}/courses?${params.toString()}`, { headers })
      if (!res.ok) throw new Error('Failed to load courses')
      const json = await res.json()

      setCourses((json.data || []).map(toCourse))
      setPagination(json.pagination || { page: 1, limit: 25, total: 0, pages: 0 })

      if (json.summary) {
        setSummary({
          total: json.summary.total || 0,
          beginner: json.summary.beginner || 0,
          intermediate: json.summary.intermediate || 0,
          advanced: json.summary.advanced || 0,
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, levelFilter, statusFilter, sortBy, sortOrder, token])

  useEffect(() => {
    loadCourses(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, levelFilter, statusFilter, sortBy, sortOrder, token])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Course title is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const payload = {
        title: form.title.trim(),
        level: form.level,
        description: form.description.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        status: form.status,
      }

      let res: Response
      if (form._id) {
        res = await fetch(`${API_BASE_URL}/courses/${form._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`${API_BASE_URL}/courses`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })
      }

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to save course')

      showToast(json.message || 'Course saved', 'success')
      setForm(emptyForm)
      await loadCourses(pagination.page)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save course', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (course: Course) => {
    setForm({
      _id: course._id,
      title: course.title,
      level: course.level,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status || 'draft',
      createdAt: course.createdAt,
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await fetch(`${API_BASE_URL}/courses/${deleteTarget._id}`, {
        method: 'DELETE',
        headers,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to delete course')
      showToast(json.message || 'Course deleted', 'success')
      setDeleteTarget(null)
      await loadCourses(pagination.page)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to delete course', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'beginner': return '#3b82f6'
      case 'intermediate': return '#f59e0b'
      case 'advanced': return '#dc2626'
      default: return 'var(--color-text-muted)'
    }
  }

  const getStatusColor = (status: string): string => {
    return status === 'published' ? '#22c55e' : '#f59e0b'
  }

  const handleBulkDelete = async () => {
    if (!bulkActionTarget) return
    setBulkProcessing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/courses/bulk/delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids: bulkActionTarget.ids }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Request failed')
      showToast(json.message, 'success')
      setBulkActionTarget(null)
      setSelectedIds(new Set())
      await loadCourses(pagination.page)
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Request failed', 'error')
    } finally {
      setBulkProcessing(false)
    }
  }

  // Clear selection when courses or filters change
  useEffect(() => {
    setSelectedIds(new Set())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, debouncedSearch, levelFilter, statusFilter, sortBy, sortOrder])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === courses.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(courses.map((c) => c._id)))
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return '—'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Course Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create, edit, and organize learning courses</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => loadCourses(pagination.page)}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Courses', value: summary.total, icon: BookOpen, color: '#3b82f6' },
            { label: 'Beginner', value: summary.beginner, icon: BookOpen, color: '#3b82f6' },
            { label: 'Intermediate', value: summary.intermediate, icon: BookOpen, color: '#f59e0b' },
            { label: 'Advanced', value: summary.advanced, icon: BookOpen, color: '#dc2626' },
          ].map(c => {
            const Icon = c.icon
            return (
              <div
                key={c.label}
                className="group card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: `${c.color}15` }}
                    >
                      <Icon size={20} style={{ color: c.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{c.label}</p>
                      <p className="text-2xl font-bold" style={{ color: c.color }}>{c.value}</p>
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
                    {c.label === 'Total Courses' ? 'All courses in the platform' : 'Courses at this level'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              className="input input-sm w-full pl-9"
              placeholder="Search by title or description..."
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
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <select
            className="select select-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(226,75,74,0.10)', color: 'var(--color-error)' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* Create / Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="card shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="card-body gap-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {form._id ? 'Edit course' : 'Create course'}
                </h2>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Course title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input input-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  placeholder="e.g. Python Basics"
                />
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as Course['level'] })}
                  className="select select-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  {LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })}
                  className="select select-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="textarea textarea-sm w-full mt-1"
                  rows={4}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  placeholder="Short overview of the learning experience"
                />
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Thumbnail URL</label>
                <div className="flex items-start gap-3 mt-1">
                  <ThumbnailPreview url={form.thumbnailUrl} alt={form.title || 'Course thumbnail'} size="md" />
                  <input
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                    className="input input-sm w-full"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-sm btn-primary" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {form._id ? 'Update course' : 'Save course'}
                </button>
                {form._id ? (
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setForm(emptyForm)}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>

          {/* Course List / Table */}
          <div className="space-y-4">
            {/* Bulk Action Toolbar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                  {selectedIds.size} course{selectedIds.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBulkActionTarget({ action: 'delete', ids: Array.from(selectedIds) })}
                    className="btn btn-sm btn-error"
                    disabled={bulkProcessing}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading courses…</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {debouncedSearch || levelFilter !== 'all'
                    ? 'No courses match your search or filter criteria'
                    : 'No courses yet. Create the first one to start building the learning path.'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block card shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                          <th key="Select" className="px-4 py-3 text-center" style={{ backgroundColor: 'transparent' }}>
                            <button
                              onClick={selectAll}
                              className="btn btn-ghost btn-xs"
                              style={{ color: selectedIds.size === courses.length && courses.length > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            >
                              {selectedIds.size === courses.length && courses.length > 0
                                ? <CheckSquare size={16} />
                                : <Square size={16} style={{ opacity: 0.4 }} />}
                            </button>
                          </th>
                          <th key="Title" style={{ backgroundColor: 'transparent' }}>
                            <SortableHeader field="title" label="Course Title" />
                          </th>
                          <th key="Level" style={{ backgroundColor: 'transparent' }}>
                            <SortableHeader field="level" label="Level" />
                          </th>
                          <th key="Status" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                            style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Status</th>
                          <th key="Lessons" className="text-xs font-semibold uppercase tracking-wider py-3 px-4"
                            style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Lessons</th>
                          <th key="CreatedDate" style={{ backgroundColor: 'transparent' }}>
                            <SortableHeader field="createdAt" label="Created Date" />
                          </th>
                          <th key="Actions" className="text-xs font-semibold uppercase tracking-wider py-3 px-4 text-center"
                            style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map(course => (
                          <tr key={course._id}
                            className="hover:bg-accent/30 transition-colors duration-150"
                            style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => toggleSelect(course._id)}
                                className="btn btn-ghost btn-xs"
                                style={{ color: selectedIds.has(course._id) ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                              >
                                {selectedIds.has(course._id)
                                  ? <CheckSquare size={14} />
                                  : <Square size={14} style={{ opacity: 0.4 }} />}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                                  <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{course.title}</p>
                                  {course.description && (
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{course.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="badge badge-sm font-semibold capitalize"
                                style={{
                                  backgroundColor: `${getLevelColor(course.level)}20`,
                                  color: getLevelColor(course.level),
                                  border: 'none',
                                }}
                              >
                                {course.level}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className="badge badge-sm font-semibold capitalize"
                                style={{
                                  backgroundColor: `${getStatusColor(course.status || 'draft')}20`,
                                  color: getStatusColor(course.status || 'draft'),
                                  border: 'none',
                                }}
                              >
                                {course.status || 'draft'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {course.lessonCount ?? 0}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {formatDate(course.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => handleEdit(course)}
                                  style={{ color: 'var(--color-accent)' }}
                                  title="Edit"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-ghost"
                                  onClick={() => setDeleteTarget(course)}
                                  style={{ color: 'var(--color-error)' }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {courses.map(course => (
                    <div
                      key={course._id}
                      className="card shadow-sm"
                      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="card-body flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleSelect(course._id)}
                              className="btn btn-ghost btn-xs"
                              style={{ color: selectedIds.has(course._id) ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                            >
                              {selectedIds.has(course._id)
                                ? <CheckSquare size={14} />
                                : <Square size={14} style={{ opacity: 0.4 }} />}
                            </button>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                              <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                            </div>
                            <div>
                              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{course.title}</h3>
                              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                {course.description || 'No description yet'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className="badge badge-sm font-semibold capitalize"
                              style={{
                                backgroundColor: `${getStatusColor(course.status || 'draft')}20`,
                                color: getStatusColor(course.status || 'draft'),
                                border: 'none',
                              }}
                            >
                              {course.status || 'draft'}
                            </span>
                            <span
                              className="badge badge-sm font-semibold capitalize"
                              style={{
                                backgroundColor: `${getLevelColor(course.level)}20`,
                                color: getLevelColor(course.level),
                                border: 'none',
                              }}
                            >
                              {course.level}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <span>{course.lessonCount ?? 0} lessons</span>
                          <span aria-hidden="true">•</span>
                          <span>{formatDate(course.createdAt)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleEdit(course)}>
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={() => setDeleteTarget(course)}
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-1">
              <button
                className="btn btn-sm btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => loadCourses(pagination.page - 1)}
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let page: number
                if (pagination.pages <= 5) {
                  page = i + 1
                } else if (pagination.page <= 3) {
                  page = i + 1
                } else if (pagination.page >= pagination.pages - 2) {
                  page = pagination.pages - 4 + i
                } else {
                  page = pagination.page - 2 + i
                }
                return (
                  <button
                    key={page}
                    className={`btn btn-sm ${page === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => loadCourses(page)}
                    style={page === pagination.page ? { border: 'none' } : { color: 'var(--color-text-muted)' }}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                className="btn btn-sm btn-ghost"
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadCourses(pagination.page + 1)}
                style={{ color: 'var(--color-text-muted)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTarget && (
          <div className="modal modal-open" onClick={() => !deleting && setDeleteTarget(null)}>
            <div
              className="modal-box max-w-sm"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}>
                  <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Delete Course?</h3>
                <div className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <ThumbnailPreview url={deleteTarget.thumbnailUrl} alt={deleteTarget.title} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{deleteTarget.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span
                        className="badge badge-xs font-semibold capitalize"
                        style={{
                          backgroundColor: `${getLevelColor(deleteTarget.level)}20`,
                          color: getLevelColor(deleteTarget.level),
                          border: 'none',
                        }}
                      >
                        {deleteTarget.level}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {deleteTarget.lessonCount ?? 0} lesson{deleteTarget.lessonCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  This action is permanent. Deleting <strong>{deleteTarget.title}</strong> will also permanently delete all <strong>{deleteTarget.lessonCount ?? 0} lessons</strong> in it. This cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error font-semibold"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {bulkActionTarget && (
          <div className="modal modal-open" onClick={() => !bulkProcessing && setBulkActionTarget(null)}>
            <div
              className="modal-box max-w-sm"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(226,75,74,0.10)' }}>
                  <Trash2 size={24} style={{ color: 'var(--color-error)' }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                  Delete {bulkActionTarget.ids.length} Course{bulkActionTarget.ids.length !== 1 ? 's' : ''}?
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  This action is permanent. Deleting these {bulkActionTarget.ids.length} course{bulkActionTarget.ids.length !== 1 ? 's' : ''} will also permanently delete all lessons in them. This cannot be undone.
                </p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setBulkActionTarget(null)}
                  disabled={bulkProcessing}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error font-semibold"
                  onClick={handleBulkDelete}
                  disabled={bulkProcessing}
                >
                  {bulkProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="toast toast-end toast-bottom z-50">
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
              style={{ border: 'none' }}>
              {toast.message}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
