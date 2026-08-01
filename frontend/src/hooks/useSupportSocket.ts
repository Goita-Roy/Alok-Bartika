/**
 * useSupportSocket — manages the Socket.IO connection lifecycle for student live chat.
 *
 * Responsibilities:
 *  - Create / destroy the socket tied to the authenticated student's JWT
 *  - Emit join_room on connect so the student enters their private room
 *  - Expose the raw socket instance so useSupportChat can register event listeners
 *  - Handle automatic reconnect (built into Socket.IO client)
 *  - Guarantee no duplicate sockets and no memory leaks on unmount
 */

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// The backend URL without the /api prefix — Socket.IO lives at the root
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:5000'

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'

interface UseSupportSocketOptions {
  /** JWT token from localStorage / AuthContext */
  token: string | null
  /** Whether the chat modal is open — only connect when open */
  enabled: boolean
}

interface UseSupportSocketReturn {
  socket: Socket | null
  status: SocketStatus
}

export function useSupportSocket({ token, enabled }: UseSupportSocketOptions): UseSupportSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const [status, setStatus] = useState<SocketStatus>('idle')

  useEffect(() => {
    // Only open a connection when enabled=true and we have a valid token
    if (!enabled || !token) {
      // If there was an existing socket, disconnect it
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setStatus('idle')
      }
      return
    }

    // Guard: don't create a second socket if one is already open
    if (socketRef.current && socketRef.current.connected) return

    setStatus('connecting')

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setStatus('connected')
      // Join own support room immediately on (re)connect
      socket.emit('join_room', {})
    })

    socket.on('connect_error', (err) => {
      console.error('[useSupportSocket] connect_error:', err.message)
      setStatus('error')
    })

    socket.on('disconnect', (reason) => {
      setStatus('disconnected')
      if (reason === 'io server disconnect') {
        // Server forcibly disconnected us (e.g., JWT expired) — don't auto-reconnect
        socket.off()
      }
    })

    socket.on('reconnect', () => {
      setStatus('connected')
      // Re-join room after reconnect
      socket.emit('join_room', {})
    })

    return () => {
      // Cleanup: remove all listeners and disconnect on unmount / dependency change
      socket.off()
      socket.disconnect()
      socketRef.current = null
      setStatus('idle')
    }
  }, [token, enabled])

  return { socket: socketRef.current, status }
}
