import { StatCard } from './StatCard'
import type { DashboardStat } from '../../data/dashboardData'

type StatsGridProps = {
  stats: DashboardStat[]
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </section>
  )
}
