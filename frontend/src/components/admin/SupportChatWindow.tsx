import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, ArrowUp, MessageSquare, Check, CheckCheck, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import api from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { useSocket, useConnectionState } from '../../hooks/useSocket'
import { sanitizeText } from '../../utils/sanitize'
import type { SupportMessage, SupportConversation, SupportSender } from '../../types/support'

interface SupportChatWindowProps {
  conversationId: string | null
}

interface MessageWithDate extends SupportMessage {
  dateLabel: string
}

interface PendingMessage {
  clientMessageId: string
  text: string
  optimisticMsg: SupportMessage
}

const TYPING_TIMEOUT = 3000
const FADE_OUT_DURATION = 1500
const RECONNECT_FETCH_DELAY = 1000

let audioCtx: AudioContext | null = null
function playNotificationSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.3)
  } catch {
    // Audio not available
  }
}

export function SupportChatWindow({ conversationId }: SupportChatWindowProps) {
  const { user } = useAuth()
  const socket = useSocket()
  const connectionState = useConnectionState()
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [studentTyping, setStudentTyping] = useState(false)
  const [connectionBanner, setConnectionBanner] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const optimisticIds = useRef<Set<string>>(new Set())
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const seenIds = useRef<Set<string>>(new Set())
  const pendingQueueRef = useRef<PendingMessage[]>([])
  const fetchLockRef = useRef<string | null>(null)
  const lastSocketEventTimeRef = useRef<number>(0)
  const lastFetchTimestampRef = useRef<number>(0)
  const isReconnectingRef = useRef(false)
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const conversationIdRef = useRef<string | null>(conversationId)

  useEffect(() => {
    conversationIdRef.current = conversationId
  }, [conversationId])

  const isOffline = connectionState === 'offline'
  const isReconnecting = connectionState === 'reconnecting'
  const isConnecting = connectionState === 'connecting'

  const showBanner = useCallback((text: string, duration?: number) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    setConnectionBanner(text)
    if (duration) {
      bannerTimerRef.current = setTimeout(() => {
        setConnectionBanner(null)
        bannerTimerRef.current = null
      }, duration)
    }
  }, [])

  const flushPendingQueue = useCallback(() => {
    const queue = pendingQueueRef.current
    if (queue.length === 0) return
    pendingQueueRef.current = []
    queue.forEach((pending) => {
      setMessages((prev) => {
        const withoutOptimistic = prev.filter(
          (m) => !(m._optimistic && m.clientMessageId === pending.clientMessageId),
        )
        return [...withoutOptimistic, pending.optimisticMsg]
      })
      socket?.emit('send_message', {
        message: pending.text,
        conversationId: conversationIdRef.current,
        clientMessageId: pending.clientMessageId,
      })
    })
  }, [socket])

  const fetchMessages = useCallback(async (convId: string) => {
    if (fetchLockRef.current === convId) return
    fetchLockRef.current = convId

    const fetchTs = Date.now()
    lastFetchTimestampRef.current = fetchTs

    try {
      setLoading(true)
      setError(null)
      const res = await api.get<{ messages: SupportMessage[]; conversation: SupportConversation }>(
        `/support/messages/${convId}`,
      )

      if (lastFetchTimestampRef.current !== fetchTs) return

      setMessages((prev) => {
        const next = res.data.messages || []
        next.forEach((m) => seenIds.current.add(m._id))
        const merged = [...prev, ...next]
        const byId = new Map<string, SupportMessage>()
        merged.forEach((m) => byId.set(m._id, m))
        return Array.from(byId.values())
      })
      setConversation(res.data.conversation || null)
      optimisticIds.current.clear()
    } catch {
      if (lastFetchTimestampRef.current === fetchTs) {
        setError('Failed to load messages')
      }
    } finally {
      if (lastFetchTimestampRef.current === fetchTs) {
        setLoading(false)
      }
      if (fetchLockRef.current === convId) {
        fetchLockRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    } else {
      setMessages([])
      setConversation(null)
      optimisticIds.current.clear()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
      isTypingRef.current = false
      setStudentTyping(false)
    }
  }, [conversationId, fetchMessages])

  // ── Request notification permission ──────────────────────────
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // ── Socket.IO: register listeners once, clean up on unmount ──────
  useEffect(() => {
    if (!socket) return

    const onMessageSent = (payload: {
      conversationId: string
      studentId: string
      message: SupportMessage
      clientMessageId?: string
    }) => {
      const now = Date.now()
      lastSocketEventTimeRef.current = now
      if (payload.conversationId !== conversationIdRef.current) return
      const savedMsg = payload.message
      const matchedClientId = payload.clientMessageId
      if (!savedMsg?._id) return
      // Defense-in-depth: sanitize message text on client
      if (savedMsg.message) {
        savedMsg.message = sanitizeText(savedMsg.message)
      }

      setMessages((prev) => {
        const withoutOptimistic = prev.filter((m) => {
          if (m._optimistic && m.clientMessageId === matchedClientId) return false
          return true
        })
        const existing = withoutOptimistic.findIndex((m) => m._id === savedMsg._id)
        if (existing >= 0) {
          const updated = [...withoutOptimistic]
          updated[existing] = savedMsg
          return updated
        }
        return [...withoutOptimistic, savedMsg]
      })

      optimisticIds.current.add(savedMsg._id)
    }

  const onReceiveMessage = (payload: {
    conversationId: string
    studentId: string
    message: SupportMessage
  }) => {
    const now = Date.now()
    lastSocketEventTimeRef.current = now
    if (payload.conversationId !== conversationIdRef.current) return
    const msg = payload.message
    if (!msg?._id) return
    // Defense-in-depth: sanitize message text on client
    if (msg.message) {
      msg.message = sanitizeText(msg.message)
    }
    const isOwnMessage = msg.sender?._id === user?.id
    setMessages((prev) => {
      const existing = prev.findIndex((m) => m._id === msg._id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = msg
        return updated
      }
      return [...prev, msg]
    })

    if (!isOwnMessage && payload.conversationId !== conversationId) {
      playNotificationSound()
      if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
        try {
          new Notification('New Message', {
            body: `${msg.sender?.fullName || 'Student'}: ${msg.message}`,
            tag: payload.conversationId,
          })
        } catch {
          // Notifications not available
        }
      }
    }
  }

    const onTyping = () => {
      if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
      setStudentTyping(true)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        typingFadeTimeoutRef.current = setTimeout(() => {
          setStudentTyping(false)
          typingFadeTimeoutRef.current = null
        }, FADE_OUT_DURATION)
      }, TYPING_TIMEOUT)
    }

    const onStopTyping = () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        setStudentTyping(false)
      }, FADE_OUT_DURATION)
    }

    const onMessageSeen = (payload: { conversationId: string; seenBy: string; seenByRole: string }) => {
      const now = Date.now()
      lastSocketEventTimeRef.current = now
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
    }

    const onError = (err: { message?: string }) => {
      setSendError(err?.message || 'Failed to send message')
      setSending(false)
    }

    socket.on('message_sent', onMessageSent)
    socket.on('receive_message', onReceiveMessage)
    socket.on('typing', onTyping)
    socket.on('stop_typing', onStopTyping)
    socket.on('message_seen', onMessageSeen)
    socket.on('error', onError)

    return () => {
      socket.off('message_sent', onMessageSent)
      socket.off('receive_message', onReceiveMessage)
      socket.off('typing', onTyping)
      socket.off('stop_typing', onStopTyping)
      socket.off('message_seen', onMessageSeen)
      socket.off('error', onError)
    }
  }, [socket, conversationId])

  // ── Auto-mark messages as read when conversation is opened ──────
  useEffect(() => {
    if (!conversationId || !socket?.connected) return
    socket.emit('message_seen', { conversationId })
  }, [conversationId, socket])

  // ── Re-emit message_seen when socket connects (handles reconnections) ──
  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      if (conversationIdRef.current && socket.connected) {
        socket.emit('message_seen', { conversationId: conversationIdRef.current })
      }
    }

    socket.on('connect', onConnect)
    return () => {
      socket.off('connect', onConnect)
    }
  }, [socket])

  // ── Flush pending queue on reconnect ──
  useEffect(() => {
    if (!socket) return

    const onReconnect = () => {
      if (isReconnectingRef.current) {
        isReconnectingRef.current = false
        showBanner('Connection restored', 3000)
        flushPendingQueue()
        if (conversationIdRef.current) {
          socket.emit('message_seen', { conversationId: conversationIdRef.current })
          setTimeout(() => {
            fetchMessages(conversationIdRef.current!)
          }, RECONNECT_FETCH_DELAY)
        }
        setStudentTyping(false)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
      }
    }

    const onDisconnect = (reason: string) => {
      if (reason === 'io server disconnect' || reason === 'transport close') {
        isReconnectingRef.current = true
        showBanner('Connection lost', 0)
        setStudentTyping(false)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
      }
    }

    const onReconnecting = () => {
      isReconnectingRef.current = true
      showBanner('Reconnecting...', 0)
    }

    socket.on('reconnect', onReconnect)
    socket.on('disconnect', onDisconnect)
    socket.on('reconnecting', onReconnecting)

    return () => {
      socket.off('reconnect', onReconnect)
      socket.off('disconnect', onDisconnect)
      socket.off('reconnecting', onReconnecting)
    }
  }, [socket, showBanner, flushPendingQueue, fetchMessages])

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
    if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      emitStopTyping()
    }, 2000)
  }, [emitTyping, emitStopTyping])

  const sendMessage = useCallback(async (text: string) => {
    const s = socket
    if (!text.trim() || !conversationId) return

    const trimmed = text.trim()
    if (trimmed.length > 3000) return

    setSendError(null)
    setSending(true)

    if (isTypingRef.current) {
      isTypingRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (typingFadeTimeoutRef.current) clearTimeout(typingFadeTimeoutRef.current)
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

    if (s?.connected) {
      setMessages((prev) => {
        const next = [...prev, optimisticMsg]
        return next
      })
      s.emit('send_message', { message: trimmed, conversationId, clientMessageId })
    } else {
      pendingQueueRef.current = [...pendingQueueRef.current, {
        clientMessageId,
        text: trimmed,
        optimisticMsg,
      }]
      setMessages((prev) => {
        const next = [...prev, optimisticMsg]
        return next
      })
      showBanner('Message queued - will send when connected', 4000)
    }

    setSending(false)
  }, [conversationId, emitStopTyping, user?.id, socket, showBanner])

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
      ? (conversation.student as SupportSender)
      : null)
    : null

  const isStudentMessage = (msg: SupportMessage) => msg.senderRole === 'student'

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 60
      if (isAtBottom) {
        scrollRef.current.scrollTop = scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  const isInputDisabled = !conversationId || isOffline || isConnecting

  const connectionStatusColor = isOffline
    ? '#EF4444'
    : isReconnecting
    ? '#F59E0B'
    : '#10B981'

  const connectionStatusLabel = isOffline
    ? 'Offline'
    : isReconnecting
    ? 'Reconnecting...'
    : isConnecting
    ? 'Connecting...'
    : 'Connected'

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
      {/* Connection Banner */}
      {connectionBanner && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bengali transition-all duration-300"
          style={{
            backgroundColor: isOffline
              ? 'rgba(239,68,68,0.1)'
              : isReconnecting
              ? 'rgba(245,158,11,0.1)'
              : 'rgba(16,185,129,0.1)',
            color: isOffline
              ? 'var(--color-error)'
              : isReconnecting
              ? '#F59E0B'
              : '#10B981',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {isOffline && <WifiOff className="w-3 h-3" />}
          {isReconnecting && <RefreshCw className="w-3 h-3 animate-spin" />}
          {!isOffline && !isReconnecting && <Wifi className="w-3 h-3" />}
          {connectionBanner}
        </div>
      )}

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
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: connectionStatusColor }} title={connectionStatusLabel} />
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
                  width: '80%',
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

      {/* Typing Indicator with fade-out */}
      {studentTyping && (
        <div className="px-6 py-2 border-t flex items-center gap-2 transition-opacity duration-1500"
          style={{ borderColor: 'var(--color-border)', opacity: studentTyping ? 1 : 0 }}>
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
            placeholder={isInputDisabled ? (isOffline ? 'Offline - messages will be queued' : 'Connecting...') : 'Type a reply...'}
            rows={1}
            disabled={isInputDisabled || sending}
            className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all font-bengali"
            style={{
              backgroundColor: isInputDisabled ? 'var(--color-border)' : 'var(--color-bg)',
              color: isInputDisabled ? 'var(--color-text-muted)' : 'var(--color-text)',
              border: '1.5px solid',
              borderColor: 'var(--color-border)',
              maxHeight: '100px',
              overflowY: 'auto',
              opacity: isInputDisabled ? 0.6 : 1,
            }}
            onKeyDown={handleKeyDown}
            onInput={handleTypingChange}
          />
          <button
            onClick={handleSend}
            disabled={sending || !conversationId || isOffline || isConnecting}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: (sending || isOffline || isConnecting) ? 'var(--color-border)' : 'linear-gradient(135deg, #0E7C66 0%, #04342C 100%)',
              cursor: (sending || isOffline || isConnecting) ? 'not-allowed' : 'pointer',
              opacity: (isOffline || isConnecting) ? 0.5 : 1,
            }}
          >
            <ArrowUp className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </button>
        </div>
        <p className="text-[10px] text-right mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {isOffline ? 'Messages will be sent when reconnected' : 'Enter to send - Shift+Enter for newline'}
        </p>
      </div>
    </div>
  )
}