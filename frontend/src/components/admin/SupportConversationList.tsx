import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Clock, MessageCircle, CheckCircle, XCircle, AlertCircle, User, Loader2 } from 'lucide-react'
import api from '../../config/api'
import type { SupportConversation } from '../../types/support'

interface SupportConversationListProps {
  onSelect: (conversationId: string) => void
  selectedId: string | null
}

type FilterStatus = 'all' | 'open' | 'unread' | 'resolved'

export function SupportConversationList({ onSelect, selectedId }: SupportConversationListProps) {
  const [conversations, setConversations] = useState<SupportConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter === 'resolved' ? 'closed' : filter)
      if (search.trim()) params.set('search', search.trim())

      const res = await api.get<{ conversations: SupportConversation[]; pagination: any }>(
        `/support/admin/conversations?${params.toString()}`,
      )
      setConversations(res.data.conversations || [])
    } catch (err: unknown) {
      setError('Failed to load conversations')
      console.error('Fetch conversations error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as FilterStatus)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchConversations()
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const getUnreadBadge = (conversation: SupportConversation) => {
    const unread = conversation.unreadStudent || 0
    if (unread === 0) return null
    return (
      <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-500 rounded-full">
        {unread > 99 ? '99+' : unread}
      </span>
    )
  }

  const getOnlineIndicator = (conversation: SupportConversation) => {
    const lastActivity = new Date(conversation.updatedAt).getTime()
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000
    const isOnline = now - lastActivity < fiveMinutes
    return (
      <span
        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        title={isOnline ? 'Online' : 'Offline'}
      />
    )
  }

  const truncateMessage = (text?: string, maxLen: number = 40) => {
    if (!text) return 'No messages yet'
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen) + '...'
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm font-bengali" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
        <button
          onClick={fetchConversations}
          className="mt-3 px-4 py-2 text-xs font-bold text-white bg-accent rounded-xl hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none font-bengali"
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '1.5px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
        <Filter className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <select
          value={filter}
          onChange={handleFilterChange}
          className="text-sm rounded-lg px-2 py-1 outline-none font-bengali flex-1"
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="unread">Unread</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--color-border)' }}>
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--color-bg)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--color-bg)' }} />
                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: 'var(--color-bg)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-10 h-10 mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-bengali" style={{ color: 'var(--color-text-muted)' }}>
              No conversations found
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => {
              const student = conv.student as any
              const isSelected = selectedId === conv._id
              return (
                <button
                  key={conv._id}
                  onClick={() => onSelect(conv._id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-accent' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent-pale)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #0E7C66, #04342C)',
                      }}
                    >
                      {student?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {getOnlineIndicator(conv)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold truncate font-bengali" style={{ color: 'var(--color-text)' }}>
                        {student?.fullName || 'Unknown Student'}
                      </span>
                      {getUnreadBadge(conv)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs truncate font-bengali" style={{ color: 'var(--color-text-muted)' }}>
                        {truncateMessage(conv.lastMessage)}
                      </span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {formatTime(conv.updatedAt)}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bengali ${
                      conv.status === 'open'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {conv.status === 'open' ? 'Open' : 'Resolved'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}