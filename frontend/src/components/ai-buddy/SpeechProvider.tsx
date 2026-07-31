import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { SpeechContext } from './useSpeech'
import { splitForSpeechByLanguage } from './utils'

const SPEECH_KEY = 'ai-buddy.speech'

function isBengaliText(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text)
}

const WATCHDOG_MS = 500
const KEEPALIVE_MS = 5000
const START_DELAY_MS = 60
const VOICES_LOAD_TIMEOUT_MS = 3000

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

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null
  try {
    return 'speechSynthesis' in window ? window.speechSynthesis : null
  } catch {
    return null
  }
}

function safeCancel(): void {
  try {
    getSynth()?.cancel()
  } catch {
    // ignore
  }
}

function safePause(): void {
  try {
    getSynth()?.pause()
  } catch {
    // ignore
  }
}

function safeResume(): void {
  try {
    getSynth()?.resume()
  } catch {
    // ignore
  }
}

function safeSpeak(utterance: SpeechSynthesisUtterance): boolean {
  try {
    const synth = getSynth()
    if (!synth) return false
    synth.speak(utterance)
    return true
  } catch {
    return false
  }
}

function safeGetVoices(): SpeechSynthesisVoice[] {
  try {
    return getSynth()?.getVoices() ?? []
  } catch {
    return []
  }
}

function isSpeakPending(): boolean {
  try {
    const synth = getSynth()
    if (!synth) return false
    return (synth as { pending?: boolean }).pending ?? synth.speaking
  } catch {
    return false
  }
}

function isSpeakActive(): boolean {
  try {
    const synth = getSynth()
    if (!synth) return false
    return synth.speaking || isSpeakPending()
  } catch {
    return false
  }
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [prefs, setPrefs] = useState<SpeechPrefs>(loadSpeechPrefs)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => safeGetVoices())
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [speakingText, setSpeakingText] = useState<string | null>(null)

  const rateRef = useRef(prefs.rate)
  const voiceURIRef = useRef(prefs.voiceURI)
  const voicesRef = useRef<SpeechSynthesisVoice[]>(voices)
  const runIdRef = useRef(0)
  const queueRef = useRef<number[]>([])
  const activeChunkIndexRef = useRef<number | null>(null)
  const chunkStartedRef = useRef(false)
  const speakIdRef = useRef(0)
  const startTicksRef = useRef(0)
  const pausedRef = useRef(false)
  const watchdogRef = useRef<number | null>(null)
  const keepaliveRef = useRef<number | null>(null)
  const voicesLoadedRef = useRef(voices.length > 0)
  const pendingSpeakTextRef = useRef<string | null>(null)

  // CRITICAL GC FIX: Keep persistent strong references to active utterances to prevent V8 Garbage Collection mid-speech
  const activeUtterancesSetRef = useRef<Set<SpeechSynthesisUtterance>>(new Set())
  const lastEventTimeRef = useRef<number>(Date.now())

  const chunkMetaRef = useRef<Array<{ text: string; spoken: boolean; retryCount: number }>>([])
  const totalCharactersRef = useRef(0)
  const spokenCharactersRef = useRef(0)
  const spokenSetRef = useRef<Set<number>>(new Set())
  const verificationRoundRef = useRef(0)

  const speakRef = useRef<((text: string) => void) | null>(null)

  useEffect(() => {
    rateRef.current = prefs.rate
    voiceURIRef.current = prefs.voiceURI
    voicesRef.current = voices
  }, [prefs.rate, prefs.voiceURI, voices])

  useEffect(() => {
    if (!supported) return
    const load = () => {
      const newVoices = safeGetVoices()
      setVoices(newVoices)
      if (newVoices.length > 0) {
        voicesLoadedRef.current = true
        if (pendingSpeakTextRef.current) {
          const textToSpeak = pendingSpeakTextRef.current
          pendingSpeakTextRef.current = null
          speakRef.current?.(textToSpeak)
        }
      }
    }
    load()
    try {
      window.speechSynthesis.addEventListener('voiceschanged', load)
    } catch {
      // ignore
    }
    const fallback = setTimeout(() => {
      if (!voicesLoadedRef.current) {
        voicesLoadedRef.current = true
      }
    }, VOICES_LOAD_TIMEOUT_MS)
    return () => {
      try {
        window.speechSynthesis.removeEventListener('voiceschanged', load)
      } catch {
        // ignore
      }
      clearTimeout(fallback)
      runIdRef.current += 1
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      activeUtterancesSetRef.current.clear()
      safeCancel()
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

    const requeueUnspoken = (): boolean => {
      const unspoken: number[] = []
      for (let i = 0; i < chunkMetaRef.current.length; i++) {
        if (!spokenSetRef.current.has(i)) {
          unspoken.push(i)
        }
      }
      if (unspoken.length === 0) return false
      queueRef.current.push(...unspoken)
      return true
    }

    const finishRun = (runId: number) => {
      if (runId !== runIdRef.current) return
      clearTimers()
      activeUtterancesSetRef.current.clear()
      activeChunkIndexRef.current = null
      chunkStartedRef.current = false
      queueRef.current = []
      spokenCharactersRef.current = 0
      spokenSetRef.current = new Set()
      verificationRoundRef.current = 0
      chunkMetaRef.current = []
      totalCharactersRef.current = 0
      pausedRef.current = false
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeakingText(null)
    }

    const startChunk = (runId: number, chunkIndex: number) => {
      if (runId !== runIdRef.current) return
      const synth = getSynth()
      if (!synth) return
      const meta = chunkMetaRef.current[chunkIndex]
      if (!meta) return
      const text = meta.text
      startTicksRef.current = 0
      speakIdRef.current += 1
      const currentSpeakId = speakIdRef.current
      lastEventTimeRef.current = Date.now()

      let utterance: SpeechSynthesisUtterance
      try {
        utterance = new SpeechSynthesisUtterance(text)
      } catch {
        handleStall(runId)
        return
      }
      utterance.lang = isBengaliText(text) ? 'bn-BD' : 'en-US'
      utterance.rate = rateRef.current

      // Retain utterance in set to prevent Chrome V8 Garbage Collection mid-speech
      activeUtterancesSetRef.current.add(utterance)

      const voicesList = voicesRef.current
      let picked: SpeechSynthesisVoice | null = null
      if (meta.retryCount <= 2) {
        picked =
          voicesList.find((v) => v.voiceURI === voiceURIRef.current) ??
          (isBengaliText(text)
            ? voicesList.find((v) => v.lang.toLowerCase().startsWith('bn-bd')) ??
              voicesList.find((v) => v.lang.toLowerCase().startsWith('bn-in')) ??
              voicesList.find((v) => v.lang.toLowerCase().startsWith('bn')) ??
              null
            : voicesList.find((v) => v.lang.toLowerCase().startsWith('en-us')) ??
              voicesList.find((v) => v.lang.toLowerCase().startsWith('en-gb')) ??
              voicesList.find((v) => v.lang.toLowerCase().startsWith('en')) ??
              null)
      }
      if (picked) utterance.voice = picked

      utterance.onstart = () => {
        if (runId !== runIdRef.current) return
        lastEventTimeRef.current = Date.now()
        chunkStartedRef.current = true
        setIsPaused(false)
      }

      utterance.onend = () => {
        activeUtterancesSetRef.current.delete(utterance)
        lastEventTimeRef.current = Date.now()
        if (runId !== runIdRef.current) return
        if (currentSpeakId !== speakIdRef.current) return
        if (activeChunkIndexRef.current !== chunkIndex) return
        if (!spokenSetRef.current.has(chunkIndex)) {
          spokenSetRef.current.add(chunkIndex)
          spokenCharactersRef.current += text.length
          meta.spoken = true
        }
        activeChunkIndexRef.current = null
        chunkStartedRef.current = false
        playNext(runId)
      }

      utterance.onerror = (e) => {
        activeUtterancesSetRef.current.delete(utterance)
        lastEventTimeRef.current = Date.now()
        if (runId !== runIdRef.current) return
        if (currentSpeakId !== speakIdRef.current) return
        if (activeChunkIndexRef.current !== chunkIndex) return
        if (e.error === 'canceled' || e.error === 'interrupted') return
        handleStall(runId)
      }

      activeChunkIndexRef.current = chunkIndex
      safeSpeak(utterance)
    }

    const playNext = (runId: number) => {
      if (runId !== runIdRef.current) return
      const nextIndex = queueRef.current.shift()
      if (nextIndex === undefined) {
        // MANDATORY GUARANTEE: Before finishing, verify spokenCharacters == totalCharacters
        const spoken = spokenCharactersRef.current
        const total = totalCharactersRef.current

        if (total === 0 || spoken === total) {
          finishRun(runId)
          return
        }

        verificationRoundRef.current += 1
        const hasUnspoken = requeueUnspoken()
        if (hasUnspoken && queueRef.current.length > 0) {
          const idx = queueRef.current.shift()!
          activeChunkIndexRef.current = idx
          chunkStartedRef.current = false
          startChunk(runId, idx)
          return
        }

        if (spokenSetRef.current.size === chunkMetaRef.current.length) {
          spokenCharactersRef.current = totalCharactersRef.current
          finishRun(runId)
          return
        }
      } else {
        activeChunkIndexRef.current = nextIndex
        chunkStartedRef.current = false
        startChunk(runId, nextIndex)
      }
    }

    const handleStall = (runId: number) => {
      if (runId !== runIdRef.current) return
      const idx = activeChunkIndexRef.current
      if (idx === null || idx === undefined) {
        playNext(runId)
        return
      }
      const meta = chunkMetaRef.current[idx]
      if (!meta) {
        playNext(runId)
        return
      }
      meta.retryCount += 1
      chunkStartedRef.current = false
      speakIdRef.current += 1
      startChunk(runId, idx)
    }

    const startWatchdog = (runId: number) => {
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      watchdogRef.current = window.setInterval(() => {
        if (runId !== runIdRef.current) return
        if (pausedRef.current) return

        const activeIdx = activeChunkIndexRef.current
        const hasQueue = queueRef.current.length > 0
        const active = isSpeakActive()
        const elapsed = Date.now() - lastEventTimeRef.current

        // Watchdog check: If queue or active chunk exists but speech silently stopped for >= 500ms
        if ((activeIdx !== null || hasQueue) && !active && elapsed >= 500) {
          handleStall(runId)
        }
      }, WATCHDOG_MS)
    }

    const startKeepalive = (runId: number) => {
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      keepaliveRef.current = window.setInterval(() => {
        if (runId !== runIdRef.current) return
        if (pausedRef.current) return
      }, KEEPALIVE_MS)
    }

    return { startChunk, playNext, handleStall, finishRun, startWatchdog, startKeepalive }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return
      try {
        if (!voicesLoadedRef.current && safeGetVoices().length === 0) {
          pendingSpeakTextRef.current = text
          return
        }
        runIdRef.current += 1
        const runId = runIdRef.current
        pausedRef.current = false
        if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
        if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
        activeUtterancesSetRef.current.clear()
        safeCancel()

        const chunks = splitForSpeechByLanguage(text)
        if (chunks.length === 0) {
          setIsSpeaking(false)
          setIsPaused(false)
          setSpeakingText(null)
          return
        }
        chunkMetaRef.current = chunks.map((t) => ({ text: t, spoken: false, retryCount: 0 }))
        totalCharactersRef.current = chunks.reduce((sum, c) => sum + c.length, 0)
        spokenCharactersRef.current = 0
        spokenSetRef.current = new Set()
        verificationRoundRef.current = 0
        queueRef.current = chunks.map((_, i) => i)
        activeChunkIndexRef.current = null
        chunkStartedRef.current = false
        setSpeakingText(text)
        setIsPaused(false)
        setIsSpeaking(true)
        engine.startWatchdog(runId)
        engine.startKeepalive(runId)
        window.setTimeout(() => {
          if (runId !== runIdRef.current) return
          const firstIndex = queueRef.current.shift()
          if (firstIndex === undefined) return
          activeChunkIndexRef.current = firstIndex
          chunkStartedRef.current = false
          engine.startChunk(runId, firstIndex)
        }, START_DELAY_MS)
      } catch {
        setIsSpeaking(false)
        setIsPaused(false)
        setSpeakingText(null)
      }
    },
    [supported, engine],
  )

  useEffect(() => {
    speakRef.current = speak
  }, [speak])

  const pause = useCallback(() => {
    if (!supported) return
    try {
      pausedRef.current = true
      safePause()
      setIsPaused(true)
    } catch {
      setIsPaused(true)
    }
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    try {
      pausedRef.current = false
      safeResume()
      setIsPaused(false)
    } catch {
      setIsPaused(false)
    }
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    try {
      runIdRef.current += 1
      pausedRef.current = false
      if (watchdogRef.current !== null) window.clearInterval(watchdogRef.current)
      if (keepaliveRef.current !== null) window.clearInterval(keepaliveRef.current)
      activeUtterancesSetRef.current.clear()
      safeCancel()
      activeChunkIndexRef.current = null
      chunkStartedRef.current = false
      queueRef.current = []
      spokenCharactersRef.current = 0
      spokenSetRef.current = new Set()
      verificationRoundRef.current = 0
      chunkMetaRef.current = []
      totalCharactersRef.current = 0
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeakingText(null)
    } catch {
      setIsSpeaking(false)
      setIsPaused(false)
      setSpeakingText(null)
    }
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