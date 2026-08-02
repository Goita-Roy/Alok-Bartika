import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { useAuthStore } from '../state/authStore'
import { getAdminSocket, disconnectAdminSocket, joinAdminRoom } from '../lib/socket'

type Tab = 'analytics' | 'students' | 'courses' | 'lessons' | 'progress' | 'support'
type Student = { id: string; fullName: string; email: string; phone: string; student?: Record<string, string>; isActive?: boolean }
type Course = { _id?: string; id?: string; title: string; description: string; level: 'Beginner' | 'Intermediate' | 'Advanced'; order?: number; published?: boolean }
type Lesson = { _id?: string; id?: string; courseId: string; title: string; slug: string; order?: number; practice?: { prompt?: string; starterCode?: string } }
type ProgressRow = { id: string; studentName: string; courseTitle: string; lessonTitle: string; score: number; completedAt: string | null; modes: { reading?: boolean; video?: boolean; practice?: boolean } }
type Analytics = { totalStudents: number; avgScores: number; mostAttemptedLessons: Array<{ lessonId: string; title: string; attempts: number }> }
type CourseForm = { title: string; description: string; level: Course['level']; order: number }

type SupportConversation = {
  _id: string
  student: { _id: string; fullName: string; email: string; profilePicture?: string } | string
  assignedAdmin?: { _id: string; fullName: string; email: string } | string | null
  status: 'open' | 'pending' | 'resolved' | 'closed'
  pinned: boolean
  lastMessage: string
  lastMessageAt: string
  unreadStudent: number
  unreadAdmin: number
  createdAt: string
  updatedAt: string
}

type SupportStatus = SupportConversation['status']

type StudentPresence = { online: boolean; lastSeen: number | null }

const inputCls = 'w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white/30'

function formatLastSeen(lastSeen: number | null): string {
  if (!lastSeen) return 'Unknown'
  const diffMs = Date.now() - lastSeen
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function PresenceDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${online ? 'bg-emerald-400' : 'bg-zinc-500'}`}
      title={online ? 'Online' : 'Offline'}
    />
  )
}

function PresenceStatus({ presence }: { presence: StudentPresence | undefined }) {
  const isOnline = presence?.online ?? false
  const lastSeen = presence?.lastSeen ?? null

  if (isOnline) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400">
        <PresenceDot online />
        Online
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
      <PresenceDot online={false} />
      Offline · Last seen {formatLastSeen(lastSeen)}
    </span>
  )
}

const STATUS_STYLES: Record<SupportStatus, string> = {
  open: 'bg-emerald-500/20 text-emerald-300',
  pending: 'bg-amber-500/20 text-amber-300',
  resolved: 'bg-sky-500/20 text-sky-300',
  closed: 'bg-zinc-500/20 text-zinc-400',
}

function StatusBadge({ status }: { status: SupportStatus }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  )
}

export function AdminDashboard() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const [tab, setTab] = useState<Tab>('analytics')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  const [studentForm, setStudentForm] = useState({
    fullName: '', email: '', phone: '', password: '',
    institution: '', department: '', batch: '', roll: '', address: '', guardianName: '', guardianPhone: '',
  })
  const [courseForm, setCourseForm] = useState<CourseForm>({ title: '', description: '', level: 'Beginner', order: 0 })
  const [lessonForm, setLessonForm] = useState({ courseId: '', title: '', slug: '', prompt: '', starterCode: '' })

  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [presenceMap, setPresenceMap] = useState<Record<string, StudentPresence>>({})
  const [statusFilter, setStatusFilter] = useState<'all' | SupportStatus>('all')

  const presenceMapRef = useRef(presenceMap)
  presenceMapRef.current = presenceMap

  const socketRef = useRef<ReturnType<typeof getAdminSocket> | null>(null)

  useEffect(() => {
    if (!token || !user) return

    const socket = getAdminSocket(token)
    socketRef.current = socket

    socket.on('connect', () => {
      joinAdminRoom()
    })

    socket.on('user_presence', (data: { userId: string; role: string; online: boolean }) => {
      if (data.role !== 'student') return
      setPresenceMap((prev) => ({
        ...prev,
        [data.userId]: {
          online: data.online,
          lastSeen: data.online ? null : Date.now(),
        },
      }))
    })

    socket.on('status_changed', (data: { conversationId: string; status: SupportStatus }) => {
      setConversations((prev) => prev.map((c) => (c._id === data.conversationId ? { ...c, status: data.status } : c)))
    })

    socket.on('conversation_pinned', (data: { conversationId: string; pinned: boolean }) => {
      setConversations((prev) => prev.map((c) => (c._id === data.conversationId ? { ...c, pinned: data.pinned } : c)))
    })

    socket.on('receive_message', (data: { conversationId: string; studentId: string; message: any; unreadStudent: number; unreadAdmin: number }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === data.conversationId)
        if (idx === -1) return prev
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          lastMessage: data.message?.message ?? updated[idx].lastMessage,
          lastMessageAt: data.message?.createdAt ?? updated[idx].lastMessageAt,
          unreadAdmin: data.unreadAdmin ?? updated[idx].unreadAdmin,
        }
        return updated
      })
    })

    socket.on('message_seen', (data: { conversationId: string; seenBy: string; seenByRole: string; unreadStudent: number; unreadAdmin: number }) => {
      setConversations((prev) => prev.map((c) =>
        c._id === data.conversationId
          ? { ...c, unreadStudent: data.unreadStudent ?? c.unreadStudent, unreadAdmin: data.unreadAdmin ?? c.unreadAdmin }
          : c
      ))
    })

    socket.on('connect_error', () => {})

    if (socket.connected) {
      joinAdminRoom()
    }

    return () => {
      socket.off('connect')
      socket.off('user_presence')
      socket.off('status_changed')
      socket.off('conversation_pinned')
      socket.off('receive_message')
      socket.off('message_seen')
      socket.off('connect_error')
      disconnectAdminSocket()
      socketRef.current = null
    }
  }, [token, user])

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/api/support/admin/conversations')
      setConversations(data.conversations ?? [])
    } catch {
      // silently fail; conversations are optional
    }
  }, [])

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
    loadConversations()
  }, [])

  useEffect(() => {
    if (tab === 'support') loadConversations()
  }, [tab, loadConversations])

  async function createStudent() {
    setBusy(true)
    setError(null)
    try {
      await api.post('/api/admin/students', studentForm)
      setStudentForm({ fullName: '', email: '', phone: '', password: '', institution: '', department: '', batch: '', roll: '', address: '', guardianName: '', guardianPhone: '' })
      await loadAll()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to create student')
    } finally {
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
    } finally {
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
    } finally {
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
    } finally {
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
    } finally {
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
    } finally {
      setBusy(false)
    }
  }

  async function updateConversationStatus(id: string, status: SupportStatus) {
    try {
      await api.patch(`/api/support/admin/conversations/${id}/status`, { status })
      setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)))
      if (socketRef.current) {
        socketRef.current.emit('status_changed', { conversationId: id, status })
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to update conversation')
    }
  }

  async function toggleConversationPin(id: string) {
    try {
      const { data } = await api.patch(`/api/support/admin/conversations/${id}/pin`)
      const newPinned = data.conversation.pinned
      setConversations((prev) => {
        const updated = prev.map((c) => (c._id === id ? { ...c, pinned: newPinned } : c))
        return [...updated].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
      })
      if (socketRef.current) {
        socketRef.current.emit('conversation_pinned', { conversationId: id, pinned: newPinned })
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to update pin status')
    }
  }

  const completion = useMemo(() => {
    const done = progressRows.filter((x) => x.completedAt).length
    return progressRows.length ? Math.round((done / progressRows.length) * 100) : 0
  }, [progressRows])

  const selectedConv = useMemo(
    () => conversations.find((c) => c._id === selectedConvId) ?? null,
    [conversations, selectedConvId],
  )

  const selectedStudentId = useMemo(() => {
    if (!selectedConv) return null
    const s = selectedConv.student
    return typeof s === 'object' ? s._id : s
  }, [selectedConv])

  const selectedStudentPresence = selectedStudentId ? presenceMap[selectedStudentId] : undefined

  const filteredConversations = useMemo(() => {
    if (statusFilter === 'all') return conversations
    return conversations.filter((c) => c.status === statusFilter)
  }, [conversations, statusFilter])

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unreadAdmin > 0 ? 1 : 0), 0),
    [conversations],
  )

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Admin Panel</h2>
      <div className="flex flex-wrap gap-2">
        {(['analytics', 'students', 'courses', 'lessons', 'progress', 'support'] as Tab[]).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === t ? 'bg-white text-zinc-950' : 'bg-white/10 text-zinc-200 hover:bg-white/20'}`}>
            {t === 'support' ? (
              <span className="flex items-center gap-1.5">
                Student Support
                {totalUnread > 0 ? (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">{totalUnread}</span>
                ) : null}
              </span>
            ) : t}
          </button>
        ))}
        <button type="button" onClick={() => { loadAll(); if (tab === 'support') loadConversations() }} className="rounded-md bg-sky-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-sky-300">
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
              {students.map((s) => {
                const p = presenceMap[s.id]
                return (
                  <div key={s.id} className="rounded-md border border-white/10 bg-zinc-950/40 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <PresenceDot online={p?.online ?? false} />
                      <span className="font-semibold">{s.fullName}</span>
                    </div>
                    <div className="mt-1 pl-4 text-zinc-300">{s.email}</div>
                    <div className="pl-4 text-zinc-400">{s.phone}</div>
                    <button type="button" onClick={() => deleteStudent(s.id)} className="mt-2 rounded bg-red-400 px-2 py-1 font-semibold text-zinc-950 hover:bg-red-300">Delete</button>
                  </div>
                )
              })}
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

      {tab === 'support' ? (
        <section className="flex gap-3" style={{ minHeight: 480 }}>
          <div className="w-80 shrink-0 rounded-xl border border-white/10 bg-white/5 p-4 overflow-y-auto" style={{ maxHeight: 520 }}>
            <div className="mb-3 text-sm font-semibold">Conversations ({filteredConversations.length})</div>
            <div className="mb-3 flex flex-wrap gap-1">
              {(['all', 'open', 'pending', 'resolved', 'closed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setStatusFilter(f)}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusFilter === f ? 'bg-white text-zinc-950' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
            {filteredConversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400">
                {conversations.length === 0 ? 'No conversations yet' : 'No conversations match this filter'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => {
                  const studentObj = typeof conv.student === 'object' ? conv.student : null
                  const studentId = studentObj?._id ?? (typeof conv.student === 'string' ? conv.student : '')
                  const p = presenceMap[studentId]
                  const isOnline = p?.online ?? false
                  return (
                    <div key={conv._id} className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-colors ${selectedConvId === conv._id ? 'bg-white/15' : 'hover:bg-white/5'}`}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleConversationPin(conv._id) }}
                        className="shrink-0 p-1 rounded transition-colors hover:bg-white/10"
                        title={conv.pinned ? 'Unpin' : 'Pin'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={conv.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-colors ${conv.pinned ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-300'}`}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedConvId(conv._id)
                          if (conv.unreadAdmin > 0 && socketRef.current) {
                            socketRef.current.emit('message_seen', { conversationId: conv._id })
                            setConversations((prev) => prev.map((c) => (c._id === conv._id ? { ...c, unreadAdmin: 0 } : c)))
                          }
                        }}
                        className={`flex flex-1 items-center gap-2.5 rounded-lg px-2 py-2 text-left text-xs transition-colors ${selectedConvId === conv._id ? 'text-white' : 'text-zinc-300'}`}
                      >
                        <PresenceDot online={isOnline} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{studentObj?.fullName ?? 'Student'}</div>
                          <div className="mt-0.5 truncate text-[11px] text-zinc-400">{conv.lastMessage || 'No messages yet'}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {conv.unreadAdmin > 0 ? (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-zinc-950">{conv.unreadAdmin}</span>
                          ) : null}
                          <StatusBadge status={conv.status} />
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col">
            {selectedConv ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-sm font-semibold">
                      {typeof selectedConv.student === 'object' ? selectedConv.student.fullName : 'Student'}
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-400">
                      {typeof selectedConv.student === 'object' ? selectedConv.student.email : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PresenceStatus presence={selectedStudentPresence} />
                    <button
                      type="button"
                      onClick={() => toggleConversationPin(selectedConv._id)}
                      className="rounded-md p-1.5 transition-colors hover:bg-white/10"
                      title={selectedConv.pinned ? 'Unpin conversation' : 'Pin conversation'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={selectedConv.pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-colors ${selectedConv.pinned ? 'text-amber-400' : 'text-zinc-400 hover:text-amber-300'}`}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                    <select
                      value={selectedConv.status}
                      onChange={(e) => updateConversationStatus(selectedConv._id, e.target.value as SupportStatus)}
                      className="rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-200 outline-none focus:border-white/30"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex-1 rounded-md border border-white/10 bg-zinc-950/40 p-4 text-xs text-zinc-300" style={{ minHeight: 320 }}>
                  <div className="text-zinc-400">Last message: {selectedConv.lastMessage || 'None'}</div>
                  <div className="mt-1 text-zinc-500">Sent: {selectedConv.lastMessageAt ? new Date(selectedConv.lastMessageAt).toLocaleString() : 'N/A'}</div>
                  <div className="mt-4 text-center text-zinc-500">
                    Real-time chat coming soon — presence is live.
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-zinc-500">
                Select a conversation to view details
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
