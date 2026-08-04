import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import api from '../../config/api'
import { useSocket } from '../../hooks/useSocket'
import type { SupportConversation } from '../../types/support'

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

const STATUS_LABELS: Record<string, string> = {
  open: 'খোলা',
  closed: 'বন্ধ',
  pending: 'অপেক্ষমান',
  resolved: 'সমাধান',
}

export function StudentMessageCenter() {
  const navigate = useNavigate()
  const socket = useSocket()
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get<SupportConversation>('/support/conversation')
      if (res.data) {
        setConversation(res.data)
        setUnreadCount(res.data.unreadStudent || 0)
      } else {
        setConversation(null)
        setUnreadCount(0)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchConversation()
  }, [fetchConversation])

  // Realtime: listen for new messages via existing socket
  useEffect(() => {
    if (!socket) return

    const onReceiveMessage = (payload: {
      conversationId: string
      message?: { message?: string; createdAt?: string }
      unreadStudent?: number
    }) => {
      setConversation((prev) => {
        if (!prev) return prev
        if (payload.conversationId !== prev._id) return prev
        return {
          ...prev,
          lastMessage: payload.message?.message || prev.lastMessage,
          lastMessageAt: payload.message?.createdAt || prev.lastMessageAt,
        }
      })
      setUnreadCount(payload.unreadStudent ?? 0)
    }

    const onMessageSeen = (payload: {
      conversationId: string
      seenByRole?: string
      unreadStudent?: number
    }) => {
      if (payload.seenByRole === 'admin' || payload.seenByRole === 'super-admin') {
        setConversation((prev) => {
          if (!prev || payload.conversationId !== prev._id) return prev
          return { ...prev, unreadStudent: payload.unreadStudent ?? 0 }
        })
        setUnreadCount(payload.unreadStudent ?? 0)
      }
    }

    socket.on('receive_message', onReceiveMessage)
    socket.on('message_seen', onMessageSeen)

    return () => {
      socket.off('receive_message', onReceiveMessage)
      socket.off('message_seen', onMessageSeen)
    }
  }, [socket])

  // Refetch when dropdown opens (ensures accurate state)
  const handleToggle = useCallback(() => {
    setOpen((v) => {
      if (!v) fetchConversation()
      return !v
    })
  }, [fetchConversation])

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

  const handleOpenMessages = () => {
    setOpen(false)
    navigate('/support')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
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
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full"
            style={{ backgroundColor: 'var(--color-accent, #1D9E75)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 z-[60] w-[340px] max-w-[92vw] flex flex-col rounded-2xl shadow-card-hover overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span
              className="font-bold text-sm"
              style={{
                color: 'var(--color-text)',
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              বার্তা{' '}
              {unreadCount > 0 && (
                <span style={{ color: 'var(--color-accent)' }}>
                  ({unreadCount})
                </span>
              )}
            </span>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            {loading && !conversation ? (
              <div
                className="py-6 text-center text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                লোড হচ্ছে...
              </div>
            ) : conversation ? (
              <div className="flex items-start gap-3">
                {/* Admin avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #0E7C66, #04342C)',
                  }}
                >
                  {conversation.assignedAdmin?.fullName?.charAt(0) || 'A'}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Admin name + time */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{
                        color: 'var(--color-text)',
                        fontFamily: "'Hind Siliguri', sans-serif",
                      }}
                    >
                      {conversation.assignedAdmin?.fullName || 'সাপোর্ট টিম'}
                    </p>
                    {unreadCount > 0 && (
                      <span
                        className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white rounded-full shrink-0"
                        style={{
                          backgroundColor: 'var(--color-accent, #1D9E75)',
                        }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          conversation.status === 'open'
                            ? 'var(--color-accent-pale)'
                            : 'var(--color-border)',
                        color:
                          conversation.status === 'open'
                            ? 'var(--color-accent)'
                            : 'var(--color-text-muted)',
                      }}
                    >
                      {STATUS_LABELS[conversation.status] || conversation.status}
                    </span>
                  </div>

                  {/* Last message preview */}
                  {conversation.lastMessage && (
                    <p
                      className="text-xs mt-1.5 truncate leading-snug"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {conversation.lastMessage}
                    </p>
                  )}

                  {/* Relative time */}
                  {conversation.lastMessageAt && (
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: 'var(--color-text-muted)', opacity: 0.8 }}
                    >
                      {timeAgo(conversation.lastMessageAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* No conversation yet */
              <div className="text-center py-2">
                <MessageSquare
                  size={28}
                  className="mx-auto mb-2 opacity-40"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  এখনো কোনো বার্তা নেই
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
                >
                  সাপোর্ট চ্যাট শুরু করুন
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="border-t text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={handleOpenMessages}
              className="w-full py-2.5 text-xs font-semibold transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              {conversation ? 'বার্তা দেখুন' : 'চ্যাট শুরু করুন'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
