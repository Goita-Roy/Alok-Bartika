import { Crown, Medal, Trophy } from 'lucide-react'

function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

interface LeaderboardEntry {
  rank: number; id: string; name: string; avatar: string
  level: string; xp: number; examMarks: number
  completedCourses: number; isCurrentUser: boolean
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="w-6 text-center text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>#{toBnDigits(rank)}</span>
}

export function LeaderboardSection({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  if (!leaderboard?.length) {
    return (
      <section className="rounded-2xl p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 1px 6px rgba(29,158,117,0.06)' }}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>লিডারবোর্ড</h3>
          <Crown size={18} style={{ color: 'var(--color-warn)' }} />
        </div>
        <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          এখনো কোনো ডাটা নেই
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 1px 6px rgba(29,158,117,0.06)' }}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>লিডারবোর্ড</h3>
        <Crown size={18} style={{ color: 'var(--color-warn)' }} />
      </div>
      <div className="space-y-2">
        {leaderboard.map(student => (
          <article key={student.id}
            className="flex items-center justify-between rounded-xl p-3 transition-colors"
            style={{
              backgroundColor: student.isCurrentUser ? 'var(--color-accent-pale)' : 'var(--color-bg)',
              border: `1px solid ${student.isCurrentUser ? 'var(--color-accent-light)' : 'var(--color-border)'}`,
            }}>
            <div className="flex items-center gap-3 min-w-0">
              <RankIcon rank={student.rank} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  backgroundColor: student.avatar ? 'transparent' : 'var(--color-accent-pale)',
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                  backgroundImage: student.avatar ? `url(${student.avatar})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                {!student.avatar ? student.name.charAt(0).toUpperCase() : ''}
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate" style={{ color: student.isCurrentUser ? 'var(--color-accent)' : 'var(--color-text)', fontWeight: student.isCurrentUser ? 700 : 500, fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {student.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {toBnDigits(student.level)} · {toBnDigits(student.examMarks)} marks · {toBnDigits(student.completedCourses)} courses
                </p>
              </div>
            </div>
            <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-text-muted)' }}>{toBnDigits(student.xp.toLocaleString())} স্কোর</span>
          </article>
        ))}
      </div>
    </section>
  )
}
