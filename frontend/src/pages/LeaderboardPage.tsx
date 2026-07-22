import { useState, useMemo } from 'react'
import {
  Crown, Medal, Search, Trophy, GraduationCap, Briefcase, Star, Bell,
  RefreshCw, X, ChevronLeft, ChevronRight, Clock, Calendar,
  FileText, Award, BarChart3, School,
} from 'lucide-react'
import { useLeaderboardData, type LeaderboardEntry } from '../hooks/useLeaderboardData'
import { useAuth } from '../context/AuthContext'

/* ---------- helpers ---------- */

const SKILL_COLORS: Record<string, string> = {
  beginner: '#059669', intermediate: '#D97706', advanced: '#7C3AED',
}
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const

// Convert English digits to Bengali digits (display only)
function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

// Bengali label for the filter level chips (display only; enum keys untouched)
const LEVEL_FILTER_BN: Record<string, string> = {
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মধ্যবর্তী',
  advanced: 'উন্নত',
}

// The displayed level is the HIGHEST COMPLETED level only, provided by the
// backend (`highestCompletedLevel`) using the existing LMS completion logic
// (Final Exam / completedLevels). It is NOT derived from the current lesson,
// current page, active tab, current course, or the numeric XP level.
function getLevelColor(e: LeaderboardEntry): string {
  const lvl = (e.highestCompletedLevel || '').toLowerCase()
  if (lvl in SKILL_COLORS) return SKILL_COLORS[lvl as keyof typeof SKILL_COLORS]
  return SKILL_COLORS.beginner
}

function getLevelLabel(e: LeaderboardEntry): string {
  const lvl = (e.highestCompletedLevel || '').toLowerCase()
  if (lvl === 'advanced') return 'উন্নত (সম্পন্ন)'
  if (lvl === 'intermediate') return 'মধ্যবর্তী'
  return 'শিক্ষানবিশ'
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 60000) return 'এইমাত্র'
  if (diff < 3600000) return `${toBnDigits(Math.floor(diff / 60000))} মিনিট আগে`
  if (diff < 86400000) return `${toBnDigits(Math.floor(diff / 3600000))} ঘণ্টা আগে`
  if (diff < 604800000) return `${toBnDigits(Math.floor(diff / 86400000))} দিন আগে`
  const d = new Date(dateStr)
  return `${toBnDigits(d.getDate())} ${BN_MONTHS[d.getMonth()]}`
}

/* ---------- sub-components ---------- */

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #FDE68A, #FBBF24)', boxShadow: '0 2px 12px rgba(251,191,36,0.35)' }}><Crown size={18} color="#7C2D12" /></div>
  if (rank === 2) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #E5E7EB, #CBD5E1)', boxShadow: '0 2px 12px rgba(203,213,225,0.35)' }}><Medal size={18} color="#475569" /></div>
  if (rank === 3) return <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #FB7185, #E11D48)', boxShadow: '0 2px 12px rgba(225,29,72,0.35)' }}><Medal size={18} color="#FFF" /></div>
  return <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black" style={{ color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>#{toBnDigits(rank)}</div>
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
    </div>
  )
}

function AvatarBlock({ src, name, size = 36 }: { src: string; name: string; size?: number }) {
  const r = `${size}px`
  return (
    <div className="rounded-full flex items-center justify-center font-black shrink-0 overflow-hidden"
      style={{ width: r, height: r, fontSize: Math.max(10, size * 0.35), backgroundColor: src ? 'transparent' : 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(6,95,70,0.18)' }}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
    </div>
  )
}

/* ---------- skeleton ---------- */

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-5 rounded-md" style={{ backgroundColor: 'var(--color-border)', width: i === 1 ? '140px' : i === 8 ? '100px' : '60px', animation: 'shimmer 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="space-y-1.5">
          <div className="h-5 w-40 rounded-md" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="h-3.5 w-28 rounded-md" style={{ backgroundColor: 'var(--color-border)' }} />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-xl" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-xl" style={{ backgroundColor: 'var(--color-border)' }} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--color-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {Array.from({ length: 9 }).map((_, i) => (
                <th key={i} className="px-4 py-3.5"><div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--color-border)' }} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }`}</style>
    </div>
  )
}

/* ---------- empty state ---------- */

function EmptyState() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
          <Trophy size={36} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>এখনও কোনো লিডারবোর্ড ডেটা নেই</h3>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          লিডারবোর্ডে আসতে কোর্স ও পরীক্ষা সম্পন্ন করুন। অন্য শিক্ষার্থীরা শেখা শুরু করলে আবার দেখুন!
        </p>
      </div>
    </div>
  )
}

/* ---------- filter button ---------- */

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap"
      style={{
        background: active ? 'linear-gradient(135deg, #0F766E, #065F46)' : '#fff',
        color: active ? '#fff' : '#065F46',
        border: `1.5px solid ${active ? 'transparent' : '#D1FAE5'}`,
      }}>
      {children}
    </button>
  )
}

/* ---------- student detail modal ---------- */

function StudentModal({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
  const lColor = getLevelColor(entry)
  const lLabel = getLevelLabel(entry)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8 space-y-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}>
        {/* close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <X size={18} />
        </button>

        {/* --- header --- */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black overflow-hidden shrink-0"
            style={{ backgroundColor: entry.avatar ? 'transparent' : 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(6,95,70,0.18)' }}>
            {entry.avatar ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" /> : entry.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold truncate" style={{ color: 'var(--color-text)' }}>{entry.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ backgroundColor: `${lColor}18`, color: lColor }}>{lLabel}</span>
              {entry.school && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><School size={12} />{entry.school}</span>}
              {entry.isCurrentUser && <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>আপনি</span>}
            </div>
          </div>
        </div>

        {/* --- stats grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'স্কোর', value: toBnDigits(entry.xp.toLocaleString('en-US')), color: 'var(--color-accent)' },
            { icon: <FileText size={16} />, label: 'পরীক্ষার স্কোর', value: `${toBnDigits(entry.examMarks)}/${toBnDigits(100)}`, color: '#6366F1' },
            { icon: <Award size={16} />, label: 'ব্যাজ', value: toBnDigits(entry.badgesCount), color: '#D97706' },
            { icon: <BarChart3 size={16} />, label: 'অগ্রগতি', value: `${toBnDigits(entry.progressPercentage)}%`, color: '#EC4899' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center transition-all" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* --- completed exams --- */}
        <section>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text)' }}>
            <FileText size={15} style={{ color: 'var(--color-accent)' }} /> সম্পন্ন পরীক্ষা ({toBnDigits(entry.completedExamsCount)})
          </h4>
          {entry.exams.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>এখনও কোনো পরীক্ষা সম্পন্ন হয়নি</p>
          ) : (
            <div className="space-y-2">
              {entry.exams.map(ex => (
                <div key={ex.id} className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ex.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${SKILL_COLORS[ex.level] || '#94A3B8'}18`, color: SKILL_COLORS[ex.level] || '#94A3B8' }}>{LEVEL_FILTER_BN[ex.level] || ex.level}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- projects --- */}
        <section>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text)' }}>
            <Briefcase size={15} style={{ color: 'var(--color-accent)' }} /> জমা দেওয়া প্রজেক্ট ({toBnDigits(entry.projectsSubmitted)})
          </h4>
          {entry.projects.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>এখনও কোনো প্রজেক্ট জমা দেওয়া হয়নি</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {entry.projects.map(p => (
                <span key={p.id} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-light)' }}>
                  {p.title}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* --- badges --- */}
        <section>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text)' }}>
            <Award size={15} style={{ color: '#D97706' }} /> অর্জিত ব্যাজ ({toBnDigits(entry.badgesCount)})
          </h4>
          {entry.badges.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>এখনও কোনো ব্যাজ অর্জিত হয়নি</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {entry.badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  <span className="text-lg">{b.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{b.name}</p>
                    {b.awardedAt && <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{(() => { const d = new Date(b.awardedAt as string); return Number.isNaN(d.getTime()) ? '' : `${toBnDigits(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBnDigits(d.getFullYear())}` })()}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- progress --- */}
        <section>
          <h4 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--color-text)' }}>
            <BarChart3 size={15} style={{ color: '#EC4899' }} /> অগ্রগতি বিশ্লেষণ
          </h4>
          <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--color-text-muted)' }}>সামগ্রিক অগ্রগতি</span>
                <span className="font-bold" style={{ color: lColor }}>{toBnDigits(entry.progressPercentage)}%</span>
              </div>
              <ProgressBar value={entry.progressPercentage} color={lColor} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'কোর্স', value: entry.completedCourses },
                { label: 'পরীক্ষা', value: entry.completedExamsCount },
                { label: 'প্রজেক্ট', value: entry.projectsSubmitted },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-lg font-black" style={{ color: 'var(--color-text)' }}>{toBnDigits(s.value)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- last active --- */}
        <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <Calendar size={13} />
          সর্বশেষ সক্রিয় {timeAgo(entry.lastActiveAt)}
        </div>
      </div>
    </div>
  )
}

/* ---------- main page ---------- */

const ROWS_PER_PAGE = 10

type FilterKey = 'all' | 'school' | 'highestScore' | 'mostProjects'

const SORT_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'সব' },
  { key: 'school', label: 'স্কুল/কলেজ' },
  { key: 'highestScore', label: 'সর্বোচ্চ স্কোর' },
  { key: 'mostProjects', label: 'সর্বাধিক প্রজেক্ট' },
]

export function LeaderboardPage() {
  const { data: leaderboard, totalCount, isLoading, refetch } = useLeaderboardData()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [schoolFilter, setSchoolFilter] = useState<string>('all')
  const [badgeFilter, setBadgeFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<FilterKey>('all')
  const [page, setPage] = useState(0)
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)

  /* --- derived filter options --- */
  const schoolOptions = useMemo(() => {
    const set = new Set(leaderboard.map(s => s.school).filter(Boolean))
    return Array.from(set).sort()
  }, [leaderboard])

  const badgeOptions = useMemo(() => {
    const set = new Set<string>()
    leaderboard.forEach(s => s.badges.forEach(b => set.add(b.name)))
    return Array.from(set).sort()
  }, [leaderboard])

  /* --- filtering + sort + pagination --- */
  const filtered = useMemo(() => {
    let entries = leaderboard

    if (search.trim()) {
      const q = search.toLowerCase()
      entries = entries.filter(s =>
        s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q)
      )
    }

    if (levelFilter !== 'all') {
      entries = entries.filter(s => ((s.highestCompletedLevel || 'beginner').toLowerCase()) === levelFilter)
    }

    if (schoolFilter !== 'all') {
      entries = entries.filter(s => s.school === schoolFilter)
    }

    if (badgeFilter !== 'all') {
      entries = entries.filter(s => s.badges.some(b => b.name === badgeFilter))
    }

    switch (sortKey) {
      case 'school':
        entries = [...entries].sort((a, b) => a.school.localeCompare(b.school))
        break
      case 'highestScore':
        entries = [...entries].sort((a, b) => b.examMarks - a.examMarks)
        break
      case 'mostProjects':
        entries = [...entries].sort((a, b) => b.projectsSubmitted - a.projectsSubmitted)
        break
    }

    return entries
  }, [leaderboard, search, levelFilter, schoolFilter, badgeFilter, sortKey])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)
  const pageEntries = filtered.slice(safePage * ROWS_PER_PAGE, (safePage + 1) * ROWS_PER_PAGE)

  /* --- reset page on filter change --- */
  const prevFilterKey = useMemo(() => ({}), [])
  // simpler: just recalc
  useMemo(() => {
    if (safePage >= totalPages) setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  /* --- current user profile for greeting --- */
  const profileEntry = useMemo(() => leaderboard.find(e => e.isCurrentUser), [leaderboard])
  const profileName = profileEntry?.name || user?.fullName || 'Student'
  const profileAvatar = profileEntry?.avatar || ''

  /* --- loading --- */
  if (isLoading) return <LoadingSkeleton />

  /* --- empty --- */
  if (!leaderboard.length) return <EmptyState />

  return (
    <div className="space-y-6">
      {/* ---- modal ---- */}
      {selectedEntry && <StudentModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      {/* ---- hero header ---- */}
      <div className="relative overflow-hidden flex items-center justify-between flex-wrap gap-4"
        style={{
          borderRadius: '28px', padding: '32px',
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 45%, #0F766E 100%)',
          boxShadow: '0 20px 50px rgba(6,95,70,0.18)',
        }}>
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 right-12 w-40 h-40 rounded-full pointer-events-none opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', transform: 'translate(0, 40%)' }} />

        <div className="flex items-center gap-5">
          {/* profile picture - 80px */}
          <div className="w-20 h-20 rounded-full shrink-0 overflow-hidden" style={{ border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 24px rgba(6,95,70,0.18)' }}>
            {profileAvatar ? (
              <img src={profileAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white text-2xl" style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)' }}>
                {profileName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* greeting text */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">হ্যালো, {profileName} 👋</h2>
            {profileEntry && (
              <div className="flex items-center gap-5 mt-1.5">
                <span className="text-sm flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>⭐ {getLevelLabel(profileEntry)}</span>
                <span className="text-sm flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{toBnDigits(profileEntry.xp.toLocaleString('en-US'))} স্কোর</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            title="রিফ্রেশ করুন">
            <RefreshCw size={18} />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}>
            <Bell size={18} />
          </div>
        </div>
      </div>

      {/* ---- summary cards ---- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {[
          { icon: <Trophy size={24} />, label: 'মোট শিক্ষার্থী', value: toBnDigits(totalCount.toLocaleString('en-US')), color: '#065F46', bg: '#ECFDF5' },
          { icon: <Medal size={24} />, label: 'আপনার র‍্যাঙ্ক', value: profileEntry ? `#${toBnDigits(profileEntry.rank)}` : '—', color: '#D97706', bg: '#FFFBEB' },
          { icon: <Award size={24} />, label: 'অর্জিত ব্যাজ', value: profileEntry ? toBnDigits(profileEntry.badgesCount) : toBnDigits(0), color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'মোট স্কোর', value: profileEntry ? toBnDigits(profileEntry.xp.toLocaleString('en-US')) : toBnDigits(0), color: '#0F766E', bg: '#F0FDF4' },
        ].map(card => (
          <div key={card.label}
            className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 cursor-default"
            style={{ backgroundColor: '#fff', boxShadow: '0 4px 16px rgba(6,95,70,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: 'var(--color-text)' }}>{card.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---- search & filter card ---- */}
      <div className="rounded-2xl p-6 md:p-7 space-y-5" style={{ backgroundColor: '#fff', boxShadow: '0 12px 30px rgba(0,0,0,0.05)' }}>
        {/* search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="নাম বা প্রতিষ্ঠান দিয়ে খুঁজুন..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm transition-all"
              style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #D1FAE5', color: 'var(--color-text)' }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map(opt => (
              <FilterBtn key={opt.key} active={sortKey === opt.key} onClick={() => setSortKey(opt.key)}>
                {opt.label}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* filter chips */}
        <div className="flex flex-wrap items-center gap-3">
          {/* level */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>লেভেল:</span>
            <FilterBtn active={levelFilter === 'all'} onClick={() => { setLevelFilter('all'); setPage(0) }}>সব</FilterBtn>
            {SKILL_LEVELS.map(l => (
              <FilterBtn key={l} active={levelFilter === l} onClick={() => { setLevelFilter(l); setPage(0) }}>
                {LEVEL_FILTER_BN[l] || l}
              </FilterBtn>
            ))}
          </div>

          {/* school */}
          {schoolOptions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>স্কুল:</span>
              <select value={schoolFilter} onChange={e => { setSchoolFilter(e.target.value); setPage(0) }}
                className="text-xs rounded-xl px-2.5 py-2 outline-none"
                style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #D1FAE5', color: 'var(--color-text)' }}>
                <option value="all">সব স্কুল</option>
                {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* badge type */}
          {badgeOptions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>ব্যাজ:</span>
              <select value={badgeFilter} onChange={e => { setBadgeFilter(e.target.value); setPage(0) }}
                className="text-xs rounded-xl px-2.5 py-2 outline-none"
                style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #D1FAE5', color: 'var(--color-text)' }}>
                <option value="all">সব ব্যাজ</option>
                {badgeOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ---- top-3 podium ---- */}
      {filtered.length >= 3 && search === '' && levelFilter === 'all' && schoolFilter === 'all' && badgeFilter === 'all' && sortKey === 'all' && (
        <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
          {[1, 0, 2].map(idx => {
            const s = leaderboard[idx]
            if (!s) return null
            const isFirst = idx === 0; const isSecond = idx === 1; const isThird = idx === 2
            const cardStyle = isFirst
              ? { background: 'linear-gradient(135deg, #FFD700, #F59E0B)', border: '1.5px solid #EAB308', boxShadow: '0 8px 30px rgba(234,179,8,0.3), 0 0 50px rgba(255,215,0,0.1)', marginTop: 0, color: '#78350F' }
              : isSecond
              ? { background: 'linear-gradient(135deg, #E5E7EB, #CBD5E1)', border: '1.5px solid #94A3B8', boxShadow: '0 8px 30px rgba(148,163,184,0.25)', marginTop: '1.5rem', color: '#334155' }
              : { background: 'linear-gradient(135deg, #FB7185, #E11D48)', border: '1.5px solid #BE123C', boxShadow: '0 8px 30px rgba(225,29,72,0.25)', marginTop: '3rem', color: '#fff' }
            const badge = isFirst ? '🥇' : isSecond ? '🥈' : '🥉'
            return (
              <div key={s.id} onClick={() => setSelectedEntry(s)}
                className="rounded-2xl p-4 md:p-6 text-center transition-all duration-300 hover:-translate-y-[3px] cursor-pointer"
                style={cardStyle}>
                <div className="text-3xl mb-2">{badge}</div>
                <div className="flex justify-center mb-2">
                  <AvatarBlock src={s.avatar} name={s.name} size={56} />
                </div>
                <p className="text-sm font-bold truncate">{s.name}</p>
                <p className="text-xs mt-0.5 truncate opacity-70">
                  {getLevelLabel(s)}{s.school ? ` · ${s.school}` : ''}
                </p>
                <p className="text-lg font-black mt-2">{toBnDigits(s.xp.toLocaleString('en-US'))} স্কোর</p>
              </div>
            )
          })}
        </div>
      )}

      {/* ---- table ---- */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', border: '1.5px solid #D1FAE5', boxShadow: '0 12px 30px rgba(0,0,0,0.05)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #065F46, #0F766E)' }}>
                {['র‍্যাঙ্ক', 'শিক্ষার্থী', 'স্কুল/কলেজ', 'লেভেল', 'পরীক্ষার স্কোর', 'পরীক্ষা', 'প্রজেক্ট', 'ব্যাজ', 'অগ্রগতি', 'সর্বশেষ সক্রিয়'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageEntries.map(s => {
                const lColor = getLevelColor(s)
                const isTop3 = s.rank <= 3
                return (
                  <tr key={s.id} onClick={() => setSelectedEntry(s)}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      backgroundColor: s.isCurrentUser ? 'var(--color-accent-pale)' : '#fff',
                      borderBottom: '1px solid #D1FAE5',
                    }}
                    onMouseEnter={e => { if (!s.isCurrentUser) (e.currentTarget as HTMLElement).style.backgroundColor = '#F8FFFC' }}
                    onMouseLeave={e => { if (!s.isCurrentUser) (e.currentTarget as HTMLElement).style.backgroundColor = '#fff' }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {isTop3 && <span className="text-base">{s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : '🥉'}</span>}
                        <RankBadge rank={s.rank} />
                        {isTop3 && <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded-lg" style={{ background: s.rank === 1 ? 'linear-gradient(135deg, #FDE68A, #FBBF24)' : s.rank === 2 ? 'linear-gradient(135deg, #E5E7EB, #CBD5E1)' : 'linear-gradient(135deg, #FB7185, #E11D48)', color: s.rank === 1 ? '#7C2D12' : s.rank === 2 ? '#475569' : '#fff' }}>{s.rank === 1 ? 'স্বর্ণ' : s.rank === 2 ? 'রৌপ্য' : 'ব্রোঞ্জ'}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarBlock src={s.avatar} name={s.name} size={48} />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate max-w-[160px]" style={{ color: s.isCurrentUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                            {s.name} {s.isCurrentUser && <span className="text-[10px] font-bold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>আপনি</span>}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{getLevelLabel(s)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={14} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs truncate max-w-[120px]" style={{ color: s.school ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{s.school || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap" style={{ backgroundColor: `${lColor}18`, color: lColor }}>{getLevelLabel(s)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold" style={{ color: 'var(--color-text)' }}>{toBnDigits(s.examMarks)}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>/{toBnDigits(100)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{toBnDigits(s.completedExamsCount)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1">
                        <Briefcase size={13} className="shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{toBnDigits(s.projectsSubmitted)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1">
                        <Star size={13} className="shrink-0" style={{ color: 'var(--color-warn)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{toBnDigits(s.badgesCount)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.progressPercentage} color={lColor} />
                        <span className="text-xs font-semibold shrink-0 w-[36px] text-right" style={{ color: 'var(--color-text-muted)' }}>{toBnDigits(s.progressPercentage)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-xs whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={12} className="shrink-0" />
                        {timeAgo(s.lastActiveAt)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {pageEntries.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    বর্তমান ফিল্টারের সাথে কোনো শিক্ষার্থী মেলেনি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- pagination ---- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {toBnDigits(filtered.length)} টির মধ্যে {toBnDigits(safePage * ROWS_PER_PAGE + 1)}–{toBnDigits(Math.min((safePage + 1) * ROWS_PER_PAGE, filtered.length))} টি দেখানো হচ্ছে
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                style={{
                  backgroundColor: i === safePage ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: i === safePage ? '#fff' : 'var(--color-text-muted)',
                  border: `1.5px solid ${i === safePage ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}>
                {toBnDigits(i + 1)}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage >= totalPages - 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
