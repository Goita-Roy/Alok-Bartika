/**
 * useSupportChat — manages all chat state and operations for the student live chat modal.
 *
 * Features:
 *  - Loads conversation and message history from REST API on mount
 *  - Optimistic message insertion for instant perceived send
 *  - Emits send_message via socket (falls back to REST if socket not connected)
 *  - Receives incoming messages in real-time via socket events
 *  - Typing / stop_typing indicator
 *  - Auto-marks messages read when conversation is viewed
 *  - Cleans up all socket listeners on unmount to prevent memory leaks
 *  - Deduplicates messages using _id tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import api from '../config/api'
import type { SupportMessage, SupportConversation } from '../types/support'

interface UseSupportChatOptions {
  socket: Socket | null
  userId: string | null
  enabled: boolean
}

interface UseSupportChatReturn {
  conversation: SupportConversation | null
  messages: SupportMessage[]
  loadingHistory: boolean
  historyError: string | null
  sending: boolean
  sendError: string | null
  adminTyping: boolean
  sendMessage: (text: string) => Promise<void>
  emitTyping: () => void
  emitStopTyping: () => void
  markRead: () => void
}

export function useSupportChat({ socket, userId, enabled }: UseSupportChatOptions): UseSupportChatReturn {
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [adminTyping, setAdminTyping] = useState(false)

  // Track seen message IDs to prevent duplicates
  const seenIds = useRef<Set<string>>(new Set())
  // Typing timeout ref — clear after 3s of no typing events
  const adminTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track conversation ref for use inside socket callbacks
  const conversationRef = useRef<SupportConversation | null>(null)
  conversationRef.current = conversation

  // ── Load conversation + message history ────────────────────────────────────
  useEffect(() => {
    if (!enabled || !userId) return

    let cancelled = false

    const load = async () => {
      setLoadingHistory(true)
      setHistoryError(null)
      setMessages([])
      seenIds.current.clear()

      try {
        // Get or create conversation
        const convRes = await api.get<{ conversation: SupportConversation | null }>('/support/conversation')
        const conv = convRes.data.conversation

        if (cancelled) return

        if (!conv) {
          // No conversation yet — nothing to load, will be created on first send
          setConversation(null)
          setLoadingHistory(false)
          return
        }

        setConversation(conv)

        // Load messages for this conversation
        const msgRes = await api.get<{ messages: SupportMessage[] }>(`/support/messages/${conv._id}`)
        if (cancelled) return

        const msgs = msgRes.data.messages || []
        msgs.forEach((m) => seenIds.current.add(m._id))
        setMessages(msgs)
      } catch (err: unknown) {
        if (!cancelled) {
          setHistoryError('বার্তা লোড করা যায়নি। পুনরায় চেষ্টা করুন।')
        }
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [enabled, userId])

  // ── Socket event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    // New message arriving from admin
    const onReceiveMessage = (payload: {
      conversationId: string
      studentId: string
      message: SupportMessage
    }) => {
      const msg = payload.message
      if (!msg?._id) return
      if (seenIds.current.has(msg._id)) return // deduplicate

      seenIds.current.add(msg._id)
      setMessages((prev) => [...prev, msg])

      // Update conversation snapshot
      setConversation((prev) =>
        prev
          ? {
              ...prev,
              lastMessage: msg.message,
              lastMessageAt: msg.createdAt,
              unreadStudent: prev.unreadStudent + 1,
            }
          : prev,
      )
    }

    // Sender confirmation (our own message was saved successfully)
    const onMessageSent = (payload: {
      conversationId: string
      studentId: string
      message: SupportMessage
    }) => {
      const savedMsg = payload.message
      if (!savedMsg?._id) return

      setMessages((prev) => {
        // Replace any optimistic placeholder for this message
        const withoutOptimistic = prev.filter((m) => {
          if (m._optimistic && m.message === savedMsg.message) return false
          return true
        })
        if (seenIds.current.has(savedMsg._id)) return withoutOptimistic
        seenIds.current.add(savedMsg._id)
        return [...withoutOptimistic, savedMsg]
      })

      // Persist conversation id so next messages can reference it
      if (payload.conversationId) {
        setConversation((prev) =>
          prev
            ? { ...prev, _id: payload.conversationId }
            : ({
                _id: payload.conversationId,
                student: userId ?? '',
                status: 'open',
                unreadStudent: 0,
                unreadAdmin: 0,
                lastMessage: savedMsg.message,
                lastMessageAt: savedMsg.createdAt,
                createdAt: savedMsg.createdAt,
                updatedAt: savedMsg.createdAt,
              } as SupportConversation),
        )
      }
    }

    // Admin is typing
    const onTyping = () => {
      setAdminTyping(true)
      if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current)
      adminTypingTimeout.current = setTimeout(() => setAdminTyping(false), 3000)
    }

    // Admin stopped typing
    const onStopTyping = () => {
      if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current)
      setAdminTyping(false)
    }

    // Message seen confirmation from admin
    const onMessageSeen = () => {
      setMessages((prev) =>
        prev.map((m) => (m.senderRole === 'student' ? { ...m, read: true } : m)),
      )
    }

    socket.on('receive_message', onReceiveMessage)
    socket.on('message_sent', onMessageSent)
    socket.on('typing', onTyping)
    socket.on('stop_typing', onStopTyping)
    socket.on('message_seen', onMessageSeen)

    return () => {
      socket.off('receive_message', onReceiveMessage)
      socket.off('message_sent', onMessageSent)
      socket.off('typing', onTyping)
      socket.off('stop_typing', onStopTyping)
      socket.off('message_seen', onMessageSeen)
      if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current)
    }
  }, [socket, userId])

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || trimmed.length > 3000) return

      setSendError(null)
      setSending(true)

      const conversationId = conversationRef.current?._id ?? undefined

      // Optimistic UI — insert the message immediately
      const optimisticMsg: SupportMessage = {
        _id: `opt_${Date.now()}`,
        conversation: conversationId ?? '',
        sender: { _id: userId ?? '', fullName: 'আপনি', email: '', role: 'student' },
        senderRole: 'student',
        message: trimmed,
        read: false,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      }
      setMessages((prev) => [...prev, optimisticMsg])

      try {
        if (socket?.connected) {
          // Real-time path: emit via socket — server saves and sends back message_sent
          socket.emit('send_message', { message: trimmed, conversationId })
        } else {
          // Fallback path: save via REST API directly
          const res = await api.post<{ data: SupportMessage; conversationId: string }>('/support/message', {
            message: trimmed,
            conversationId,
          })

          const savedMsg = res.data.data
          if (savedMsg?._id) {
            // Remove optimistic, add real message
            setMessages((prev) => {
              const without = prev.filter((m) => !m._optimistic || m.message !== trimmed)
              if (seenIds.current.has(savedMsg._id)) return without
              seenIds.current.add(savedMsg._id)
              return [...without, savedMsg]
            })
            if (res.data.conversationId) {
              setConversation((prev) =>
                prev
                  ? { ...prev, _id: res.data.conversationId }
                  : null,
              )
            }
          }
        }
      } catch (err: unknown) {
        // Remove optimistic on failure
        setMessages((prev) => prev.filter((m) => !m._optimistic || m.message !== trimmed))
        setSendError('বার্তা পাঠানো যায়নি। পুনরায় চেষ্টা করুন।')
      } finally {
        setSending(false)
      }
    },
    [socket, userId],
  )

  // ── Typing indicators ──────────────────────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!socket?.connected) return
    const conversationId = conversationRef.current?._id
    socket.emit('typing', { conversationId })
  }, [socket])

  const emitStopTyping = useCallback(() => {
    if (!socket?.connected) return
    const conversationId = conversationRef.current?._id
    socket.emit('stop_typing', { conversationId })
  }, [socket])

  // ── Mark messages read ─────────────────────────────────────────────────────
  const markRead = useCallback(() => {
    const convId = conversationRef.current?._id
    if (!convId) return

    // Reset local unread counter
    setConversation((prev) => (prev ? { ...prev, unreadStudent: 0 } : prev))

    if (socket?.connected) {
      socket.emit('message_seen', { conversationId: convId })
    } else {
      // REST fallback
      api.patch('/support/read', { conversationId: convId }).catch(() => {/* non-critical */})
    }
  }, [socket])

  return {
    conversation,
    messages,
    loadingHistory,
    historyError,
    sending,
    sendError,
    adminTyping,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markRead,
  }
}
