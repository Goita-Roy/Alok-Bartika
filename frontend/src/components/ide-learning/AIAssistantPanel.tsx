import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Bot, SendHorizontal, Sparkles, MessageSquare } from 'lucide-react'
import {
  answerBengaliVoiceQuestion,
  buildRunVoiceSequence,
  buildVoiceErrorMessage,
  type CodeErrorDetail,
} from '../../utils/codeAnalyzer'

type AIAssistantPanelProps = {
  errors: CodeErrorDetail[]
  runTrigger: number
  runSuccess: boolean
  runErrors: CodeErrorDetail[]
  focusedErrorLine: number | null
  theme: 'dark' | 'light'
}

export function AIAssistantPanel({
  errors,
  runTrigger,
  runSuccess,
  runErrors,
  focusedErrorLine,
  theme,
}: AIAssistantPanelProps) {
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [listening, setListening] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([
    {
      role: 'assistant',
      text: '👋 আমি তোমার AI কোডিং Assistant! কোড Run করলে আমি স্বয়ংক্রিয়ভাবে error বিশ্লেষণ করে বাংলায় ব্যাখ্যা দেব। প্রশ্ন করতে "জিজ্ঞাসা করুন" বাটনে ক্লিক করো।',
    },
  ])
  const lastRunTriggerRef = useRef(0)
  const lastFocusedLineRef = useRef<number | null>(null)
  const speakingRef = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakOne = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!voiceEnabled || !window.speechSynthesis) {
          resolve()
          return
        }
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.lang = 'bn-BD'
        const voices = window.speechSynthesis.getVoices()
        const bn = voices.find((v) => v.lang.includes('bn'))
        if (bn) utterance.voice = bn
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        window.speechSynthesis.speak(utterance)
      }),
    [voiceEnabled],
  )

  const speakSequence = useCallback(
    async (texts: string[]) => {
      if (!texts.length || speakingRef.current) return
      speakingRef.current = true
      window.speechSynthesis?.cancel()
      for (const text of texts) {
        // eslint-disable-next-line no-await-in-loop
        await speakOne(text)
      }
      speakingRef.current = false
    },
    [speakOne],
  )

  const appendMessages = useCallback((texts: string[]) => {
    setMessages((prev) => [...prev, ...texts.map((text) => ({ role: 'assistant' as const, text }))])
  }, [])

  useEffect(() => {
    if (runTrigger === 0 || runTrigger === lastRunTriggerRef.current) return
    lastRunTriggerRef.current = runTrigger
    lastFocusedLineRef.current = null

    if (runSuccess && !runErrors.length) {
      const msg = '✅ কোড সঠিকভাবে execute হয়েছে! কোনো error পাওয়া যায়নি।'
      appendMessages([msg])
      void speakSequence([msg])
      return
    }

    const script = buildRunVoiceSequence(runErrors, runSuccess)
    if (!script.length) return

    appendMessages(script)
    void speakSequence(script)
  }, [runTrigger, runErrors, runSuccess, appendMessages, speakSequence])

  useEffect(() => {
    if (focusedErrorLine == null || focusedErrorLine === lastFocusedLineRef.current) return
    lastFocusedLineRef.current = focusedErrorLine

    const err = errors.find((e) => e.line === focusedErrorLine) ?? runErrors.find((e) => e.line === focusedErrorLine)
    if (!err) return

    const msg = buildVoiceErrorMessage(err)
    appendMessages([msg])
    void speakSequence([msg])
  }, [focusedErrorLine, errors, runErrors, appendMessages, speakSequence])

  const handleVoiceQuestion = (raw: string) => {
    const q = raw.trim()
    if (!q) return
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    const reply = answerBengaliVoiceQuestion(q, errors.length ? errors : runErrors, '')
    appendMessages([reply])
    void speakSequence([reply])
  }

  const startListening = () => {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      appendMessages(['এই browser-এ voice input সমর্থিত নয়।'])
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'bn-BD'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript
      setQuestion(transcript)
      handleVoiceQuestion(transcript)
    }
    recognition.start()
  }

  const panelCls = isDark
    ? 'bg-[#14121c] border-[#2d2a3f] text-slate-200'
    : 'bg-white border-slate-200 text-slate-800'

  const btnCls = isDark
    ? 'bg-[#1b1928] hover:bg-[#252236] border-[#2d2a3f] text-slate-300'
    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'

  return (
    <div className={`flex flex-col h-full ${panelCls}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b shrink-0 ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
            <Bot size={13} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-bold">AI Assistant</span>
            <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Code Analysis & Error Help</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`p-1.5 rounded-lg border transition ${btnCls} ${voiceEnabled ? 'ring-1 ring-violet-500/30' : ''}`}
          title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
        >
          {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-medium ${
          isDark ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-700'
        }`}>
          <Sparkles size={12} />
          Run করলে স্বয়ংক্রিয় error বিশ্লেষণ · লাইন ক্লিক করলে ব্যাখ্যা
        </div>

        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
              m.role === 'assistant'
                ? isDark
                  ? 'bg-[#1b1928] border border-[#2d2a3f]'
                  : 'bg-slate-50 border border-slate-200'
                : isDark
                  ? 'bg-violet-500/10 border border-violet-500/20 ml-4'
                  : 'bg-indigo-50 border border-indigo-200 ml-4'
            }`}
          >
            <div className={`flex items-center gap-1.5 mb-1 text-[9px] font-bold uppercase tracking-wider ${
              m.role === 'assistant'
                ? isDark ? 'text-violet-400' : 'text-violet-600'
                : isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {m.role === 'assistant' ? (
                <><Bot size={10} /> AI Assistant</>
              ) : (
                <><MessageSquare size={10} /> You</>
              )}
            </div>
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={`flex gap-2 p-3 border-t shrink-0 ${isDark ? 'border-[#2d2a3f]' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={startListening}
          className={`shrink-0 p-2 rounded-lg border transition ${btnCls} ${listening ? 'ring-2 ring-violet-400 bg-violet-500/10' : ''}`}
          title="ভয়েসে প্রশ্ন করুন"
        >
          {listening ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} />}
        </button>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && question.trim()) {
              handleVoiceQuestion(question)
              setQuestion('')
            }
          }}
          placeholder='"আমার কোডে কী সমস্যা?" বা "Fix suggestion দাও"'
          className={`flex-1 rounded-lg border px-3 py-2 text-xs outline-none transition ${
            isDark
              ? 'bg-[#0e0c13] border-[#2d2a3f] text-slate-200 focus:border-violet-500'
              : 'bg-white border-slate-200 focus:border-violet-400'
          }`}
        />
        <button
          type="button"
          onClick={() => {
            if (question.trim()) {
              handleVoiceQuestion(question)
              setQuestion('')
            }
          }}
          className={`shrink-0 p-2 rounded-lg border transition ${btnCls} hover:bg-violet-500 hover:text-white hover:border-violet-500`}
          title="পাঠান"
        >
          <SendHorizontal size={14} />
        </button>
      </div>
    </div>
  )
}
