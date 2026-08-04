/**
 * LiveChatModal — the complete student support chat overlay.
 *
 * Orchestrates:
 *  - useSupportSocket  →  socket connection lifecycle
 *  - useSupportChat    →  message state, history, send, receive, typing, seen
 *  - ChatHeader        →  status bar + close button
 *  - ChatMessages      →  scrollable message list
 *  - ChatInput         →  composition area
 *
 * Design:
 *  - Fixed overlay: full screen on mobile, 420px wide floating panel on desktop
 *  - Smooth slide-in / scale animation on open
 *  - All text in Bangla
 *  - Dark/light theme compatible via CSS variables
 */

import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSupportSocket } from '../../hooks/useSupportSocket'
import { useSupportChat } from '../../hooks/useSupportChat'
import ChatHeader from './ChatHeader'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

interface LiveChatModalProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCount?: (count: number) => void
}

const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth()

  // Guard: only students should use the live chat. If an admin token is
  // accidentally present in localStorage (e.g. admin logged in in another tab),
  // prevent the chat from opening to avoid the ADMIN_NEEDS_CONVERSATION_ID error.
  const isStudent = user?.role === 'student'
  const hasValidToken = !!token && isStudent

  // Socket connection — only active while modal is open
  const { socket, status } = useSupportSocket({ token, enabled: isOpen && hasValidToken })

  // Chat state — history, send, receive, typing, seen
  const {
    conversation,
    messages,
    loadingHistory,
    historyError,
    hasMore,
    sending,
    sendError,
    adminTyping,
    sendMessage,
    emitTyping,
    emitStopTyping,
    loadOlderMessages,
  } = useSupportChat({ socket, userId: user?.id ?? null, enabled: isOpen })

  // Trap focus inside modal on open (accessibility)
  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      const input = document.getElementById('live-chat-input') as HTMLTextAreaElement | null
      input?.focus()
    }, 200)
    return () => clearTimeout(timer)
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const adminName = conversation?.assignedAdmin?.fullName ?? null

  return (
    <>
      {/* Backdrop — click to close on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="লাইভ সহায়তা চ্যাট"
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-end sm:p-6"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Chat panel */}
        <div
          className="relative w-full sm:w-[420px] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
          style={{
            height: 'min(580px, 90vh)',
            backgroundColor: 'var(--color-white)',
            animation: 'chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <ChatHeader
            status={status}
            adminName={adminName}
            onClose={onClose}
          />

          {/* Messages — flex-1 scrollable area */}
          <div className="flex-1 overflow-hidden">
            <ChatMessages
              messages={messages}
              loadingHistory={loadingHistory}
              historyError={historyError}
              adminTyping={adminTyping}
              hasMore={hasMore}
              onLoadOlder={loadOlderMessages}
            />
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            onTyping={emitTyping}
            onStopTyping={emitStopTyping}
            sending={sending}
            sendError={sendError}
            disabled={false}
          />
        </div>
      </div>

      {/* Inline keyframe + bounce animation styles */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-5px); }
        }
      `}</style>
    </>
  )
}

export default LiveChatModal
