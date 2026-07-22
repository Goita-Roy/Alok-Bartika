import { useState, useEffect, useRef, useCallback } from 'react'

export interface TTSState {
  isPlaying: boolean
  isPaused: boolean
  currentParagraphIndex: number
  supported: boolean
}

const isBengali = (text: string): boolean => {
  // Bengali range in Unicode is U+0980 to U+09FF
  return /[\u0980-\u09FF]/.test(text)
}

export function useTextToSpeech(containerRef: React.RefObject<HTMLElement | null>) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1)
  const [supported, setSupported] = useState(false)

  const isPlayingRef = useRef(false)
  const isPausedRef = useRef(false)
  const currentParagraphIndexRef = useRef(-1)
  const chunks = useRef<{ element: HTMLElement; text: string }[]>([])
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Sync refs to avoid stale closures in callbacks
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && !!window.speechSynthesis)
  }, [])

  const getVoice = useCallback((lang: 'bn-BD' | 'en-US'): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null
    const voices = window.speechSynthesis.getVoices()
    let match = voices.find(v => v.lang.toLowerCase() === lang.toLowerCase())
    if (!match) {
      match = voices.find(v => v.lang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0]))
    }
    return match || null
  }, [])

  // Listen for voice list updates (necessary in some browsers)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const handleVoices = () => {
      // Just forces matching recalculation if voices load late
    }
    window.speechSynthesis.addEventListener('voiceschanged', handleVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoices)
    }
  }, [])

  // Cancel any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    setIsPlaying(false)
    setIsPaused(false)
    window.speechSynthesis.cancel()

    // Remove highlighting from previously active element
    if (currentParagraphIndexRef.current >= 0 && chunks.current[currentParagraphIndexRef.current]) {
      try {
        chunks.current[currentParagraphIndexRef.current].element.classList.remove('tts-highlighting')
      } catch {}
    }

    setCurrentParagraphIndex(-1)
    currentParagraphIndexRef.current = -1
  }, [])

  const speakIndex = useCallback((index: number) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (index < 0 || index >= chunks.current.length) {
      stop()
      return
    }

    // Clear previous highlighting
    if (currentParagraphIndexRef.current >= 0 && chunks.current[currentParagraphIndexRef.current]) {
      try {
        chunks.current[currentParagraphIndexRef.current].element.classList.remove('tts-highlighting')
      } catch {}
    }

    setCurrentParagraphIndex(index)
    currentParagraphIndexRef.current = index

    const currentItem = chunks.current[index]
    try {
      currentItem.element.classList.add('tts-highlighting')
      currentItem.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    } catch {}

    const utterance = new SpeechSynthesisUtterance(currentItem.text)
    const isBng = isBengali(currentItem.text)
    const voice = getVoice(isBng ? 'bn-BD' : 'en-US')
    if (voice) utterance.voice = voice
    utterance.lang = isBng ? 'bn-BD' : 'en-US'

    utterance.onend = () => {
      try {
        currentItem.element.classList.remove('tts-highlighting')
      } catch {}
      if (isPlayingRef.current && !isPausedRef.current) {
        speakIndex(index + 1)
      }
    }

    utterance.onerror = (e) => {
      try {
        currentItem.element.classList.remove('tts-highlighting')
      } catch {}
      console.error('TTS synthesis error:', e)
      // Attempt to proceed on error
      if (isPlayingRef.current && !isPausedRef.current) {
        speakIndex(index + 1)
      }
    }

    currentUtteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [getVoice, stop])

  const start = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (!containerRef.current) return

    window.speechSynthesis.cancel()

    // Extract readable paragraphs, lists, and headings
    const elements = Array.from(containerRef.current.querySelectorAll('p, li, h1, h2, h3, .tts-speak'))
      .filter(el => {
        const isExcluded = el.closest('pre, code, .monaco-editor, button, input, textarea, .no-tts')
        return !isExcluded
      })

    chunks.current = elements
      .map(el => ({
        element: el as HTMLElement,
        text: (el as HTMLElement).innerText.trim(),
      }))
      .filter(item => item.text.length > 0)

    if (chunks.current.length === 0) return

    setIsPlaying(true)
    setIsPaused(false)
    speakIndex(0)
  }, [containerRef, speakIndex])

  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [])

  return {
    isPlaying,
    isPaused,
    currentParagraphIndex,
    supported,
    start,
    pause,
    resume,
    stop,
  }
}
