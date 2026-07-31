import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const DEFAULT_LANGS = ['bn-BD', 'en-US']

function getRecognitionCtor(): (new () => SpeechRecognition) | null {
  if (typeof window === 'undefined') return null
  const w = window as Window
  const ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  return ctor ?? null
}

function friendlyError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'মাইক্রোফোন ব্যবহারের অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।'
    case 'no-speech':
      return 'কোনো কথা শোনা যায়নি। আবার চেষ্টা করুন।'
    case 'network':
      return 'ভয়েস ইনপুটের জন্য ইন্টারনেট সংযোগ প্রয়োজন।'
    case 'audio-capture':
      return 'মাইক্রোফোন খুঁজে পাওয়া যায়নি।'
    case 'language-not-supported':
      return 'এই ব্রাউজারে বাংলা বা ইংরেজি ভয়েস ইনপুট সমর্থিত নয়।'
    default:
      return 'ভয়েস শনাক্তকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
  }
}

export interface UseSpeechRecognitionOptions {
  langs?: string[]
  lang?: string
  onFinal: (transcript: string) => void
  onError: (message: string) => void
}

export interface UseSpeechRecognitionResult {
  supported: boolean
  listening: boolean
  interim: string
  start: () => void
  stop: () => void
  cancel: () => void
}

export function useSpeechRecognition({
  langs,
  lang,
  onFinal,
  onError,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const [langsList] = useState<string[]>(() => {
    const list = langs && langs.length > 0 ? langs : lang ? [lang] : DEFAULT_LANGS
    return list.length > 0 ? list : DEFAULT_LANGS
  })
  const [supported] = useState(() => getRecognitionCtor() !== null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onFinalRef = useRef(onFinal)
  const onErrorRef = useRef(onError)
  const cancelledRef = useRef(false)
  const langIndexRef = useRef(0)
  const startRef = useRef<() => void>(() => {})

  useEffect(() => {
    onFinalRef.current = onFinal
    onErrorRef.current = onError
  }, [onFinal, onError])

  const teardown = useCallback(() => {
    recognitionRef.current = null
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    if (!supported) return
    if (recognitionRef.current) return
    const ctor = getRecognitionCtor()
    if (!ctor) return
    try {
      const rec = new ctor()
      recognitionRef.current = rec
      cancelledRef.current = false
      rec.lang = langsList[langIndexRef.current] ?? langsList[0]
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1

      rec.onresult = (event) => {
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i]
          const transcript = result[0]?.transcript ?? ''
          if (result.isFinal) {
            const text = transcript.trim()
            if (text) onFinalRef.current(text)
          } else {
            interimText += transcript
          }
        }
        setInterim(interimText)
      }

      rec.onerror = (event) => {
        if (cancelledRef.current) return
        if (event.error === 'aborted') return
        if (event.error === 'language-not-supported' && langIndexRef.current < langsList.length - 1) {
          langIndexRef.current += 1
          recognitionRef.current = null
          try {
            rec.abort()
          } catch {
            // ignore
          }
          startRef.current()
          return
        }
        onErrorRef.current(friendlyError(event.error))
        try {
          rec.abort()
        } catch {
          // ignore
        }
      }

      rec.onend = () => {
        teardown()
      }

      rec.start()
      setListening(true)
    } catch {
      onErrorRef.current('ভয়েস ইনপুট শুরু করা যায়নি। আবার চেষ্টা করুন।')
    }
  }, [supported, langsList, teardown])

  useEffect(() => {
    startRef.current = start
  }, [start])

  const stop = useCallback(() => {
    langIndexRef.current = 0
    recognitionRef.current?.stop()
  }, [])

  const cancel = useCallback(() => {
    cancelledRef.current = true
    langIndexRef.current = 0
    recognitionRef.current?.abort()
  }, [])

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      recognitionRef.current?.abort()
    }
  }, [])

  return useMemo(
    () => ({ supported, listening, interim, start, stop, cancel }),
    [supported, listening, interim, start, stop, cancel],
  )
}
