import { useState, useEffect, useCallback, useRef } from 'react'

export interface ExamTerminationInfo {
  terminated: boolean
  reason: string
  terminatedAt: number | null
}

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

  // Track fullscreen transitions for blur grace window
  useEffect(() => {
    const handleFullscreenChange = () => {
      lastFullscreenChangeRef.current = Date.now()
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
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
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) return
      if (Date.now() - lastFullscreenChangeRef.current < FULLSCREEN_BLUR_GRACE_MS) return
      if (document.hidden) return
      terminate('আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। ব্রাউজার ফোকাস হারানো হয়েছে।')
    }

    const handlePageHide = () => {
      if (!activeRef.current) return
      terminate('আপনি পরীক্ষার নিয়ম ভঙ্গ করেছেন। পৃষ্ঠা বন্ধ করা হয়েছে।')
    }

    // Prevent page refresh or tab close during active exam
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!activeRef.current) return
      e.preventDefault()
      e.returnValue = 'পরীক্ষা চলাকালীন রিফ্রেশ বা ট্যাব বন্ধ করা যাবে না।'
      return 'পরীক্ষা চলাকালীন রিফ্রেশ বা ট্যাব বন্ধ করা যাবে না।'
    }

    // Prevent browser Back button navigation by locking history state
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      if (!activeRef.current) return
      window.history.pushState(null, '', window.location.href)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [active, info.terminated, terminate])

  return info
}
