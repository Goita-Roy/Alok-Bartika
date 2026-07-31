import type { ComponentType } from 'react'
import { Bug, GitBranch, Puzzle, RefreshCw, SendHorizontal, Variable, Wrench } from 'lucide-react'

type IconType = ComponentType<{ size?: number | string; className?: string }>

interface SuggestedPrompt {
  text: string
  icon: IconType
}

const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { text: '🐍 Python কী?', icon: RefreshCw },
  { text: '🔁 Loop বুঝিয়ে দাও', icon: GitBranch },
  { text: '📦 Variable কী?', icon: Variable },
  { text: '🐞 আমার কোড ঠিক করো', icon: Bug },
  { text: '⚠️ এই Error কেন হচ্ছে?', icon: Wrench },
  { text: '🎮 Scratch শিখতে চাই', icon: Puzzle },
]

export function SuggestedPrompts({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
      {SUGGESTED_PROMPTS.map((p, idx) => (
        <button
          key={p.text}
          type="button"
          onClick={() => onPrompt(p.text)}
          className="group flex animate-fade-up items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            animationDelay: `${idx * 60}ms`,
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)'
          }}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
            style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
          >
            <p.icon size={17} />
          </span>
          <span className="flex-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            {p.text}
          </span>
          <SendHorizontal
            size={15}
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: 'var(--color-accent)' }}
          />
        </button>
      ))}
    </div>
  )
}
