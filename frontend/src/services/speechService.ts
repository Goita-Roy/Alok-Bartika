// speechService.ts
// ---------------------------------------------------------------------------
// Reusable Text-to-Speech (TTS) service for the Bangla Audio Learning System.
//
// Design goals:
//   * Wrap the browser SpeechSynthesis API behind a stable interface.
//   * Auto-detect the best available Bangla voice (Google > Microsoft > Browser > EN fallback).
//   * Make future migration to cloud TTS (Google Cloud TTS, Azure Speech,
//     Amazon Polly, ElevenLabs, OpenAI TTS) require minimal changes by keeping
//     all provider logic behind the `SpeechProvider` interface.
//   * Keep the service framework-agnostic (no React, no DOM UI).
// ---------------------------------------------------------------------------

export type SpeechLang = 'bn-BD' | 'bn-IN' | 'en-US'

export type SpeechProviderId =
  | 'browser'
  | 'google'
  | 'azure'
  | 'polly'
  | 'elevenlabs'
  | 'openai'

export interface SpeakOptions {
  text: string
  lang?: SpeechLang
  /** Voice URI/name to use. When omitted the best matching voice is chosen. */
  voice?: string
  /** Playback rate, 0.1 - 10. Defaults to 1. */
  rate?: number
  /** Pitch, 0 - 2. Defaults to 1. */
  pitch?: number
  /** Volume, 0 - 1. Defaults to 1. */
 volume?: number
  /** Fired as speech progresses (used for sentence-level karaoke highlight). */
  onBoundary?: (charIndex: number, charLength: number) => void
  onEnd?: () => void
  onError?: (error: unknown) => void
}

export interface SpeechProvider {
  readonly id: SpeechProviderId
  readonly label: string
  readonly supported: boolean
  /** Resolve available voices for this provider (best-effort). */
  getVoices(): SpeechVoiceInfo[]
  speak(options: SpeakOptions): void
  pause(): void
  resume(): void
  stop(): void
}

export interface SpeechVoiceInfo {
  /** Stable identifier (voice URI for browser, voice id for cloud). */
  id: string
  name: string
  lang: string
  /** Optional provider-specific hint, e.g. "Google", "Microsoft". */
  vendor?: string
  /** True when the voice can speak Bangla. */
  isBangla?: boolean
}

// ---------------------------------------------------------------------------
// Voice selection helpers
// ---------------------------------------------------------------------------

const BANGLA_LANG_PREFIXES = ['bn']

function langIsBangla(lang: string): boolean {
  const lower = (lang || '').toLowerCase()
  return BANGLA_LANG_PREFIXES.some((p) => lower.startsWith(p))
}

function normalizeBanglaLang(lang: SpeechLang | string | undefined): SpeechLang {
  if (lang && langIsBangla(lang)) return 'bn-BD'
  return 'en-US'
}

/**
 * Rank a voice for Bangla preference.
 * Priority: Google Bangla > Microsoft Bangla > Browser Bangla > English fallback.
 */
function scoreVoice(voice: SpeechVoiceInfo): number {
  const isBangla = !!voice.isBangla || langIsBangla(voice.lang)
  const vendor = (voice.vendor || '').toLowerCase()
  const name = voice.name.toLowerCase()

  if (isBangla) {
    if (vendor.includes('google') || name.includes('google')) return 100
    if (vendor.includes('microsoft') || name.includes('microsoft')) return 90
    // Generic browser-provided Bangla voice.
    return 70
  }
  // English fallback (last resort).
  return 10
}

function pickVoice(voices: SpeechVoiceInfo[], lang: SpeechLang): SpeechVoiceInfo | null {
  if (voices.length === 0) return null
  const target = normalizeBanglaLang(lang)
  const isTargetBangla = langIsBangla(target)

  const ranked = [...voices]
    .map((v) => ({ v, s: scoreVoice(v) }))
    .sort((a, b) => b.s - a.s)

  if (isTargetBangla) {
    // Prefer any Bangla voice.
    const bangla = ranked.find((r) => r.s >= 70)
    if (bangla) return bangla.v
  } else {
    const english = ranked.find((r) => r.s < 70)
    if (english) return english.v
  }

  // Fallback to the highest scored voice overall.
  return ranked[0]?.v ?? null
}

// ---------------------------------------------------------------------------
// Browser SpeechSynthesis provider (default)
// ---------------------------------------------------------------------------

class BrowserSpeechProvider implements SpeechProvider {
  readonly id: SpeechProviderId = 'browser'
  readonly label = 'Browser (SpeechSynthesis)'
  private current: SpeechSynthesisUtterance | null = null
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    this.refreshVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', this.refreshVoices)
  }

  get supported(): boolean {
    return typeof window !== 'undefined' && !!window.speechSynthesis
  }

  private refreshVoices = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    this.voices = window.speechSynthesis.getVoices() ?? []
  }

  getVoices(): SpeechVoiceInfo[] {
    return this.voices.map((v) => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      vendor: v.name,
      isBangla: langIsBangla(v.lang),
    }))
  }

  speak(options: SpeakOptions): void {
    if (!this.supported) {
      options.onError?.('SpeechSynthesis is not supported in this environment')
      return
    }
    const synth = window.speechSynthesis
    // Always cancel any in-flight utterance before starting a new one.
    synth.cancel()

    const utterance = new SpeechSynthesisUtterance(options.text)
    const lang = normalizeBanglaLang(options.lang)
    utterance.lang = lang
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1

    const voices = this.getVoices()
    const selected =
      (options.voice && voices.find((v) => v.id === options.voice)) ||
      pickVoice(voices, lang)
    if (selected) {
      const native = this.voices.find((v) => v.voiceURI === selected.id)
      if (native) utterance.voice = native
    }

    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        options.onBoundary?.(event.charIndex, (event as SpeechSynthesisEvent).charLength ?? 0)
      }
    }
    utterance.onend = () => {
      this.current = null
      options.onEnd?.()
    }
    utterance.onerror = (event) => {
      this.current = null
      // "canceled" / "interrupted" are expected during stop(); ignore them.
      if (event.error === 'canceled' || event.error === 'interrupted') {
        options.onEnd?.()
        return
      }
      options.onError?.(event.error)
    }

    this.current = utterance
    synth.speak(utterance)
  }

  pause(): void {
    if (this.supported) window.speechSynthesis.pause()
  }

  resume(): void {
    if (this.supported) window.speechSynthesis.resume()
  }

  stop(): void {
    if (this.supported) {
      window.speechSynthesis.cancel()
      this.current = null
    }
  }
}

// ---------------------------------------------------------------------------
// Speech service (singleton facade)
// ---------------------------------------------------------------------------

class SpeechService {
  private provider: SpeechProvider
  private preferredProviderId: SpeechProviderId = 'browser'

  constructor() {
    this.provider = new BrowserSpeechProvider()
  }

  /** Swap providers. Cloud providers can be wired here later with minimal change. */
  setProvider(id: SpeechProviderId, provider?: SpeechProvider): void {
    this.preferredProviderId = id
    if (provider) this.provider = provider
  }

  get providerId(): SpeechProviderId {
    return this.preferredProviderId
  }

  get supported(): boolean {
    return this.provider.supported
  }

  getVoices(): SpeechVoiceInfo[] {
    return this.provider.getVoices()
  }

  /** Best available Bangla voice, or null if none found. */
  getBestBanglaVoice(): SpeechVoiceInfo | null {
    const voices = this.getVoices()
    const ranked = [...voices]
      .map((v) => ({ v, s: scoreVoice(v) }))
      .sort((a, b) => b.s - a.s)
    return ranked.find((r) => r.s >= 70)?.v ?? null
  }

  /** Resolve a voice by id, falling back to auto-detection for the language. */
  resolveVoice(voiceId: string | undefined, lang: SpeechLang): SpeechVoiceInfo | null {
    const voices = this.getVoices()
    if (voiceId) {
      const exact = voices.find((v) => v.id === voiceId)
      if (exact) return exact
    }
    return pickVoice(voices, lang)
  }

  speak(options: SpeakOptions): void {
    this.provider.speak(options)
  }

  pause(): void {
    this.provider.pause()
  }

  resume(): void {
    this.provider.resume()
  }

  stop(): void {
    this.provider.stop()
  }
}

// Export a single shared instance. Hooks/components should import this.
export const speechService = new SpeechService()

// Convenience re-exports for tests / direct usage.
export { normalizeBanglaLang, langIsBangla, pickVoice, scoreVoice }
