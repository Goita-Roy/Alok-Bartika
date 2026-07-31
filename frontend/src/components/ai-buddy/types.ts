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
  pinned?: boolean
}

export type GroupKey = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Previous 30 Days'

export interface Attachment {
  id: string
  kind: 'image' | 'file'
  name: string
  size: number
  previewUrl?: string
  status: 'processing' | 'ready'
  file: File
}
