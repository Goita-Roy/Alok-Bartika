import { io, Socket } from 'socket.io-client'
import { env } from './env'

let socket: Socket | null = null

export type PresenceMap = Record<string, { online: boolean; lastSeen: number | null }>

export function getAdminSocket(token: string): Socket {
  if (socket && socket.connected) return socket

  socket = io(env.apiUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  return socket
}

export function disconnectAdminSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}

export function joinAdminRoom() {
  socket?.emit('join_room', {})
}
