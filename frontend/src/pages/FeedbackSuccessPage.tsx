import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProgressContext } from '../context/ProgressContext'
import { API_BASE_URL } from '../config/api'

export function FeedbackSuccessPage() {
  const { level } = useParams<{ level: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const { refreshProgress } = useProgressContext()
  const [checking, setChecking] = useState(true)

  const state = location.state as { nextLevelUnlocked?: boolean; nextLevel?: string } | null
  const nextLevelUnlocked = state?.nextLevelUnlocked ?? false
  const nextLevel = state?.nextLevel ?? null

  useEffect(() => {
    if (!level) {
      navigate('/courses', { replace: true })
      return
    }
    // Refresh progression so any subsequent navigation reads the latest unlocks
    refreshProgress()
    // Verify feedback was actually submitted
    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/feedback/status/${level}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          navigate('/courses', { replace: true })
          return
        }
        const data = await res.json()
        if (!data.feedbackSubmitted) {
          navigate(`/feedback/${level}`, { replace: true })
          return
        }
      } catch {
        navigate('/courses', { replace: true })
        return
      } finally {
        setChecking(false)
      }
    }
    verify()
  }, [level])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
        <span className="loading loading-spinner loading-lg" style={{ color: 'var(--color-accent)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-lg space-y-6">
        <div
          className="rounded-3xl p-8 text-center"
          style={{ backgroundColor: 'var(--color-surface)', border: '2px solid var(--color-border)' }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>
            ধন্যবাদ!
          </h1>
          <p className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-muted)' }}>
            আপনার মূল্যবান মতামত সফলভাবে সংরক্ষণ করা হয়েছে।
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            আপনার মতামত আমাদের আলোকবার্তিকা প্ল্যাটফর্মকে আরও উন্নত করতে সাহায্য করবে।
          </p>

          {nextLevelUnlocked && (
            <div
              className="mt-6 rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(101,209,178,0.08)', border: '1px solid rgba(101,209,178,0.25)' }}
            >
              <div className="text-3xl mb-2">🔓</div>
              <p className="font-black text-sm" style={{ color: 'var(--color-accent)' }}>
                পরবর্তী লেভেল সফলভাবে আনলক হয়েছে!
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {nextLevelUnlocked && nextLevel && (
            <button
              type="button"
              onClick={() => navigate(`/courses?level=${nextLevel}`, { replace: true })}
              className="flex-1 py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--color-accent)', color: '#04342C' }}
            >
              ➡️ পরবর্তী লেভেলে যান
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/courses', { replace: true })}
            className={`${nextLevelUnlocked ? 'flex-1' : 'w-full'} py-3.5 rounded-2xl font-black text-sm transition-all hover:scale-105`}
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '2px solid var(--color-border)' }}
          >
            ➡️ কোর্সে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  )
}
