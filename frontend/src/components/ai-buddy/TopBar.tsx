import { Moon, Menu, RefreshCw, Settings, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface TopBarProps {
  title: string
  loading: boolean
  online: boolean
  userInitial: string
  userFullName: string
  onToggleSidebar: () => void
  onOpenSettings: () => void
}

export function TopBar({ title, loading, online, userInitial, userFullName, onToggleSidebar, onOpenSettings }: TopBarProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div
      className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="সাইডবার খুলুন"
        className="rounded-lg p-1.5 transition-colors xl:hidden"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Menu size={19} />
      </button>

      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-sm font-black leading-tight sm:text-base"
          style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {title || 'AI বাডি'}
        </h1>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <>
              <RefreshCw size={10} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
              <span className="text-[10px] font-semibold" style={{ color: 'var(--color-accent)' }}>
                ভাবছে…
              </span>
            </>
          ) : (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: online ? '#22c55e' : 'var(--color-error)' }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: online ? '#22c55e' : 'var(--color-error)' }}
              >
                {online ? 'সংযুক্ত' : 'অফলাইন'}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="থিম পরিবর্তন"
          className="rounded-lg p-2 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {resolvedTheme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="সেটিংস"
          className="rounded-lg p-2 transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Settings size={17} />
        </button>
        <div
          className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black"
          title={userFullName}
          aria-label={userFullName}
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
        >
          {userInitial}
        </div>
      </div>
    </div>
  )
}
