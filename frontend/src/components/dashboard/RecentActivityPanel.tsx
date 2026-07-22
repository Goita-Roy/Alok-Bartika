import { getDashboardIcon } from './icons'
import type { ActivityItem } from '../../data/dashboardData'

export function RecentActivityPanel({ activities }: { activities: ActivityItem[] }) {
  return (
    <section className="rounded-2xl p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 1px 6px rgba(29,158,117,0.06)' }}>
      <h3 className="mb-5 text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>সাম্প্রতিক কার্যক্রম</h3>
      <div className="space-y-3">
        {activities.map(activity => {
          const Icon = getDashboardIcon(activity.icon)
          return (
            <article key={activity.id} className="flex items-start justify-between gap-3 rounded-xl p-3"
              style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-start gap-3">
                <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>{activity.text}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{activity.time}</p>
                </div>
              </div>
              <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--color-accent)' }}>+{activity.xp} XP</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
