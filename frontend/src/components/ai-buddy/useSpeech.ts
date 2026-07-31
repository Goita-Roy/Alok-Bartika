import { createContext, useContext } from 'react'

export interface SpeechContextValue {
  supported: boolean
  voices: SpeechSynthesisVoice[]
  rate: number
  voiceURI: string | null
  isSpeaking: boolean
  isPaused: boolean
  speakingText: string | null
  setRate: (rate: number) => void
  setVoiceURI: (uri: string | null) => void
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

export const SpeechContext = createContext<SpeechContextValue | null>(null)

export function useSpeech(): SpeechContextValue {
  const ctx = useContext(SpeechContext)
  if (!ctx) throw new Error('useSpeech must be used within SpeechProvider')
  return ctx
}
