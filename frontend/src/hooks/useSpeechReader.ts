// useSpeechReader.ts
// ---------------------------------------------------------------------------
// React hook for the Bangla Audio Learning System.
//
// Wraps speechService to provide:
//   * play()        — read the whole lesson top-to-bottom (paragraph by paragraph)
//   * pause()       — pause the current utterance
//   * resume()      — resume from where it stopped
//   * stop()        — cancel speech and clear state
//   * cleanup       — speech is always cancelled on unmount / lesson change
//
// It does NOT touch lesson source files; readable blocks are discovered at
// runtime from the provided container element.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  speechService,
  normalizeBanglaLang,
  type SpeechLang,
  type SpeechVoiceInfo,
} from '../services/speechService'

export type ReaderStatus = 'idle' | 'playing' | 'paused'

export interface SpeechReaderState {
  status: ReaderStatus
  isPlaying: boolean
  isPaused: boolean
  currentIndex: number
  supported: boolean
  voices: SpeechVoiceInfo[]
}

// Selector for the readable blocks inside a lesson container.
const READABLE_SELECTOR = 'p, li, h1, h2, h3, h4, .tts-speak'

// Elements that must never be read aloud.
const EXCLUDE_SELECTOR =
  'pre, code, .monaco-editor, button, input, textarea, select, .no-tts, [aria-hidden="true"], nav, footer, .lesson-navigation, .beginner-lesson-navigation'

// Only Bengali and English voices are exposed to the learner.
const ALLOWED_LANG_PREFIXES = ['bn', 'en']

function langIsAllowed(lang: string): boolean {
  const lower = (lang || '').toLowerCase()
  return ALLOWED_LANG_PREFIXES.some((p) => lower === p || lower.startsWith(p + '-'))
}

function langIsEnglish(lang: string): boolean {
  const lower = (lang || '').toLowerCase()
  return lower === 'en' || lower.startsWith('en-')
}

// Build a Range covering [start, end) character offsets within an element's
// text content (walks across nested text nodes). Returns null if out of range.
function buildTextRange(root: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let offset = 0
  let startNode: { node: Text; offset: number } | null = null
  let endNode: { node: Text; offset: number } | null = null

  let node = walker.nextNode() as Text | null
  while (node) {
    const len = node.data.length
    if (!startNode && offset + len > start) {
      startNode = { node, offset: start - offset }
    }
    if (!endNode && offset + len >= end) {
      endNode = { node, offset: end - offset }
      break
    }
    offset += len
    node = walker.nextNode() as Text | null
  }

  if (!startNode || !endNode) return null
  const range = document.createRange()
  range.setStart(startNode.node, Math.max(0, startNode.offset))
  range.setEnd(endNode.node, Math.max(0, endNode.offset))
  return range
}

export interface UseSpeechReaderOptions {
  /** Container that holds the lesson content. */
  containerRef: React.RefObject<HTMLElement | null>
  /** Playback rate, 0.1 - 10. Used as the initial speed; changes go through setSpeed. */
  rate?: number
  /** Optional scroll container for scrollIntoView. */
  scrollContainerRef?: React.RefObject<HTMLElement | null>
  /** Called when playback of the whole lesson naturally ends. */
  onEnd?: () => void
}

export function useSpeechReader(options: UseSpeechReaderOptions) {
  const { containerRef, rate = 1, scrollContainerRef, onEnd } = options

  const [status, setStatus] = useState<ReaderStatus>('idle')
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechVoiceInfo[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeedState] = useState<number>(rate)

  // Refs keep latest values available to speechService callbacks without
  // re-creating the callbacks (avoids stale-closure bugs).
  const statusRef = useRef<ReaderStatus>('idle')
  const indexRef = useRef(-1)
  const chunksRef = useRef<{ element: HTMLElement; text: string; lang: SpeechLang }[]>([])
  const voiceIdRef = useRef<string | undefined>(undefined)
  const rateRef = useRef(rate)
  const onEndRef = useRef(onEnd)
  const scrollRef = useRef(scrollContainerRef?.current ?? null)

  useEffect(() => {
    rateRef.current = speed
  }, [speed])

  const setSpeed = useCallback((value: number) => {
    setSpeedState(value)
  }, [])
  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])
  useEffect(() => {
    scrollRef.current = scrollContainerRef?.current ?? null
  }, [scrollContainerRef])

  // Detect support + load voices.
  const VOICE_KEY = 'alokbartika_tts_voice'
  useEffect(() => {
    setSupported(speechService.supported)
    const load = () => {
      const all = speechService.getVoices()
      // Only keep Bengali (bn, bn-BD, bn-IN) and English (en, en-US, …) voices.
      const filtered = all.filter((v) => langIsAllowed(v.lang))
      setVoices(filtered)

      // Resolve the selected voice:
      //   1. Use a previously stored choice if it still exists in the filtered list.
      //   2. Otherwise auto-detect the best Bangla voice.
      //   3. Fall back to the best available English voice.
      let stored = ''
      try {
        stored = localStorage.getItem(VOICE_KEY) || ''
      } catch {
        /* noop */
      }
      const stillAvailable = stored && filtered.some((v) => v.id === stored)
      if (stillAvailable) {
        setSelectedVoice(stored)
        return
      }
      const bangla = speechService.getBestBanglaVoice()
      const english = filtered.find((v) => langIsEnglish(v.lang))
      const chosen = bangla?.id ?? english?.id ?? filtered[0]?.id ?? ''
      setSelectedVoice(chosen)
      try {
        if (chosen) localStorage.setItem(VOICE_KEY, chosen)
      } catch {
        /* noop */
      }
    }
    load()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', load)
      return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
    return undefined
  }, [])

  // Keep the live voice id in sync with state (used by speechService callbacks).
  useEffect(() => {
    voiceIdRef.current = selectedVoice || undefined
  }, [selectedVoice])

  const setVoice = useCallback((id: string) => {
    setSelectedVoice(id)
    try {
      localStorage.setItem(VOICE_KEY, id)
    } catch {
      /* noop */
    }
  }, [])

  const clearHighlight = useCallback((index: number) => {
    const chunk = chunksRef.current[index]
    if (chunk) {
      try {
        chunk.element.classList.remove('tts-highlighting')
      } catch {
        /* noop */
      }
    }
  }, [])

  // ── Word/sentence karaoke highlight (span-based) ──
  // Wraps the currently spoken word in <span class="tts-current-word"> so the
  // browser paints a yellow highlight. The span is removed when speech ends or
  // the next word begins. Original HTML is restored by unwrapping.
  const highlightSpanRef = useRef<HTMLSpanElement | null>(null)

  const clearWordHighlight = useCallback(() => {
    const span = highlightSpanRef.current
    if (!span) return
    try {
      const parent = span.parentNode
      if (parent) {
        while (span.firstChild) {
          parent.insertBefore(span.firstChild, span)
        }
        parent.removeChild(span)
        parent.normalize()
      }
    } catch {
      /* noop */
    }
    highlightSpanRef.current = null
  }, [])

  const clearKaraoke = useCallback(() => {
    clearWordHighlight()
    try {
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed) sel.removeAllRanges()
    } catch {
      /* noop */
    }
  }, [clearWordHighlight])

  const applyKaraoke = useCallback((element: HTMLElement, charIndex: number, charLength: number) => {
    try {
      clearWordHighlight()
      const length = charLength > 0 ? charLength : 1
      const range = buildTextRange(element, charIndex, charIndex + length)
      if (!range) return

      const span = document.createElement('span')
      span.className = 'tts-current-word'
      try {
        range.surroundContents(span)
      } catch {
        span.appendChild(range.extractContents())
        range.insertNode(span)
      }
      highlightSpanRef.current = span

      const rect = span.getBoundingClientRect()
      if (rect.bottom > window.innerHeight - 80 || rect.top < 80) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } catch {
      /* noop */
    }
  }, [clearWordHighlight])

  const highlight = useCallback((index: number) => {
    const chunk = chunksRef.current[index]
    if (!chunk) return
    try {
      chunk.element.classList.add('tts-highlighting')
      chunk.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch {
      /* noop */
    }
  }, [])

  const stop = useCallback(() => {
    speechService.stop()
    clearKaraoke()
    indexRef.current = -1
    statusRef.current = 'idle'
    setCurrentIndex(-1)
    setStatus('idle')
  }, [clearKaraoke])

  const speakIndex = useCallback(
    (index: number) => {
      const chunks = chunksRef.current
      if (index < 0 || index >= chunks.length) {
        stop()
        onEndRef.current?.()
        return
      }

      clearKaraoke()
      indexRef.current = index
      setCurrentIndex(index)

      const chunk = chunks[index]
      try { chunk.element.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch { /* noop */ }

      speechService.speak({
        text: chunk.text,
        lang: chunk.lang,
        voice: voiceIdRef.current,
        rate: rateRef.current,
        onBoundary: (charIndex, charLength) => {
          // Karaoke: highlight the word/sentence currently being spoken and
          // smoothly scroll it into view.
          applyKaraoke(chunk.element, charIndex, charLength)
        },
        onEnd: () => {
          clearKaraoke()
          if (statusRef.current === 'playing') {
            speakIndex(index + 1)
          }
        },
        onError: (err) => {
          console.error('[useSpeechReader] synthesis error:', err)
          clearKaraoke()
          if (statusRef.current === 'playing') {
            speakIndex(index + 1)
          }
        },
      })
    },
    [clearKaraoke, applyKaraoke, stop],
  )

  const play = useCallback(() => {
    if (!speechService.supported || !containerRef.current) return

    // Discover readable blocks fresh each time, so edits/re-renders are picked up.
    const elements = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(READABLE_SELECTOR),
    ).filter((el) => {
      if (!el.innerText || !el.innerText.trim()) return false
      const excluded = el.closest(EXCLUDE_SELECTOR)
      return !excluded
    })

    chunksRef.current = elements.map((el) => ({
      element: el,
      text: el.innerText.trim(),
      lang: normalizeBanglaLang(el.lang || undefined),
    }))

    if (chunksRef.current.length === 0) return

    speechService.stop()
    statusRef.current = 'playing'
    setStatus('playing')
    speakIndex(0)
  }, [containerRef, speakIndex])

  const playFrom = useCallback(
    (startIndex: number) => {
      if (!speechService.supported || !containerRef.current) return

      const elements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(READABLE_SELECTOR),
      ).filter((el) => {
        if (!el.innerText || !el.innerText.trim()) return false
        const excluded = el.closest(EXCLUDE_SELECTOR)
        return !excluded
      })

      chunksRef.current = elements.map((el) => ({
        element: el,
        text: el.innerText.trim(),
        lang: normalizeBanglaLang(el.lang || undefined),
      }))

      if (chunksRef.current.length === 0) return

      const clamped = Math.max(0, Math.min(startIndex, chunksRef.current.length - 1))
      speechService.stop()
      statusRef.current = 'playing'
      setStatus('playing')
      speakIndex(clamped)
    },
    [containerRef, speakIndex],
  )

  const pause = useCallback(() => {
    if (statusRef.current !== 'playing') return
    speechService.pause()
    statusRef.current = 'paused'
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    if (statusRef.current !== 'paused') return
    speechService.resume()
    statusRef.current = 'playing'
    setStatus('playing')
  }, [])

  // Read a specific paragraph (used by Next/Prev and keyboard shortcuts).
  const readParagraph = useCallback(
    (index: number) => {
      const chunks = chunksRef.current
      if (index < 0 || index >= chunks.length) return
      speechService.stop()
      clearKaraoke()
      indexRef.current = index
      setCurrentIndex(index)
      statusRef.current = 'playing'
      setStatus('playing')
      const chunk = chunks[index]
      try { chunk.element.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch { /* noop */ }
      speechService.speak({
        text: chunk.text,
        lang: chunk.lang,
        voice: voiceIdRef.current,
        rate: rateRef.current,
        onBoundary: (charIndex, charLength) => {
          applyKaraoke(chunk.element, charIndex, charLength)
        },
        onEnd: () => {
          clearKaraoke()
          statusRef.current = 'idle'
          setStatus('idle')
        },
        onError: (err) => {
          console.error('[useSpeechReader] synthesis error:', err)
          clearKaraoke()
          statusRef.current = 'idle'
          setStatus('idle')
        },
      })
    },
    [clearKaraoke, applyKaraoke],
  )

  const next = useCallback(() => {
    if (!chunksRef.current.length) {
      play()
      return
    }
    const target = Math.min(indexRef.current + 1, chunksRef.current.length - 1)
    readParagraph(target)
  }, [readParagraph, play])

  const prev = useCallback(() => {
    if (!chunksRef.current.length) {
      play()
      return
    }
    const target = Math.max(indexRef.current - 1, 0)
    readParagraph(target)
  }, [readParagraph, play])

  // Always cancel speech on unmount (and when the container/options change).
  useEffect(() => {
    return () => {
      speechService.stop()
      clearWordHighlight()
      try {
        const sel = window.getSelection()
        if (sel && !sel.isCollapsed) sel.removeAllRanges()
      } catch { /* noop */ }
    }
  }, [clearWordHighlight])

  return {
    status,
    isPlaying: status === 'playing',
    isPaused: status === 'paused',
    currentIndex,
    supported,
    voices,
    banglaVoices: voices.filter((v) => v.isBangla),
    englishVoices: voices.filter((v) => langIsEnglish(v.lang)),
    selectedVoice,
    setVoice,
    speed,
    setSpeed,
    next,
    prev,
    play,
    playFrom,
    pause,
    resume,
    stop,
  }
}
