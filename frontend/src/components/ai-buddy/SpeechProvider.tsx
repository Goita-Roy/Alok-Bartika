import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SpeechContext } from './useSpeech'
import { splitForSpeech } from './utils'

const SPEECH_KEY = 'ai-buddy.speech'

const MAX_RETRIES = 2
const WATCHDOG_MS = 1500
const KEEPALIVE_MS = 10000
const START_DELAY_MS = 60

interface SpeechPrefs {
  rate: number
  voiceURI: string | null
}

function loadSpeechPrefs(): SpeechPrefs {
  try {
    const raw = localStorage.getItem(SPEECH_KEY)
    if (!raw) return { rate: 1, voiceURI: null }
    const parsed = JSON.parse(raw) as Partial<SpeechPrefs>
    const rate = typeof parsed.rate === 'number' && parsed.rate >= 0.5 && parsed.rate <= 1.5 ? parsed.rate : 1
    return { rate, voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null }
  } catch {
    return { rate: 1, voiceURI: null }
  }
}

function saveSpeechPrefs(prefs: SpeechPrefs): void {
  try {
    localStorage.setItem(SPEECH_KEY, JSON.stringify(prefs))
  } catch {
    // ignore
  }
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [prefs, setPrefs] = useState<SpeechPrefs>(loadSpeechPrefs)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [],
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  const rateRef = useRef(prefs.rate)
  const voiceURIRef = useRef(prefs.voiceURI)
  const voicesRef = useRef<SpeechSynthesisVoice[]>(voices)
  const runIdRef = useRef(0)
  const queueRef = useRef<string[]>([])
  const activeChunkRef = useRef<string | null>(null)
  const chunkStartedRef = useRef(false)
  const retriesRef = useRef(0)
  const startTicksRef = useRef(0)
  const pausedRef = useRef(false)
  const watchdogRef = useRef<number | null>(null)
  const keepaliveRef = useRef<number | null>(null)

  useEffect(() => {
    rateRef.current = prefs.rate
    voiceURIRef.current = prefs.voiceURI
    voicesRef.current = voices
  }, [prefs.rate, prefs.voiceURI, voices])

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
      runIdRef.current += 1
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const engine = useMemo(() => {
    const clearTimers = () => {
      if (watchdogRef.current !== null) {
        window.clearInterval(watchdogRef.current)
        watchdogRef.current = null
      }
      if (keepaliveRef.current !== null) {
        window.clearInterval(keepaliveRef.current)
        keepaliveRef.current = null
      }
    }

    const finishRun = (runId: number) => {
      if (runId !== runIdRef.current) return
      clearTimers()
      activeChunkRef.current = null
      chunkStartedRef.current = false
      queueRef.current = []
      retriesRef.current = 0
      startTicksRef.current = 0
      pausedRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeakingText(null)
    }

    const startChunk = (runId: number, text: string) => {
      if (runId !== runIdRef.current) return
      if (!supported || !('speechSynthesis' in window)) return
      startTicksRef.current = 0
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'bn-BD'
      utterance.rate = rateRef.current
      const voicesList = voicesRef.current
      const picked =
        voicesList.find((v) => v.voiceURI === voiceURIRef.current) ??
        voicesList.find((v) => v.lang.toLowerCase().startsWith('bn')) ??
        null
      if (picked) utterance.voice = picked

      utterance.onstart = () => {
        if (runId !== runIdRef.current) return
        chunkStartedRef.current = true
        setIsPaused(false)
      }

      utterance.onend = () => {
        if (runId !== runIdRef.current) return
        if (activeChunkRef.current !== text) return
        activeChunkRef.current = null
        chunkStartedRef.current = false
        playNext(runId)
      }

      utterance.onerror = (e) => {
        if (runId !== runIdRef.current) return
        if (activeChunkRef.current !== text) return
        if (e.error === 'canceled' || e.error === 'interrupted') return
        handleStall(runId)
      }

      window.speechSynthesis.speak(utterance)
    }

    const playNext = (runId: number) => {
      if (runId !== runIdRef.current) return
      const next = queueRef.current.shift()
      if (!next) {
        finishRun(runId)
        return
      }
      activeChunkRef.current = next
      chunkStartedRef.current = false
      retriesRef.current = 0
      startChunk(runId, next)
    }

    const handleStall = (runId: number) => {
      if (runId !== runIdRef.current) return
      const chunk = activeChunkRef.current
      if (!chunk) {
        playNext(runId)
        return
      }
      retriesRef.current += 1
      if (retriesRef.current <= MAX_RETRIES) {
        chunkStartedRef.current = false
        startChunk(runId, chunk)
      } else {
        activeChunkRef.current = null
        chunkStartedRef.current = false
        playNext(runId)
      }
    }

    const startWatchdog = (runId: number) => {
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      watchdogRef.current = window.setInterval(() => {
        if (runId !== runIdRef.current) return
        if (pausedRef.current) return
        const synth = window.speechSynthesis
        if (activeChunkRef.current === null) return
        if (chunkStartedRef.current) {
          if (!synth.speaking && !synth.paused) handleStall(runId)
        } else {
          startTicksRef.current += 1
          if (startTicksRef.current >= 2 && !synth.speaking && !synth.pending) handleStall(runId)
        }
      }, WATCHDOG_MS)
    }

    const startKeepalive = (runId: number) => {
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      keepaliveRef.current = window.setInterval(() => {
        if (runId !== runIdRef.current) return
        if (pausedRef.current) return
        const synth = window.speechSynthesis
        if (synth.speaking && !synth.paused && chunkStartedRef.current) {
          synth.pause()
          synth.resume()
        }
      }, KEEPALIVE_MS)
    }

    return { startChunk, playNext, handleStall, finishRun, startWatchdog, startKeepalive }
  }, [supported])

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return
      runIdRef.current += 1
      const runId = runIdRef.current
      pausedRef.current = false
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      window.speechSynthesis.cancel()
      const chunks = splitForSpeech(text)
      if (chunks.length === 0) {
        setIsSpeaking(false)
        setIsPaused(false)
        setSpeakingText(null)
        return
      }
      queueRef.current = chunks.slice(1)
      activeChunkRef.current = null
      chunkStartedRef.current = false
      retriesRef.current = 0
      setSpeakingText(text)
      setIsPaused(false)
      setIsSpeaking(true)
      engine.startWatchdog(runId)
      engine.startKeepalive(runId)
      window.setTimeout(() => {
        if (runId !== runIdRef.current) return
        engine.startChunk(runId, chunks[0])
      }, START_DELAY_MS)
    },
    [supported, engine],
  )

  const pause = useCallback(() => {
    if (!supported) return
    pausedRef.current = true
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    pausedRef.current = false
    window.speechSynthesis.resume()
    setIsPaused(false)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    runIdRef.current += 1
    pausedRef.current = false
    if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
    if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
    window.speechSynthesis.cancel()
    activeChunkRef.current = null
    chunkStartedRef.current = false
    queueRef.current = []
    retriesRef.current = 0
    startTicksRef.current = 0
    setIsSpeaking(false)
    setIsPaused(false)
    setSpeakingText(null)
  }, [supported])

  const setRate = useCallback((rate: number) => {
    setPrefs((prev) => {
      const next = { ...prev, rate }
      saveSpeechPrefs(next)
      return next
    })
  }, [])

  const setVoiceURI = useCallback((voiceURI: string | null) => {
    setPrefs((prev) => {
      const next = { ...prev, voiceURI }
      saveSpeechPrefs(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      supported,
      voices,
      rate: prefs.rate,
      voiceURI: prefs.voiceURI,
      isSpeaking,
      isPaused,
      speakingText,
      setRate,
      setVoiceURI,
      speak,
      pause,
      resume,
      stop,
    }),
    [supported, voices, prefs.rate, prefs.voiceURI, isSpeaking, isPaused, speakingText, setRate, setVoiceURI, speak, pause, resume, stop],
  )

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  )
}
