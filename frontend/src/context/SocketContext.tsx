import React, { createContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:5000'

type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'offline'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  connectionState: ConnectionState
}

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>('offline')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
        setConnectionState('offline')
      }
      return
    }

    if (socketRef.current && socketRef.current.connected) return

    setConnectionState('connecting')

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socketRef.current = s
    setSocket(s)

    s.on('connect', () => {
      s.emit('join_room', {})
      setConnected(true)
      setConnectionState('connected')
    })

    s.on('disconnect', (reason) => {
      setConnected(false)
      if (reason === 'io server disconnect' || reason === 'transport close') {
        setConnectionState('offline')
      } else {
        setConnectionState('reconnecting')
      }
    })

    s.on('reconnect', () => {
      setConnected(true)
      setConnectionState('connected')
      s.emit('join_room', {})
    })

    s.on('reconnect_attempt', () => {
      setConnectionState('reconnecting')
    })

    s.on('reconnecting', () => {
      setConnectionState('reconnecting')
    })

    s.on('connect_error', () => {
      setConnectionState('offline')
    })

    return () => {
      s.off()
      s.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
      setConnectionState('offline')
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, connected, connectionState }}>
      {children}
    </SocketContext.Provider>
  )
}

