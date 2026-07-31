import { useEffect, useState } from 'react'
import { Menu, Moon, RefreshCw, Settings, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { MODEL_NAME, MODEL_PROVIDER } from './utils'
import { SettingsMenu } from './SettingsMenu'

interface TopBarProps {
  title: string
  loading: boolean
  onToggleSidebar: () => void
  onClear: () => void
}

export function TopBar({ title, loading, onToggleSidebar, onClear }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true))
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <div
      className="flex items-center gap-2 border-b px-3 py-2.5 sm:px-4"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="সাইডবার খুলুন"
        className="rounded-lg p-1.5 transition-colors lg:hidden"
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
          <span className="hidden text-[10px] font-medium sm:inline" style={{ color: 'var(--color-text-muted)' }}>
            · {MODEL_PROVIDER} · {MODEL_NAME}
          </span>
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
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="সেটিংস"
            aria-expanded={settingsOpen}
            className="rounded-lg p-2 transition-colors"
            style={{
              color: settingsOpen ? 'var(--color-accent)' : 'var(--color-text-muted)',
              backgroundColor: settingsOpen ? 'var(--color-accent-pale)' : 'transparent',
            }}
          >
            <Settings size={17} />
          </button>
          {settingsOpen && (
            <SettingsMenu onClose={() => setSettingsOpen(false)} onClear={onClear} online={online} />
          )}
        </div>
      </div>
    </div>
  )
}
