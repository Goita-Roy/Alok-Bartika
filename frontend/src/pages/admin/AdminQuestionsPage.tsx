import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import api from '../../config/api'
import { ClipboardList, Loader2, Save } from 'lucide-react'

interface CourseItem {
  _id: string
  title: string
  level: string
}

interface ExamFormState {
  _id?: string
  title: string
  description: string
  passingScore: number
  timeLimitMinutes: number
  isActive: boolean
  courseId: string
  questionsText: string
}

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const buildDefaultForm = (courseId: string): ExamFormState => ({
  title: '',
  description: '',
  passingScore: 60,
  timeLimitMinutes: 30,
  isActive: true,
  courseId,
  questionsText: '[{"type":"mcq","questionText":"Sample question","options":["Option A","Option B"],"correctAnswer":"Option A","points":1}]',
})

export function AdminQuestionsPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [examForms, setExamForms] = useState<Record<string, ExamFormState>>({})
  const [loading, setLoading] = useState(true)
  const [savingLevel, setSavingLevel] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses')
      const courseList = response.data?.data || []
      setCourses(courseList)

      const initialState: Record<string, ExamFormState> = {}
      LEVELS.forEach(level => {
        const matchingCourse = courseList.find((course: CourseItem) => course.level === level.value)
        initialState[level.value] = buildDefaultForm(matchingCourse?._id || '')
      })
      setExamForms(initialState)

      await Promise.all(LEVELS.map(async level => {
        try {
          const res = await api.get(`/exams/level/${level.value}`)
          const exam = res.data
          const matchingCourse = courseList.find((course: CourseItem) => course.level === level.value)
          if (exam) {
            initialState[level.value] = {
              _id: exam._id,
              title: exam.title || '',
              description: exam.description || '',
              passingScore: exam.passingScore || 60,
              timeLimitMinutes: exam.timeLimitMinutes || 30,
              isActive: exam.isActive !== false,
              courseId: matchingCourse?._id || exam.courseId || '',
              questionsText: JSON.stringify(exam.questions || [], null, 2),
            }
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.error(err)
          }
        }
      }))

      setExamForms(initialState)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const updateForm = (level: string, updates: Partial<ExamFormState>) => {
    setExamForms(prev => ({ ...prev, [level]: { ...(prev[level] || buildDefaultForm('')), ...updates } }))
  }

  const handleSave = async (level: string) => {
    const form = examForms[level]
    if (!form) return
    if (!form.courseId) {
      setError('Select a course for this exam level first')
      return
    }
    if (!form.title.trim()) {
      setError('Exam title is required')
      return
    }

    try {
      setSavingLevel(level)
      setError(null)
      setSuccess(null)

      let questions = []
      try {
        questions = JSON.parse(form.questionsText)
      } catch {
        throw new Error('Questions must be valid JSON')
      }

      const payload = {
        courseId: form.courseId,
        level,
        title: form.title.trim(),
        description: form.description.trim(),
        passingScore: Number(form.passingScore),
        timeLimitMinutes: Number(form.timeLimitMinutes),
        isActive: form.isActive,
        questions,
      }

      const response = form._id
        ? await api.put(`/exams/${form._id}`, payload)
        : await api.post('/exams', payload)

      const savedExam = response.data?.data || response.data
      updateForm(level, {
        _id: savedExam?._id || form._id,
        title: savedExam?.title || form.title,
        description: savedExam?.description || form.description,
        passingScore: savedExam?.passingScore || form.passingScore,
        timeLimitMinutes: savedExam?.timeLimitMinutes || form.timeLimitMinutes,
        isActive: savedExam?.isActive ?? form.isActive,
      })
      setSuccess(`${level} exam saved successfully`)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save exam')
    } finally {
      setSavingLevel(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Question and Exam Management</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Create and update the active exam for each learning level</p>
        </div>

        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(16,185,129,0.08)', color: '#047857' }}>
            {success}
          </div>
        )}

        {loading ? (
          <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading exams…</p>
          </div>
        ) : (
          LEVELS.map(level => {
            const form = examForms[level.value]
            return (
              <div key={level.value} className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="card-body gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={18} style={{ color: 'var(--color-accent)' }} />
                      <h2 className="text-lg font-semibold">{level.label} exam</h2>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => handleSave(level.value)} disabled={savingLevel === level.value}>
                      {savingLevel === level.value ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save
                    </button>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Course</label>
                      <select
                        value={form?.courseId || ''}
                        onChange={(e) => updateForm(level.value, { courseId: e.target.value })}
                        className="select select-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      >
                        <option value="">Select a course</option>
                        {courses.filter(course => course.level === level.value).map(course => (
                          <option key={course._id} value={course._id}>{course.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Title</label>
                      <input
                        value={form?.title || ''}
                        onChange={(e) => updateForm(level.value, { title: e.target.value })}
                        className="input input-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                    <textarea
                      value={form?.description || ''}
                      onChange={(e) => updateForm(level.value, { description: e.target.value })}
                      className="textarea textarea-sm w-full mt-1"
                      rows={3}
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Passing score</label>
                      <input
                        type="number"
                        value={form?.passingScore || 60}
                        onChange={(e) => updateForm(level.value, { passingScore: Number(e.target.value) || 60 })}
                        className="input input-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Time limit (min)</label>
                      <input
                        type="number"
                        value={form?.timeLimitMinutes || 30}
                        onChange={(e) => updateForm(level.value, { timeLimitMinutes: Number(e.target.value) || 30 })}
                        className="input input-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Active</label>
                      <select
                        value={form?.isActive ? 'true' : 'false'}
                        onChange={(e) => updateForm(level.value, { isActive: e.target.value === 'true' })}
                        className="select select-sm w-full mt-1"
                        style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Questions (JSON)</label>
                    <textarea
                      value={form?.questionsText || ''}
                      onChange={(e) => updateForm(level.value, { questionsText: e.target.value })}
                      className="textarea textarea-sm w-full mt-1 font-mono text-xs"
                      rows={10}
                      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                      placeholder='[{"type":"mcq","questionText":"...","options":["A","B"],"correctAnswer":"A","points":1}]'
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </AdminLayout>
  )
}
