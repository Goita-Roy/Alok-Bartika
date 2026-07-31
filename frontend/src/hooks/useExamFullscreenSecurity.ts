import { useCallback, useEffect, useRef, useState } from 'react'

// Number of fullscreen exits allowed before the exam is auto-submitted.
export const MAX_FULLSCREEN_VIOLATIONS = 3

type RequestFullscreenFn = () => Promise<boolean>

// Requests fullscreen on the whole document. Never throws — returns whether the
// browser accepted the request. Uses the prefixed API for older Safari.
export function requestDocumentFullscreen(): Promise<boolean> {
  try {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => void | Promise<void>
    }
    if (typeof el.requestFullscreen === 'function') {
      return Promise.resolve(el.requestFullscreen()).then(() => true).catch(() => false)
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      el.webkitRequestFullscreen()
      return Promise.resolve(true)
    }
  } catch {
    // Fullscreen unsupported or blocked by the browser.
  }
  return Promise.resolve(false)
}

export interface ExamFullscreenSecurity {
  isFullscreen: boolean
  violationCount: number
  showWarning: boolean
  reEntering: boolean
  enterFullscreen: RequestFullscreenFn
  continueWithoutFullscreen: () => void
}

// Watches the Fullscreen API for the secure exam experience.
//
// Exiting fullscreen (ESC, the browser's fullscreen control, or any other way)
// is a *browser* action that cannot be blocked. Instead of redirecting or
// terminating the exam, we count it as a violation, show a warning dialog, and
// let the student re-enter fullscreen. After MAX_FULLSCREEN_VIOLATIONS exits
// the exam is auto-submitted.
export function useExamFullscreenSecurity(
  active: boolean,
  onMaxViolations: () => void,
): ExamFullscreenSecurity {
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== 'undefined' && !!document.fullscreenElement,
  )
  const [violationCount, setViolationCount] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [reEntering, setReEntering] = useState(false)

  const activeRef = useRef(active)
  const onMaxViolationsRef = useRef(onMaxViolations)
  const wasInFullscreenRef = useRef(false)
  const violationCountRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
    onMaxViolationsRef.current = onMaxViolations
  })

  // A fresh attempt starts with a clean slate (also runs when the exam starts).
  useEffect(() => {
    if (!active) return
    violationCountRef.current = 0
    setViolationCount(0)
    setShowWarning(false)
    wasInFullscreenRef.current = !!document.fullscreenElement
  }, [active])

  // Detect every fullscreen enter/exit. An exit is only counted as a violation
  // once the exam is active AND we had previously entered fullscreen.
  useEffect(() => {
    const handleFullscreenChange = () => {
      const nowInFullscreen = !!document.fullscreenElement
      setIsFullscreen(nowInFullscreen)

      if (nowInFullscreen) {
        wasInFullscreenRef.current = true
        setShowWarning(false)
        return
      }

      const wasInFullscreen = wasInFullscreenRef.current
      wasInFullscreenRef.current = false
      if (!activeRef.current || !wasInFullscreen) return

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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const enterFullscreen = useCallback(async () => {
    setReEntering(true)
    const ok = await requestDocumentFullscreen()
    setReEntering(false)
    return ok
  }, [])

  const continueWithoutFullscreen = useCallback(() => setShowWarning(false), [])

  return {
    isFullscreen,
    violationCount,
    showWarning,
    reEntering,
    enterFullscreen,
    continueWithoutFullscreen,
  }
}
