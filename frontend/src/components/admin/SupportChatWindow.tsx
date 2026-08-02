import React, { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Loader2, Clock, User, AlertCircle, Send, ArrowUp, MessageSquare, Check, CheckCheck } from 'lucide-react'
import api from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import type { SupportMessage, SupportConversation } from '../../types/support'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:5000'

interface SupportChatWindowProps {
  conversationId: string | null
}

interface MessageWithDate extends SupportMessage {
  dateLabel: string
}

export function SupportChatWindow({ conversationId }: SupportChatWindowProps) {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [studentTyping, setStudentTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const optimisticIds = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const fetchMessages = async (convId: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get<{ messages: SupportMessage[]; conversation: SupportConversation }>(
        `/support/messages/${convId}`,
      )
      setMessages(res.data.messages || [])
      setConversation(res.data.conversation || null)
      optimisticIds.current.clear()
    } catch (err: unknown) {
      setError('Failed to load messages')
      console.error('Fetch messages error:', err)
    } finally {
      setLoading(false)
    }
  }

  const connectSocket = useCallback(() => {
    if (!token || !conversationId) return

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    s.on('connect', () => {
      s.emit('join_room', {})
    })

    s.on('message_sent', (payload: {
      conversationId: string
      studentId: string
      message: SupportMessage
      clientMessageId?: string
    }) => {
      const savedMsg = payload.message
      const matchedClientId = payload.clientMessageId
      if (!savedMsg?._id) return

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => {
          if (m._optimistic && m.clientMessageId === matchedClientId) return false
          return true
        })
        if (optimisticIds.current.has(savedMsg._id)) return withoutOptimistic
        optimisticIds.current.add(savedMsg._id)
        return [...withoutOptimistic, savedMsg]
      })
    })

    s.on('receive_message', (payload: {
      conversationId: string
      studentId: string
      message: SupportMessage
    }) => {
      const msg = payload.message
      if (!msg?._id) return
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev
        return [...prev, msg]
      })
    })

    s.on('typing', () => {
      setStudentTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => setStudentTyping(false), 3000)
    })

    s.on('stop_typing', () => {
      setStudentTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    })

    s.on('message_seen', (payload: { conversationId: string; seenBy: string; seenByRole: string }) => {
      if (payload.conversationId !== conversationId) return
      if (payload.seenByRole === 'student') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderRole === 'admin' ? { ...m, read: true } : m
          )
        )
      } else if (payload.seenByRole === 'admin') {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderRole === 'student' ? { ...m, read: true } : m
          )
        )
      }
    })

    s.on('error', (err: { message?: string }) => {
      setSendError(err?.message || 'Failed to send message')
      setSending(false)
    })

    s.on('disconnect', () => {
      setSocket(null)
      setStudentTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    })

    setSocket(s)

    return () => {
      s.off()
      s.disconnect()
    }
  }, [token, conversationId])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      const cleanup = connectSocket()
      return () => {
        if (cleanup) cleanup()
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        isTypingRef.current = false
        setStudentTyping(false)
      }
    } else {
      setMessages([])
      setConversation(null)
      optimisticIds.current.clear()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      isTypingRef.current = false
      setStudentTyping(false)
    }
  }, [conversationId, connectSocket])

  // Auto-mark messages as read when conversation is opened
  useEffect(() => {
    if (!conversationId || !socket?.connected) return
    socket.emit('message_seen', { conversationId })
  }, [conversationId, socket])

  const emitTyping = useCallback(() => {
    if (!socket?.connected || !conversationId) return
    socket.emit('typing', { conversationId })
  }, [socket, conversationId])

  const emitStopTyping = useCallback(() => {
    if (!socket?.connected || !conversationId) return
    socket.emit('stop_typing', { conversationId })
  }, [socket, conversationId])

  const handleTypingChange = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      emitTyping()
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      emitStopTyping()
    }, 2000)
  }, [emitTyping, emitStopTyping])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !conversationId || !socket?.connected || sending) return

    const trimmed = text.trim()
    if (trimmed.length > 3000) return

    setSendError(null)
    setSending(true)

    if (isTypingRef.current) {
      isTypingRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      emitStopTyping()
    }

    const clientMessageId = crypto.randomUUID()

    const optimisticMsg: SupportMessage = {
      _id: `opt_${Date.now()}`,
      conversation: conversationId,
      sender: { _id: user?.id ?? '', fullName: 'You', email: '', role: 'admin' },
      senderRole: 'admin',
      message: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
      _optimistic: true,
      clientMessageId,
    } as SupportMessage

    setMessages((prev) => [...prev, optimisticMsg])

    socket.emit('send_message', { message: trimmed, conversationId, clientMessageId })
    setSending(false)
  }, [conversationId, socket, sending, emitStopTyping, user?.id])

  const handleSend = useCallback(async () => {
    const input = document.getElementById('admin-reply-input') as HTMLTextAreaElement | null
    const text = input?.value ?? ''
    if (!text.trim()) return
    if (input) input.value = ''
    await sendMessage(text)
  }, [sendMessage])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const getDateLabel = (iso: string) => {
    const date = new Date(iso)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const msgDate = new Date(date)
    msgDate.setHours(0, 0, 0, 0)

    if (msgDate.getTime() === today.getTime()) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday'
    return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const messagesWithDates: MessageWithDate[] = messages.map((msg) => ({
    ...msg,
    dateLabel: getDateLabel(msg.createdAt),
  }))

  const student = conversation?.student
    ? (typeof conversation.student === 'object'
      ? (conversation.student as any)
      : null)
    : null

  const isStudentMessage = (msg: SupportMessage) => msg.senderRole === 'student'

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--color-accent-pale)' }}
          >
            <MessageSquare className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2 font-bengali">Select a conversation</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Select a conversation from the sidebar to view messages.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 mb-3" style={{ color: 'var(--color-error)' }} />
          <p className="text-sm font-bengali" style={{ color: 'var(--color-error)' }}>{error}</p>
          <button
            onClick={() => conversationId && fetchMessages(conversationId)}
            className="mt-3 px-4 py-2 text-xs font-bold text-white bg-accent rounded-xl hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Student Info Header */}
      <div className="px-6 py-4 border-b flex items-center gap-4" style={{ borderColor: 'var(--color-border)' }}>
        {student ? (
          <>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0E7C66, #04342C)',
              }}
            >
              {student.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold font-bengali" style={{ color: 'var(--color-text)' }}>
                {student.fullName || 'Unknown Student'}
              </h3>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {student.email || ''}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`w-2 h-2 rounded-full ${
                conversation?.status === 'open' ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bengali"
                style={{
                  backgroundColor: conversation?.status === 'open'
                    ? 'rgba(16,185,129,0.1)'
                    : 'rgba(107,114,128,0.1)',
                  color: conversation?.status === 'open'
                    ? 'var(--color-accent)'
                    : 'var(--color-text-muted)',
                }}
              >
                {conversation?.status === 'open' ? 'Open' : 'Resolved'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            <div className="space-y-2 flex-1">
              <div className="h-3 rounded w-1/3 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
              <div className="h-2 rounded w-1/2 animate-pulse" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4" ref={scrollRef}>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="h-10 rounded-xl animate-pulse" style={{
                  backgroundColor: 'var(--color-border)',
                  width: `${60 + Math.random() * 40}%`,
                }} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-bengali" style={{ color: 'var(--color-text-muted)' }}>
              No messages yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messagesWithDates.map((msg, index) => {
              const prevMsg = index > 0 ? messagesWithDates[index - 1] : null
              const showDateDivider = !prevMsg || prevMsg.dateLabel !== msg.dateLabel
              const isStudent = isStudentMessage(msg)

              return (
                <React.Fragment key={msg._id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center py-2">
                      <span className="text-[10px] px-3 py-1 rounded-full font-bengali"
                        style={{
                          backgroundColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {msg.dateLabel}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isStudent ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      isStudent
                        ? 'rounded-bl-sm'
                        : 'rounded-br-sm'
                    }`}
                      style={{
                        backgroundColor: isStudent
                          ? 'var(--color-surface)'
                          : 'var(--color-accent)',
                        color: isStudent
                          ? 'var(--color-text)'
                          : '#FFFFFF',
                      }}
                    >
                      {!isStudent && (
                        <span className="text-[10px] font-bold mb-1 block opacity-80">
                          Admin
                        </span>
                      )}
                      <p className="text-sm font-bengali leading-relaxed">
                        {msg.message}
                      </p>
                      <span className="text-[10px] mt-1 block opacity-60">
                        {formatTime(msg.createdAt)}
                      </span>
                      {!isStudent && index === messagesWithDates.length - 1 && (
                        <span className="text-[10px] mt-0.5 block text-right"
                          style={{ color: msg.read ? '#3B82F6' : 'var(--color-text-muted)' }}
                        >
                          {msg.read
                            ? <CheckCheck className="w-3 h-3 inline" />
                            : <Check className="w-3 h-3 inline" />
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {studentTyping && (
        <div className="px-6 py-2 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--color-accent)' }} />
          <span className="text-xs font-bengali" style={{ color: 'var(--color-text-muted)' }}>
            Student is typing...
          </span>
        </div>
      )}

      {/* Reply Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {sendError && (
          <p className="text-xs font-bengali mb-2 px-1" style={{ color: 'var(--color-error)' }}>
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            id="admin-reply-input"
            placeholder="Type a reply..."
            rows={1}
            disabled={sending}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all font-bengali"
            style={{
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1.5px solid',
              borderColor: 'var(--color-border)',
              maxHeight: '100px',
              overflowY: 'auto',
            }}
            onKeyDown={handleKeyDown}
            onInput={handleTypingChange}
          />
          <button
            onClick={handleSend}
            disabled={sending || !conversationId}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: sending ? 'var(--color-border)' : 'linear-gradient(135deg, #0E7C66 0%, #04342C 100%)',
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowUp className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </button>
        </div>
        <p className="text-[10px] text-right mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Enter to send • Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}