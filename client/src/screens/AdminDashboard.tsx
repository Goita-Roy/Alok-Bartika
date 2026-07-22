import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type Tab = 'students' | 'courses' | 'lessons' | 'progress' | 'analytics'
type Student = { id: string; fullName: string; email: string; phone: string; student?: Record<string, string> }
type Course = { _id?: string; id?: string; title: string; description: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; order?: number; published?: boolean }
type Lesson = { _id?: string; id?: string; courseId: string; title: string; slug: string; order?: number; practice?: { prompt?: string; starterCode?: string } }
type ProgressRow = { id: string; studentName: string; courseTitle: string; lessonTitle: string; score: number; completedAt: string | null; modes: { reading?: boolean; video?: boolean; practice?: boolean } }
type Analytics = { totalStudents: number; avgScores: number; mostAttemptedLessons: Array<{ lessonId: string; title: string; attempts: number }> }
type CourseForm = { title: string; description: string; level: Course['level']; order: number }

const inputCls = 'w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white/30'

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('analytics')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    institution: '',
    department: '',
    batch: '',
    roll: '',
    address: '',
    guardianName: '',
    guardianPhone: '',
  })
  const [courseForm, setCourseForm] = useState<CourseForm>({ title: '', description: '', level: 'Beginner', order: 0 })
  const [lessonForm, setLessonForm] = useState({ courseId: '', title: '', slug: '', prompt: '', starterCode: '' })

  async function loadAll() {
    setBusy(true)
    setError(null)
    try {
      const [s, c, l, p, a] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/api/admin/courses'),
        api.get('/api/admin/lessons'),
        api.get('/api/admin/progress'),
        api.get('/api/admin/analytics'),
      ])
      setStudents(s.data?.students ?? [])
      setCourses(c.data?.courses ?? [])
      setLessons(l.data?.lessons ?? [])
      setProgressRows(p.data?.progress ?? [])
      setAnalytics(a.data?.analytics ?? null)
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to load admin data')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function createStudent() {
    setBusy(true)
    setError(null)
    try {
      await api.post('/api/admin/students', studentForm)
      setStudentForm({ fullName: '', email: '', phone: '', password: '', institution: '', department: '', batch: '', roll: '', address: '', guardianName: '', guardianPhone: '' })
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to create student')
      setBusy(false)
    }
  }

  async function deleteStudent(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api.delete(`/api/admin/students/${id}`)
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to delete student')
      setBusy(false)
    }
  }

  async function createCourse() {
    setBusy(true)
    setError(null)
    try {
      await api.post('/api/admin/courses', courseForm)
      setCourseForm({ title: '', description: '', level: 'Beginner', order: 0 })
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to create course')
      setBusy(false)
    }
  }

  async function deleteCourse(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api.delete(`/api/admin/courses/${id}`)
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to delete course')
      setBusy(false)
    }
  }

  async function createLesson() {
    setBusy(true)
    setError(null)
    try {
      await api.post('/api/admin/lessons', {
        courseId: lessonForm.courseId,
        title: lessonForm.title,
        slug: lessonForm.slug,
        reading: { markdown: lessonForm.prompt || 'Lesson notes' },
        video: { url: '' },
        practice: { prompt: lessonForm.prompt, starterCode: lessonForm.starterCode },
      })
      setLessonForm({ courseId: '', title: '', slug: '', prompt: '', starterCode: '' })
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to create lesson')
      setBusy(false)
    }
  }

  async function deleteLesson(id: string) {
    setBusy(true)
    setError(null)
    try {
      await api.delete(`/api/admin/lessons/${id}`)
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to delete lesson')
      setBusy(false)
    }
  }

  const completion = useMemo(() => {
    const done = progressRows.filter((x) => x.completedAt).length
    return progressRows.length ? Math.round((done / progressRows.length) * 100) : 0
  }, [progressRows])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin Panel</h2>
      <div className="flex flex-wrap gap-2">
        {(['analytics', 'students', 'courses', 'lessons', 'progress'] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-white text-zinc-950' : 'bg-white/10 text-zinc-200 hover:bg-white/20'}`}>
            {t}
          </button>
        ))}
        <button type="button" onClick={loadAll} className="rounded-md bg-sky-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-sky-300">
          Refresh
        </button>
      </div>
      {error ? <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">{error}</div> : null}
      {busy ? <div className="text-xs text-zinc-400">Loading...</div> : null}

      {tab === 'analytics' && analytics ? (
        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-zinc-400">Total students</div><div className="mt-1 text-2xl font-bold">{analytics.totalStudents}</div></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-zinc-400">Avg scores</div><div className="mt-1 text-2xl font-bold">{analytics.avgScores}</div></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="text-xs text-zinc-400">Completion rate</div><div className="mt-1 text-2xl font-bold">{completion}%</div></div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-3">
            <div className="text-sm font-semibold">Most attempted lessons</div>
            <div className="mt-2 grid gap-2">
              {analytics.mostAttemptedLessons.map((l) => (
                <div key={l.lessonId} className="flex items-center justify-between rounded-md border border-white/10 bg-zinc-950/40 px-3 py-2 text-xs">
                  <span>{l.title}</span>
                  <span className="text-zinc-400">{l.attempts} attempts</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'students' ? (
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Create student</div>
            <div className="mt-3 grid gap-2">
              {Object.entries(studentForm).map(([k, v]) => (
                <input key={k} value={v} placeholder={k} type={k === 'password' ? 'password' : 'text'} onChange={(e) => setStudentForm((prev) => ({ ...prev, [k]: e.target.value }))} className={inputCls} />
              ))}
              <button type="button" onClick={createStudent} className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300">Add student</button>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Students ({students.length})</div>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
              {students.map((s) => (
                <div key={s.id} className="rounded-md border border-white/10 bg-zinc-950/40 p-3 text-xs">
                  <div className="font-semibold">{s.fullName}</div>
                  <div className="text-zinc-300">{s.email}</div>
                  <div className="text-zinc-400">{s.phone}</div>
                  <button type="button" onClick={() => deleteStudent(s.id)} className="mt-2 rounded bg-red-400 px-2 py-1 font-semibold text-zinc-950 hover:bg-red-300">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'courses' ? (
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Create course</div>
            <div className="mt-3 grid gap-2">
              <input value={courseForm.title} placeholder="title" onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
              <textarea value={courseForm.description} placeholder="description" onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))} className={inputCls} />
              <select value={courseForm.level} onChange={(e) => setCourseForm((p) => ({ ...p, level: e.target.value as Course['level'] }))} className={inputCls}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
              <button type="button" onClick={createCourse} className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300">Add course</button>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Courses ({courses.length})</div>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
              {courses.map((c) => {
                const id = String(c._id ?? c.id)
                return (
                  <div key={id} className="rounded-md border border-white/10 bg-zinc-950/40 p-3 text-xs">
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-zinc-300">{c.level}</div>
                    <button type="button" onClick={() => deleteCourse(id)} className="mt-2 rounded bg-red-400 px-2 py-1 font-semibold text-zinc-950 hover:bg-red-300">Delete</button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'lessons' ? (
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Create lesson</div>
            <div className="mt-3 grid gap-2">
              <select value={lessonForm.courseId} onChange={(e) => setLessonForm((p) => ({ ...p, courseId: e.target.value }))} className={inputCls}>
                <option value="">Select course</option>
                {courses.map((c) => <option key={String(c._id ?? c.id)} value={String(c._id ?? c.id)}>{c.title}</option>)}
              </select>
              <input value={lessonForm.title} placeholder="title" onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
              <input value={lessonForm.slug} placeholder="slug" onChange={(e) => setLessonForm((p) => ({ ...p, slug: e.target.value }))} className={inputCls} />
              <textarea value={lessonForm.prompt} placeholder="practice prompt" onChange={(e) => setLessonForm((p) => ({ ...p, prompt: e.target.value }))} className={inputCls} />
              <textarea value={lessonForm.starterCode} placeholder="starter code" onChange={(e) => setLessonForm((p) => ({ ...p, starterCode: e.target.value }))} className={inputCls} />
              <button type="button" onClick={createLesson} className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300">Add lesson</button>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Lessons ({lessons.length})</div>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
              {lessons.map((l) => {
                const id = String(l._id ?? l.id)
                return (
                  <div key={id} className="rounded-md border border-white/10 bg-zinc-950/40 p-3 text-xs">
                    <div className="font-semibold">{l.title}</div>
                    <div className="text-zinc-400">{l.slug}</div>
                    <button type="button" onClick={() => deleteLesson(id)} className="mt-2 rounded bg-red-400 px-2 py-1 font-semibold text-zinc-950 hover:bg-red-300">Delete</button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'progress' ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold">Progress monitoring ({progressRows.length})</div>
          <div className="mt-3 max-h-[520px] overflow-auto rounded-md border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/10 text-zinc-200">
                <tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Lesson</th><th className="px-3 py-2">Modes</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Completed</th></tr>
              </thead>
              <tbody>
                {progressRows.map((p) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className="px-3 py-2">{p.studentName}</td>
                    <td className="px-3 py-2">{p.courseTitle}</td>
                    <td className="px-3 py-2">{p.lessonTitle}</td>
                    <td className="px-3 py-2">{`${p.modes?.reading ? 'R ' : ''}${p.modes?.video ? 'V ' : ''}${p.modes?.practice ? 'P' : ''}`.trim() || '-'}</td>
                    <td className="px-3 py-2">{p.score}</td>
                    <td className="px-3 py-2">{p.completedAt ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}

