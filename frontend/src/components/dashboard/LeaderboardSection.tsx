import { Crown, Medal, Trophy, Clock, BookOpen, Award, Flame, Zap } from 'lucide-react'
import { formatBanglaNumber } from '../../utils/banglaNumbers'

interface LeaderboardEntry {
  rank: number; id: string; name: string; avatar: string
  level: number; xp: number; completedCourses: number
  completedLessons: number; badgesCount: number
  totalMinutes: number; lastActiveAt: string | null
  streak: number; progressPercentage: number
  isCurrentUser: boolean
}

function formatLastActive(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
  if (diffMin < 1) return 'এইমাত্র'
  if (diffMin < 60) return `${formatBanglaNumber(diffMin)} মি আগে`
  const hours = Math.floor(diffMin / 60)
  if (hours < 24) return `${formatBanglaNumber(hours)} ঘ আগে`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${formatBanglaNumber(days)} দি আগে`
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })
}

function formatMinutes(m: number): string {
  if (m < 60) return `${formatBanglaNumber(m)} মি`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min > 0 ? `${formatBanglaNumber(h)}ঘ ${formatBanglaNumber(min)}মি` : `${formatBanglaNumber(h)}ঘ`
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const MEDAL_BG = ['#FFF8E1', '#F0F0F0', '#F5EEE6']

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-2xl drop-shadow" style={{ lineHeight: 1 }}>🥇</span>
  if (rank === 2) return <span className="text-2xl drop-shadow" style={{ lineHeight: 1 }}>🥈</span>
  if (rank === 3) return <span className="text-2xl drop-shadow" style={{ lineHeight: 1 }}>🥉</span>
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
      style={{ backgroundColor: '#E8ECF0', color: '#64748B' }}
    >
      {formatBanglaNumber(rank)}
    </span>
  )
}

function AvatarCircle({ name, avatar, size = 36 }: { name: string; avatar: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: avatar ? 'transparent' : '#D4E8DE',
        color: '#0F766E',
        fontSize: Math.round(size * 0.4),
        backgroundImage: avatar ? `url(${avatar})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '2px solid #E2E8F0',
      }}
    >
      {!avatar ? name.charAt(0).toUpperCase() : ''}
    </div>
  )
}

function XPProgressBar({ xp, level }: { xp: number; level: number }) {
  const progress = xp % 1000
  const pct = Math.min((progress / 1000) * 100, 100)
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Zap size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
      <div className="flex-1 h-2 rounded-full min-w-[60px]" style={{ backgroundColor: '#E2E8F0' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
        />
      </div>
      <span className="text-[11px] font-bold shrink-0" style={{ color: '#64748B' }}>
        লেভেল {formatBanglaNumber(level)}
      </span>
    </div>
  )
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color }}>
      <Icon size={12} />
      {value}
    </span>
  )
}

function TopThreeCard({ student, isYou }: { student: LeaderboardEntry; isYou: boolean }) {
  const rankIdx = Math.min(student.rank - 1, 2)
  return (
    <div
      className="flex flex-col items-center text-center p-4 rounded-2xl transition-all"
      style={{
        backgroundColor: student.isCurrentUser ? '#F0FDF4' : '#FAFAFA',
        border: `1.5px solid ${student.isCurrentUser ? '#BBF7D0' : MEDAL_COLORS[rankIdx]}40`,
        boxShadow: student.isCurrentUser ? '0 4px 12px rgba(34,197,94,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div className="mb-2">{RankBadge({ rank: student.rank })}</div>
      <AvatarCircle name={student.name} avatar={student.avatar} size={52} />
      <div className="mt-2 flex items-center gap-1.5 min-w-0">
        <span
          className="text-sm font-bold truncate max-w-[120px]"
          style={{ color: '#0F172A', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {student.name}
        </span>
        {isYou && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            আপনি
          </span>
        )}
      </div>
      <div className="mt-1.5 w-full max-w-[140px]">
        <XPProgressBar xp={student.xp} level={student.level} />
      </div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
        <MiniStat icon={BookOpen} label="" value={`${formatBanglaNumber(student.completedCourses)} কোর্স`} color="#0F766E" />
        <MiniStat icon={Award} label="" value={`${formatBanglaNumber(student.badgesCount)} ব্যাজ`} color="#6366F1" />
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
        <MiniStat icon={Flame} label="" value={`${formatBanglaNumber(student.streak)} দি`} color="#F97316" />
        <MiniStat icon={Clock} label="" value={formatMinutes(student.totalMinutes)} color="#64748B" />
      </div>
      <div className="mt-1 text-[10px] font-medium" style={{ color: '#94A3B8' }}>
        {formatLastActive(student.lastActiveAt)}
      </div>
    </div>
  )
}

function RegularRow({ student, isYou, index }: { student: LeaderboardEntry; isYou: boolean; index: number }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
      style={{
        backgroundColor: student.isCurrentUser ? '#F0FDF4' : index % 2 === 0 ? '#FAFAFA' : 'transparent',
        border: `1px solid ${student.isCurrentUser ? '#BBF7D0' : 'transparent'}`,
      }}
    >
      <RankBadge rank={student.rank} />
      <AvatarCircle name={student.name} avatar={student.avatar} size={36} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-bold truncate"
            style={{ color: '#0F172A', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            {student.name}
          </span>
          {isYou && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
              style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
            >
              আপনি
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-0.5">
          <MiniStat icon={Zap} label="" value={`${formatBanglaNumber(student.xp)} স্কোর`} color="#F59E0B" />
          <MiniStat icon={BookOpen} label="" value={`${formatBanglaNumber(student.completedCourses)} কোর্স`} color="#0F766E" />
          <MiniStat icon={Award} label="" value={`${formatBanglaNumber(student.badgesCount)} ব্যাজ`} color="#6366F1" />
          <MiniStat icon={Flame} label="" value={`${formatBanglaNumber(student.streak)} দি`} color="#F97316" />
          <MiniStat icon={Clock} label="" value={formatMinutes(student.totalMinutes)} color="#64748B" />
        </div>
      </div>
      <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0 min-w-[100px]">
        <XPProgressBar xp={student.xp} level={student.level} />
        <span className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>
          {formatLastActive(student.lastActiveAt)}
        </span>
      </div>
      <div className="sm:hidden flex flex-col items-end shrink-0">
        <span className="text-xs font-bold" style={{ color: '#64748B' }}>
          {formatBanglaNumber(student.xp)} স্কোর
        </span>
        <span className="text-[10px]" style={{ color: '#94A3B8' }}>
          {formatLastActive(student.lastActiveAt)}
        </span>
      </div>
    </div>
  )
}

export function LeaderboardSection({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  if (!leaderboard?.length) {
    return (
      <section
        className="rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-border)',
          boxShadow: '0 1px 6px rgba(29,158,117,0.06)',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
            লিডারবোর্ড
          </h3>
          <Crown size={18} style={{ color: 'var(--color-warn)' }} />
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Trophy size={40} style={{ color: '#CBD5E1' }} />
          <p className="text-sm font-medium text-center" style={{ color: '#94A3B8', fontFamily: "'Hind Siliguri', sans-serif" }}>
            এখনো কোনো শিক্ষার্থী লিডারবোর্ডে নেই
          </p>
        </div>
      </section>
    )
  }

  const top3 = leaderboard.filter(s => s.rank <= 3)
  const rest = leaderboard.filter(s => s.rank > 3)

  return (
    <section
      className="rounded-2xl p-6"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1.5px solid var(--color-border)',
        boxShadow: '0 1px 6px rgba(29,158,117,0.06)',
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          লিডারবোর্ড
        </h3>
        <Crown size={18} style={{ color: 'var(--color-warn)' }} />
      </div>

      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {top3.map(s => (
            <TopThreeCard key={s.id} student={s} isYou={s.isCurrentUser} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="space-y-1">
          {rest.map((s, i) => (
            <RegularRow key={s.id} student={s} isYou={s.isCurrentUser} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}