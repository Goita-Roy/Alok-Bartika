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
 *  - Reconnection sync: refreshes conversation + messages + emits seen on reconnect
 *  - Clears typing indicator on disconnect/reconnect to prevent stuck states
 *  - Plays notification sound for incoming messages when tab is inactive
 *  - Shows browser notification for incoming messages when tab is inactive
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { Socket } from 'socket.io-client'
import api from '../config/api'
import { sanitizeText } from '../utils/sanitize'
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
  hasMore: boolean
  sending: boolean
  sendError: string | null
  adminTyping: boolean
  sendMessage: (text: string) => Promise<void>
  emitTyping: () => void
  emitStopTyping: () => void
  markRead: () => void
  loadOlderMessages: () => Promise<void>
}

// ── Notification sound (Web Audio API sine wave) ────────────────────────
let audioCtx: AudioContext | null = null
function playNotificationSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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

function showBrowserNotification(title: string, body: string, tag: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return
  try {
    new Notification(title, { body, tag })
  } catch {
    // Notifications not available
  }
}

export function useSupportChat({ socket, userId, enabled }: UseSupportChatOptions): UseSupportChatReturn {
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [adminTyping, setAdminTyping] = useState(false)

  // Track seen message IDs to prevent duplicates
  const seenIds = useRef<Set<string>>(new Set())
  // Buffer for realtime messages arriving while history is loading
  const messageBuffer = useRef<SupportMessage[]>([])
  // Typing timeout ref — clear after 3s of no typing events
  const adminTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track conversation ref for use inside socket callbacks
  const conversationRef = useRef<SupportConversation | null>(null)
  // Track loading state via ref so socket handlers always see the latest value
  const loadingHistoryRef = useRef(loadingHistory)
  // Track whether initial history has been loaded (for reconnection sync)
  const hasLoadedHistoryRef = useRef(false)
  // Track enabled state for use inside socket callbacks
  const enabledRef = useRef(enabled)

  useEffect(() => {
    conversationRef.current = conversation
  }, [conversation])

  useEffect(() => {
    loadingHistoryRef.current = loadingHistory
  }, [loadingHistory])

  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  // ── Helper: refresh conversation + messages (used by reconnection sync) ──
  const refreshConversation = useCallback(async () => {
    try {
      const convRes = await api.get<{ conversation: SupportConversation | null }>('/support/conversation')
      const conv = convRes.data.conversation
      if (conv) {
        setConversation(conv)
        const msgRes = await api.get<{ messages: SupportMessage[]; hasMore: boolean }>(`/support/messages/${conv._id}`)
        const msgs = msgRes.data.messages || []
        const mergedById = new Map<string, SupportMessage>()
        msgs.forEach((m) => {
          seenIds.current.add(m._id)
          mergedById.set(m._id, m)
        })
        setMessages(Array.from(mergedById.values()))
        setHasMore(msgRes.data.hasMore ?? false)
      }
    } catch {
      // Non-critical — keep existing messages
    }
  }, [])

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
          hasLoadedHistoryRef.current = true
          return
        }

        setConversation(conv)

         // Load messages for this conversation
         const msgRes = await api.get<{ messages: SupportMessage[]; hasMore: boolean }>(`/support/messages/${conv._id}`)
         if (cancelled) return

         const msgs = msgRes.data.messages || []
         msgs.forEach((m) => seenIds.current.add(m._id))

         // Merge history + buffered realtime messages
         const buffered = messageBuffer.current
         messageBuffer.current = []

         const merged = [...msgs, ...buffered]
         const mergedById = new Map<string, SupportMessage>()
         merged.forEach((m) => mergedById.set(m._id, m))
         const deduped = Array.from(mergedById.values())
         deduped.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

          // Register all merged message IDs in seenIds (history + buffered)
          deduped.forEach((m) => seenIds.current.add(m._id))

         setMessages(deduped)
         setHasMore(msgRes.data.hasMore ?? false)
         hasLoadedHistoryRef.current = true
      } catch {
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
      if (payload.conversationId !== conversationRef.current?._id) return
      const msg = payload.message
      if (!msg?._id) return
      if (seenIds.current.has(msg._id)) return // deduplicate

      // Defense-in-depth: sanitize message text on client
      if (msg.message) {
        msg.message = sanitizeText(msg.message)
      }

      // If history is still loading, buffer the message for later merge
      if (loadingHistoryRef.current) {
        messageBuffer.current = [...messageBuffer.current, msg]
        return
      }

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

      // Play notification sound when document is not visible (tab inactive)
      if (document.visibilityState !== 'visible') {
        playNotificationSound()
        showBrowserNotification(
          'আলোকবর্তিকা সহায়তা',
          `${msg.sender?.fullName || 'সহায়তা'}: ${msg.message}`,
          `conv-${payload.conversationId}`,
        )
      }
    }

     // Sender confirmation (our own message was saved successfully)
      const onMessageSent = (payload: {
        conversationId: string
        studentId: string
        message: SupportMessage
        clientMessageId?: string
      }) => {
        if (payload.conversationId !== conversationRef.current?._id) {
          // If we don't have a conversation yet but the server sent one back,
          // accept it (first message may have created the conversation server-side)
          if (conversationRef.current?._id) return
          if (!payload.conversationId) return
        }
        const savedMsg = payload.message
        const matchedClientId = payload.clientMessageId
        if (!savedMsg?._id) return

        // Defense-in-depth: sanitize message text on client
        if (savedMsg.message) {
          savedMsg.message = sanitizeText(savedMsg.message)
        }

         setMessages((prev) => {
          // If the saved message is already in state, return unchanged (idempotent)
          if (prev.some((m) => m._id === savedMsg._id)) return prev

          // Replace the matching optimistic placeholder for this message
          const withoutOptimistic = prev.filter((m) => {
            if (m._optimistic && m.clientMessageId === matchedClientId) return false
            return true
          })
          const next = [...withoutOptimistic, savedMsg]
          return next
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

    // Admin has seen the messages — only mark student messages as read when
    // the event originates from an admin (not from the student's own markRead call)
    const onMessageSeen = (payload: { seenByRole?: string } | undefined) => {
      if (!payload || payload.seenByRole !== 'admin') return
      setMessages((prev) =>
        prev.map((m) => (m.senderRole === 'student' ? { ...m, read: true } : m)),
      )
    }

    // Socket error event — remove optimistic messages, stop spinner, show error
    const onError = (error: { code?: string; message?: string }) => {
      setMessages((prev) => prev.filter((m) => !m._optimistic))
      setSending(false)
      setSendError(
        error?.message || 'বার্তা পাঠানো ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।',
      )
    }

    // Socket disconnect — clear typing state, remove optimistic messages
    const onDisconnect = () => {
      setMessages((prev) => prev.filter((m) => !m._optimistic))
      setSending(false)
      setSendError('সংযোগ হারিয়ে গেছে। বার্তা পাঠানো ব্যর্থ হয়েছে।')
      // Clear typing indicator to prevent stuck state after reconnect
      setAdminTyping(false)
      if (adminTypingTimeout.current) {
        clearTimeout(adminTypingTimeout.current)
        adminTypingTimeout.current = null
      }
    }

    // Reconnection sync — refresh conversation + messages + emit seen
    const onConnect = () => {
      if (!hasLoadedHistoryRef.current || !enabledRef.current) return
      // Clear any stale typing state from previous session
      setAdminTyping(false)
      if (adminTypingTimeout.current) {
        clearTimeout(adminTypingTimeout.current)
        adminTypingTimeout.current = null
      }
      // Refresh data from server (deduplication prevents message duplication)
      refreshConversation()
      // Re-emit message_seen to sync read status
      const convId = conversationRef.current?._id
      if (convId) {
        socket.emit('message_seen', { conversationId: convId })
      }
    }

    socket.on('receive_message', onReceiveMessage)
    socket.on('message_sent', onMessageSent)
    socket.on('typing', onTyping)
    socket.on('stop_typing', onStopTyping)
    socket.on('message_seen', onMessageSeen)
    socket.on('error', onError)
    socket.on('disconnect', onDisconnect)
    socket.on('connect', onConnect)

    return () => {
      socket.off('receive_message', onReceiveMessage)
       socket.off('message_sent', onMessageSent)
       socket.off('typing', onTyping)
       socket.off('stop_typing', onStopTyping)
       socket.off('message_seen', onMessageSeen)
       socket.off('error', onError)
       socket.off('disconnect', onDisconnect)
       socket.off('connect', onConnect)
       if (adminTypingTimeout.current) clearTimeout(adminTypingTimeout.current)
     }
  }, [socket, userId, refreshConversation])

// ── Send message ───────────────────────────────────────────────────────────
   const sendMessage = useCallback(
     async (text: string) => {
       const trimmed = text.trim()
       if (!trimmed || trimmed.length > 3000) return

       setSendError(null)
       setSending(true)

       const conversationId = conversationRef.current?._id ?? undefined

        const clientMessageId = crypto.randomUUID()

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
         clientMessageId,
       }
       setMessages((prev) => [...prev, optimisticMsg])

       try {
           if (socket?.connected) {
             socket.emit('send_message', { message: trimmed, conversationId, clientMessageId })
         } else {
          // Fallback path: save via REST API directly
          const res = await api.post<{ data: SupportMessage; conversationId: string; clientMessageId: string }>('/support/message', {
            message: trimmed,
            conversationId,
            clientMessageId,
          })

          const savedMsg = res.data.data
          if (savedMsg?._id) {
            // Defense-in-depth: sanitize message text on client
            if (savedMsg.message) {
              savedMsg.message = sanitizeText(savedMsg.message)
            }
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
                  : ({
                      _id: res.data.conversationId,
                      student: userId ?? '',
                      status: 'open',
                      unreadStudent: 0,
                      unreadAdmin: 0,
                      lastMessage: trimmed,
                      lastMessageAt: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    } as SupportConversation),
              )
            }
          }
        }
      } catch {
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

  // ── Load older messages (pagination) ──────────────────────────────────
  const loadOlderMessages = useCallback(async () => {
    const convId = conversationRef.current?._id
    if (!convId || !messages.length) return

    const oldestMsg = messages[0]
    const before = oldestMsg.createdAt

    try {
      const res = await api.get<{ messages: SupportMessage[]; hasMore: boolean }>(
        `/support/messages/${convId}`,
        { params: { limit: 50, before } },
      )

      const olderMsgs = res.data.messages || []
      if (olderMsgs.length === 0) {
        setHasMore(false)
        return
      }

      // Register loaded message IDs in seenIds
      olderMsgs.forEach((m) => seenIds.current.add(m._id))

      setMessages((prev) => {
        const prevIds = new Set(prev.map((m) => m._id))
        const newMsgs = olderMsgs.filter((m) => !prevIds.has(m._id))
        return [...newMsgs, ...prev]
      })

      setHasMore(res.data.hasMore ?? false)
    } catch {
      // Silently fail — pagination is non-critical
    }
  }, [messages])

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
    hasMore,
    sending,
    sendError,
    adminTyping,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markRead,
    loadOlderMessages,
  }
}
