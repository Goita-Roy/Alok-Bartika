import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import { BookOpen, Edit3, Loader2, PlusCircle, Trash2 } from 'lucide-react'

interface CourseItem {
  _id: string
  title: string
  level: string
  description: string
  thumbnailUrl: string
  createdAt: string
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const emptyForm = {
  _id: '',
  title: '',
  level: 'beginner',
  description: '',
  thumbnailUrl: '',
}

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/courses')
      setCourses(response.data?.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

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
      }

      if (form._id) {
        await api.put(`/courses/${form._id}`, payload)
      } else {
        await api.post('/courses', payload)
      }

      setForm(emptyForm)
      await loadCourses()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save course')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (course: CourseItem) => {
    setForm({
      _id: course._id,
      title: course.title,
      level: course.level,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
    })
  }

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Delete this course and its lessons?')) return
    try {
      await api.delete(`/courses/${courseId}`)
      await loadCourses()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete course')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Course Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create, edit, and organize learning courses</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="btn btn-sm btn-outline"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <PlusCircle size={16} />
            New course
          </button>
        </div>

        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="card shadow-sm"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="card-body gap-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg font-semibold">{form._id ? 'Edit course' : 'Create course'}</h2>
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
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="select select-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  {LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
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
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  className="input input-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  placeholder="https://..."
                />
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

          <div className="space-y-4">
            {loading ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading courses…</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No courses yet. Create the first one to start building the learning path.</p>
              </div>
            ) : (
              courses.map(course => (
                <div key={course._id} className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="card-body flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{course.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{course.description || 'No description yet'}</p>
                      </div>
                      <span className="badge badge-sm" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{course.thumbnailUrl ? 'Has thumbnail' : 'No thumbnail'}</span>
                      <span>•</span>
                      <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleEdit(course)}>
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleDelete(course._id)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
