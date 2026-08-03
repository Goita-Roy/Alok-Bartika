import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../state/authStore'
import { useSupportStore } from '../state/supportStore'
import { getStudentSocket, disconnectStudentSocket, joinStudentRoom } from '../lib/socket'

type DashboardData = {
  ok: boolean
  progress: { lessonsCompleted: number; totalLessons: number; percent: number }
  xp: { xp: number; level: number; nextLevelXp: number; progress01: number }
  recommended: {
    id: string
    title: string
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    durationMin: number
    description: string
  }
  courses: Array<{
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    color: 'green' | 'amber' | 'violet'
    items: Array<{ id: string; title: string; lessons: number; done: number }>
  }>
  quiz: { next: { id: string; title: string; questions: number; estMin: number }; lastScore: number }
  performance: { streakDays: number; accuracy: number; avgSessionMin: number }
}

function levelLabel(level: DashboardData['recommended']['level']) {
  if (level === 'Beginner') return 'শিক্ষানবিশ'
  if (level === 'Intermediate') return 'মাঝারি'
  return 'উন্নত'
}

function levelColor(level: DashboardData['recommended']['level']) {
  if (level === 'Beginner') return 'bg-green-500/15 text-green-200 border-green-500/30'
  if (level === 'Intermediate') return 'bg-amber-500/15 text-amber-200 border-amber-500/30'
  return 'bg-violet-500/15 text-violet-200 border-violet-500/30'
}

function courseAccent(color: DashboardData['courses'][number]['color']) {
  if (color === 'green') return 'from-green-500/25 to-green-500/5'
  if (color === 'amber') return 'from-amber-500/25 to-amber-500/5'
  return 'from-violet-500/25 to-violet-500/5'
}

export function StudentDashboard() {
  const user = useAuthStore((s) => s.user)

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatConversationId, setChatConversationId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const token = useAuthStore((s) => s.token)
  const studentUnread = useSupportStore((s) => s.studentUnread)
  const setStudentUnread = useSupportStore((s) => s.setStudentUnread)
  const clearStudentUnread = useSupportStore((s) => s.clearStudentUnread)

  // Socket connection for unread notifications
  useEffect(() => {
    if (!token || !user) return

    const socket = getStudentSocket(token)

    socket.on('connect', () => {
      joinStudentRoom(user.id)
    })

    socket.on('receive_message', (data: { conversationId: string; studentId: string; message: any; unreadStudent: number }) => {
      setStudentUnread(data.unreadStudent)
    })

    socket.on('message_seen', (data: { conversationId: string; seenByRole: string; unreadStudent: number }) => {
      if (data.seenByRole === 'admin' || data.seenByRole === 'super-admin') {
        setStudentUnread(data.unreadStudent)
      }
    })

    socket.on('connect_error', () => {})

    if (socket.connected) {
      joinStudentRoom(user.id)
    }

    return () => {
      socket.off('connect')
      socket.off('receive_message')
      socket.off('message_seen')
      socket.off('connect_error')
      disconnectStudentSocket()
    }
  }, [token, user])

  // Fetch initial unread count from conversation
  useEffect(() => {
    if (!user) return
    api.get('/api/support/conversation')
      .then((res) => {
        if (res.data?.conversation) {
          setStudentUnread(res.data.conversation.unreadStudent ?? 0)
        }
      })
      .catch(() => {})
  }, [user])

  async function openChat() {
    setChatOpen(true)
    clearStudentUnread()
    setChatLoading(true)
    try {
      const { data: convData } = await api.get('/api/support/conversation')
      let conv = convData?.conversation
      if (!conv) {
        const { data: created } = await api.post('/api/support/conversation')
        conv = created?.conversation
      }
      if (conv) {
        setChatConversationId(conv._id)
        const { data: msgData } = await api.get(`/api/support/messages/${conv._id}`)
        setChatMessages(msgData?.messages ?? [])
        await api.patch('/api/support/read', { conversationId: conv._id })
      }
    } catch {
      // ignore
    } finally {
      setChatLoading(false)
    }
  }

  function closeChat() {
    setChatOpen(false)
    setChatMessages([])
    setChatConversationId(null)
    setChatInput('')
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return
    const text = chatInput.trim()
    setChatInput('')

    let convId = chatConversationId
    if (!convId) {
      try {
        const { data } = await api.post('/api/support/conversation')
        convId = data?.conversation?._id
        if (convId) setChatConversationId(convId)
      } catch {
        setChatInput(text)
        return
      }
    }
    if (!convId) {
      setChatInput(text)
      return
    }

    try {
      await api.post('/api/support/message', { message: text, conversationId: convId })
      setChatMessages((prev) => [...prev, { _id: Date.now().toString(), message: text, sender: { _id: user?.id, fullName: user?.fullName }, createdAt: new Date().toISOString() }])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .get<DashboardData>('/api/student/dashboard')
      .then((res) => {
        if (mounted) setData(res.data)
      })
      .catch((e) => {
        if (mounted) setError(e?.response?.data?.error ?? e?.message ?? 'ড্যাশবোর্ড লোড করা যায়নি')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const greetingName = user?.fullName ?? 'শিক্ষার্থী'
  const progressText = useMemo(() => {
    if (!data) return null
    return `${data.progress.lessonsCompleted}/${data.progress.totalLessons} টি পাঠ`
  }, [data])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="h-6 w-56 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          <div className="h-36 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/15 via-emerald-500/10 to-violet-500/15 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{greetingName}! স্বাগতম!</h2>
            <p className="mt-1 text-sm text-zinc-200/90">
              আজ কিছু মজার জিনিস শিখুন।
            </p>
          </div>

          {data ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                স্কোর: <span className="font-semibold">{data.xp.xp}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
                লেভেল <span className="font-semibold">{data.xp.level}</span>
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-zinc-200/90">
              <span className="font-semibold">অগ্রগতি</span>
              <span>{progressText}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-emerald-400"
                style={{ width: `${Math.min(100, Math.max(0, data.progress.percent))}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-200/80">
              <span>{data.progress.percent}% সম্পন্ন</span>
              <span>
                পরবর্তী লেভেল <span className="font-semibold">{data.xp.nextLevelXp}</span> স্কোর
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">প্রস্তাবিত পাঠ</h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] ${levelColor(data.recommended.level)}`}
              >
                {levelLabel(data.recommended.level)}
              </span>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-base font-semibold">{data.recommended.title}</div>
                  <div className="mt-1 text-sm text-zinc-300">{data.recommended.description}</div>
                </div>
                <div className="text-xs text-zinc-300">
                  <div>
                    সময়: <span className="font-semibold text-zinc-100">{data.recommended.durationMin} মিনিট</span>
                  </div>
                  <Link
                    to="/courses"
                    className="mt-2 inline-block w-full rounded-lg bg-sky-500 px-4 py-2 text-center text-xs font-semibold text-zinc-950 hover:bg-sky-400 md:w-auto"
                  >
                    শুরু করুন
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold">কুইজ</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="font-semibold">{data.quiz.next.title}</div>
                <div className="mt-1 text-xs text-zinc-300">
                  {data.quiz.next.questions} টি প্রশ্ন · ~{data.quiz.next.estMin} মিনিট
                </div>
                <button
                  type="button"
                  className="mt-3 w-full rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300"
                >
                  কুইজ দিন
                </button>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4 text-xs text-zinc-300">
                শেষ স্কোর: <span className="font-semibold text-zinc-100">{data.quiz.lastScore}%</span>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">কোর্সসমূহ</h3>
              <span className="text-xs text-zinc-300">একটি লেভেল বেছে নিন</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {data.courses.map((group) => (
                <div
                  key={group.level}
                  className={`rounded-2xl border border-white/10 bg-gradient-to-b ${courseAccent(group.color)} p-4`}
                >
                  <div className="text-sm font-semibold">{levelLabel(group.level)}</div>
                  <div className="mt-3 space-y-3">
                    {group.items.map((c) => {
                      const percent = c.lessons ? Math.round((c.done / c.lessons) * 100) : 0
                      return (
                        <div key={c.id} className="rounded-xl border border-white/10 bg-zinc-950/35 p-3">
                          <div className="text-xs font-semibold">{c.title}</div>
                          <div className="mt-2 h-2 rounded-full bg-white/10">
                            <div className="h-2 rounded-full bg-white/70" style={{ width: `${percent}%` }} />
                          </div>
                          <div className="mt-2 text-[11px] text-zinc-200/80">
                            {c.done}/{c.lessons} টি পাঠ
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold">কর্মক্ষমতার সারাংশ</h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-xs text-zinc-300">ধারাবাহিকতা</div>
                <div className="mt-1 text-lg font-semibold">{data.performance.streakDays} দিন</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-xs text-zinc-300">নির্ভুলতা</div>
                <div className="mt-1 text-lg font-semibold">{Math.round(data.performance.accuracy * 100)}%</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
                <div className="text-xs text-zinc-300">গড় সেশন</div>
                <div className="mt-1 text-lg font-semibold">{data.performance.avgSessionMin} মিনিট</div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* Live Chat Floating Button */}
      <button
        type="button"
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-zinc-950 shadow-lg hover:bg-sky-400 transition-colors"
        title="Live Chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {studentUnread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {studentUnread > 99 ? '99+' : studentUnread}
          </span>
        ) : null}
      </button>

      {/* Chat Panel */}
      {chatOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeChat} />
          <div className="relative flex w-full max-w-md flex-col rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl" style={{ height: '70vh', maxHeight: 560 }}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="text-sm font-semibold">Live Chat</div>
              <button type="button" onClick={closeChat} className="text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatLoading ? (
                <div className="text-center text-xs text-zinc-400 py-8">Loading...</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center text-xs text-zinc-400 py-8">No messages yet. Start a conversation!</div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sender?._id === user?.id
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${isMe ? 'bg-sky-500/20 text-sky-100' : 'bg-white/10 text-zinc-200'}`}>
                        <div>{msg.message}</div>
                        <div className="mt-1 text-[10px] text-zinc-400">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-400 disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
