import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgressContext } from '../context/ProgressContext'
import { API_BASE_URL } from '../config/api'

const FAVORITE_OPTIONS = [
  'ভিডিও', 'অ্যানিমেশন', 'IDE', 'অনুশীলন', 'কুইজ', 'ব্যাখ্যা', 'AI সহায়তা', 'গেমিফিকেশন', 'অন্যান্য',
]

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মাঝারি',
  advanced: 'উন্নত',
}

export function FeedbackPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const { token, updateUser } = useAuth()
  const { refreshProgress } = useProgressContext()
  const validLevels = ['beginner', 'intermediate', 'advanced']

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [courseExperience, setCourseExperience] = useState('')
  const [learnedSomething, setLearnedSomething] = useState('')
  const [lessonUnderstanding, setLessonUnderstanding] = useState('')
  const [favoriteParts, setFavoriteParts] = useState<string[]>([])
  const [improvementSuggestion, setImprovementSuggestion] = useState('')
  const [futureFeatures, setFutureFeatures] = useState('')
  const [recommendation, setRecommendation] = useState('')
  const [additionalSuggestion, setAdditionalSuggestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!level || !validLevels.includes(level)) {
      navigate('/courses', { replace: true })
      return
    }
    checkFeedbackStatus()
  }, [level])

  const checkFeedbackStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/status/${level}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        navigate('/courses', { replace: true })
        return
      }
      const data = await res.json()
      if (!data.passed) {
        navigate('/courses', { replace: true })
        return
      }
      if (data.feedbackSubmitted) {
        navigate('/courses', { replace: true })
        return
      }
    } catch {
      navigate('/courses', { replace: true })
      return
    } finally {
      setChecking(false)
    }
  }

  const toggleFavorite = (part: string) => {
    setFavoriteParts(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part],
    )
  }

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (rating === 0) errors.push('অনুগ্রহ করে রেটিং নির্বাচন করুন')
    if (!courseExperience) errors.push('অনুগ্রহ করে আপনার অভিজ্ঞতা নির্বাচন করুন')
    if (!learnedSomething) errors.push('অনুগ্রহ করে শেখার অভিজ্ঞতা নির্বাচন করুন')
    if (!lessonUnderstanding) errors.push('অনুগ্রহ করে পাঠ বোঝার মাত্রা নির্বাচন করুন')
    if (!improvementSuggestion || improvementSuggestion.trim().length < 20) {
      errors.push('উন্নতির পরামর্শ কমপক্ষে ২০টি অক্ষর হতে হবে')
    }
    if (!recommendation) errors.push('অনুগ্রহ করে সুপারিশ নির্বাচন করুন')
    return errors
  }, [rating, courseExperience, learnedSomething, lessonUnderstanding, improvementSuggestion, recommendation])

  const handleSubmit = async () => {
    if (validationErrors.length > 0 || submitting) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          rating,
          courseExperience,
          learnedSomething,
          lessonUnderstanding,
          favoriteParts,
          improvementSuggestion: improvementSuggestion.trim(),
          futureFeatures,
          recommendation,
          additionalSuggestion,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'জমা দিতে ব্যর্থ')
      }

      // Clear pendingFeedback in AuthContext so the ProtectedRoute stops
      // redirecting to this feedback page on subsequent navigations.
      updateUser({ pendingFeedback: null })

      // Refresh progression state immediately — the backend has unlocked the
      // next level, so ProgressContext must reflect it before the success page
      // or any navigation to /courses renders.
      refreshProgress()

      navigate(`/feedback/${level}/success`, {
        state: { nextLevelUnlocked: data.nextLevelUnlocked, nextLevel: data.nextLevel },
        replace: true,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const charCount = improvementSuggestion.trim().length
  const charValid = charCount >= 20

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <span className="loading loading-spinner loading-lg" style={{ color: 'var(--color-accent)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header card */}
        <div
          className="rounded-3xl p-8 text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-border)' }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            অভিনন্দন!
          </h1>
          <p className="text-base font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            আপনি সফলভাবে {LEVEL_LABELS[level || '']} লেভেলের পরীক্ষা সম্পন্ন করেছেন।
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
            আপনার মূল্যবান মতামত আমাদের আলোকবার্তিকা প্ল্যাটফর্মকে আরও উন্নত করতে সাহায্য করবে।
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl p-4 text-sm font-semibold"
            style={{ backgroundColor: 'rgba(248,113,113,0.10)', color: 'var(--color-error)', border: '1px solid rgba(248,113,113,0.20)' }}
          >
            {error}
          </div>
        )}

        {/* ── 1. Overall Rating ── */}
        <Section title="১. সামগ্রিক রেটিং" required>
          <div className="flex items-center gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className="text-3xl transition-all hover:scale-110"
                style={{
                  color: star <= (hoverRating || rating) ? '#F59E0B' : 'var(--color-text-muted)',
                  opacity: star <= (hoverRating || rating) ? 1 : 0.3,
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              {['', 'খারাপ', 'গড়', 'ভালো', 'খুব ভালো', 'চমৎকার'][rating]}
            </p>
          )}
        </Section>

        {/* ── 2. Course Experience ── */}
        <Section title="২. এই কোর্সটি আপনার কেমন লেগেছে?" required>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: 'অসাধারণ', icon: '😊' },
              { value: 'ভালো', icon: '🙂' },
              { value: 'মোটামুটি', icon: '😐' },
              { value: 'উন্নতির প্রয়োজন', icon: '😕' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCourseExperience(opt.value)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: courseExperience === opt.value ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                  border: `2px solid ${courseExperience === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: courseExperience === opt.value ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 3. Learned Something ── */}
        <Section title="৩. আপনি কি এই কোর্স থেকে নতুন কিছু শিখতে পেরেছেন?" required>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'হ্যাঁ, অনেক কিছু শিখেছি', icon: '✅' },
              { value: 'কিছুটা শিখেছি', icon: '🙂' },
              { value: 'খুব বেশি শিখতে পারিনি', icon: '❌' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLearnedSomething(opt.value)}
                className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: learnedSomething === opt.value ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                  border: `2px solid ${learnedSomething === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: learnedSomething === opt.value ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 4. Lesson Understanding ── */}
        <Section title="৪. পাঠগুলো কি সহজে বুঝতে পেরেছেন?" required>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'সম্পূর্ণ বুঝেছি', icon: '✅' },
              { value: 'বেশিরভাগ বুঝেছি', icon: '🙂' },
              { value: 'আরও সহজ করা দরকার', icon: '❌' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLessonUnderstanding(opt.value)}
                className="flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: lessonUnderstanding === opt.value ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                  border: `2px solid ${lessonUnderstanding === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: lessonUnderstanding === opt.value ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 5. Favorite Parts ── */}
        <Section title="৫. কোন বিষয়টি আপনার সবচেয়ে ভালো লেগেছে?" optional>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>
            একাধিক নির্বাচন করতে পারেন
          </p>
          <div className="flex flex-wrap gap-2">
            {FAVORITE_OPTIONS.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleFavorite(opt)}
                className="px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: favoriteParts.includes(opt) ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                  border: `2px solid ${favoriteParts.includes(opt) ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: favoriteParts.includes(opt) ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                {favoriteParts.includes(opt) ? '☑ ' : '☐ '}
                {opt}
              </button>
            ))}
          </div>
        </Section>

        {/* ── 6. Improvement Suggestion ── */}
        <Section title="৬. কোন অংশে উন্নতি করা দরকার?" required>
          <textarea
            className="textarea w-full mt-2"
            rows={4}
            placeholder="আপনার মূল্যবান মতামত লিখুন..."
            value={improvementSuggestion}
            onChange={e => setImprovementSuggestion(e.target.value)}
            style={{
              backgroundColor: 'var(--color-bg)',
              border: `2px solid ${improvementSuggestion && !charValid ? 'var(--color-error)' : 'var(--color-border)'}`,
              color: 'var(--color-text)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '14px',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          />
          <div className="flex justify-end mt-1">
            <span
              className="text-xs font-semibold"
              style={{ color: charValid ? 'var(--color-accent)' : 'var(--color-error)' }}
            >
              {charCount}/২০ অক্ষর {charValid ? '✅' : ''}
            </span>
          </div>
        </Section>

        {/* ── 7. Future Features ── */}
        <Section title="৭. ভবিষ্যতে আপনি আলোকবার্তিকায় কোন নতুন ফিচার দেখতে চান?" optional>
          <textarea
            className="textarea w-full mt-2"
            rows={3}
            placeholder="যেমন: আরও অনুশীলন, আরও ভিডিও, লাইভ ক্লাস, AI Tutor, Coding Challenge, Mobile App, Certificate Improvement, অন্যান্য"
            value={futureFeatures}
            onChange={e => setFutureFeatures(e.target.value)}
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '14px',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          />
        </Section>

        {/* ── 8. Recommendation ── */}
        <Section title="৮. আপনি কি আলোকবার্তিকা আপনার বন্ধু বা সহপাঠীদের কাছে সুপারিশ করবেন?" required>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: 'অবশ্যই করব', icon: '🌟' },
              { value: 'সম্ভবত করব', icon: '🙂' },
              { value: 'নিশ্চিত নই', icon: '😐' },
              { value: 'না, করব না', icon: '❌' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRecommendation(opt.value)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
                style={{
                  backgroundColor: recommendation === opt.value ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                  border: `2px solid ${recommendation === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: recommendation === opt.value ? 'var(--color-accent)' : 'var(--color-text)',
                }}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.value}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── 9. Additional Suggestion ── */}
        <Section title="৯. আপনি যদি আলোকবার্তিকা টিমকে একটি পরামর্শ দিতে চান, তাহলে কী বলবেন?" optional>
          <textarea
            className="textarea w-full mt-2"
            rows={3}
            placeholder="আপনার অতিরিক্ত পরামর্শ লিখুন..."
            value={additionalSuggestion}
            onChange={e => setAdditionalSuggestion(e.target.value)}
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '14px',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          />
        </Section>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div
            className="rounded-2xl p-4 text-sm font-semibold"
            style={{ backgroundColor: 'rgba(248,113,113,0.10)', color: 'var(--color-error)', border: '1px solid rgba(248,113,113,0.20)' }}
          >
            <p className="font-black mb-2">অনুগ্রহ করে নিচের ক্ষেত্রগুলি পূরণ করুন:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/courses', { replace: true })}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '2px solid var(--color-border)' }}
          >
            ← কোর্সে ফিরে যান
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={validationErrors.length > 0 || submitting}
            className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: '#04342C',
            }}
          >
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'মতামত জমা দিন'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  required,
  optional,
  children,
}: {
  title: string
  required?: boolean
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <h2 className="text-base font-black mb-4" style={{ color: 'var(--color-text)' }}>
        {title}
        {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
        {optional && <span className="text-xs font-semibold ml-2" style={{ color: 'var(--color-text-muted)' }}>(ঐচ্ছিক)</span>}
      </h2>
      {children}
    </div>
  )
}
