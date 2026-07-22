import { useEffect, useRef, useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SAVE_INTERVAL = 60_000
const INACTIVITY_TIMEOUT = 5 * 60_000

const PAGE_WHITELIST = [
  '/dashboard',
  '/courses',
  '/development',
  '/practice',
  '/quiz',
]

function isTrackingPage(pathname: string): boolean {
  return PAGE_WHITELIST.some(p => pathname.startsWith(p))
}

const SS_TAB_KEY = 'alok_tab_switches'

export function useLearningTracker(): {
  elapsedSeconds: number
  isSessionRunning: boolean
  tabSwitchCount: number
  isTabAway: boolean
} {
  const { user } = useAuth()
  const location = useLocation()

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isSessionRunning, setIsSessionRunning] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    try { return Number(sessionStorage.getItem(SS_TAB_KEY)) || 0 } catch { return 0 }
  })
  const [isTabAway, setIsTabAway] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef(0)
  const runningRef = useRef(false)
  const mountedRef = useRef(true)
  const awayCountedRef = useRef(false)

  const getApiUrl = () =>
    (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'

  const saveToBackend = useCallback(async () => {
    if (!runningRef.current) return
    const now = Date.now()
    const ms = now - startTimeRef.current
    startTimeRef.current = now
    if (ms < 60000) return
    const minutes = Math.floor(ms / 60000)
    try {
      const token = localStorage.getItem('token')
      await fetch(`${getApiUrl()}/learning/tick`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ minutes }),
      })
    } catch {}
  }, [])

  const stop = useCallback(() => {
    if (!runningRef.current) return
    runningRef.current = false
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    if (saveIntervalRef.current) { clearInterval(saveIntervalRef.current); saveIntervalRef.current = null }
    setIsSessionRunning(false)
    const ms = Date.now() - startTimeRef.current
    if (ms >= 60000) {
      const minutes = Math.floor(ms / 60000)
      const token = localStorage.getItem('token')
      fetch(`${getApiUrl()}/learning/tick`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ minutes }),
      }).catch(() => {})
    }
  }, [])

  const start = useCallback(() => {
    if (runningRef.current) return
    if (!isTrackingPage(location.pathname)) return
    runningRef.current = true
    startTimeRef.current = Date.now()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1)
    }, 1000)
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current)
    saveIntervalRef.current = setInterval(() => { saveToBackend() }, SAVE_INTERVAL)
    setIsSessionRunning(true)
  }, [location.pathname, saveToBackend])

  const resetInactivity = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    inactivityRef.current = setTimeout(() => {
      saveToBackend()
      stop()
    }, INACTIVITY_TIMEOUT)
  }, [saveToBackend, stop])

  const incrementTabSwitch = useCallback(() => {
    setTabSwitchCount(prev => {
      const next = prev + 1
      try { sessionStorage.setItem(SS_TAB_KEY, String(next)) } catch {}
      return next
    })
  }, [])

  // Reset on logout
  useEffect(() => {
    if (!user) {
      try { sessionStorage.removeItem(SS_TAB_KEY) } catch {}
      setTabSwitchCount(0)
      setElapsedSeconds(0)
      setIsSessionRunning(false)
      stop()
    }
  }, [user, stop])

  // main lifecycle
  useEffect(() => {
    mountedRef.current = true
    const isTracking = isTrackingPage(location.pathname)
    awayCountedRef.current = false

    const handleVisibility = () => {
      if (document.hidden) {
        saveToBackend()
        stop()
        setIsTabAway(true)
        if (!awayCountedRef.current) {
          awayCountedRef.current = true
          incrementTabSwitch()
        }
      } else {
        start()
        resetInactivity()
        setIsTabAway(false)
        awayCountedRef.current = false
      }
    }

    const handleBlur = () => {
      saveToBackend()
      stop()
      setIsTabAway(true)
      if (!awayCountedRef.current) {
        awayCountedRef.current = true
        incrementTabSwitch()
      }
    }

    const handleFocus = () => {
      start()
      resetInactivity()
      setIsTabAway(false)
      awayCountedRef.current = false
    }

    const handleBeforeUnload = () => { saveToBackend() }

    const handleActivity = () => {
      if (!runningRef.current) start()
      resetInactivity()
    }

    if (isTracking && user) {
      start()
      resetInactivity()
      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('focus', handleFocus)
      window.addEventListener('blur', handleBlur)
      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('mousemove', handleActivity)
      window.addEventListener('keydown', handleActivity)
      window.addEventListener('scroll', handleActivity)
      window.addEventListener('click', handleActivity)
    }

    return () => {
      mountedRef.current = false
      saveToBackend()
      stop()
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('click', handleActivity)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current)
    }
  }, [user, location.pathname, start, stop, saveToBackend, resetInactivity, incrementTabSwitch])

  return { elapsedSeconds, isSessionRunning, tabSwitchCount, isTabAway }
}
