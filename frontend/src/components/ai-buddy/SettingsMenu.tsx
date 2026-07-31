import { Bot, Moon, RotateCcw, Sun, Wifi, WifiOff, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { MODEL_NAME, MODEL_PROVIDER } from './utils'

interface SettingsMenuProps {
  onClose: () => void
  onClear: () => void
  online: boolean
}

export function SettingsMenu({ onClose, onClear, online }: SettingsMenuProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <button
        type="button"
        aria-label="বন্ধ করুন"
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-11 z-50 w-72 animate-pop-in rounded-2xl border p-2"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          boxShadow: 'var(--shadow-card-hover)',
        }}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <p
            className="text-sm font-black"
            style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            সেটিংস
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="rounded-md p-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
            >
              <Bot size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                বর্তমান মডেল
              </p>
              <p className="truncate text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {MODEL_NAME}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                backgroundColor: 'var(--color-accent-pale)',
                color: online ? '#22c55e' : 'var(--color-error)',
              }}
            >
              {online ? <Wifi size={15} /> : <WifiOff size={15} />}
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                সংযোগ
              </p>
              <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {online ? 'অনলাইন' : 'অফলাইন'} · {MODEL_PROVIDER} API
              </p>
            </div>
          </div>

          <hr className="my-1" style={{ borderColor: 'var(--color-border)' }} />

          <button
            type="button"
            onClick={() => {
              toggleTheme()
              onClose()
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </span>
            {theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClear()
              onClose()
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
            >
              <RotateCcw size={15} />
            </span>
            কথোপকথন মুছুন
          </button>
        </div>
      </div>
    </>
  )
}
