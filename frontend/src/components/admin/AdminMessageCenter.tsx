import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, ChevronDown } from 'lucide-react'
import api from '../../config/api'
import { useSocket } from '../../hooks/useSocket'
import type { SupportConversation, SupportSender } from '../../types/support'

interface ConversationItem {
  _id: string
  student: SupportSender | string
  lastMessage?: string
  lastMessageAt?: string
  unreadAdmin: number
  status: string
  updatedAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'এইমাত্র'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ঘণ্টা আগে`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} দিন আগে`
  return new Date(iso).toLocaleDateString('bn-BD')
}

export function AdminMessageCenter() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<{ conversations: SupportConversation[] }>(
        '/support/admin/conversations?limit=8'
      )
      const convs = (res.data.conversations || []) as ConversationItem[]
      setConversations(convs)
      const total = convs.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0)
      setTotalUnread(total)
    } catch {
      // silently fail — will retry on next socket event
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Realtime: listen for new messages via existing socket
  useEffect(() => {
    if (!socket) return

    const onReceiveMessage = (payload: {
      conversationId: string
      studentId: string
      message: { sender?: { fullName?: string }; message?: string; createdAt?: string }
      unreadAdmin?: number
    }) => {
      const { conversationId, message: msg, unreadAdmin } = payload

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === conversationId)
        const updated: ConversationItem = {
          _id: conversationId,
          student: prev[idx]?.student || 'Student',
          lastMessage: msg?.message || prev[idx]?.lastMessage,
          lastMessageAt: msg?.createdAt || new Date().toISOString(),
          unreadAdmin: unreadAdmin ?? (prev[idx]?.unreadAdmin || 0) + 1,
          status: 'open',
          updatedAt: new Date().toISOString(),
        }

        if (idx >= 0) {
          const next = [...prev]
          next.splice(idx, 1)
          next.unshift(updated)
          return next
        }
        // New conversation — prepend if under limit
        return [updated, ...prev].slice(0, 8)
      })

      setTotalUnread((prev) => prev + 1)
    }

    const onMessageSeen = (payload: {
      conversationId: string
      seenByRole?: string
      unreadAdmin?: number
    }) => {
      if (payload.seenByRole === 'admin' || payload.seenByRole === 'super-admin') {
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === payload.conversationId
              ? { ...c, unreadAdmin: payload.unreadAdmin ?? 0 }
              : c
          )
          const total = updated.reduce((sum, c) => sum + (c.unreadAdmin || 0), 0)
          setTotalUnread(total)
          return updated
        })
      }
    }

    socket.on('receive_message', onReceiveMessage)
    socket.on('message_seen', onMessageSeen)

    return () => {
      socket.off('receive_message', onReceiveMessage)
      socket.off('message_seen', onMessageSeen)
    }
  }, [socket])

  // Close dropdown on outside click / Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleConversationClick = (conversationId: string) => {
    setOpen(false)
    navigate(`/admin/support?conversation=${conversationId}`)
  }

  const getStudentName = (student: SupportSender | string): string => {
    if (typeof student === 'object' && student?.fullName) return student.fullName
    return 'Student'
  }

  const getStudentInitial = (student: SupportSender | string): string => {
    const name = getStudentName(student)
    return name.charAt(0).toUpperCase() || 'U'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Messages"
        className="relative p-2.5 rounded-xl transition-all duration-200"
        style={{
          color: 'var(--color-text-muted)',
          border: '1.5px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-accent)'
          e.currentTarget.style.borderColor = 'var(--color-accent-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        <MessageSquare size={18} />
        {totalUnread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full"
            style={{ backgroundColor: 'var(--color-accent, #1D9E75)' }}
          >
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 z-[60] w-[360px] max-w-[92vw] max-h-[70vh] flex flex-col rounded-2xl shadow-card-hover overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span
              className="font-bold text-sm"
              style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              Messages {totalUnread > 0 && <span style={{ color: 'var(--color-accent)' }}>({totalUnread})</span>}
            </span>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading && conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center px-4 py-10 text-center">
                <MessageSquare size={32} className="mb-2 opacity-40" style={{ color: 'var(--color-text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  No conversations yet
                </p>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {conversations.map((conv) => (
                  <li
                    key={conv._id}
                    className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: conv.unreadAdmin > 0 ? 'var(--color-accent-pale)' : 'transparent',
                    }}
                    onClick={() => handleConversationClick(conv._id)}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #0E7C66, #04342C)' }}
                      >
                        {getStudentInitial(conv.student)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{
                            color: 'var(--color-text)',
                            fontFamily: "'Hind Siliguri', sans-serif",
                          }}
                        >
                          {getStudentName(conv.student)}
                        </p>
                        {conv.unreadAdmin > 0 && (
                          <span
                            className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white rounded-full shrink-0"
                            style={{ backgroundColor: 'var(--color-accent, #1D9E75)' }}
                          >
                            {conv.unreadAdmin > 99 ? '99+' : conv.unreadAdmin}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs mt-0.5 truncate leading-snug"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: 'var(--color-text-muted)', opacity: 0.8 }}
                      >
                        {conv.lastMessageAt ? timeAgo(conv.lastMessageAt) : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={() => {
                setOpen(false)
                navigate('/admin/support')
              }}
              className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              View All Messages <ChevronDown size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
