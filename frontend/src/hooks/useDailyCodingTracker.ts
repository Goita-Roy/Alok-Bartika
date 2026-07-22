import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useDailyCodingTracker(trackCoding = false) {
  const { user } = useAuth()
  const today = getTodayKey()
  const uid = user?.id || 'anon'
  const storageKey = `codingTime_${uid}_${today}`

  const [codingSeconds, setCodingSeconds] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? parseInt(raw, 10) : 0
    } catch {
      return 0
    }
  })

  const savedDateKey = useRef(today)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const id = setInterval(() => {
      const now = getTodayKey()
      if (now !== savedDateKey.current) {
        savedDateKey.current = now
        setCodingSeconds(0)
      }
    }, 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (trackCoding) {
      intervalRef.current = setInterval(() => {
        setCodingSeconds(prev => {
          const next = prev + 1
          try {
            const key = `codingTime_${uid}_${getTodayKey()}`
            localStorage.setItem(key, String(next))
          } catch {}
          return next
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [trackCoding, uid])

  useEffect(() => {
    const key = `codingTime_${uid}_${getTodayKey()}`
    try {
      const raw = localStorage.getItem(key)
      setCodingSeconds(raw ? parseInt(raw, 10) : 0)
    } catch {
      setCodingSeconds(0)
    }
  }, [uid])

  return { codingSeconds }
}
