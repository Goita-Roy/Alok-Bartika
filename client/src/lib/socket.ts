import { io, Socket } from 'socket.io-client'
import { env } from './env'

let socket: Socket | null = null
let studentSocket: Socket | null = null

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

// ── Student socket (for support unread notifications) ──────────────────

export function getStudentSocket(token: string): Socket {
  if (studentSocket && studentSocket.connected) return studentSocket

  studentSocket = io(env.apiUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  })

  return studentSocket
}

export function disconnectStudentSocket() {
  if (studentSocket) {
    studentSocket.removeAllListeners()
    studentSocket.disconnect()
    studentSocket = null
  }
}

export function joinStudentRoom(studentId: string) {
  studentSocket?.emit('join_room', { studentId })
}
