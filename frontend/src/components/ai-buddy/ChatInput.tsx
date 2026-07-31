import { useRef, useState } from 'react'
import { SendHorizontal, Square } from 'lucide-react'
import { MAX_MESSAGE_CHARS } from './utils'

interface ChatInputProps {
  loading: boolean
  onSend: (text: string) => void
  onStop: () => void
}

export function ChatInput({ loading, onSend, onStop }: ChatInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const submit = () => {
    const text = value.trim()
    if (!text || loading) return
    onSend(text)
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const canSend = value.trim().length > 0 && !loading
  const overLimit = value.length > MAX_MESSAGE_CHARS

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-end gap-2 rounded-2xl border p-2 transition-colors focus-within:border-[color:var(--color-accent)]"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value)
            grow(e.target)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={loading}
          placeholder="AI বাডিকে প্রশ্ন করো…"
          aria-label="বার্তা"
          className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[color:var(--color-text-muted)]"
          style={{ color: 'var(--color-text)' }}
        />
        {loading ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="থামাও"
            title="থামাও"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--color-error)' }}
          >
            <Square size={16} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            aria-label="পাঠান"
            title="পাঠান"
            disabled={!canSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
            style={{
              backgroundColor: 'var(--color-accent)',
              boxShadow: canSend ? '0 2px 8px rgba(14,124,102,0.3)' : 'none',
            }}
          >
            <SendHorizontal size={18} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-1">
        <p
          className="text-[11px] font-medium"
          style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          Enter দিয়ে পাঠান · Shift+Enter দিয়ে নতুন লাইন
        </p>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: overLimit ? 'var(--color-error)' : 'var(--color-text-muted)' }}
        >
          {value.length}/{MAX_MESSAGE_CHARS}
        </span>
      </div>
    </div>
  )
}
