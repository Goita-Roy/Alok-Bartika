import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'
import { ArrowLeft, Award, BookOpen, CheckCircle, RefreshCw, User, Zap } from 'lucide-react'

interface ProfileData {
  fullName: string
  email: string
  username: string
  phone: string
  profilePicture: string
  profile: {
    avatar: string
    schoolName: string
    className: string
    roll: string
    address: string
    phone: string
    bio: string
    birthDate: string | null
  }
  schoolName: string
  xp: number
  level: number
  badges: { name: string }[]
  completedLessons: number
  completedCourses: number
  currentStage: string
  progressPercentage: number
  examMarks: number
  leaderboardRank: number
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'যোগ করা হয়নি'
  try {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return 'যোগ করা হয়নি'
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return 'যোগ করা হয়নি'
  }
}

function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

function display(val: any, fallback = 'যোগ করা হয়নি'): string {
  if (val === null || val === undefined || val === '') return fallback
  return String(val)
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.message || `Request failed (${res.status})`)
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      console.error('Profile fetch error:', err)
      setError(err.message || 'প্রোফাইল লোড করা যায়নি')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" style={{ color: 'var(--color-accent)' }}></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-xl text-sm font-bold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          {error}
        </div>
        <button onClick={fetchProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ backgroundColor: 'var(--color-accent)' }}>
          <RefreshCw size={16} /> পুনরায় চেষ্টা করুন
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-xl text-sm font-bold" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          প্রোফাইল লোড করা যায়নি
        </div>
        <button onClick={fetchProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ backgroundColor: 'var(--color-accent)' }}>
          <RefreshCw size={16} /> পুনরায় চেষ্টা করুন
        </button>
      </div>
    )
  }

  const avatar = data.profile?.avatar || data.profilePicture || ''

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}>
        <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরে যান
      </button>

      {/* Header Card */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: 'var(--color-accent-pale)', border: '2px solid var(--color-border)' }}>
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-black"
              style={{ color: 'var(--color-accent)' }}>
              {data.fullName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{data.fullName}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>@{data.username}</p>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--color-accent)' }}>
            {data.email}
          </p>
        </div>
        <div className="sm:ml-auto flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-accent-pale)' }}>
            <p className="text-2xl font-black" style={{ color: 'var(--color-accent)' }}>{toBnDigits(data.level)}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>লেভেল</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Zap size={18} />, label: 'এক্সপি', value: toBnDigits(data.xp?.toLocaleString() || '0') },
          { icon: <Award size={18} />, label: 'কোর্স সম্পন্ন', value: toBnDigits(data.completedCourses ?? 0) },
          { icon: <BookOpen size={18} />, label: 'লেসন সম্পন্ন', value: toBnDigits(data.completedLessons ?? 0) },
          { icon: <User size={18} />, label: 'র‍্যাঙ্ক', value: data.leaderboardRank ? `#${toBnDigits(data.leaderboardRank)}` : '—' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-4 text-center"
            style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
            <div className="flex justify-center mb-1" style={{ color: 'var(--color-accent)' }}>{stat.icon}</div>
            <p className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Profile Info */}
      <div className="rounded-2xl p-5 space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
          <User size={16} /> ব্যক্তিগত তথ্য
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoRow label="পূর্ণ নাম" value={display(data.fullName)} />
          <InfoRow label="ইউজারনেম" value={`@${display(data.username)}`} />
          <InfoRow label="ইমেইল" value={display(data.email)} />
          <InfoRow label="স্কুলের নাম" value={display(data.profile?.schoolName || data.schoolName)} />
          <InfoRow label="জন্ম তারিখ" value={formatDate(data.profile?.birthDate)} />
          <InfoRow label="রোল নম্বর" value={display(data.profile?.roll)} />
          <InfoRow label="ঠিকানা" value={display(data.profile?.address)} />
          <InfoRow label="ফোন নম্বর" value={display(data.phone || data.profile?.phone)} />
          <InfoRow label="নিজের সম্পর্কে" value={display(data.profile?.bio)} className="sm:col-span-2" />
        </div>
      </div>

      <div className="text-center">
        <Link to="/settings"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ backgroundColor: 'var(--color-accent)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#178a63'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)'}>
          প্রোফাইল সম্পাদনা করুন
        </Link>
      </div>
    </div>
  )
}

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  const isNotAdded = value === 'যোগ করা হয়নি'
  return (
    <div className={className}>
      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      <p className="text-sm font-medium mt-0.5" style={{ color: isNotAdded ? 'var(--color-text-muted)' : 'var(--color-text)', opacity: isNotAdded ? 0.6 : 1 }}>
        {value}
      </p>
    </div>
  )
}
