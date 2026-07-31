import { createContext, useContext } from 'react'

export type FontSize = 'sm' | 'md' | 'lg'

export interface PrefsContextValue {
  fontSize: FontSize
  autoRead: boolean
  setFontSize: (fontSize: FontSize) => void
  setAutoRead: (autoRead: boolean) => void
}

export const PrefsContext = createContext<PrefsContextValue | null>(null)

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider')
  return ctx
}
