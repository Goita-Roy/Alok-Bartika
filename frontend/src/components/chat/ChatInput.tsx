/**
 * ChatInput — message composition area with typing event emission.
 *
 * Features:
 *  - Textarea that auto-expands up to 4 lines
 *  - Send on Enter (Shift+Enter = new line)
 *  - Debounced typing / stop_typing events
 *  - Character counter near 3000-char limit
 *  - Disabled state while sending
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => Promise<void>
  onTyping: () => void
  onStopTyping: () => void
  sending: boolean
  sendError: string | null
  disabled?: boolean
}

const MAX_LEN = 3000
const TYPING_DEBOUNCE_MS = 600

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onTyping,
  onStopTyping,
  sending,
  sendError,
  disabled = false,
}) => {
  const [text, setText] = useState('')
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 100)}px`
  }, [text])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length > MAX_LEN) return
    setText(val)

    // Typing indicator
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTyping()
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false
      onStopTyping()
    }, TYPING_DEBOUNCE_MS)
  }

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return

    // Stop typing before sending
    if (typingTimer.current) clearTimeout(typingTimer.current)
    isTypingRef.current = false
    onStopTyping()

    setText('')
    await onSend(trimmed)
    textareaRef.current?.focus()
  }, [text, sending, disabled, onSend, onStopTyping])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
    }
  }, [])

  const nearLimit = text.length > MAX_LEN * 0.85

  return (
    <div
      className="px-4 py-3 border-t"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-white)' }}
    >
      {sendError && (
        <p className="text-xs font-bengali mb-2 px-1" style={{ color: 'var(--color-error)' }}>
          {sendError}
        </p>
      )}

      <div className="flex items-end gap-2">
        <textarea
          id="live-chat-input"
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="এখানে লিখুন..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all font-bengali"
          style={{
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '1.5px solid',
            borderColor: 'var(--color-border)',
            maxHeight: '100px',
            overflowY: 'auto',
          }}
          aria-label="বার্তা লিখুন"
        />
        <button
          id="live-chat-send-btn"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          aria-label="বার্তা পাঠান"
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: text.trim() && !sending && !disabled
              ? 'linear-gradient(135deg, #0E7C66 0%, #04342C 100%)'
              : 'var(--color-border)',
            cursor: text.trim() && !sending && !disabled ? 'pointer' : 'not-allowed',
          }}
        >
          <Send
            className="w-4 h-4"
            style={{
              color: text.trim() && !sending && !disabled ? '#FFFFFF' : 'var(--color-text-muted)',
              transform: 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {/* Character counter near limit */}
      {nearLimit && (
        <p className="text-[10px] text-right mt-1 pr-12" style={{ color: 'var(--color-text-muted)' }}>
          {text.length}/{MAX_LEN}
        </p>
      )}
    </div>
  )
}

export default ChatInput
