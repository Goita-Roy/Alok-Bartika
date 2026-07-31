import { memo, useEffect, useRef, useState } from 'react'
import { AlertCircle, Bot, Check, Copy, RefreshCw, Sparkles } from 'lucide-react'
import type { ChatTurn } from './types'
import { formatTime } from './utils'
import { Markdown } from './Markdown'
import { SuggestedPrompts } from './SuggestedPrompts'
import { VoicePlayback } from './VoicePlayback'

interface MessageBubbleProps {
  turn: ChatTurn
  userInitial: string
  onRetry: (turnId: string) => void
}

function CopyMessageButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="বার্তা কপি করুন"
      title="কপি"
      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition-colors"
      style={{ color: copied ? '#22c55e' : 'var(--color-text-muted)' }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'কপি হয়েছে' : 'কপি'}
    </button>
  )
}

function MessageBubble({ turn, userInitial, onRetry }: MessageBubbleProps) {
  if (turn.role === 'user') {
    return (
      <div className="flex justify-end gap-2.5">
        <div className="flex max-w-[88%] flex-col items-end sm:max-w-[75%]">
          <div
            className="animate-message-in rounded-2xl rounded-br-md px-4 py-3"
            style={{
              background: 'linear-gradient(135deg, #0E7C66, #1D9E75)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(14,124,102,0.22)',
            }}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{turn.content}</p>
          </div>
          <span
            className="mt-1 px-1 text-[10px] font-medium"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {formatTime(turn.createdAt)}
          </span>
        </div>
        <div
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
        >
          {userInitial}
        </div>
      </div>
    )
  }

  return (
    <div className="group flex justify-start gap-2.5">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: 'linear-gradient(135deg, #1D9E75, #9FE1CB)',
          boxShadow: '0 2px 8px rgba(29,158,117,0.25)',
        }}
      >
        <Bot size={16} color="#fff" />
      </div>
      <div className="min-w-0 max-w-[88%] sm:max-w-[78%]">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
            AI বাডি
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
          >
            AI
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {formatTime(turn.createdAt)}
          </span>
        </div>
        {turn.error ? (
          <div
            className="animate-message-in rounded-2xl rounded-bl-md border px-4 py-3"
            style={{
              backgroundColor: 'var(--color-error-pale, rgba(255,107,74,0.1))',
              borderColor: 'rgba(255,107,74,0.3)',
            }}
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-error)' }} />
              <div className="flex-1">
                <p
                  className="text-sm font-medium leading-relaxed"
                  style={{ color: 'var(--color-error)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {turn.content}
                </p>
                <button
                  type="button"
                  onClick={() => onRetry(turn.id)}
                  className="mt-2 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-opacity hover:opacity-85"
                  style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
                >
                  <RefreshCw size={12} /> আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="animate-message-in rounded-2xl rounded-bl-md border px-4 py-3"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <Markdown content={turn.content} />
          </div>
        )}
        {!turn.error && (
          <div className="mt-0.5 flex flex-wrap items-center justify-start gap-x-2 gap-y-0.5 pl-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <CopyMessageButton text={turn.content} />
            <VoicePlayback content={turn.content} />
          </div>
        )}
      </div>
    </div>
  )
}

const MessageBubbleMemo = memo(MessageBubble)

export function TypingIndicator() {
  return (
    <div className="flex animate-message-in justify-start gap-2.5">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(135deg, #1D9E75, #9FE1CB)' }}
      >
        <Bot size={16} color="#fff" />
      </div>
      <div
        className="rounded-2xl rounded-bl-md border px-4 py-3.5"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="h-2 w-2 animate-typing-bounce rounded-full"
              style={{ backgroundColor: 'var(--color-accent)', animationDelay: `${d * 0.15}s` }}
            />
          ))}
          <span
            className="ml-1 text-xs font-medium"
            style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            ভাবছে…
          </span>
        </div>
      </div>
    </div>
  )
}

function EmptyState({
  onPrompt,
  hasConversation,
}: {
  onPrompt: (text: string) => void
  hasConversation: boolean
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-7 px-2 py-10">
      <div className="animate-fade-up text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #1D9E75, #0E7C66)',
            boxShadow: '0 8px 24px rgba(29,158,117,0.3)',
          }}
        >
          <Sparkles size={28} color="#fff" />
        </div>
        <h2
          className="text-2xl font-black"
          style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {hasConversation ? 'নতুন কথোপকথন' : 'AI বাডিতে স্বাগতম'} 👋
        </h2>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          পাইথন, কোডিং সমস্যা বা প্রোগ্রামিং কনসেপ্ট — যেকোনো প্রশ্ন করতে পারো
        </p>
      </div>
      <SuggestedPrompts onPrompt={onPrompt} />
    </div>
  )
}

interface MessageListProps {
  messages: ChatTurn[]
  loading: boolean
  userInitial: string
  hasConversation: boolean
  fontSize: 'sm' | 'md' | 'lg'
  onRetry: (turnId: string) => void
  onSuggestedPrompt: (text: string) => void
}

const FONT_SIZES = { sm: '0.875rem', md: '0.9375rem', lg: '1.0625rem' }

const INITIAL_VISIBLE = 30
const LOAD_MORE_STEP = 30

export function MessageList({
  messages,
  loading,
  userInitial,
  hasConversation,
  fontSize,
  onRetry,
  onSuggestedPrompt,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, loading, endRef])

  const empty = messages.length === 0 && !loading
  const sliceStart = Math.max(0, messages.length - visibleCount)
  const visibleMessages = messages.slice(sliceStart)

  return (
    <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
      {empty ? (
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-8">
          <EmptyState onPrompt={onSuggestedPrompt} hasConversation={hasConversation} />
        </div>
      ) : (
        <div
          className="mx-auto w-full max-w-3xl space-y-5 px-3 py-4 sm:px-6 sm:py-6"
          style={{ fontSize: FONT_SIZES[fontSize] }}
        >
          {sliceStart > 0 && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + LOAD_MORE_STEP)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-80"
                style={{ color: 'var(--color-accent)', backgroundColor: 'var(--color-accent-pale)' }}
              >
                আরও পুরনো বার্তা দেখুন ({sliceStart})
              </button>
            </div>
          )}
          {visibleMessages.map((turn) => (
            <MessageBubbleMemo
              key={turn.id}
              turn={turn}
              userInitial={userInitial}
              onRetry={onRetry}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>
      )}
    </div>
  )
}
