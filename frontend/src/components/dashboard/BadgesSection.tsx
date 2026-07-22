import { Lock, Award } from 'lucide-react'
import { getDashboardIcon } from './icons'
import type { BadgeItem } from '../../data/dashboardData'

export function BadgesSection({ badges }: { badges: BadgeItem[] }) {
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  return (
    <section
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: '#C8EBD8',
        border: '1.5px solid #8BC9A8',
        boxShadow: '0 2px 12px rgba(29,158,117,0.10)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5"
        style={{ backgroundColor: '#B8E5CE', borderBottom: '1px solid #8BC9A8' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1D9E75', color: '#fff' }}>
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <h3
              className="font-bold truncate"
              style={{
                color: '#1a3a2e',
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: 'clamp(1rem, 3vw, 1.2rem)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
              }}
            >
              ব্যাজ
            </h3>
            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: '#2d5a48' }}>
              {earned.length}/{badges.length} অর্জিত
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map(badge => {
            const Icon = getDashboardIcon(badge.icon)
            return (
              <article
                key={badge.id}
                className="rounded-xl p-3.5 text-center transition-all duration-200"
                style={{
                  backgroundColor: badge.earned ? '#B8E5CE' : '#A7DCC0',
                  border: `1.5px solid ${badge.earned ? '#8BC9A8' : '#8BC9A8'}`,
                  opacity: badge.earned ? 1 : 0.55,
                }}
                onMouseEnter={e => {
                  if (badge.earned) {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(29,158,117,0.20)'
                    e.currentTarget.style.borderColor = '#1D9E75'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#8BC9A8'
                }}
              >
                <div className="mb-2 flex justify-center">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: badge.earned ? '#1D9E75' : '#8BC9A8',
                      color: badge.earned ? '#fff' : '#4a7a64',
                    }}
                  >
                    {badge.earned ? <Icon size={20} /> : <Lock size={16} />}
                  </div>
                </div>
                <p
                  className="font-semibold leading-tight"
                  style={{
                    color: badge.earned ? '#1a3a2e' : '#4a7a64',
                    fontFamily: "'Hind Siliguri', sans-serif",
                    fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {badge.name}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
