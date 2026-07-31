export type ChatRole = 'user' | 'assistant'

export interface ChatTurn {
  id: string
  role: ChatRole
  content: string
  error?: boolean
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: ChatTurn[]
}

export type GroupKey = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Previous 30 Days'
