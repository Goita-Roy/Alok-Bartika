/**
 * ChatMessages — scrollable message list.
 * Handles:
 *  - Grouping student vs admin messages (bubble alignment)
 *  - Optimistic messages styled differently (slightly faded)
 *  - Read receipts (double-tick for student's own messages)
 *  - Auto-scroll to bottom on new message
 *  - Timestamps
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { Check, CheckCheck, Loader2 } from 'lucide-react'
import type { SupportMessage } from '../../types/support'
import EmptyChatState from './EmptyChatState'
import TypingIndicator from './TypingIndicator'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

interface ChatMessagesProps {
  messages: SupportMessage[]
  studentId: string
  loadingHistory: boolean
  historyError: string | null
  adminTyping: boolean
  hasMore: boolean
  onLoadOlder: () => void
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  studentId,
  loadingHistory,
  historyError,
  adminTyping,
  hasMore,
  onLoadOlder,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollableRef = useRef<HTMLDivElement>(null)
  const isPaginationLoadingRef = useRef(false)
  const savedScrollHeightRef = useRef(0)
  const savedScrollTopRef = useRef(0)

  const handleLoadOlder = useCallback(() => {
    const el = scrollableRef.current
    if (el) {
      savedScrollHeightRef.current = el.scrollHeight
      savedScrollTopRef.current = el.scrollTop
    }
    isPaginationLoadingRef.current = true
    onLoadOlder()
  }, [onLoadOlder])

  // Auto-scroll for realtime messages; restore scroll position after pagination
  useEffect(() => {
    if (isPaginationLoadingRef.current) {
      const el = scrollableRef.current
      if (el && savedScrollHeightRef.current > 0) {
        const heightDelta = el.scrollHeight - savedScrollHeightRef.current
        el.scrollTop = savedScrollTopRef.current + heightDelta
      }
      isPaginationLoadingRef.current = false
      savedScrollHeightRef.current = 0
      savedScrollTopRef.current = 0
      return
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, adminTyping])

  if (loadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-accent)' }} />
        <p className="text-sm font-bengali" style={{ color: 'var(--color-text-muted)' }}>
          বার্তা লোড হচ্ছে...
        </p>
      </div>
    )
  }

  if (historyError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,107,74,0.1)' }}>
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-bengali" style={{ color: 'var(--color-error)' }}>
          {historyError}
        </p>
      </div>
    )
  }

  if (messages.length === 0 && !adminTyping) {
    return <EmptyChatState />
  }

  return (
    <div className="flex flex-col gap-1 px-4 py-4 overflow-y-auto h-full font-bengali" ref={scrollableRef}>
      {/* Load Older Messages button */}
      {hasMore && (
        <div className="flex justify-center py-2">
          <button
            onClick={handleLoadOlder}
            className="px-4 py-1.5 rounded-full text-xs font-bengali font-medium transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border)',
            }}
          >
            পুরনো বার্তা লোড করুন
          </button>
        </div>
      )}
      {messages.map((msg) => {
        const isMine = msg.senderRole === 'student'
        const isOptimistic = msg._optimistic === true

        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar — only for admin messages */}
            {!isMine && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mb-1"
                style={{ background: 'linear-gradient(135deg, #0E7C66, #04342C)' }}
              >
                আ
              </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMine ? 'items-end' : 'items-start'}`}>
              <div
                className="px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: isMine ? '#0E7C66' : 'var(--color-surface)',
                  color: isMine ? '#FFFFFF' : 'var(--color-text)',
                  opacity: isOptimistic ? 0.65 : 1,
                  transition: 'opacity 0.3s',
                  wordBreak: 'break-word',
                }}
              >
                {msg.message}
              </div>

              {/* Timestamp + read receipt */}
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {formatTime(msg.createdAt)}
                </span>
                {isMine && (
                  isOptimistic ? (
                    <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
                  ) : msg.read ? (
                    <CheckCheck className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Check className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                  )
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Admin typing indicator */}
      {adminTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}

export default ChatMessages
