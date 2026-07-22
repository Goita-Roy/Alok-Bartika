import { useMemo, useState } from 'react'
import { Award, Lock, Sparkles, Shield, Rocket, Crown, Lightbulb, Bug, Star, Zap, Target, BookOpen, CheckCircle, TrendingUp } from 'lucide-react'
import { getDashboardIcon } from '../components/dashboard/icons'
import type { BadgeItem } from '../data/dashboardData'

// Convert English digits to Bengali digits (display only)
function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

// Bengali display names for badges (keyed by the DB/English badge name — keys untouched)
const BADGE_NAME_BN: Record<string, string> = {
  'First Solve': 'প্রথম সমাধান',
  'Bug Hunter': 'বাগ শিকারি',
  'Fast Learner': 'দ্রুত শিক্ষার্থী',
  'Logic Master': 'লজিক মাস্টার',
  'Code Ninja': 'কোড নিনজা',
  'Top Ranker': 'শীর্ষ র‍্যাঙ্কার',
  'Perfect Score': 'নিখুঁত স্কোর',
  'Project Master': 'প্রজেক্ট মাস্টার',
  'Consistent Learner': 'নিয়মিত শিক্ষার্থী',
  '1000 Points Club': '১০০০ পয়েন্ট ক্লাব',
  'Streak Master': 'স্ট্রিক মাস্টার',
  'Helping Hand': 'সহায়ক হাত',
  'Debugging Pro': 'ডিবাগিং প্রো',
  'Speed Demon': 'গতিদানব',
  'First Exam': 'প্রথম পরীক্ষা',
}

// Bengali category labels (display only)
const CATEGORY_BN: Record<string, string> = {
  Milestone: 'মাইলফলক',
  Skill: 'দক্ষতা',
  Speed: 'গতি',
  Competition: 'প্রতিযোগিতা',
  Achievement: 'অর্জন',
  Habit: 'অভ্যাস',
  Social: 'সামাজিক',
  Other: 'অন্যান্য',
}

const BADGE_META: Record<string, { description: string; category: string; color: string; bgColor: string }> = {
  'First Solve':        { description: 'আপনার প্রথম কোডিং সমস্যা সমাধান করুন',            category: 'Milestone', color: '#059669', bgColor: '#D1FAE5' },
  'Bug Hunter':         { description: 'আপনার কোডে ৫টি বাগ খুঁজে ঠিক করুন',           category: 'Skill',    color: '#DC2626', bgColor: '#FEE2E2' },
  'Fast Learner':       { description: 'এক দিনে ১০টি পাঠ সম্পন্ন করুন',        category: 'Speed',    color: '#D97706', bgColor: '#FEF3C7' },
  'Logic Master':       { description: '২০টি লজিক ধাঁধা সঠিকভাবে সমাধান করুন',           category: 'Skill',    color: '#7C3AED', bgColor: '#EDE9FE' },
  'Code Ninja':         { description: '১০০০ লাইন পরিচ্ছন্ন কোড লিখুন',              category: 'Milestone', color: '#0891B2', bgColor: '#CFFAFE' },
  'Top Ranker':         { description: 'সাপ্তাহিক লিডারবোর্ডে ১ নম্বরে পৌঁছান',          category: 'Competition', color: '#F59E0B', bgColor: '#FEF3C7' },
  'Perfect Score':      { description: 'যেকোনো পরীক্ষায় ১০০% স্কোর করুন',                      category: 'Achievement', color: '#16A34A', bgColor: '#DCFCE7' },
  'Project Master':     { description: '৫টি সম্পূর্ণ প্রজেক্ট জমা দিন',                  category: 'Milestone', color: '#6366F1', bgColor: '#EEF2FF' },
  'Consistent Learner': { description: 'টানা ৭ দিন লগইন করুন',               category: 'Habit',   color: '#0891B2', bgColor: '#CFFAFE' },
  '1000 Points Club':   { description: 'মোট ১০০০ XP অর্জন করুন',                     category: 'Milestone', color: '#F59E0B', bgColor: '#FEF3C7' },
  'Streak Master':      { description: '৩০ দিনের শেখার স্ট্রিক বজায় রাখুন',           category: 'Habit',   color: '#EA580C', bgColor: '#FFEDD5' },
  'Helping Hand':       { description: '৩ জন সহপাঠীকে সমস্যা সমাধানে সাহায্য করুন',           category: 'Social',  color: '#059669', bgColor: '#D1FAE5' },
  'Debugging Pro':      { description: 'হিন্ট ছাড়াই ২০টি ত্রুটি ঠিক করুন',                 category: 'Skill',    color: '#9333EA', bgColor: '#F3E8FF' },
  'Speed Demon':        { description: '২ মিনিটের কম সময়ে একটি কুইজ সম্পন্ন করুন',          category: 'Speed',    color: '#DB2777', bgColor: '#FCE7F3' },
  'First Exam':         { description: 'আপনার প্রথম পরীক্ষা সম্পন্ন করুন',                    category: 'Milestone', color: '#059669', bgColor: '#D1FAE5' },
}

const BADGE_DATES: Record<string, string> = {
  'First Solve': '2026-01-15', 'Bug Hunter': '2026-02-03', 'Fast Learner': '2026-02-20',
  'Logic Master': '2026-03-10', 'Perfect Score': '2026-03-22', 'Project Master': '2026-04-05',
  'Consistent Learner': '2026-04-18', '1000 Points Club': '2026-05-01', 'First Exam': '2026-01-20',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return `${toBnDigits(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBnDigits(d.getFullYear())}`
}

function BadgeCard({ badge, meta, earnedDate, earned }: { badge: BadgeItem; meta: typeof BADGE_META[string]; earnedDate?: string; earned: boolean }) {
  const Icon = getDashboardIcon(badge.icon)
  const catColor = meta.color

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 group"
      style={{
        backgroundColor: earned ? '#FFFFFF' : '#EAF5EE',
        border: `1.5px solid ${earned ? catColor + '50' : '#B7D9C1'}`,
        opacity: earned ? 1 : 0.55,
        borderRadius: '18px',
        boxShadow: earned ? '0 8px 24px rgba(6, 95, 70, 0.10)' : 'none',
      }}
      onMouseEnter={e => {
        if (earned) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px rgba(6, 95, 70, 0.18)`
          ;(e.currentTarget as HTMLElement).style.borderColor = catColor
        }
      }}
      onMouseLeave={e => {
        if (earned) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(6, 95, 70, 0.10)'
          ;(e.currentTarget as HTMLElement).style.borderColor = catColor + '50'
        }
      }}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: earned ? catColor + '15' : '#CDE8D4',
            color: earned ? catColor : '#4B5563',
            borderRadius: '16px',
          }}>
          {earned ? <Icon size={24} /> : <Lock size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold" style={{
              color: earned ? '#1F2937' : '#4B5563',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }}>{BADGE_NAME_BN[badge.name] || badge.name}</h4>
            {earned && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + '20', color: catColor }}>
                {CATEGORY_BN[meta.category] || meta.category}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#4B5563' }}>{meta.description}</p>
          {earned && earnedDate && (
            <p className="text-[11px] font-medium mt-2 flex items-center gap-1" style={{ color: catColor }}>
              <CheckCircle size={11} /> {formatDate(earnedDate)} তারিখে অর্জিত
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ earned, total }: { earned: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0
  const gradId = 'progressGradient'
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl" style={{
      backgroundColor: '#EAF5EE',
      border: '1.5px solid #B7D9C1',
      borderRadius: '18px',
    }}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F766E" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
          </defs>
          <circle cx="28" cy="28" r="24" fill="none" stroke="#CDE8D4" strokeWidth="4" />
          <circle cx="28" cy="28" r="24" fill="none" stroke={`url(#${gradId})`} strokeWidth="4" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <span className="absolute text-sm font-black" style={{ color: '#065F46' }}>{toBnDigits(pct)}%</span>
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: '#1F2937' }}>সামগ্রিক অগ্রগতি</p>
        <p className="text-xs mt-0.5" style={{ color: '#4B5563' }}>{toBnDigits(total)} টির মধ্যে {toBnDigits(earned)} টি ব্যাজ অর্জিত</p>
      </div>
    </div>
  )
}

export function BadgesPage({ badges }: { badges: BadgeItem[] }) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

  const { earned, locked, totalBadges, categories } = useMemo(() => {
    const earnedBadges = badges.filter(b => b.earned)
    const lockedBadges = badges.filter(b => !b.earned)
    const cats = [...new Set(earnedBadges.map(b => (BADGE_META[b.name]?.category || 'Other')))]
    return { earned: earnedBadges, locked: lockedBadges, totalBadges: badges.length, categories: cats }
  }, [badges])

  const filtered = filter === 'all' ? badges : filter === 'earned' ? earned : locked

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0F766E, #065F46)' }}>
          <Award size={20} color="#fff" />
        </div>
        <div>
          <h2 className="font-bold" style={{
            color: '#1F2937',
            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
          }}>ব্যাজ ও অর্জন</h2>
          <p className="text-sm" style={{ color: '#4B5563' }}>আপনার অর্জনসমূহ ট্র্যাক করুন</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'মোট ব্যাজ', value: totalBadges },
          { label: 'অর্জিত', value: earned.length },
          { label: 'লকড', value: locked.length },
          { label: 'ক্যাটাগরি', value: categories.length },
        ].map(s => (
          <div key={s.label}
            className="p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #0F766E 0%, #065F46 100%)',
              borderRadius: '18px',
              boxShadow: '0 8px 24px rgba(6, 95, 70, 0.12)',
            }}>
            <p className="text-2xl font-black text-white">{toBnDigits(s.value)}</p>
            <p className="text-xs font-semibold mt-1 text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress ring */}
      <ProgressRing earned={earned.length} total={totalBadges} />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'earned', 'locked'] as const).map(opt => (
          <button key={opt}
            onClick={() => setFilter(opt)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 capitalize"
            style={{
              backgroundColor: filter === opt ? '#065F46' : '#E6F4EA',
              color: filter === opt ? '#FFFFFF' : '#065F46',
              border: `1.5px solid ${filter === opt ? '#065F46' : '#B7D9C1'}`,
              borderRadius: '12px',
            }}>
            {opt === 'all' ? 'সব ব্যাজ' : opt === 'earned' ? 'অর্জিত' : 'লকড'}
            <span className="ml-1.5 text-[10px] opacity-80">({toBnDigits(opt === 'all' ? badges.length : opt === 'earned' ? earned.length : locked.length)})</span>
          </button>
        ))}
      </div>

      {/* Badge grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Award size={48} style={{ color: '#4B5563' }} />
          <p className="mt-4 text-sm font-semibold" style={{ color: '#4B5563' }}>এখনও দেখানোর মতো কোনো ব্যাজ নেই</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(badge => {
            const meta = BADGE_META[badge.name] || { description: 'এই ব্যাজটি অর্জনের শর্তগুলো পূরণ করুন', category: 'Other', color: '#059669', bgColor: '#EAF5EE' }
            return <BadgeCard key={badge.id} badge={badge} meta={meta} earnedDate={BADGE_DATES[badge.name]} earned={badge.earned} />
          })}
        </div>
      )}
    </div>
  )
}
