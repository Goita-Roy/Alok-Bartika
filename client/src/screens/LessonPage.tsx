import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useUiStore } from '../state/uiStore'

const Editor = lazy(() => import('@monaco-editor/react'))

type Lesson = {
  id: string
  courseId: string
  title: string
  reading: { markdown: string }
  video: { url: string }
  practice: { prompt: string; starterCode: string }
}

type LessonResponse = { ok: boolean; lesson: Lesson }
type AiHelpResponse = {
  ok: boolean
  explanation: string
  suggestedFix: string
  beginnerGuidance: string
  model: string
  latencyMs: number
}

type Mode = 'reading' | 'video' | 'practice'

function tabClass(active: boolean) {
  return active
    ? 'bg-white/10 text-white'
    : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
}

export function LessonPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('reading')
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [code, setCode] = useState('')
  const [stdin, setStdin] = useState('')
  const [runOut, setRunOut] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [askingAi, setAskingAi] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [aiHint, setAiHint] = useState<AiHelpResponse | null>(null)
  const lowBandwidth = useUiStore((s) => s.lowBandwidth)

  useEffect(() => {
    if (!lessonId) return
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .get<LessonResponse>(`/api/lessons/${lessonId}`)
      .then((r) => {
        if (!mounted) return
        setLesson(r.data.lesson)
        setCode(r.data.lesson.practice?.starterCode ?? '')
      })
      .catch((e) => {
        const msg = e?.response?.data?.error ?? e?.message ?? 'পাঠ লোড করতে ব্যর্থ'
        if (mounted) setError(msg)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [lessonId])

  const lines = useMemo(() => {
    const md = lesson?.reading?.markdown ?? ''
    return md.split('\n').filter(Boolean).slice(0, 12)
  }, [lesson])

  async function markModeDone(doneMode: Mode) {
    if (!lesson) return
    setSaving(true)
    try {
      await api.post('/api/progress/complete', { courseId: lesson.courseId, lessonId: lesson.id, mode: doneMode })
      setToast('সংরক্ষিত!')
      setTimeout(() => setToast(null), 1200)
    } catch (e: any) {
      setToast(e?.response?.data?.error ?? e?.message ?? 'সংরক্ষণ ব্যর্থ')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function markLessonComplete() {
    if (!lesson) return
    setSaving(true)
    try {
      await api.post('/api/progress/complete', { courseId: lesson.courseId, lessonId: lesson.id })
      navigate(`/courses/${lesson.courseId}`, { replace: true })
    } catch (e: any) {
      setToast(e?.response?.data?.error ?? e?.message ?? 'সম্পন্ন করতে ব্যর্থ')
      setTimeout(() => setToast(null), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function runPython() {
    setRunning(true)
    setRunOut('')
    setAiHint(null)
    try {
      const r = await api.post('/api/execute/python', { sourceCode: code, stdin })
      const parts = [
        r.data?.stdout ? `STDOUT\n${r.data.stdout}` : '',
        r.data?.stderr ? `STDERR\n${r.data.stderr}` : '',
        r.data?.compile_output ? `COMPILE\n${r.data.compile_output}` : '',
        r.data?.message ? `MESSAGE\n${r.data.message}` : '',
      ].filter(Boolean)
      setRunOut(parts.join('\n\n') || '(কোন আউটপুট নেই)')
    } catch (e: any) {
      setRunOut(e?.response?.data?.error ?? e?.message ?? 'চালানো ব্যর্থ')
    } finally {
      setRunning(false)
    }
  }

  async function askAiForHelp() {
    if (!runOut.trim()) {
      setToast('প্রথমে কোড চালান যাতে AI ত্রুটি দেখতে পায়।')
      setTimeout(() => setToast(null), 2000)
      return
    }

    setAskingAi(true)
    try {
      const response = await api.post<AiHelpResponse>('/api/ai/help', {
        sourceCode: code,
        errorOutput: runOut,
        lessonId: lesson?.id ?? '',
      })
      setAiHint(response.data)
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? e?.message ?? 'AI সহায়তা ব্যর্থ'
      setToast(msg)
      setTimeout(() => setToast(null), 2000)
    } finally {
      setAskingAi(false)
    }
  }

  if (loading && !lesson) {
    return <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        <Link className="text-sm text-white underline underline-offset-4" to="/courses">
          কোর্সে ফিরুন
        </Link>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{lesson.title}</h2>
          <p className="mt-1 text-sm text-zinc-300">একটি মোড বেছে নিন: পড়ুন, দেখুন, তারপর প্র্যাকটিস করুন।</p>
        </div>
        <Link className="text-sm text-white underline underline-offset-4" to={`/courses/${lesson.courseId}`}>
          পাঠে ফিরুন
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
          <button type="button" className={`rounded-full px-4 py-2 text-xs ${tabClass(mode === 'reading')}`} onClick={() => setMode('reading')}>
          পড়া
        </button>
        <button type="button" className={`rounded-full px-4 py-2 text-xs ${tabClass(mode === 'video')}`} onClick={() => setMode('video')}>
          ভিডিও
        </button>
        <button type="button" className={`rounded-full px-4 py-2 text-xs ${tabClass(mode === 'practice')}`} onClick={() => setMode('practice')}>
          প্র্যাকটিস
        </button>
      </div>

      {toast ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200">{toast}</div>
      ) : null}

      {mode === 'reading' ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-zinc-200">পড়া মোড</div>
          <div className="mt-3 space-y-2 text-sm text-zinc-300">
            {lines.map((line, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
                {line}
              </div>
            ))}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => markModeDone('reading')}
            className="mt-4 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            পড়া সম্পন্ন চিহ্নিত করুন
          </button>
        </section>
      ) : null}

      {mode === 'video' ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-zinc-200">ভিডিও মোড</div>
          <div className="mt-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-300">
            {lesson.video?.url ? (
              <a className="text-sky-300 underline underline-offset-4" href={lesson.video.url} target="_blank" rel="noreferrer">
                ভিডিও খুলুন
              </a>
            ) : (
              'এই পাঠের জন্য এখনও কোনো ভিডিও নেই।'
            )}
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => markModeDone('video')}
            className="mt-4 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            ভিডিও সম্পন্ন চিহ্নিত করুন
          </button>
        </section>
      ) : null}

      {mode === 'practice' ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-zinc-200">প্র্যাকটিস মোড</div>
          <div className="mt-3 rounded-xl border border-white/10 bg-zinc-950/40 p-4 text-sm text-zinc-300">
            <div className="font-semibold text-zinc-100">প্রম্পট</div>
            <div className="mt-1">{lesson.practice.prompt}</div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold text-zinc-100">কোড এডিটর (পাইথন)</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={running}
                    onClick={runPython}
                    className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-200 disabled:opacity-60"
                  >
                    {running ? 'চালানো হচ্ছে…' : 'চালান'}
                  </button>
                  <button
                    type="button"
                    disabled={askingAi || running}
                    onClick={askAiForHelp}
                    className="rounded-lg bg-violet-300 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-violet-200 disabled:opacity-60"
                  >
                    {askingAi ? 'চিন্তা করা হচ্ছে…' : 'AI-কে জিজ্ঞাসা করুন'}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10">
                {lowBandwidth ? (
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-[220px] w-full resize-none bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 outline-none"
                  />
                ) : (
                  <Suspense fallback={<div className="h-[220px] bg-zinc-950/60 p-3 text-xs text-zinc-400">এডিটর লোড হচ্ছে...</div>}>
                    <Editor
                      height="220px"
                      defaultLanguage="python"
                      theme="vs-dark"
                      value={code}
                      onChange={(v) => setCode(v ?? '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                      }}
                    />
                  </Suspense>
                )}
              </div>
              <div className="mt-3 grid gap-2">
                <label className="grid gap-1 text-xs">
                  <span className="text-zinc-300">স্টিডিন (ঐচ্ছিক)</span>
                  <input
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white/30"
                  />
                </label>
                <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
                  <div className="text-xs font-semibold text-zinc-100">আউটপুট কনসোল</div>
                  <pre className="mt-2 max-h-40 overflow-auto text-xs text-zinc-300">{runOut || '(আউটপুট দেখতে কোড চালান)'}</pre>
                </div>
                {aiHint ? (
                  <div className="rounded-lg border border-violet-400/40 bg-violet-500/10 p-3">
                    <div className="text-xs font-semibold text-violet-100">AI কোডিং সহায়তা</div>
                    <div className="mt-2 grid gap-2 text-xs text-zinc-200">
                      <div>
                        <span className="font-semibold text-zinc-100">কী ভুল হয়েছে:</span> {aiHint.explanation}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-100">এই ফিক্সটি ব্যবহার করুন:</span> {aiHint.suggestedFix}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-100">শিক্ষানবিশ টিপ:</span> {aiHint.beginnerGuidance}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        model: {aiHint.model} | response: {aiHint.latencyMs}ms
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-4">
              <div className="text-xs font-semibold text-zinc-100">আপনার উত্তর (নোট)</div>
              <textarea
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                className="mt-2 h-28 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => markModeDone('practice')}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
            >
              প্র্যাকটিস সম্পন্ন চিহ্নিত করুন
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={markLessonComplete}
              className="rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-sky-400 disabled:opacity-60"
            >
              পাঠ শেষ করুন
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}

