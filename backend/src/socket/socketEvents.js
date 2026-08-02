/**
 * Socket.IO Event Handlers — Student Support Chat
 *
 * Room conventions:
 *   Student  → joins `support:<studentId>`  (private room per student)
 *   Admin    → joins `admin-support`         (shared room for all admins/super-admins)
 *
 * Events (client → server):
 *   join_room       – join the appropriate socket room
 *   leave_room      – leave the socket room
 *   send_message    – persist message, broadcast to counterpart
 *   typing          – broadcast typing indicator to counterpart
 *   stop_typing     – stop typing indicator
 *   message_seen    – mark messages read, broadcast seen status
 *
 * Events (server → client):
 *   receive_message – new message payload
 *   typing          – typing indicator
 *   stop_typing     – stop typing indicator
 *   message_seen    – seen confirmation
 *   error           – structured error event (never crashes the server)
 */

const mongoose = require('mongoose')
const { SupportConversation } = require('../models/SupportConversation')
const { SupportMessage } = require('../models/SupportMessage')
const { env } = require('../config/env')

const isDev = env.nodeEnv !== 'production'

// ── Socket-level rate limiting ──────────────────────────────────────
// Prevents spam without affecting normal conversation pace.
// In-memory store — cleared on server restart (acceptable for this use case).

/**
 * Track recent event timestamps per user.
 * Key format: `${userId}:${eventName}`
 */
const socketRateLimitStore = new Map()

/**
 * Check if a socket event is within the allowed rate limit.
 * Returns true if the event is allowed, false if it should be throttled.
 */
function checkSocketRateLimit(userId, eventName, limit, windowMs) {
  const key = `${userId}:${eventName}`
  const now = Date.now()
  const timestamps = socketRateLimitStore.get(key) || []

  // Prune timestamps outside the current window
  const windowStart = now - windowMs
  const recent = timestamps.filter((t) => t > windowStart)

  if (recent.length >= limit) {
    return false
  }

  recent.push(now)
  socketRateLimitStore.set(key, recent)
  return true
}

// Cleanup stale entries every 60 seconds to prevent memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of socketRateLimitStore.entries()) {
    const windowStart = now - 60000
    const recent = timestamps.filter((t) => t > windowStart)
    if (recent.length === 0) {
      socketRateLimitStore.delete(key)
    } else {
      socketRateLimitStore.set(key, recent)
    }
  }
}, 60000)

// Rate limit configs
const SEND_MESSAGE_LIMIT = { max: 5, windowMs: 10000 } // 5 messages per 10s
const TYPING_LIMIT = { max: 1, windowMs: 1000 } // 1 typing event per 1s

// ─────────────────────────────────────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the socket room name for a given user.
 * Students get a private room; admins / super-admins share a single room.
 */
function resolveRoom(user) {
  if (user.role === 'student') return `support:${user._id}`
  if (user.role === 'admin' || user.role === 'super-admin') return 'admin-support'
  return null
}

/**
 * Resolve the *counterpart* room to broadcast to.
 * If sender is a student → broadcast to admin-support.
 * If sender is admin/super-admin → broadcast to support:<studentId>.
 */
function resolveCounterpartRoom(senderRole, studentId) {
  if (senderRole === 'student') return 'admin-support'
  if (senderRole === 'admin' || senderRole === 'super-admin') {
    return studentId ? `support:${studentId}` : null
  }
  return null
}

/**
 * Emit a structured error to a single socket without crashing the server.
 */
function emitError(socket, code, message) {
  socket.emit('error', { code, message })
}

/**
 * Log only in development to avoid leaking internals in production.
 */
function devLog(...args) {
  if (isDev) console.log('[socket]', ...args)
}

/**
 * Validate that a conversationId is a proper ObjectId string.
 */
function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
}

// ─────────────────────────────────────────────────────────────────────────────
// join_room
// ─────────────────────────────────────────────────────────────────────────────

async function joinSupportRoom(socket, _payload) {
  try {
    const { user } = socket

    const room = resolveRoom(user)
    if (!room) {
      return emitError(socket, 'INVALID_ROLE', 'Your role cannot join a support room')
    }

    // SECURITY: A student may only join their own private room.
    // (resolveRoom already enforces this — log any attempt to be sure.)
    await socket.join(room)
    devLog(`${user.role} ${user._id} joined room "${room}"`)

    socket.emit('room_joined', { room })
  } catch (error) {
    console.error('[socket] join_room error:', error.message)
    emitError(socket, 'JOIN_FAILED', 'Failed to join support room')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// leave_room
// ─────────────────────────────────────────────────────────────────────────────

async function leaveSupportRoom(socket, _payload) {
  try {
    const { user } = socket
    const room = resolveRoom(user)
    if (room) {
      await socket.leave(room)
      devLog(`${user.role} ${user._id} left room "${room}"`)
    }
  } catch (error) {
    console.error('[socket] leave_room error:', error.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// send_message  →  save to MongoDB first, then broadcast receive_message
// ─────────────────────────────────────────────────────────────────────────────

async function saveAndBroadcastMessage(io, socket, payload) {
  try {
     const { user } = socket
     const { conversationId, message, clientMessageId } = payload || {}

    // ── Validate payload ──────────────────────────────────────────────────
    if (!message || typeof message !== 'string' || !message.trim()) {
      return emitError(socket, 'INVALID_MESSAGE', 'Message text is required')
    }

    const trimmed = message.trim()
    if (trimmed.length > 3000) {
      return emitError(socket, 'MESSAGE_TOO_LONG', 'Message exceeds 3000 characters')
    }

    // ── Resolve or create conversation ────────────────────────────────────
    let conversation = null

    if (conversationId) {
      if (!isValidObjectId(conversationId)) {
        return emitError(socket, 'INVALID_CONVERSATION_ID', 'Invalid conversation ID')
      }

      conversation = await SupportConversation.findById(conversationId)
      if (!conversation) {
        return emitError(socket, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
      }

      // SECURITY: student cannot post to another student's conversation
      const isOwner = conversation.student.toString() === user._id
      const isAdmin = user.role === 'admin' || user.role === 'super-admin'
      if (!isOwner && !isAdmin) {
        return emitError(socket, 'ACCESS_DENIED', 'You cannot post to another user\'s conversation')
      }
    } else {
      // Students who don't provide a conversationId get their active one (or a new one)
      if (user.role !== 'student') {
        return emitError(socket, 'ADMIN_NEEDS_CONVERSATION_ID', 'Admins must provide a conversationId')
      }

      conversation = await SupportConversation.findOne({ student: user._id, status: 'open' })
      if (!conversation) {
        conversation = await SupportConversation.create({
          student: user._id,
          status: 'open',
          lastMessage: trimmed,
          lastMessageAt: new Date(),
        })
      }
    }

    // ── Persist message to MongoDB ────────────────────────────────────────
    const newMessage = await SupportMessage.create({
      conversation: conversation._id,
      sender: user._id,
      senderRole: user.role,
      message: trimmed,
      read: false,
    })

    // ── Update conversation summary ───────────────────────────────────────
    const isStudentSender = user.role === 'student'
    await SupportConversation.findByIdAndUpdate(conversation._id, {
      $set: {
        lastMessage: trimmed,
        lastMessageAt: new Date(),
        status: 'open',
      },
      $inc: isStudentSender ? { unreadAdmin: 1 } : { unreadStudent: 1 },
    })

    // ── Populate sender before broadcasting ───────────────────────────────
    const populated = await SupportMessage.findById(newMessage._id)
      .populate('sender', 'fullName email role')
      .lean()

    const broadcastPayload = {
      conversationId: conversation._id.toString(),
      studentId: conversation.student.toString(),
      message: populated,
      clientMessageId: clientMessageId || undefined,
    }

    // ── Broadcast to counterpart room only ────────────────────────────────
    const counterpartRoom = resolveCounterpartRoom(user.role, conversation.student.toString())
    if (counterpartRoom) {
      io.to(counterpartRoom).emit('receive_message', broadcastPayload)
    }

    // ── Also confirm back to the sender ──────────────────────────────────
    socket.emit('message_sent', broadcastPayload)

    devLog(`Message saved & broadcast: conv=${conversation._id} sender=${user._id}`)
  } catch (error) {
    console.error('[socket] send_message error:', error.message)
    emitError(socket, 'SEND_FAILED', 'Failed to send message. Please try again.')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// typing / stop_typing
// ─────────────────────────────────────────────────────────────────────────────

function handleTyping(io, socket, payload, eventName) {
  try {
    const { user } = socket
    const { conversationId, studentId } = payload || {}

    const counterpartRoom = resolveCounterpartRoom(
      user.role,
      user.role === 'student' ? user._id : studentId,
    )

    if (!counterpartRoom) {
      return // silently ignore — no valid target room
    }

    io.to(counterpartRoom).emit(eventName, {
      conversationId: conversationId || null,
      userId: user._id,
      role: user.role,
      fullName: user.fullName,
    })
  } catch (error) {
    console.error(`[socket] ${eventName} error:`, error.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// message_seen
// ─────────────────────────────────────────────────────────────────────────────

async function handleMessageSeen(io, socket, payload) {
  try {
    const { user } = socket
    const { conversationId } = payload || {}

    if (!isValidObjectId(conversationId)) {
      return emitError(socket, 'INVALID_CONVERSATION_ID', 'Valid conversationId is required')
    }

    const conversation = await SupportConversation.findById(conversationId)
    if (!conversation) {
      return emitError(socket, 'CONVERSATION_NOT_FOUND', 'Conversation not found')
    }

    // SECURITY: only the owner (student) or admin may mark messages read
    const isOwner = conversation.student.toString() === user._id
    const isAdmin = user.role === 'admin' || user.role === 'super-admin'
    if (!isOwner && !isAdmin) {
      return emitError(socket, 'ACCESS_DENIED', 'Access denied')
    }

    // Mark all messages sent by the OTHER party as read
    await SupportMessage.updateMany(
      { conversation: conversationId, sender: { $ne: user._id }, read: false },
      { $set: { read: true } },
    )

    // Reset the unread counter for the viewer
    const resetField = user.role === 'student' ? { unreadStudent: 0 } : { unreadAdmin: 0 }
    await SupportConversation.findByIdAndUpdate(conversationId, { $set: resetField })

    // Broadcast seen status to the counterpart room
    const counterpartRoom = resolveCounterpartRoom(user.role, conversation.student.toString())
    const seenPayload = {
      conversationId,
      seenBy: user._id,
      seenByRole: user.role,
    }

    if (counterpartRoom) {
      io.to(counterpartRoom).emit('message_seen', seenPayload)
    }
    // Confirm back to sender
    socket.emit('message_seen', seenPayload)

    devLog(`message_seen: conv=${conversationId} seenBy=${user._id}`)
  } catch (error) {
    console.error('[socket] message_seen error:', error.message)
    emitError(socket, 'SEEN_FAILED', 'Failed to mark messages as seen')
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main event registration (called once per socket connection)
// ─────────────────────────────────────────────────────────────────────────────

function registerSocketEvents(io, socket) {
  const { user } = socket

  devLog(`connect: userId=${user._id} role=${user.role} socketId=${socket.id}`)

  // ── join_room ─────────────────────────────────────────────────────────────
  socket.on('join_room', (payload) => joinSupportRoom(socket, payload))

  // ── leave_room ────────────────────────────────────────────────────────────
  socket.on('leave_room', (payload) => leaveSupportRoom(socket, payload))

  // ── send_message ──────────────────────────────────────────────────────────
  socket.on('send_message', (payload) => {
    if (!checkSocketRateLimit(user._id, 'send_message', SEND_MESSAGE_LIMIT.max, SEND_MESSAGE_LIMIT.windowMs)) {
      return emitError(socket, 'RATE_LIMITED', 'Too many messages. Please wait a moment.')
    }
    saveAndBroadcastMessage(io, socket, payload)
  })

  // ── typing ────────────────────────────────────────────────────────────────
  socket.on('typing', (payload) => {
    if (!checkSocketRateLimit(user._id, 'typing', TYPING_LIMIT.max, TYPING_LIMIT.windowMs)) {
      return
    }
    handleTyping(io, socket, payload, 'typing')
  })

  // ── stop_typing ───────────────────────────────────────────────────────────
  socket.on('stop_typing', (payload) => {
    if (!checkSocketRateLimit(user._id, 'stop_typing', TYPING_LIMIT.max, TYPING_LIMIT.windowMs)) {
      return
    }
    handleTyping(io, socket, payload, 'stop_typing')
  })

  // ── message_seen ──────────────────────────────────────────────────────────
  socket.on('message_seen', (payload) => handleMessageSeen(io, socket, payload))

  // ── disconnect ────────────────────────────────────────────────────────────
  socket.on('disconnect', (reason) => {
    devLog(`disconnect: userId=${user._id} role=${user.role} socketId=${socket.id} reason=${reason}`)
    // Socket.IO automatically removes the socket from all rooms on disconnect.
    // No manual cleanup required — there are no server-side maps to purge.
  })

  // ── catch-all for unhandled events (dev only) ─────────────────────────────
  if (isDev) {
    socket.onAny((event, ...args) => {
      const knownEvents = ['join_room', 'leave_room', 'send_message', 'typing', 'stop_typing', 'message_seen', 'disconnect']
      if (!knownEvents.includes(event)) {
        console.warn('[socket] Unknown event received:', event, args)
      }
    })
  }
}

module.exports = { registerSocketEvents }
