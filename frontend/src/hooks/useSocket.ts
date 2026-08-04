import { useContext } from 'react'
import { Socket } from 'socket.io-client'
import { SocketContext } from '../context/SocketContext'

export function useSocket(): Socket | null {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context.socket
}

export function useConnectionState() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useConnectionState must be used within a SocketProvider')
  }
  return context.connectionState
}