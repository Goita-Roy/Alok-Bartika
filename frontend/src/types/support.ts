// Support Chat Types — Student Panel Live Chat

export interface SupportSender {
  _id: string
  fullName: string
  email: string
  role: string
}

export interface SupportMessage {
  _id: string
  conversation: string
  sender: SupportSender
  senderRole: string
  message: string
  read: boolean
  createdAt: string
  // Optimistic flag — true while message is being saved to server
  _optimistic?: boolean
  // Client-generated unique ID for matching optimistic messages with server acknowledgements
  clientMessageId?: string
}

export interface SupportConversation {
  _id: string
  student: string
  assignedAdmin?: SupportSender | null
  status: 'open' | 'closed'
  lastMessage?: string
  lastMessageAt?: string
  unreadStudent: number
  unreadAdmin: number
  createdAt: string
  updatedAt: string
}
