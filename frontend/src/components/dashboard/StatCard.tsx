import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { getDashboardIcon } from './icons'
import type { DashboardStat } from '../../data/dashboardData'

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = getDashboardIcon(stat.icon)
  return (
    <article className="rounded-2xl p-5 transition-all duration-250 hover:-translate-y-1"
      style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 1px 6px rgba(29,158,117,0.06)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(29,158,117,0.10)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-light)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(29,158,117,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}>
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: stat.trendUp ? 'var(--color-accent)' : 'var(--color-error)' }}>
          {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {stat.trend}
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{stat.title}</p>
      <p className="text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>{stat.value}</p>
      <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{stat.description}</p>
    </article>
  )
}
