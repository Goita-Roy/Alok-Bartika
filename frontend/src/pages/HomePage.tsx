import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, CheckCircle, Monitor, Mic, Trophy, Bot, Smartphone, Lock, ArrowDown } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useCourseProgress, type LearningLevel } from '../hooks/useCourseProgress'

/* ── Typewriter ──────────────────────────────────────────────────────── */
function Typewriter({ text, delay = 160 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState('')
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => { setShown(p => p + text[idx]); setIdx(p => p + 1) }, delay)
      return () => clearTimeout(t)
    }
  }, [idx, delay, text])
  return (
    <span>
      {shown}
      <span className="inline-block w-0.5 h-[0.85em] ml-1 align-middle animate-pulse"
        style={{ backgroundColor: 'var(--color-home-gold)' }} />
    </span>
  )
}

/* ── Bengali digit helper (display-only, values unchanged) ───────────── */
const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
function toBn(value: number | string): string {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[+d])
}

const BN = "'Hind Siliguri', sans-serif"

/* ── Static marketing copy (fully Bangla) ────────────────────────────── */
const FEATURES = [
  { icon: Monitor, title: 'ইনস্টল ছাড়াই IDE', desc: 'কোনো সফটওয়্যার ইনস্টল ছাড়াই সরাসরি ব্রাউজারে কোড লেখো ও চালাও। কম ক্ষমতার কম্পিউটারেও কাজ করে।' },
  { icon: Mic, title: 'বাংলা অডিও গাইড', desc: 'মাতৃভাষায় ধাপে ধাপে নির্দেশনা — ইংরেজির ভয় নেই! AI-চালিত তাৎক্ষণিক পরামর্শ বাংলাতেই পাওয়া যাবে।' },
  { icon: Trophy, title: 'খেলার ছলে শেখা', desc: 'স্কোর পয়েন্ট, ব্যাজ ও লিডারবোর্ড দিয়ে শেখাকে মজাদার করো। প্রতিটি সমস্যা সমাধানে পুরস্কার পাও।' },
  { icon: Bot, title: 'AI সহায়তা', desc: 'আটকে গেলে AI সহকারী সঙ্গে সঙ্গে পরামর্শ দেবে। ভুল ব্যাখ্যা করবে বাংলায়, নিজের মতো করে পথ দেখাবে।' },
  { icon: Smartphone, title: 'সব ডিভাইসে সমর্থন', desc: 'মোবাইল, ট্যাবলেট ও ডেস্কটপ — সব ডিভাইসে সমানভাবে কাজ করে। যেকোনো জায়গা থেকে শেখার সুযোগ।' },
]

/* ── Curriculum levels (labels only; unlock state comes from the LMS) ── */
const CURRICULUM: { key: LearningLevel; step: string; title: string; desc: string }[] = [
  { key: 'beginner',     step: '০১', title: 'ধাপ ১ — শিক্ষানবিশ',  desc: 'যুক্তিভিত্তিক চিন্তা শেখো। কোনো কোড না লিখেই ধাঁধা ও ধারাক্রম সমাধান করো!' },
  { key: 'intermediate', step: '০২', title: 'ধাপ ২ — মধ্যবর্তী',    desc: 'টেনে-এনে বসানো ব্লক দিয়ে লুপ ও শর্ত বোঝো। কোডের গঠন সহজে আয়ত্ত করো।' },
  { key: 'advanced',     step: '০৩', title: 'ধাপ ৩ — উন্নত (Python)', desc: 'AI সহায়তায় সত্যিকারের Python কোড লেখো। সত্যিকারের প্রোগ্রামার হয়ে ওঠো!' },
]

const LEVEL_BN: Record<LearningLevel, string> = {
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মধ্যবর্তী',
  advanced: 'উন্নত',
}

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Public platform statistics (existing /api/stats — all values are real).
  const [stats, setStats] = useState<{
    students: number
    totalClasses: number
    totalLessons: number
    learningStages: number
    successRate: number
    successRateAvailable: boolean
  } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Reuse the SAME progression hook the LMS uses. classesByLevel is intentionally
  // empty here: level lock/unlock (isLevelUnlocked) depends only on completedLevels,
  // so the Home Page mirrors the exact LMS unlock rule without importing course data
  // or altering any progression logic.
  const emptyClassesByLevel = { beginner: [], intermediate: [], advanced: [] } as Record<LearningLevel, { id: string }[]>
  const { isLevelUnlocked, completedLevels } = useCourseProgress(emptyClassesByLevel)

  const fetchStats = useCallback(() => {
    setStatsLoading(true)
    axios.get<{
      students: number
      totalClasses: number
      totalLessons: number
      learningStages: number
      successRate: number
      successRateAvailable: boolean
    }>(`${API_BASE_URL}/stats`)
      .then(res => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false))
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats, user])

  // Continue Learning: when logged in, resume to the canonical lesson the
  // backend computed (persisted in MongoDB — never localStorage).
  const [continueUrl, setContinueUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!user) { setContinueUrl(null); return }
    let cancelled = false
    axios.get<{ continueLearning?: { continueUrl: string; title: string | null } }>(`${API_BASE_URL}/progression`)
      .then(res => { if (!cancelled && res.data?.continueLearning?.continueUrl) setContinueUrl(res.data.continueLearning.continueUrl) })
      .catch(() => { if (!cancelled) setContinueUrl(null) })
    return () => { cancelled = true }
  }, [user])

  const handleCurriculumClick = (item: typeof CURRICULUM[number]) => {
    if (!user) {
      navigate('/signup')
      return
    }
    navigate('/courses')
  }

  return (
    <div className="space-y-20 pb-20">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="pt-4 lg:pt-10">
        <div className="rounded-3xl p-8 lg:p-16 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-hero-bg)' }}>
          {/* soft glow blob */}
          <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(8,80,65,0.06) 0%, transparent 70%)', transform: 'translate(25%, -25%)' }} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left */}
            <div className="space-y-8 animate-fade-up">
              <div className="space-y-3">
                <h1 className="text-5xl lg:text-6xl font-black leading-tight" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>
                  কোডিং শেখো,<br />
                  <span style={{ color: 'var(--color-accent)' }}>
                    <Typewriter text="স্বপ্ন গড়ো" delay={180} />
                  </span>
                </h1>
              </div>

              <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--color-home-text-body)', fontFamily: BN }}>
                আলোকবর্তিকা — বাংলাদেশের প্রথম বাংলা মাধ্যম Python শিক্ষা প্ল্যাটফর্ম।
                ৬ষ্ঠ থেকে ৮ম শ্রেণীর শিক্ষার্থীদের জন্য, সম্পূর্ণ বিনামূল্যে।
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'var(--color-home-gold)', color: 'var(--color-home-gold-text)', boxShadow: '0 4px 14px rgba(244,197,58,0.30)', fontFamily: BN }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold-hover)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold)' }}>
                  {user ? 'শেখা চালিয়ে যান' : 'শেখা শুরু করুন'} <ArrowRight size={18} />
                </Link>
                <Link to="/about"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold transition-all duration-200"
                  style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)', backgroundColor: 'var(--color-white)', fontFamily: BN }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-surface)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-white)' }}>
                  আরও জানুন
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {['সম্পূর্ণ বিনামূল্যে', 'বাংলায় শেখা', 'AI সাহায্য'].map(badge => (
                  <div key={badge} className="flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: 'var(--color-accent)', fontFamily: BN }}>
                    <CheckCircle size={15} /> {badge}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — IDE mockup */}
            <div className="relative group">
              <div className="rounded-3xl p-6 transition-all duration-700 group-hover:-translate-y-2"
                style={{ backgroundColor: 'var(--color-home-surface)', border: '1.5px solid var(--color-home-border)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(14,124,102,0.09), 0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: 'var(--color-home-cta-soft)', border: '1px solid var(--color-home-border)' }}>🐍</div>
                  <div>
                    <h3 className="font-black" style={{ color: 'var(--color-home-text-body)' }}>Python IDE</h3>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)', fontFamily: BN }}>ধাপ ৩ — লুপ</p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    {['var(--color-error)','var(--color-home-gold)','var(--color-accent)'].map(c => (
                      <div key={c} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                {/* Code */}
                <div className="rounded-2xl p-5 font-mono text-sm mb-4"
                  style={{ backgroundColor: 'var(--color-home-code-bg)', color: 'var(--color-home-code-text)' }}>
                  <div className="mb-1 opacity-50 text-xs" style={{ color: 'var(--color-home-code-comment)', fontFamily: BN }}># ১ থেকে ৫ প্রিন্ট করে</div>
                  <div className="mb-1"></div>
                  <div className="mb-1">
                    <span style={{ color: '#C084FC', fontWeight: 700 }}>for</span>
                    <span style={{ color: '#F4FBF8' }}> i </span>
                    <span style={{ color: '#C084FC', fontWeight: 700 }}>in</span>
                    <span style={{ color: '#65D1B2' }}> range</span>
                    <span style={{ color: '#F4FBF8' }}>(1, 6):</span>
                  </div>
                  <div className="pl-6">
                    <span style={{ color: '#C084FC' }}>print</span>
                    <span style={{ color: '#F4FBF8' }}>(i)</span>
                  </div>
                </div>
                {/* Output */}
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-home-surface)', border: '1px solid var(--color-home-border)' }}>
                  <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent)', fontFamily: BN }}>আউটপুট</p>
                  <p className="font-mono font-bold" style={{ color: 'var(--color-home-text-body)' }}>১  ২  ৩  ৪  ৫</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar (real platform statistics only) ──────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: statsLoading || !stats ? '—' : toBn(stats.students), label: 'মোট শিক্ষার্থী' },
            { value: statsLoading || !stats ? '—' : toBn(stats.totalLessons), label: 'মোট পাঠ' },
            { value: statsLoading || !stats ? '—' : toBn(stats.learningStages), label: 'শেখার ধাপ' },
            { value: statsLoading || !stats ? '—' : (stats.successRateAvailable ? toBn(stats.successRate) + '%' : '—'), label: 'সফলতার হার' },
          ].map((s, i) => (
            <div key={i}
              className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'var(--color-home-surface)', borderRadius: '20px', boxShadow: '0 2px 12px rgba(14,124,102,0.08), 0 1px 4px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(14,124,102,0.14), 0 2px 8px rgba(0,0,0,0.05)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(14,124,102,0.08), 0 1px 4px rgba(0,0,0,0.03)' }}
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-1" style={{ color: 'var(--color-accent)', fontFamily: BN }}>{s.value}</h2>
              <p className="text-sm font-bold" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest"
            style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)', border: '1px solid var(--color-home-warm-badge-border)', fontFamily: BN }}>
            মূল বৈশিষ্ট্য
          </span>
          <h2 className="text-4xl font-black" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>
            প্ল্যাটফর্মে কী <span style={{ color: 'var(--color-accent)' }}>পাবে?</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl p-7 transition-all duration-300"
              style={{ backgroundColor: 'var(--color-home-card-bg)', border: '1.5px solid var(--color-home-card-border)', borderRadius: '20px', boxShadow: '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(14,124,102,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-home-card-border)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--color-home-cta-soft)', color: 'var(--color-accent)', border: '1.5px solid var(--color-home-border)', boxShadow: '0 2px 8px rgba(14,124,102,0.10)' }}>
                <f.icon size={24} style={{ color: i % 2 === 0 ? 'var(--color-accent)' : 'var(--color-home-gold)' }} />
              </div>
              <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-home-text-body)', fontFamily: BN }}>{f.title}</h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-home-text-muted)', fontFamily: BN }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Curriculum (dynamic lock/unlock from the LMS) ──────────────── */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest"
            style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)', border: '1px solid var(--color-home-warm-badge-border)', fontFamily: BN }}>
            পাঠক্রম
          </span>
          <h2 className="text-4xl font-black" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>
            তিনটি <span style={{ color: 'var(--color-accent)' }}>ধাপে শেখো</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--color-home-text-muted)', fontFamily: BN }}>
            একদম শূন্য থেকে Python পর্যন্ত — একটি সাজানো পথনির্দেশ যা তোমাকে ধীরে ধীরে এগিয়ে নিয়ে যাবে।
          </p>
        </div>
        <div className="space-y-6">
          {CURRICULUM.map((item, i) => {
            // Authenticated users use the EXISTING LMS progress logic untouched.
            // Guests must see the neutral public landing state (every step
            // "শুরু করুন") and never any lock/completion status.
            const isGuest = !user
            const unlocked = isGuest ? true : isLevelUnlocked(item.key)
            const completed = isGuest ? false : completedLevels.includes(item.key)
            const isLast = i === CURRICULUM.length - 1
            return (
              <div key={item.key}>
                <div
                  onClick={() => unlocked && handleCurriculumClick(item)}
                  className={`flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] transition-all duration-300 shadow-sm group ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  style={{
                    backgroundColor: 'var(--color-home-card-bg)',
                    border: !unlocked ? '1.5px solid var(--color-home-stage-locked-border)' : '1.5px solid var(--color-home-card-border)',
                    borderRadius: '20px',
                    opacity: unlocked ? 1 : 0.7,
                    boxShadow: !unlocked ? '0 2px 12px rgba(184,168,118,0.08)' : '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={e => { if (unlocked) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 44px rgba(14,124,102,0.14)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.01)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = !unlocked ? 'var(--color-home-stage-locked-border)' : 'var(--color-home-card-border)'; (e.currentTarget as HTMLElement).style.boxShadow = !unlocked ? '0 2px 12px rgba(184,168,118,0.08)' : '0 2px 12px rgba(14,124,102,0.06), 0 1px 4px rgba(0,0,0,0.03)'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: 'var(--color-home-card-bg)', color: 'var(--color-home-accent-dark)', border: '1.5px solid var(--color-home-card-border)', boxShadow: '0 2px 8px rgba(14,124,102,0.10)', fontFamily: BN }}>
                    {item.step}
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>{item.title}</h3>
                    <p className="text-base leading-relaxed mb-4 md:mb-0" style={{ color: 'var(--color-home-text-muted)', fontFamily: BN }}>{item.desc}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <span className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor: 'var(--color-home-card-bg)', color: 'var(--color-accent)', border: '1px solid var(--color-home-card-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', fontFamily: BN }}>
                      {LEVEL_BN[item.key]}
                    </span>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{ backgroundColor: 'var(--color-home-cta-bg)', color: 'var(--color-home-cta-text)', fontFamily: BN }}>
                      {isGuest
                        ? (<>শুরু করুন <ArrowRight size={16} /></>)
                        : !unlocked
                          ? (<><Lock size={16} /> লক করা</>)
                          : completed
                            ? (<>সম্পন্ন <CheckCircle size={16} /></>)
                            : (<>চালিয়ে যান <ArrowRight size={16} /></>)}
                    </span>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex justify-center py-2" aria-hidden>
                    <ArrowDown size={22} style={{ color: 'var(--color-home-text-muted)' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section>
        <div className="rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-cta-bg)', boxShadow: '0 12px 40px rgba(14,124,102,0.25)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(253,248,241,0.10) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(253,248,241,0.06) 0%, transparent 70%)', transform: 'translate(-30%,30%)' }} />
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: 'var(--color-home-cta-text)', fontFamily: BN }}>
                আজই শুরু করো তোমার<br />
                <span style={{ color: 'var(--color-home-cta-soft)' }}>কোডিং যাত্রা!</span>
              </h2>
              <p className="text-lg lg:text-xl font-medium max-w-2xl mx-auto" style={{ color: 'var(--color-home-cta-soft)', fontFamily: BN }}>
                বিনামূল্যে রেজিস্ট্রেশন করো — কোনো ক্রেডিট কার্ড লাগবে না।
              </p>
            </div>
            <Link to={!user ? '/signup' : (continueUrl || '/courses')}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-xl font-black transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: 'var(--color-home-gold)', color: 'var(--color-home-gold-text)', boxShadow: '0 4px 20px rgba(244,197,58,0.35)', fontFamily: BN }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold-hover)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold)' }}>
              {!user ? 'বিনামূল্যে শুরু করুন' : (continueUrl ? 'শেখা চালিয়ে যান' : 'কোর্সসমূহ দেখুন')} <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── আমাদের সম্পর্কে ──────────────────────────────────────────────── */}
      <section>
        <div className="rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-card-bg)', border: '1.5px solid var(--color-home-card-border)', boxShadow: '0 8px 32px rgba(14,124,102,0.08)' }}>
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <span className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest"
              style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)', border: '1px solid var(--color-home-warm-badge-border)', fontFamily: BN }}>
              আমাদের সম্পর্কে
            </span>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}>
              বাংলাদেশের শিশুদের জন্য<br />
              <span style={{ color: 'var(--color-accent)' }}>প্রোগ্রামিং শেখার আলো</span>
            </h2>
            <p className="text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-home-text-body)', fontFamily: BN }}>
              আলোকবর্তিকা — ৬ষ্ঠ থেকে ৮ম শ্রেণীর শিক্ষার্থীদের জন্য বাংলা ভাষায় ইন্টারঅ্যাকটিভ কোডিং প্ল্যাটফর্ম।
            </p>
            <Link to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-black transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)', backgroundColor: 'var(--color-white)', fontFamily: BN }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-surface)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-white)' }}>
              আরও জানুন <ArrowDown size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
