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

export type SocketStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected'

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
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<SocketStatus>('idle')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Only open a connection when enabled=true and we have a valid token
    if (!enabled || !token) {
      // If there was an existing socket, disconnect it
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setStatus('idle')
      }
      return
    }

    // Guard: don't create a second socket if one is already open
    if (socketRef.current && socketRef.current.connected) return

    setStatus('connecting')

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setStatus('connected')
      // Join own support room immediately on (re)connect
      newSocket.emit('join_room', {})
    })

    newSocket.on('connect_error', () => {
      setStatus('error')
    })

    newSocket.on('reconnect_attempt', () => {
      setStatus('reconnecting')
    })

    newSocket.on('reconnecting', () => {
      setStatus('reconnecting')
    })

    newSocket.on('error', () => {
      setStatus('error')
    })

    newSocket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        setStatus('disconnected')
        newSocket.off()
      } else {
        setStatus('reconnecting')
      }
    })

    newSocket.on('reconnect', () => {
      setStatus('connected')
      // Re-join room after reconnect
      newSocket.emit('join_room', {})
    })

    return () => {
      // Cleanup: remove all listeners and disconnect on unmount / dependency change
      newSocket.off()
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setStatus('idle')
    }
  }, [token, enabled])

  return { socket, status }
}
