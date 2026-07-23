import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useCopyProtection } from '../hooks/useCopyProtection'
import { useExamAntiCheat } from '../hooks/useExamAntiCheat'
import { useCourseProgress, type LearningLevel } from '../hooks/useCourseProgress'
import { ExamInstructions } from '../components/exam/ExamInstructions'
import { ExamTerminatedPage } from '../components/exam/ExamTerminatedPage'
import {
  Timer, CheckCircle2, XCircle, Trophy, AlertTriangle,
  ChevronLeft, ChevronRight, ArrowLeft, RefreshCw, Star,
  Code2, X,
} from 'lucide-react'
import { CodeEditor } from '../components/CodeEditor'

// ── Color tokens (matches existing platform dark theme) ─────────────────────
const S = {
  bg: '#04342C', surface: '#0A4A3F', card: '#071f1a',
  accent: '#65D1B2', light: '#8FE3CC', muted: '#B8C5C1', text: '#F5F7F6',
  danger: '#f87171', warn: '#f5c842', success: '#65D1B2',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ', intermediate: 'মধ্যবর্তী', advanced: 'উন্নত',
}
const NEXT_LEVEL: Record<string, string | null> = {
  beginner: 'intermediate', intermediate: 'advanced', advanced: null,
}

interface Question {
  _id: string
  type: 'mcq' | 'truefalse' | 'code-output' | 'coding'
  questionText: string
  options: string[]
  starterCode?: string
  points: number
}
interface ExamData {
  _id: string
  level: string
  title: string
  description: string
  passingScore: number
  timeLimitMinutes: number
  questionCount: number
  questions: Question[]
}
interface QuestionResult {
  questionIdx: number
  questionText: string
  type: string
  options: string[]
  given: any
  correct: boolean
  correctAnswer: any
  explanation: string
  points: number
}
interface SubmitResult {
  passed: boolean
  score: number
  earnedPoints: number
  totalPoints: number
  passingScore: number
  attemptNumber: number
  xpAwarded: number
  newBadge: { name: string; icon: string; description: string } | null
  newAchievement: { name: string; icon: string; description: string } | null
  nextLevelUnlocked: boolean
  nextLevel: string | null
  questionResults: QuestionResult[]
}

// ── Timer display ────────────────────────────────────────────────────────────
function TimerBar({ secondsLeft, totalSeconds }: { secondsLeft: number; totalSeconds: number }) {
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 100
  const isWarning = secondsLeft < 120
  const isCritical = secondsLeft < 30
  const m = Math.floor(secondsLeft / 60)
  const s = secondsLeft % 60

  return (
    <div className="flex items-center gap-3">
      <Timer size={16} style={{ color: isCritical ? S.danger : isWarning ? S.warn : S.accent }} />
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(101,209,178,0.12)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            backgroundColor: isCritical ? S.danger : isWarning ? S.warn : S.accent,
          }}
        />
      </div>
      <span
        className="text-sm font-black tabular-nums w-14 text-right"
        style={{ color: isCritical ? S.danger : isWarning ? S.warn : S.accent }}
      >
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  )
}

// ── Question renderer ────────────────────────────────────────────────────────
function QuestionCard({
  q, idx, total, answer, onAnswer,
}: {
  q: Question; idx: number; total: number; answer: any; onAnswer: (val: any) => void
}) {
  const [ideOpen, setIdeOpen] = useState(false)
  if (!q) return null
  const tfOptions = ['সত্য', 'মিথ্যা']
  const displayOptions = q.type === 'truefalse' ? tfOptions : (q.options ?? [])

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ backgroundColor: S.surface, border: '1px solid rgba(101,209,178,0.12)' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 text-[11px] font-black px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}
        >
          Q{idx + 1}/{total}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(101,209,178,0.08)', color: S.muted }}
            >
              {q.type === 'mcq' ? 'এমসিকিউ' : q.type === 'truefalse' ? 'সত্য/মিথ্যা' : q.type === 'code-output' ? 'কোড আউটপুট' : 'কোডিং'}
            </span>
            <span className="text-[10px] font-bold" style={{ color: S.muted }}>{q.points} pts</span>
          </div>
          <p className="text-base font-bold leading-relaxed" style={{ color: S.text }}>{q.questionText}</p>
        </div>
      </div>

      {/* Starter code for coding questions */}
      {q.type === 'coding' && q.starterCode && (
        <pre
          className="p-4 rounded-xl text-sm font-mono overflow-x-auto"
          style={{ backgroundColor: 'rgba(4,52,44,0.8)', color: S.accent, border: '1px solid rgba(101,209,178,0.12)' }}
        >
          {q.starterCode}
        </pre>
      )}

      {/* MCQ / True-False options */}
      {(q.type === 'mcq' || q.type === 'truefalse') && (
        <div className="grid gap-2">
          {displayOptions.map((opt, oi) => {
            const selected = answer === oi
            return (
              <button
                key={oi}
                onClick={() => onAnswer(oi)}
                className="text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                style={{
                  backgroundColor: selected ? 'rgba(101,209,178,0.15)' : 'rgba(101,209,178,0.04)',
                  border: `1.5px solid ${selected ? S.accent : 'rgba(101,209,178,0.10)'}`,
                  color: selected ? S.accent : S.muted,
                  transform: selected ? 'scale(1.01)' : 'scale(1)',
                }}
              >
                <span className="font-black mr-2" style={{ color: S.accent }}>
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {/* Code output — text input */}
      {q.type === 'code-output' && (
        <div>
          <p className="text-xs font-bold mb-2" style={{ color: S.muted }}>কোডটি রান করলে কী আউটপুট আসবে?</p>
          <input
            type="text"
            value={answer || ''}
            onChange={e => onAnswer(e.target.value)}
            placeholder="আউটপুট এখানে লিখুন..."
            className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none"
            style={{
              backgroundColor: 'rgba(101,209,178,0.05)',
              border: '1.5px solid rgba(101,209,178,0.15)',
              color: S.text,
            }}
          />
        </div>
      )}

      {/* Coding — solve inside the existing IDE */}
      {q.type === 'coding' && (
        <div className="flex flex-col gap-3">
          {q.starterCode && (
            <div>
              <p className="text-xs font-bold mb-2" style={{ color: S.muted }}>শুরুর কোড:</p>
              <pre
                className="p-4 rounded-xl text-sm font-mono overflow-x-auto"
                style={{ backgroundColor: 'rgba(4,52,44,0.8)', color: S.accent, border: '1px solid rgba(101,209,178,0.12)' }}
              >
                {q.starterCode}
              </pre>
            </div>
          )}

          <button
            onClick={() => setIdeOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
            style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 20px rgba(101,209,178,0.25)' }}
          >
            <Code2 size={16} /> IDE খুলুন
          </button>

          {answer && String(answer).trim().length > 0 ? (
            <div>
              <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: S.success }}>
                <CheckCircle2 size={13} /> আপনার জমা দেওয়া কোড:
              </p>
              <pre
                className="p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto"
                style={{ backgroundColor: 'rgba(4,52,44,0.8)', color: S.light, border: '1px solid rgba(101,209,178,0.12)' }}
              >
                {answer}
              </pre>
            </div>
          ) : (
            <p className="text-xs font-semibold" style={{ color: S.muted }}>
              "IDE খুলুন" চাপুন, Python কোড লিখুন, রান করুন এবং IDE থেকে জমা দিন।
            </p>
          )}

          {/* Embedded IDE modal — reuses the existing CodeEditor component */}
          {ideOpen && (
            <IDEModal
              starterCode={q.starterCode || 'print("")'}
              problemDescription={q.questionText}
              initialAnswer={typeof answer === 'string' ? answer : ''}
              onSubmit={code => { onAnswer(code); setIdeOpen(false) }}
              onClose={() => setIdeOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Embedded IDE modal (reuses existing CodeEditor) ───────────────────────────
// Opens the platform's existing IDE preloaded with the question's starter code.
// The student writes & runs Python inside it, then clicks "Submit from IDE"
// which stores the code into the exam answer via the existing submission flow.
function IDEModal({
  starterCode, problemDescription, initialAnswer, onSubmit, onClose,
}: {
  starterCode: string
  problemDescription: string
  initialAnswer: string
  onSubmit: (code: string) => void
  onClose: () => void
}) {
  const [code, setCode] = useState(initialAnswer && initialAnswer.trim().length > 0 ? initialAnswer : starterCode)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'rgba(4,52,44,0.92)' }}>
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: S.card, borderBottom: '1px solid rgba(101,209,178,0.15)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Code2 size={16} style={{ color: S.accent }} />
          <span className="text-sm font-black truncate" style={{ color: S.text }}>কোডিং IDE</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSubmit(code)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: S.accent, color: '#04342C' }}
          >
            <CheckCircle2 size={15} /> IDE থেকে জমা দিন
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: S.muted }}
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CodeEditor
          initialCode={initialAnswer && initialAnswer.trim().length > 0 ? initialAnswer : starterCode}
          language="python"
          problemDescription={problemDescription}
          onChange={setCode}
        />
      </div>
    </div>
  )
}

// ── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({
  result, level, onRetry,
}: { result: SubmitResult; level: string; onRetry: () => void }) {
  const [showReview, setShowReview] = useState(false)
  const nextLevel = result.nextLevel

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4"
      style={{ backgroundColor: S.bg }}
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Score card */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ backgroundColor: S.surface, border: `2px solid ${result.passed ? S.accent : S.danger}` }}
        >
          <div className="text-6xl mb-4">{result.passed ? '🎉' : '😔'}</div>
          <h1
            className="text-3xl font-black mb-1"
            style={{ color: result.passed ? S.accent : S.danger }}
          >
            {result.passed ? 'পাস হয়েছে!' : 'ফেল হয়েছে'}
          </h1>
          <p className="text-sm font-semibold mb-6" style={{ color: S.muted }}>
            {LEVEL_LABELS[level]} ফাইনাল পরীক্ষা — প্রচেষ্টা #{result.attemptNumber}
          </p>

          {/* Score ring */}
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
              style={{
                background: `conic-gradient(${result.passed ? S.accent : S.danger} ${result.score * 3.6}deg, rgba(101,209,178,0.08) 0deg)`,
              }}
            >
              <div
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                style={{ backgroundColor: S.surface }}
              >
                <span className="text-2xl font-black" style={{ color: result.passed ? S.accent : S.danger }}>
                  {result.score}%
                </span>
                <span className="text-[10px] font-bold" style={{ color: S.muted }}>
                  {result.earnedPoints}/{result.totalPoints} pts
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold" style={{ color: S.muted }}>
            পাসের নম্বর: {result.passingScore}% · +{result.xpAwarded} স্কোর অর্জিত
          </p>
        </div>

        {/* New badge / achievement */}
        {(result.newBadge || result.newAchievement) && (
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ backgroundColor: 'rgba(101,209,178,0.08)', border: '1px solid rgba(101,209,178,0.20)' }}
          >
            <div className="text-4xl">{result.newBadge?.icon || result.newAchievement?.icon}</div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: S.accent }}>
                {result.newBadge ? '🏅 নতুন ব্যাজ অর্জিত!' : '🏆 নতুন অ্যাচিভমেন্ট!'}
              </p>
              <p className="text-sm font-bold" style={{ color: S.text }}>
                {result.newBadge?.name || result.newAchievement?.name}
              </p>
              <p className="text-xs" style={{ color: S.muted }}>
                {result.newBadge?.description || result.newAchievement?.description}
              </p>
            </div>
          </div>
        )}

        {/* Next level unlocked */}
        {result.nextLevelUnlocked && nextLevel && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: 'rgba(101,209,178,0.08)', border: '1px solid rgba(101,209,178,0.25)' }}
          >
            <div className="text-3xl mb-2">🔓</div>
            <p className="font-black text-sm" style={{ color: S.accent }}>
              {LEVEL_LABELS[nextLevel]} লেভেল আনলক হয়েছে!
            </p>
            <Link
              to={`/courses?level=${nextLevel}`}
              className="inline-flex items-center gap-2 mt-3 px-6 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: S.accent, color: '#04342C' }}
            >
              <Star size={15} /> এখনই শুরু করুন
            </Link>
          </div>
        )}

        {/* Advanced completed */}
        {result.passed && level === 'advanced' && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: 'rgba(101,209,178,0.08)', border: '1px solid rgba(101,209,178,0.25)' }}
          >
            <div className="text-4xl mb-3">👑</div>
            <p className="font-black text-lg" style={{ color: S.accent }}>সম্পূর্ণ কোর্স শেষ!</p>
            <p className="text-sm font-semibold mt-1" style={{ color: S.muted }}>
              আপনি সব তিনটি লেভেল সফলভাবে সম্পন্ন করেছেন।
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/exam/${level}/review`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: '1px solid rgba(101,209,178,0.20)' }}
          >
            <ChevronRight size={15} /> বিস্তারিত পর্যালোচনা
          </Link>
          {!result.passed && (
            <button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: '1px solid rgba(101,209,178,0.20)' }}
            >
              <RefreshCw size={15} /> আবার পরীক্ষা দিন
            </button>
          )}
          <Link
            to="/courses"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: result.passed ? S.accent : 'rgba(255,255,255,0.05)', color: result.passed ? '#04342C' : S.muted }}
          >
            <ArrowLeft size={15} /> কোর্সে ফিরে যান
          </Link>
        </div>

        {/* Wrong answer review */}
        <div>
          <button
            onClick={() => setShowReview(!showReview)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all"
            style={{
              backgroundColor: 'rgba(101,209,178,0.05)',
              border: '1px solid rgba(101,209,178,0.10)',
              color: S.muted,
            }}
          >
            <span>ভুল উত্তর পর্যালোচনা ({result.questionResults.filter(r => !r.correct).length} টি ভুল)</span>
            <ChevronRight size={16} className={`transition-transform ${showReview ? 'rotate-90' : ''}`} />
          </button>

          {showReview && (
            <div className="mt-3 space-y-4">
              {result.questionResults.map((r, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: r.correct ? 'rgba(101,209,178,0.04)' : 'rgba(248,113,113,0.06)',
                    border: `1px solid ${r.correct ? 'rgba(101,209,178,0.12)' : 'rgba(248,113,113,0.20)'}`,
                  }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    {r.correct
                      ? <CheckCircle2 size={16} style={{ color: S.accent }} className="mt-0.5 shrink-0" />
                      : <XCircle size={16} style={{ color: S.danger }} className="mt-0.5 shrink-0" />}
                    <p className="text-sm font-semibold" style={{ color: S.text }}>
                      <span className="font-black mr-1" style={{ color: r.correct ? S.accent : S.danger }}>Q{i + 1}.</span>
                      {r.questionText}
                    </p>
                  </div>

                  {!r.correct && (
                    <div className="ml-6 space-y-1.5 text-xs font-semibold">
                      <p style={{ color: S.danger }}>
                        আপনার উত্তর: {
                          (r.type === 'mcq' || r.type === 'truefalse')
                            ? (r.given !== undefined && r.given !== null ? r.options?.[r.given] || r.given : 'দেওয়া হয়নি')
                            : (r.given || 'দেওয়া হয়নি')
                        }
                      </p>
                      <p style={{ color: S.accent }}>
                        সঠিক উত্তর: {
                          (r.type === 'mcq' || r.type === 'truefalse')
                            ? r.options?.[r.correctAnswer] || r.correctAnswer
                            : r.correctAnswer
                        }
                      </p>
                      {r.explanation && (
                        <p className="mt-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(101,209,178,0.06)', color: S.muted }}>
                          💡 {r.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ExamPage ─────────────────────────────────────────────────────────────
export function ExamPage() {
  useCopyProtection()
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const [searchParams] = useSearchParams()

  // Wire into the shared progress system so passing the exam unlocks the next level
  const { completeLevel, markExamPassed } = useCourseProgress(
    { beginner: [], intermediate: [], advanced: [] },
    []
  )

  const [examStarted, setExamStarted] = useState(searchParams.get('autoStart') === 'true')
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Refs that always hold the latest values so the timer interval never
  // captures a stale closure (the root cause of the auto-submit bug).
  const answersRef = useRef(answers)
  const startTimeRef = useRef(startTime)
  const submittedRef = useRef(submitted)
  const submitFnRef = useRef<() => void>(() => {})

  useEffect(() => { answersRef.current = answers }, [answers])
  useEffect(() => { startTimeRef.current = startTime }, [startTime])
  useEffect(() => { submittedRef.current = submitted }, [submitted])

  const antiCheatInfo = useExamAntiCheat(examStarted)

  // Fetch exam
  const { data: exam, isLoading, isError, error } = useQuery<ExamData>({
    queryKey: ['exam-level', level],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated')
      
      const apiUrl = `${API_BASE_URL}/exams/level/${level}`;
      
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) {
        if (res.status === 403) {
          let body: any = {}
          try { body = await res.json() } catch { /* ignore parse errors */ }
          const err = new Error(body.code === 'EXAM_ALREADY_PASSED' ? 'আপনি ইতিমধ্যেই এই পরীক্ষায় পাস করেছেন' : 'পরীক্ষা লক করা') as Error & { code?: string; requiredLevel?: string | null }
          err.code = body.code || 'EXAM_LOCKED'
          err.requiredLevel = body.requiredLevel || null
          throw err
        }
        throw new Error('পরীক্ষা পাওয়া যায়নি')

      }
      const data = await res.json();
      return data;
    },
    enabled: !!token && !!level,
  })

  // Initialise timer once exam loads
  useEffect(() => {
    if (!exam) return
    const secs = (exam.timeLimitMinutes || 30) * 60
    setSecondsLeft(secs)
    setStartTime(Date.now())
  }, [exam])

  // Countdown tick (only runs after exam starts).
  // On timeout it calls submitFnRef.current(), which always reads the latest
  // answers/startTime via refs — never a stale closure. This produces the exact
  // same payload as clicking the Submit button.
  useEffect(() => {
    if (!exam || submitted || !examStarted) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          submitFnRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [exam, submitted, examStarted])

  const submitMutation = useMutation({
    mutationFn: async (payload: { answers: any[]; timeTakenSeconds: number }) => {
      const res = await fetch(`${API_BASE_URL}/exams/${exam!._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('জমা দিতে ব্যর্থ')
      return res.json() as Promise<SubmitResult>
    },
    onSuccess: data => {
      setResult(data)
      setSubmitted(true)
      // Update local progress so next-level unlock takes effect immediately
      if (data.passed && level) {
        completeLevel(level as LearningLevel)
        markExamPassed(exam!._id, {
          score: data.score,
          passed: true,
          takenAt: new Date().toISOString(),
          timeTakenSeconds: Math.round((Date.now() - startTime) / 1000),
        })
      }
    },
  })

  // The single source of submission logic. Both manual submit and the
  // timeout auto-submit call submitFnRef.current(), guaranteeing an identical
  // payload (latest answers + accurate time taken).
  const submitExamNow = useCallback(() => {
    if (submittedRef.current || !exam) return
    if (timerRef.current) clearInterval(timerRef.current)
    const answersArray = exam.questions.map((_, i) => answersRef.current[i] ?? null)
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
    submitMutation.mutate({ answers: answersArray, timeTakenSeconds: timeTaken })
  }, [exam, submitMutation])

  useEffect(() => { submitFnRef.current = submitExamNow }, [submitExamNow])

  const handleSubmit = useCallback(() => {
    submitExamNow()
  }, [submitExamNow])

  // On anti-cheat termination: do NOT auto-submit or grade the attempt.
  // Stop the timer, and record a "terminated" marker so the attempt is preserved
  // as a rule-violation. The student must start a completely new attempt.
  const terminationRecordedRef = useRef(false)
  useEffect(() => {
    if (!antiCheatInfo.terminated) return
    if (timerRef.current) clearInterval(timerRef.current)
    if (submitted || !exam || terminationRecordedRef.current) return
    terminationRecordedRef.current = true
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    fetch(`${API_BASE_URL}/exams/${exam._id}/terminate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: antiCheatInfo.reason, timeTakenSeconds: timeTaken }),
    }).catch(() => { /* best-effort: page is being terminated */ })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [antiCheatInfo.terminated])

  const handleRetry = () => {
    setAnswers({})
    setCurrentQ(0)
    setSubmitted(false)
    setResult(null)
    if (exam) {
      const secs = exam.timeLimitMinutes * 60
      setSecondsLeft(secs)
      setStartTime(Date.now())
    }
  }

  const answeredCount = useMemo(() =>
    exam ? exam.questions.filter((_, i) => answers[i] !== undefined && answers[i] !== null && answers[i] !== '').length : 0,
    [exam, answers]
  )

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4">
          <div className="text-5xl animate-spin">⚙️</div>
          <p className="font-black text-sm uppercase tracking-widest" style={{ color: S.muted }}>পরীক্ষা লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (isError || !exam) {
    // Distinguish a progression-locked exam (HTTP 403) from a genuine error.
    const lockedErr = error as (Error & { code?: string; requiredLevel?: string | null }) | null
    const isLocked = lockedErr?.code === 'EXAM_LOCKED'
    const alreadyPassed = lockedErr?.code === 'EXAM_ALREADY_PASSED'
    const prevLevel = lockedErr?.requiredLevel

    if (alreadyPassed) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: S.bg }}>
          <div className="text-center space-y-5 max-w-md">
            <div className="text-5xl">✅</div>
            <p className="font-black text-lg" style={{ color: S.text }}>আপনি ইতিমধ্যেই এই চূড়ান্ত পরীক্ষায় পাস করেছেন</p>
            <p className="text-sm font-semibold" style={{ color: S.muted }}>
              আপনি ইতিমধ্যে এই লেভেলের চূড়ান্ত পরীক্ষায় উত্তীর্ণ হয়েছেন। আপনি পরবর্তী লেভেলে যেতে পারেন বা আপনার ফলাফল পর্যালোচনা করতে পারেন।
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to={`/exam/${level}/review`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm"
                style={{ backgroundColor: S.accent, color: '#04342C' }}
              >
                ফলাফল পর্যালোচনা করুন
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                style={{ color: S.accent, border: `1px solid ${S.accent}` }}
              >
                কোর্সে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (isLocked) {
      const prevHref = prevLevel ? `/exam/${prevLevel}` : '/courses'
      const prevLabel = prevLevel
        ? `${prevLevel.charAt(0).toUpperCase() + prevLevel.slice(1)} পরীক্ষা দিন`
        : 'কোর্সে ফিরে যান'
      return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: S.bg }}>
          <div className="text-center space-y-5 max-w-md">
            <div className="text-5xl">🔒</div>
            <p className="font-black text-lg" style={{ color: S.text }}>এই চূড়ান্ত পরীক্ষা লক করা আছে</p>
            <p className="text-sm font-semibold" style={{ color: S.muted }}>
              এই লেভেলের পরীক্ষা দিতে হলে আগের লেভেলটি সম্পন্ন করে তার চূড়ান্ত পরীক্ষায় পাস করতে হবে।
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to={prevHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm"
                style={{ backgroundColor: S.accent, color: '#04342C' }}
              >
                <ArrowLeft size={14} /> {prevLabel}
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                style={{ color: S.accent, border: `1px solid ${S.accent}` }}
              >
                কোর্সে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4">
          <AlertTriangle size={48} style={{ color: S.danger }} className="mx-auto" />
          <p className="font-black" style={{ color: S.text }}>এই লেভেলের পরীক্ষা পাওয়া যায়নি।</p>
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: S.accent }}>
            <ArrowLeft size={14} /> কোর্সে ফিরে যান
          </Link>
        </div>
      </div>
    )
  }

  // ── Exam terminated by anti-cheat ───────────────────────────────────────
  if (antiCheatInfo.terminated) {
    return <ExamTerminatedPage level={level!} reason={antiCheatInfo.reason} />
  }

  // ── Exam instructions (before start) ───────────────────────────────────
  if (!examStarted) {
    return (
      <ExamInstructions
        level={level!}
        examTitle={exam.title}
        questionCount={exam.questionCount || exam.questions.length}
        timeLimitMinutes={exam.timeLimitMinutes}
        passingScore={exam.passingScore}
        onStart={() => setExamStarted(true)}
        onBack={() => navigate('/courses')}
      />
    )
  }

  // ── Result screen ────────────────────────────────────────────────────────
  if (submitted && result) {
    return <ResultScreen result={result} level={level!} onRetry={handleRetry} />
  }

  // ── Submitting overlay ───────────────────────────────────────────────────
  if (submitMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4">
          <div className="text-5xl animate-pulse">📊</div>
          <p className="font-black text-sm uppercase tracking-widest" style={{ color: S.accent }}>গ্রেড করা হচ্ছে...</p>
        </div>
      </div>
    )
  }

  // ── No questions available (defensive) ────────────────────────────────────
  // Guards against an exam document that has an empty/missing questions array
  // so QuestionCard never receives an undefined question.
  if (!Array.isArray(exam.questions) || exam.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4">
          <AlertTriangle size={48} style={{ color: S.warn }} className="mx-auto" />
          <p className="font-black" style={{ color: S.text }}>কোনো প্রশ্ন উপলব্ধ নেই।</p>
          <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-bold" style={{ color: S.accent }}>
            <ArrowLeft size={14} /> কোর্সে ফিরে যান
          </Link>
        </div>
      </div>
    )
  }

  // Keep the active index within bounds: 0 <= safeIndex < questions.length
  const safeIndex = Math.min(Math.max(currentQ, 0), exam.questions.length - 1)
  const q = exam.questions[safeIndex]
  const totalSecs = exam.timeLimitMinutes * 60

  // ── Exam UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: S.bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-4"
        style={{ backgroundColor: S.card, borderBottom: '1px solid rgba(101,209,178,0.12)' }}
      >
        <Link
          to="/courses"
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: S.muted }}
          title="পরীক্ষা থেকে বের হন"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black truncate" style={{ color: S.text }}>{exam.title}</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: S.muted }}>
            {LEVEL_LABELS[exam.level]} · ফাইনাল পরীক্ষা · পাস: {exam.passingScore}%
          </p>
        </div>
        <div className="w-40 shrink-0">
          {totalSecs > 0 && <TimerBar secondsLeft={secondsLeft} totalSeconds={totalSecs} />}
        </div>
      </header>

      {/* Progress nav strip */}
      <div
        className="px-4 py-2 flex items-center gap-1 overflow-x-auto shrink-0"
        style={{ backgroundColor: S.surface, borderBottom: '1px solid rgba(101,209,178,0.08)' }}
      >
        {exam.questions.map((_, i) => {
          const ans = answers[i]
          const isAnswered = ans !== undefined && ans !== null && ans !== ''
          const isActive = i === safeIndex
          return (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className="shrink-0 w-7 h-7 rounded-lg text-[11px] font-black transition-all"
              style={{
                backgroundColor: isActive
                  ? S.accent
                  : isAnswered
                  ? 'rgba(101,209,178,0.20)'
                  : 'rgba(101,209,178,0.06)',
                color: isActive ? '#04342C' : isAnswered ? S.accent : S.muted,
                border: `1px solid ${isActive ? S.accent : 'rgba(101,209,178,0.10)'}`,
              }}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <QuestionCard
            q={q}
            idx={safeIndex}
            total={exam.questions.length}
            answer={answers[safeIndex]}
            onAnswer={val => setAnswers(prev => ({ ...prev, [safeIndex]: val }))}
          />
        </div>
      </div>

      {/* Footer nav */}
      <footer
        className="sticky bottom-0 px-4 py-3 flex items-center justify-between gap-3"
        style={{ backgroundColor: S.card, borderTop: '1px solid rgba(101,209,178,0.12)' }}
      >
        <button
          onClick={() => setCurrentQ(Math.max(0, safeIndex - 1))}
          disabled={safeIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30"
          style={{ backgroundColor: 'rgba(101,209,178,0.08)', color: S.muted }}
        >
          <ChevronLeft size={15} /> আগে
        </button>

        <span className="text-xs font-bold" style={{ color: S.muted }}>
          {answeredCount}/{exam.questions.length} উত্তর দেওয়া হয়েছে
        </span>

        {safeIndex < exam.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(safeIndex + 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{ backgroundColor: 'rgba(101,209,178,0.12)', color: S.accent }}
          >
            পরে <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105 disabled:opacity-60"
            style={{ backgroundColor: S.accent, color: '#04342C', boxShadow: '0 0 20px rgba(101,209,178,0.25)' }}
          >
            <Trophy size={15} /> জমা দিন
          </button>
        )}
      </footer>
    </div>
  )
}
