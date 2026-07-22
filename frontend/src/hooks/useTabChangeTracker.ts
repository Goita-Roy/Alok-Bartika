import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const STORAGE_PREFIX = 'tabChangeCount_'

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useTabChangeTracker() {
  const { user } = useAuth()
  const today = getTodayKey()
  const savedDateKey = useRef(today)

  const storageKey = user?.id ? `${STORAGE_PREFIX}${user.id}_${today}` : null

  const [tabChangeCount, setTabChangeCount] = useState<number>(() => {
    if (!storageKey) return 0
    try {
      const raw = window.localStorage.getItem(storageKey)
      const n = raw ? parseInt(raw, 10) : 0
      return isNaN(n) ? 0 : n
    } catch {
      return 0
    }
  })

  const [showWarning, setShowWarning] = useState(false)
  const wasHidden = useRef(false)
  const warnedCount = useRef<number | null>(null)

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
  }, [])

  // Detect midnight date change — reset to 0 for the new day
  useEffect(() => {
    const id = setInterval(() => {
      const now = getTodayKey()
      if (now !== savedDateKey.current) {
        savedDateKey.current = now
        setTabChangeCount(0)
        setShowWarning(false)
        warnedCount.current = null
      }
    }, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!storageKey) return

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden.current = true
      } else if (document.visibilityState === 'visible' && wasHidden.current) {
        wasHidden.current = false
        setTabChangeCount(prev => {
          const next = prev + 1
          try {
            const key = user?.id ? `${STORAGE_PREFIX}${user.id}_${getTodayKey()}` : null
            if (key) window.localStorage.setItem(key, String(next))
          } catch {}
          return next
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [storageKey, user?.id])

  useEffect(() => {
    if (!storageKey) {
      setTabChangeCount(0)
      setShowWarning(false)
      warnedCount.current = null
      return
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      const n = raw ? parseInt(raw, 10) : 0
      setTabChangeCount(isNaN(n) ? 0 : n)
    } catch {
      setTabChangeCount(0)
    }
  }, [storageKey])

  useEffect(() => {
    if (tabChangeCount > 5 && warnedCount.current !== tabChangeCount) {
      warnedCount.current = tabChangeCount
      setShowWarning(true)
    }
  }, [tabChangeCount])

  return { tabChangeCount, showWarning, dismissWarning }
}
