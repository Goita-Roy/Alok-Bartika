/**
 * Socket.IO Server Initializer
 *
 * Call `initSocket(httpServer, allowedOrigins)` once from server.js after the
 * HTTP server is created.  Returns the `io` instance in case it is needed
 * elsewhere (e.g., for broadcasting from REST controllers).
 *
 * Architecture:
 *   server.js  →  initSocket(httpServer)
 *                     ↓
 *                 socketAuth  (JWT middleware)
 *                     ↓
 *                 registerSocketEvents  (per-connection event wiring)
 */

const { Server } = require('socket.io')
const { socketAuth } = require('./socketAuth')
const { registerSocketEvents } = require('./socketEvents')
const { env } = require('../config/env')

let _io = null

/**
 * Initialize and return a Socket.IO server attached to `httpServer`.
 *
 * @param {import('http').Server} httpServer  Node HTTP server instance
 * @param {string[]}              allowedOrigins  CORS allowed origins (mirrors Express CORS)
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        // Allow requests with no origin (e.g., local Postman / native apps)
        if (!origin) return cb(null, true)
        if (allowedOrigins.includes(origin)) return cb(null, true)
        cb(new Error(`Socket.IO CORS: origin '${origin}' not allowed`))
      },
      credentials: true,
    },
    // Ping settings — keep connections alive without excessive overhead
    pingTimeout: 60000,
    pingInterval: 25000,
    // Transports: prefer WebSocket, fall back to polling
    transports: ['websocket', 'polling'],
  })

  // ── JWT Authentication Middleware ─────────────────────────────────────────
  io.use(socketAuth)

  // ── Per-connection event wiring ───────────────────────────────────────────
  io.on('connection', (socket) => {
    registerSocketEvents(io, socket)
  })

  // ── Global error handler (never crashes the process) ─────────────────────
  io.engine.on('connection_error', (err) => {
    console.error('[socket.io] Engine connection error:', err.code, err.message)
  })

  _io = io

  if (env.nodeEnv !== 'production') {
    console.log('[socket.io] Server initialized')
  }

  return io
}

/**
 * Access the singleton Socket.IO instance from anywhere in the backend
 * (e.g., from REST controllers that need to emit real-time events).
 *
 * Returns null if initSocket() has not been called yet.
 */
function getIo() {
  return _io
}

module.exports = { initSocket, getIo }
