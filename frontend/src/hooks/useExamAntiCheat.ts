import { useState, useEffect, useCallback, useRef } from 'react'

export interface ExamTerminationInfo {
  terminated: boolean
  reason: string
  terminatedAt: number | null
}

// Browsers dispatch a window `blur` event while entering AND exiting the
// Fullscreen API (ESC / the browser's fullscreen control). Without a guard,
// a student pressing ESC to leave fullscreen would be misread as "focus lost"
// and the exam would be terminated. This grace window covers both transitions.
const FULLSCREEN_BLUR_GRACE_MS = 1500

export function useExamAntiCheat(active: boolean) {
  const [info, setInfo] = useState<ExamTerminationInfo>({
    terminated: false,
    reason: '',
    terminatedAt: null,
  })
  const activeRef = useRef(active)
  const lastFullscreenChangeRef = useRef(0)

  useEffect(() => {
    activeRef.current = active
  })

  const terminate = useCallback((reason: string) => {
    setInfo({ terminated: true, reason, terminatedAt: Date.now() })
  }, [])

  // Always track fullscreen transitions (even before the exam starts) so the
  // blur guard below always has accurate timing data.
  useEffect(() => {
    const handleFullscreenChange = () => {
      lastFullscreenChangeRef.current = Date.now()
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!active || info.terminated) return

    const handleVisibilityChange = () => {
      if (!activeRef.current) return
      if (document.visibilityState === 'hidden') {
        terminate('আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। ব্রাউজার ট্যাব পরিবর্তন করা হয়েছে।')
      }
    }

    const handleWindowBlur = () => {
      if (!activeRef.current) return
      // Exiting fullscreen (ESC) is a native browser action, NOT cheating.
      // Skip any blur that belongs to a fullscreen transition.
      if (document.fullscreenElement) return
      if (Date.now() - lastFullscreenChangeRef.current < FULLSCREEN_BLUR_GRACE_MS) return
      // A hidden tab is already recorded by visibilitychange — don't double-fire.
      if (document.hidden) return
      terminate('আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। ব্রাউজার ফোকাস হারানো হয়েছে।')
    }

    const handlePageHide = () => {
      if (!activeRef.current) return
      terminate('আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। পৃষ্ঠা বন্ধ করা হয়েছে।')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [active, info.terminated, terminate])

  return info
}
