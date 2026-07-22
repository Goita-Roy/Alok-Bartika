import { useState, useEffect, useCallback, useRef } from 'react'

export interface ExamTerminationInfo {
  terminated: boolean
  reason: string
  terminatedAt: number | null
}

export function useExamAntiCheat(active: boolean) {
  const [info, setInfo] = useState<ExamTerminationInfo>({
    terminated: false,
    reason: '',
    terminatedAt: null,
  })
  const activeRef = useRef(active)

  useEffect(() => {
    activeRef.current = active
  })

  const terminate = useCallback((reason: string) => {
    setInfo({ terminated: true, reason, terminatedAt: Date.now() })
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
