import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { PrefsContext } from './usePrefs'
import type { FontSize } from './usePrefs'

const PREFS_KEY = 'ai-buddy.prefs'

interface Prefs {
  fontSize: FontSize
  autoRead: boolean
}

function loadPrefs(): Prefs {
  const fallback: Prefs = { fontSize: 'md', autoRead: false }
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<Prefs>
    const fontSize: FontSize = parsed.fontSize === 'sm' || parsed.fontSize === 'lg' ? parsed.fontSize : 'md'
    return { fontSize, autoRead: parsed.autoRead === true }
  } catch {
    return fallback
  }
}

function savePrefs(prefs: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs)

  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      savePrefs(next)
      return next
    })
  }, [])

  const setFontSize = useCallback((fontSize: FontSize) => update({ fontSize }), [update])
  const setAutoRead = useCallback((autoRead: boolean) => update({ autoRead }), [update])

  const value = useMemo(
    () => ({ fontSize: prefs.fontSize, autoRead: prefs.autoRead, setFontSize, setAutoRead }),
    [prefs.fontSize, prefs.autoRead, setFontSize, setAutoRead],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
