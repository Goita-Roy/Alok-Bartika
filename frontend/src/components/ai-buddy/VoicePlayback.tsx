import { useMemo } from 'react'
import { Pause, Play, Square, Volume2 } from 'lucide-react'
import { markdownToSpeechText } from './utils'
import { useSpeech } from './useSpeech'

const RATES = [
  { value: 0.75, label: '০.৭৫×' },
  { value: 1, label: '১×' },
  { value: 1.25, label: '১.২৫×' },
  { value: 1.5, label: '১.৫×' },
]

export function VoicePlayback({ content }: { content: string }) {
  const {
    supported,
    voices,
    rate,
    voiceURI,
    isSpeaking,
    isPaused,
    speakingText,
    speak,
    pause,
    resume,
    stop,
    setRate,
    setVoiceURI,
  } = useSpeech()

  const text = useMemo(() => markdownToSpeechText(content), [content])
  if (!supported || !text) return null

  const active = isSpeaking && speakingText === text
  const bnVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('bn'))
  const otherVoices = voices.filter((v) => !v.lang.toLowerCase().startsWith('bn'))

  return (
    <div className="flex flex-wrap items-center gap-1">
      {active ? (
        <>
          <button
            type="button"
            onClick={() => (isPaused ? resume() : pause())}
            aria-label={isPaused ? 'চালিয়ে যান' : 'বিরতি'}
            title={isPaused ? 'চালিয়ে যান' : 'বিরতি'}
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition-colors"
            style={{ color: 'var(--color-accent)' }}
          >
            {isPaused ? <Play size={11} /> : <Pause size={11} />}
            {isPaused ? 'চালিয়ে যান' : 'বিরতি'}
          </button>
          <button
            type="button"
            onClick={stop}
            aria-label="উত্তর পড়া থামান"
            title="থামান"
            className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition-colors"
            style={{ color: 'var(--color-error)' }}
          >
            <Square size={11} fill="currentColor" /> থামান
          </button>
          <select
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            aria-label="স্পিচ গতি"
            className="rounded-md border bg-transparent px-1 py-1 text-[10px] font-bold outline-none"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          >
            {RATES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={voiceURI ?? ''}
            onChange={(e) => setVoiceURI(e.target.value || null)}
            aria-label="ভয়েস নির্বাচন"
            className="max-w-[110px] truncate rounded-md border bg-transparent px-1 py-1 text-[10px] font-bold outline-none"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          >
            <option value="">ভয়েস</option>
            {bnVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
            {otherVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
        </>
      ) : (
        <button
          type="button"
          onClick={() => speak(text)}
          aria-label="উত্তর শুনুন"
          title="উত্তর শুনুন"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-bold transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Volume2 size={11} /> উত্তর শুনুন
        </button>
      )}
    </div>
  )
}
