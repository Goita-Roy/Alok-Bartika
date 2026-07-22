import { Clock, Timer, RefreshCw, SwitchCamera } from 'lucide-react'

function formatMin(m: number): string {
  if (m < 60) return `${Math.round(m)} মি`
  const h = Math.floor(m / 60)
  const min = Math.round(m % 60)
  return min > 0 ? `${h}ঘ ${min}মি` : `${h}ঘ`
}

function formatLastActive(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 1000 / 60)
  if (diffMin < 1) return 'এইমাত্র'
  if (diffMin < 60) return `${diffMin} মি আগে`
  const hours = Math.floor(diffMin / 60)
  if (hours < 24) return `${hours} ঘ আগে`
  return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })
}

function formatHms(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const STAT_ICONS: Record<string, { icon: any; color: string; bgColor: string }> = {
  today:  { icon: Clock,        color: '#4F46E5', bgColor: '#E5EEFF' },
  total:  { icon: Timer,        color: '#0F766E', bgColor: '#E7F8EE' },
  tab:    { icon: RefreshCw,    color: '#6366F1', bgColor: '#EEE8FF' },
  active: { icon: SwitchCamera, color: '#EC4899', bgColor: '#FFE7EF' },
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  suffix,
}: {
  icon: any
  label: string
  value: string
  color: string
  bgColor: string
  suffix?: string
}) {
  return (
    <div
      className="rounded-[20px] p-5 transition-all duration-200 hover:-translate-y-1 flex items-center gap-4"
      style={{ backgroundColor: '#F8FFFC', border: '1.5px solid #D4E8DE', boxShadow: '0 8px 24px rgba(15,118,110,0.08)' }}
    >
      <div
        className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: bgColor, color }}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold" style={{ color: '#64748B', fontFamily: "'Hind Siliguri', sans-serif" }}>
          {label}
        </p>
        <p className="text-2xl font-black mt-1 flex items-center gap-1.5" style={{ color: '#0F172A' }}>
          {value}
          {suffix && <span className="text-xs font-bold" style={{ color: '#94A3B8', fontFamily: "'Hind Siliguri', sans-serif" }}>{suffix}</span>}
        </p>
      </div>
    </div>
  )
}

export function LearningAnalyticsCards({
  todayMinutes,
  totalMinutes,
  elapsedSeconds,
  tabSwitchCount,
  lastActiveAt,
}: {
  todayMinutes: number
  totalMinutes: number
  elapsedSeconds: number
  tabSwitchCount: number
  lastActiveAt: string | null
}) {
  const dynamicTotalSeconds = (totalMinutes * 60) + elapsedSeconds

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={STAT_ICONS.today.icon}
        label="আজকের শেখার সময়"
        value={formatMin(todayMinutes)}
        color={STAT_ICONS.today.color}
        bgColor={STAT_ICONS.today.bgColor}
      />
      <StatCard
        icon={STAT_ICONS.total.icon}
        label="মোট শেখার সময়"
        value={formatHms(dynamicTotalSeconds)}
        color={STAT_ICONS.total.color}
        bgColor={STAT_ICONS.total.bgColor}
      />
      <StatCard
        icon={STAT_ICONS.tab.icon}
        label="ট্যাব পরিবর্তন"
        value={String(tabSwitchCount)}
        color={STAT_ICONS.tab.color}
        bgColor={STAT_ICONS.tab.bgColor}
        suffix="বার"
      />
      <StatCard
        icon={STAT_ICONS.active.icon}
        label="শেষ সক্রিয় সময়"
        value={formatLastActive(lastActiveAt)}
        color={STAT_ICONS.active.color}
        bgColor={STAT_ICONS.active.bgColor}
      />
    </div>
  )
}

const WEEKDAYS_SHORT = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি', 'রবি']

export function WeeklyChart({
  dailyLogs,
}: {
  dailyLogs: Array<{ date: string; minutes: number }>
}) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const days: { label: string; minutes: number; isToday: boolean }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const log = dailyLogs.find(l => l.date === dateStr)
    days.push({
      label: WEEKDAYS_SHORT[d.getDay() === 0 ? 6 : d.getDay() - 1] || '',
      minutes: log?.minutes || 0,
      isToday: i === dayOfWeek - 1 || (dayOfWeek === 0 && i === 6),
    })
  }

  const maxMin = Math.max(...days.map(d => d.minutes), 1)

  return (
    <section
      className="rounded-[20px] p-6 transition-all duration-200"
      style={{ backgroundColor: '#F8FFFC', border: '1.5px solid #D4E8DE', boxShadow: '0 8px 24px rgba(15,118,110,0.08)' }}
    >
      <h3 className="text-base font-bold mb-5" style={{ color: '#64748B', fontFamily: "'Hind Siliguri', sans-serif" }}>
        সাপ্তাহিক শেখার সময়
      </h3>
      <div className="flex items-end gap-2 h-32">
        {days.map((d, i) => {
          const pct = (d.minutes / maxMin) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-bold" style={{ color: '#94A3B8' }}>
                {d.minutes > 0 ? `${Math.round(d.minutes)}মি` : ''}
              </span>
              <div
                className="w-full rounded-[8px] transition-all duration-300"
                style={{
                  height: `${Math.max(pct, d.minutes > 0 ? 4 : 0)}%`,
                  background: d.isToday ? 'linear-gradient(180deg, #16A34A, #4ADE80)' : '#D4E8DE',
                  minHeight: d.minutes > 0 ? '4px' : '0px',
                }}
              />
              <span
                className="text-[11px] font-bold mt-1"
                style={{ color: d.isToday ? '#0F766E' : '#94A3B8', fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
