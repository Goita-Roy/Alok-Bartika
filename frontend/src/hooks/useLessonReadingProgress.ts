import { useEffect, useRef, useState, useCallback, type RefObject } from 'react'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'

const STORAGE_PREFIX = 'alokbartika_reading_progress_'

function loadPersisted(lessonId: string): number {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${lessonId}`)
    if (!raw) return 0
    const val = parseInt(raw, 10)
    return isNaN(val) ? 0 : Math.max(0, Math.min(100, val))
  } catch {
    return 0
  }
}

export function useLessonReadingProgress(
  lessonId: string | undefined,
  scrollContainerRef?: RefObject<HTMLElement | null>,
  iframeRef?: RefObject<HTMLIFrameElement | null>,
) {
  const { token } = useAuth()
  const maxSeenRef = useRef(lessonId ? loadPersisted(lessonId) : 0)
  const [progress, setProgress] = useState(() => lessonId ? loadPersisted(lessonId) : 0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync persisted progress when lessonId changes (standard React pattern)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!lessonId) {
      maxSeenRef.current = 0
      setProgress(0)
      return
    }
    const val = loadPersisted(lessonId)
    maxSeenRef.current = val
    setProgress(val)
  }, [lessonId])
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((val: number) => {
    if (!lessonId) return
    try { localStorage.setItem(`${STORAGE_PREFIX}${lessonId}`, String(val)) } catch { /* noop */ }

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (!token) return
      fetch(`${API_BASE_URL}/progression/last-visited`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId, readingProgress: { [lessonId]: val } }),
      }).catch(() => {})
    }, 3000)
  }, [lessonId, token])

  useEffect(() => {
    if (!lessonId) return

    const iframe = iframeRef?.current ?? null

    const calcProgress = () => {
      // When content lives inside a same-origin iframe, the scrollable
      // element is the iframe's own document — the wrapper never scrolls.
      const doc = iframe?.contentDocument
      const win = iframe?.contentWindow
      if (doc && win) {
        const se = doc.scrollingElement || doc.documentElement
        const scrollTop = se?.scrollTop || 0
        const scrollHeight = se?.scrollHeight || 0
        const clientHeight = win.innerHeight || 0
        const maxScroll = scrollHeight - clientHeight
        if (maxScroll <= 0) return 0
        return Math.min(100, Math.round((scrollTop / maxScroll) * 100))
      }

      const el = scrollContainerRef?.current
      const scrollTop = el ? el.scrollTop : (window.scrollY || document.documentElement.scrollTop)
      const scrollHeight = el ? el.scrollHeight : Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      )
      const clientHeight = el ? el.clientHeight : window.innerHeight
      const maxScroll = scrollHeight - clientHeight
      if (maxScroll <= 0) return 0
      return Math.min(100, Math.round((scrollTop / maxScroll) * 100))
    }

    let skippedFirst = false
    const handleScroll = () => {
      if (!skippedFirst) { skippedFirst = true; return }
      const raw = calcProgress()
      if (raw > maxSeenRef.current) {
        maxSeenRef.current = raw
        setProgress(raw)
        persist(raw)
      }
    }

    // For iframe content we must (re)attach once the document has loaded.
    const attachToIframe = () => {
      const win = iframe?.contentWindow
      if (!win) return
      win.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    let cleanupIframe: (() => void) | null = null
    if (iframe) {
      if (iframe.contentDocument?.readyState === 'complete') {
        attachToIframe()
      } else {
        const onLoad = () => attachToIframe()
        iframe.addEventListener('load', onLoad)
        cleanupIframe = () => iframe.removeEventListener('load', onLoad)
      }
    }

    const container = scrollContainerRef?.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    handleScroll()

    return () => {
      skippedFirst = false
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      } else {
        window.removeEventListener('scroll', handleScroll)
      }
      if (cleanupIframe) cleanupIframe()
    }
  }, [lessonId, scrollContainerRef, iframeRef, persist])

  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [])

  return progress
}
