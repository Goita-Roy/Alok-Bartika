import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import { FileText, Loader2, PlusCircle, Trash2, Edit3 } from 'lucide-react'

interface CourseItem {
  _id: string
  title: string
  level: string
}

interface LessonItem {
  _id: string
  title: string
  content: string
  order: number
  language: string
  videoUrl: string
  audioUrl: string
  starterCode: string
  expectedOutput: string
}

const emptyForm = {
  _id: '',
  title: '',
  content: '',
  order: 1,
  language: 'python',
  videoUrl: '',
  audioUrl: '',
  starterCode: '',
  expectedOutput: '',
}

export function AdminLessonsPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await api.get('/courses')
      const courseList = response.data?.data || []
      setCourses(courseList)
      if (!selectedCourseId && courseList[0]) {
        setSelectedCourseId(courseList[0]._id)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load courses')
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadLessons = async (courseId: string) => {
    if (!courseId) return
    try {
      setLoadingLessons(true)
      setError(null)
      const response = await api.get(`/lessons/course/${courseId}`)
      setLessons(response.data?.data || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load lessons')
    } finally {
      setLoadingLessons(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourseId) {
      loadLessons(selectedCourseId)
    }
  }, [selectedCourseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId) {
      setError('Select a course first')
      return
    }
    if (!form.title.trim()) {
      setError('Lesson title is required')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const payload = {
        courseId: selectedCourseId,
        title: form.title.trim(),
        content: form.content.trim(),
        order: Number(form.order) || 1,
        language: form.language,
        videoUrl: form.videoUrl.trim(),
        audioUrl: form.audioUrl.trim(),
        starterCode: form.starterCode.trim(),
        expectedOutput: form.expectedOutput.trim(),
      }

      if (form._id) {
        await api.put(`/lessons/${form._id}`, payload)
      } else {
        await api.post('/lessons', payload)
      }

      setForm(emptyForm)
      await loadLessons(selectedCourseId)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save lesson')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (lesson: LessonItem) => {
    setForm({
      _id: lesson._id,
      title: lesson.title,
      content: lesson.content,
      order: lesson.order || 1,
      language: lesson.language,
      videoUrl: lesson.videoUrl,
      audioUrl: lesson.audioUrl,
      starterCode: lesson.starterCode,
      expectedOutput: lesson.expectedOutput,
    })
  }

  const handleDelete = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await api.delete(`/lessons/${lessonId}`)
      await loadLessons(selectedCourseId)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete lesson')
    }
  }

  const selectedCourse = courses.find(course => course._id === selectedCourseId)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Lesson Management</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create and organize lesson content for each course</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="btn btn-sm btn-outline"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <PlusCircle size={16} />
            New lesson
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
                <FileText size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-lg font-semibold">{form._id ? 'Edit lesson' : 'Create lesson'}</h2>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Course</label>
                {loadingCourses ? (
                  <div className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Loading courses…</div>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="select select-sm w-full mt-1"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input input-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="textarea textarea-sm w-full mt-1"
                  rows={4}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 1 })}
                    className="input input-sm w-full mt-1"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="select select-sm w-full mt-1"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Video URL</label>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    className="input input-sm w-full mt-1"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Audio URL</label>
                  <input
                    value={form.audioUrl}
                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                    className="input input-sm w-full mt-1"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Starter code</label>
                <textarea
                  value={form.starterCode}
                  onChange={(e) => setForm({ ...form, starterCode: e.target.value })}
                  className="textarea textarea-sm w-full mt-1"
                  rows={3}
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Expected output</label>
                <input
                  value={form.expectedOutput}
                  onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })}
                  className="input input-sm w-full mt-1"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="flex gap-2">
                <button className="btn btn-sm btn-primary" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  {form._id ? 'Update lesson' : 'Save lesson'}
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
            <div className="rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Selected course:</span>{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{selectedCourse?.title || '—'}</span>
            </div>

            {loadingLessons ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading lessons…</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No lessons yet for this course. Add the first one to start teaching.</p>
              </div>
            ) : (
              lessons.map(lesson => (
                <div key={lesson._id} className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="card-body flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{lesson.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lesson.content || 'No content added yet'}</p>
                      </div>
                      <span className="badge badge-sm" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>#{lesson.order}</span>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleEdit(lesson)}>
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleDelete(lesson._id)}>
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
