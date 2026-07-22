import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useCopyProtection } from '../hooks/useCopyProtection'
import {
  CheckCircle2, XCircle, Trophy, AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, Clock, Star,
} from 'lucide-react'

const S = {
  bg: '#04342C', surface: '#0A4A3F', card: '#071f1a',
  accent: '#65D1B2', light: '#8FE3CC', muted: '#B8C5C1', text: '#F5F7F6',
  danger: '#f87171', warn: '#f5c842', success: '#65D1B2',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ', intermediate: 'মধ্যবর্তী', advanced: 'উন্নত',
}

interface Question {
  _id: string
  type: 'mcq' | 'truefalse' | 'code-output' | 'coding'
  questionText: string
  options: string[]
  correctAnswer: any
  explanation: string
  starterCode?: string
  points: number
}

interface Attempt {
  score: number
  earnedPoints: number
  totalPoints: number
  passed: boolean
  timeTakenSeconds: number
  takenAt: string
  answers: any[]
  attemptNumber: number
  questionResults: {
    questionIdx: number
    questionText: string
    type: string
    options: string[]
    given: any
    correct: boolean
    correctAnswer: any
    explanation: string
    points: number
  }[]
}

interface ReviewData {
  exam: {
    _id: string
    level: string
    title: string
    description: string
    passingScore: number
    questionCount: number
    questions: Question[]
  }
  attempt: Attempt
  attemptCount: number
  bestScore: number
}

const tfOptions = ['সত্য (True)', 'মিথ্যা (False)']

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return dateStr }
}

export function ExamReviewPage() {
  useCopyProtection()
  const { level } = useParams<{ level: string }>()
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<ReviewData | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!token || !level) return

    const fetchReview = async () => {
      try {
        setLoading(true)
        setError(null)

        // First get the exam by level to get exam ID
        const examRes = await fetch(`${API_BASE_URL}/exams/level/${level}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!examRes.ok) {
          // Check if there are attempts saved locally
          setError('পরীক্ষার তথ্য পাওয়া যায়নি।')
          setLoading(false)
          return
        }
        const examData = await examRes.json()

        // Then fetch review data
        const reviewRes = await fetch(`${API_BASE_URL}/exams/${examData._id}/review`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!reviewRes.ok) {
          setError('পর্যালোচনার তথ্য পাওয়া যায়নি। আপনি কি পরীক্ষায় অংশ নিয়েছেন?')
          setLoading(false)
          return
        }
        const data = await reviewRes.json()
        setReviewData(data)
      } catch (err) {
        setError('পর্যালোচনা লোড করতে সমস্যা হয়েছে।')
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [token, level])

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4">
          <div className="text-5xl animate-spin">⚙️</div>
          <p className="font-black text-sm uppercase tracking-widest" style={{ color: S.muted }}>পর্যালোচনা লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error || !reviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: S.bg }}>
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <AlertTriangle size={48} style={{ color: S.danger }} className="mx-auto" />
          <p className="font-black text-lg" style={{ color: S.text }}>{error || 'পর্যালোচনা পাওয়া যায়নি।'}</p>
          <p className="text-sm font-semibold" style={{ color: S.muted }}>
            আপনি কি পরীক্ষায় অংশ নিয়েছেন? পরীক্ষা দেওয়ার পরেই পর্যালোচনা দেখা যাবে।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to={`/exam/${level}`}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: '1px solid rgba(101,209,178,0.20)' }}
            >
              <ArrowLeft size={15} /> পরীক্ষায় যান
            </Link>
            <Link
              to="/courses"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: S.accent, color: '#04342C' }}
            >
              <Star size={15} /> কোর্সে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { exam, attempt } = reviewData
  const correctCount = attempt.questionResults.filter(r => r.correct).length
  const incorrectCount = attempt.questionResults.filter(r => !r.correct).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: S.bg }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center gap-4"
        style={{ backgroundColor: S.card, borderBottom: '1px solid rgba(101,209,178,0.12)' }}
      >
        <Link
          to="/courses"
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: S.muted }}
          title="কোর্সে ফিরুন"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black truncate" style={{ color: S.text }}>{exam.title} — পর্যালোচনা</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: S.muted }}>
            {LEVEL_LABELS[exam.level]} · ফাইনাল পরীক্ষা · রিভিউ মোড
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Score Summary Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 text-center"
          style={{
            backgroundColor: S.surface,
            border: `2px solid ${attempt.passed ? S.accent : S.danger}`,
          }}
        >
          <div className="text-5xl mb-3">{attempt.passed ? '🎉' : '😔'}</div>
          <h1
            className="text-2xl sm:text-3xl font-black mb-1"
            style={{ color: attempt.passed ? S.accent : S.danger }}
          >
            {attempt.passed ? 'পাস করেছে!' : 'ফেল করেছে'}
          </h1>
          <p className="text-sm font-semibold mb-4" style={{ color: S.muted }}>
            {LEVEL_LABELS[exam.level]} — প্রচেষ্টা #{attempt.attemptNumber}
          </p>

          {/* Score ring */}
          <div className="flex items-center justify-center mb-4">
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center"
              style={{
                background: `conic-gradient(${attempt.passed ? S.accent : S.danger} ${attempt.score * 3.6}deg, rgba(101,209,178,0.08) 0deg)`,
              }}
            >
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center"
                style={{ backgroundColor: S.surface }}
              >
                <span className="text-xl font-black" style={{ color: attempt.passed ? S.accent : S.danger }}>
                  {attempt.score}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(101,209,178,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: S.muted }}>স্কোর</p>
              <p className="text-lg font-black" style={{ color: S.text }}>{attempt.score}%</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(101,209,178,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: S.muted }}>প্রাপ্ত নম্বর</p>
              <p className="text-lg font-black" style={{ color: S.accent }}>{attempt.earnedPoints}/{attempt.totalPoints}</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(101,209,178,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: S.muted }}>সঠিক/ভুল</p>
              <p className="text-lg font-black" style={{ color: S.text }}>
                <span style={{ color: S.accent }}>{correctCount}</span>/
                <span style={{ color: S.danger }}>{incorrectCount}</span>
              </p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(101,209,178,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: S.muted }}>সময়</p>
              <p className="text-lg font-black" style={{ color: S.text }}>
                <Clock size={14} className="inline mr-1" style={{ color: S.muted }} />
                {formatTime(attempt.timeTakenSeconds)}
              </p>
            </div>
          </div>

          <p className="text-xs font-bold mt-4" style={{ color: S.muted }}>
            পাসের নম্বর: {exam.passingScore}% · পরীক্ষার তারিখ: {formatDate(attempt.takenAt)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 justify-center flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(101,209,178,0.08)' }}>
            <CheckCircle2 size={16} style={{ color: S.accent }} />
            <span className="text-sm font-bold" style={{ color: S.accent }}>{correctCount} সঠিক</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(248,113,113,0.08)' }}>
            <XCircle size={16} style={{ color: S.danger }} />
            <span className="text-sm font-bold" style={{ color: S.danger }}>{incorrectCount} ভুল</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ backgroundColor: 'rgba(101,209,178,0.08)' }}>
            <Trophy size={16} style={{ color: S.warn }} />
            <span className="text-sm font-bold" style={{ color: S.warn }}>{exam.questionCount} টি প্রশ্ন</span>
          </div>
        </div>

        {/* Question Review */}
        <div className="space-y-3">
          <h2 className="text-base font-black" style={{ color: S.text }}>
            সকল প্রশ্নের পর্যালোচনা ({exam.questionCount})
          </h2>

          {attempt.questionResults.map((r, idx) => {
            const isExpanded = expandedQuestions.has(idx)
            const displayOptions = r.type === 'truefalse' ? tfOptions : r.options
            const examQuestion = exam.questions[r.questionIdx] || exam.questions[idx]

            return (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden transition-all"
                style={{
                  backgroundColor: r.correct ? 'rgba(101,209,178,0.04)' : 'rgba(248,113,113,0.05)',
                  border: `1px solid ${r.correct ? 'rgba(101,209,178,0.15)' : 'rgba(248,113,113,0.20)'}`,
                }}
              >
                {/* Question header (clickable) */}
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex items-start gap-3 p-4 text-left"
                >
                  <span className="shrink-0 mt-0.5">
                    {r.correct
                      ? <CheckCircle2 size={18} style={{ color: S.accent }} />
                      : <XCircle size={18} style={{ color: S.danger }} />
                    }
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded"
                        style={{ backgroundColor: r.correct ? 'rgba(101,209,178,0.10)' : 'rgba(248,113,113,0.10)', color: r.correct ? S.accent : S.danger }}
                      >
                        Q{idx + 1}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(101,209,178,0.06)', color: S.muted }}
                      >
                        {r.type === 'mcq' ? 'MCQ' : r.type === 'truefalse' ? 'True/False' : r.type === 'code-output' ? 'Code Output' : 'Coding'}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: S.muted }}>{r.points} pts</span>
                    </div>
                    <p className="text-sm font-bold leading-relaxed" style={{ color: S.text }}>
                      {r.questionText}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: r.correct ? 'rgba(101,209,178,0.10)' : 'rgba(248,113,113,0.10)',
                          color: r.correct ? S.accent : S.danger,
                        }}
                      >
                        {r.correct ? '✓ সঠিক' : '✗ ভুল'}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 mt-1 transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <ChevronRight size={16} style={{ color: S.muted }} />
                  </span>
                </button>

                {/* Expanded answer details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {/* Options */}
                    {(r.type === 'mcq' || r.type === 'truefalse') && displayOptions && (
                      <div className="grid gap-1.5 mt-2">
                        {displayOptions.map((opt, oi) => {
                          const isSelected = r.given === oi
                          const isCorrectAns = r.correctAnswer === oi
                          let optStyle: React.CSSProperties = {
                            backgroundColor: 'rgba(101,209,178,0.04)',
                            border: '1px solid rgba(101,209,178,0.08)',
                            color: S.muted,
                          }
                          if (isSelected && isCorrectAns) {
                            optStyle = {
                              backgroundColor: 'rgba(101,209,178,0.15)',
                              border: `1.5px solid ${S.accent}`,
                              color: S.accent,
                            }
                          } else if (isSelected && !isCorrectAns) {
                            optStyle = {
                              backgroundColor: 'rgba(248,113,113,0.12)',
                              border: `1.5px solid ${S.danger}`,
                              color: S.danger,
                            }
                          } else if (!isSelected && isCorrectAns) {
                            optStyle = {
                              backgroundColor: 'rgba(101,209,178,0.08)',
                              border: `1.5px solid ${S.accent}`,
                              color: S.accent,
                            }
                          }
                          return (
                            <div
                              key={oi}
                              className="px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                              style={optStyle}
                            >
                              <span className="font-black shrink-0">{String.fromCharCode(65 + oi)}.</span>
                              <span className="flex-1">{opt}</span>
                              {isSelected && <span className="text-[10px] font-bold shrink-0">আপনার উত্তর</span>}
                              {isCorrectAns && !isSelected && <span className="text-[10px] font-bold shrink-0">সঠিক উত্তর</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Code output answer */}
                    {r.type === 'code-output' && (
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold mb-1" style={{ color: S.muted }}>আপনার উত্তর:</p>
                            <div
                              className="px-3 py-2 rounded-xl text-sm font-mono"
                              style={{
                                backgroundColor: 'rgba(248,113,113,0.08)',
                                border: '1px solid rgba(248,113,113,0.20)',
                                color: S.danger,
                              }}
                            >
                              {r.given || '—'}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold mb-1" style={{ color: S.muted }}>সঠিক উত্তর:</p>
                            <div
                              className="px-3 py-2 rounded-xl text-sm font-mono"
                              style={{
                                backgroundColor: 'rgba(101,209,178,0.08)',
                                border: '1px solid rgba(101,209,178,0.20)',
                                color: S.accent,
                              }}
                            >
                              {r.correctAnswer || '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Coding answer */}
                    {r.type === 'coding' && (
                      <div className="space-y-3 mt-2">
                        {/* Student submitted code */}
                        <div>
                          <p className="text-[10px] font-bold mb-1" style={{ color: S.muted }}>শিক্ষার্থীর জমা দেওয়া কোড:</p>
                          <pre
                            className="p-3 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap"
                            style={{
                              backgroundColor: 'rgba(4,52,44,0.8)',
                              border: '1px solid rgba(101,209,178,0.15)',
                              color: S.accent,
                            }}
                          >
                            {r.given || '—'}
                          </pre>
                        </div>

                        {/* Starter code */}
                        {examQuestion?.starterCode && (
                          <div>
                            <p className="text-[10px] font-bold mb-1" style={{ color: S.muted }}>স্টার্টার কোড:</p>
                            <pre
                              className="p-3 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap"
                              style={{
                                backgroundColor: 'rgba(4,52,44,0.5)',
                                border: '1px solid rgba(101,209,178,0.10)',
                                color: S.muted,
                              }}
                            >
                              {examQuestion.starterCode}
                            </pre>
                          </div>
                        )}

                        {/* Expected output */}
                        {examQuestion?.correctAnswer != null && String(examQuestion.correctAnswer).trim() !== '' && (
                          <div>
                            <p className="text-[10px] font-bold mb-1" style={{ color: S.muted }}>প্রত্যাশিত আউটপুট:</p>
                            <pre
                              className="p-3 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap"
                              style={{
                                backgroundColor: 'rgba(101,209,178,0.08)',
                                border: '1px solid rgba(101,209,178,0.20)',
                                color: S.accent,
                              }}
                            >
                              {String(examQuestion.correctAnswer)}
                            </pre>
                          </div>
                        )}

                        {/* Submitted time */}
                        <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: S.muted }}>
                          <Clock size={12} style={{ color: S.muted }} />
                          <span>জমা দেওয়ার সময়: {formatDate(attempt.takenAt)}</span>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {r.explanation && (
                      <div
                        className="mt-2 px-4 py-3 rounded-xl text-sm font-medium leading-relaxed"
                        style={{
                          backgroundColor: 'rgba(101,209,178,0.06)',
                          border: '1px solid rgba(101,209,178,0.10)',
                          color: S.muted,
                        }}
                      >
                        <span className="font-black" style={{ color: S.accent }}>ব্যাখ্যা: </span>
                        {r.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8">
          <Link
            to={`/exam/${level}`}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: S.accent, border: '1px solid rgba(101,209,178,0.20)' }}
          >
            <ArrowLeft size={15} /> আবার পরীক্ষা দিন
          </Link>
          <Link
            to="/courses"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: S.accent, color: '#04342C' }}
          >
            <Star size={15} /> কোর্সে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  )
}