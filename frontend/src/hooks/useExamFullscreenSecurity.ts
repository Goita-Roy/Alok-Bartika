import { useCallback, useEffect, useRef, useState } from 'react'

// Number of fullscreen exits allowed before the exam is auto-submitted.
export const MAX_FULLSCREEN_VIOLATIONS = 3

type RequestFullscreenFn = () => Promise<boolean>

// Requests fullscreen on the whole document. Never throws — returns whether the
// browser accepted the request. Uses prefixed APIs for cross-browser compatibility.
export async function requestDocumentFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false

  try {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
      mozRequestFullScreen?: () => Promise<void> | void
      msRequestFullscreen?: () => Promise<void> | void
    }

    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen()
    } else if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen()
    } else if (typeof el.mozRequestFullScreen === 'function') {
      await el.mozRequestFullScreen()
    } else if (typeof el.msRequestFullscreen === 'function') {
      await el.msRequestFullscreen()
    }
  } catch (err) {
    console.warn('Fullscreen request failed:', err)
  }

  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

// Safely exits fullscreen, waiting for the fullscreenchange event to confirm the
// browser has actually completed the transition. No setTimeout fallback — resolves
// only when the event fires (or immediately if already not in fullscreen).
export async function exitDocumentFullscreenSafe(): Promise<void> {
  if (typeof document === 'undefined') return

  const fsElement =
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement

  if (!fsElement) return

  // Wait for fullscreenchange to fire, which confirms exit is complete.
  const exitConfirmed = new Promise<void>(resolve => {
    const handler = () => {
      document.removeEventListener('fullscreenchange', handler)
      document.removeEventListener('webkitfullscreenchange', handler)
      document.removeEventListener('mozfullscreenchange', handler)
      document.removeEventListener('MSFullscreenChange', handler)
      resolve()
    }
    document.addEventListener('fullscreenchange', handler, { once: true })
    document.addEventListener('webkitfullscreenchange', handler, { once: true })
    document.addEventListener('mozfullscreenchange', handler, { once: true })
    document.addEventListener('MSFullscreenChange', handler, { once: true })
  })

  try {
    const doc = document as any
    if (typeof doc.exitFullscreen === 'function') {
      await doc.exitFullscreen()
    } else if (typeof doc.webkitExitFullscreen === 'function') {
      await doc.webkitExitFullscreen()
    } else if (typeof doc.mozCancelFullScreen === 'function') {
      await doc.mozCancelFullScreen()
    } else if (typeof doc.msExitFullscreen === 'function') {
      await doc.msExitFullscreen()
    }
  } catch (e) {
    console.error('Failed to exit fullscreen', e)
    return
  }

  // Await the event — browser fires it asynchronously after the exit completes.
  await exitConfirmed
}

export interface ExamFullscreenSecurity {
  isFullscreen: boolean
  violationCount: number
  showWarning: boolean
  reEntering: boolean
  enterFullscreen: RequestFullscreenFn
  continueWithoutFullscreen: () => void
  /** Call this before any intentional exitDocumentFullscreenSafe() to prevent
   *  the fullscreenchange handler from treating the exit as a violation. */
  signalIntentionalExit: () => void
}

// Watches the Fullscreen API for the secure exam experience.
export function useExamFullscreenSecurity(
  active: boolean,
  onMaxViolations: () => void,
): ExamFullscreenSecurity {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && !!(document.fullscreenElement || (document as any).webkitFullscreenElement),
  )
  const [violationCount, setViolationCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [reEntering, setReEntering] = useState(false)

  const activeRef = useRef(active)
  const onMaxViolationsRef = useRef(onMaxViolations)
  const wasInFullscreenRef = useRef(false)
  const violationCountRef = useRef(0)
  // Flag set before any intentional exit (submit / confirmed manual leave)
  // so handleFullscreenChange knows to skip violation logic.
  const intentionalExitRef = useRef(false)

  useEffect(() => {
    activeRef.current = active
    onMaxViolationsRef.current = onMaxViolations
  })

  // A fresh attempt starts with a clean slate.
  useEffect(() => {
    if (!active) return
    violationCountRef.current = 0
    intentionalExitRef.current = false
    setViolationCount(0)
    setShowWarning(false)
    wasInFullscreenRef.current = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
  }, [active])

  // Detect every fullscreen enter/exit.
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const nowInFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(nowInFullscreen)

      if (nowInFullscreen) {
        wasInFullscreenRef.current = true
        setShowWarning(false)
        return
      }

      // ── Intentional exit (submit or confirmed manual leave) ───────────────
      // Simply clear the flag and return — no violation, no re-entry attempt.
      if (intentionalExitRef.current) {
        intentionalExitRef.current = false
        wasInFullscreenRef.current = false
        return
      }

      const wasInFullscreen = wasInFullscreenRef.current
      wasInFullscreenRef.current = false
      if (!activeRef.current || !wasInFullscreen) return

      // ── Unexpected exit (ESC / browser chrome) — attempt re-entry ─────────
      const reEntered = await requestDocumentFullscreen()
      if (reEntered && !!(document.fullscreenElement || (document as any).webkitFullscreenElement)) {
        wasInFullscreenRef.current = true
        setShowWarning(false)
        return
      }

      // Count violation only if re-entry is blocked by browser policy
      violationCountRef.current += 1
      const count = violationCountRef.current
      setViolationCount(count)

      if (count >= MAX_FULLSCREEN_VIOLATIONS) {
        setShowWarning(false)
        onMaxViolationsRef.current()
      } else {
        setShowWarning(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const enterFullscreen = useCallback(async () => {
    setReEntering(true)
    const ok = await requestDocumentFullscreen()
    setReEntering(false)
    return ok
  }, [])

  const continueWithoutFullscreen = useCallback(() => setShowWarning(false), [])

  const signalIntentionalExit = useCallback(() => {
    intentionalExitRef.current = true
  }, [])

  return {
    isFullscreen,
    violationCount,
    showWarning,
    reEntering,
    enterFullscreen,
    continueWithoutFullscreen,
    signalIntentionalExit,
  }
}
