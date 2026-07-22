import { CheckCircle2, Lock, PlayCircle, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

// ── Design tokens ──────────────────────────────────────────────────────────────
const C = {
  accent:      '#1D9E75',
  hover:       '#9FE1CB',
  lockedBg:    '#E1F5EE',
  cardBg:      '#FFFFFF',
  completedBg: '#0F766E',   // ← dark teal for completed cards
  warn:        '#F59E0B',
  text:        '#1F2937',   // darker primary text
  secondary:   '#4B5563',   // darker secondary text
  muted:       '#6B7280',   // darker muted text
  border:      '#C8E8DC',
  error:       '#E24B4A',
}

type ClassCardProps = {
  id: string
  title: string
  description: string
  href: string
  locked: boolean
  completed: boolean
  level?: 'beginner' | 'intermediate' | 'advanced'
  order?: number
  onComplete: (id: string) => void
}

// ── Locked card ────────────────────────────────────────────────────────────────
function LockedCard({ title, description, order }: Pick<ClassCardProps, 'title' | 'description' | 'order'>) {
  return (
    <article
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        backgroundColor: C.lockedBg,
        border: `1.5px solid ${C.border}`,
        opacity: 0.78,
        borderRadius: '20px',
        transition: 'all 250ms ease',
      }}
    >
      {/* Locked ribbon at top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: C.border }} />

      <div className="p-5 pr-12 space-y-3">
        {/* Lock badge */}
        <div className="absolute top-4 right-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(107,114,128,0.12)', border: `1.5px solid ${C.border}` }}
          >
            <Lock size={17} style={{ color: C.muted }} />
          </div>
        </div>

        {order !== undefined && (
          <span
            className="inline-flex w-8 h-8 rounded-xl items-center justify-center text-sm font-black"
            style={{ backgroundColor: 'rgba(107,114,128,0.10)', color: C.muted }}
          >
            {order}
          </span>
        )}
        <h3 className="text-base font-bold leading-snug" style={{ color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
          {title}
        </h3>
        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}>
          {description}
        </p>
        <span
          className="inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: 'rgba(107,114,128,0.10)', color: C.muted, fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          <Lock size={13} /> লক করা আছে
        </span>
      </div>
    </article>
  )
}

// ── Completed card — dark teal #0F766E ─────────────────────────────────────────
function CompletedCard({ id, title, description, href, order }: Omit<ClassCardProps, 'locked' | 'completed' | 'onComplete' | 'level'>) {
  return (
    <article
      className="group relative rounded-[20px] overflow-hidden transition-all duration-250 hover:-translate-y-1"
      style={{
        backgroundColor: C.completedBg,
        border: '1.5px solid rgba(15,118,110,0.40)',
        boxShadow: '0 8px 24px rgba(15,118,110,0.28)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(15,118,110,0.38)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(15,118,110,0.28)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Completed accent stripe */}
      <div className="h-1.5 w-full" style={{ backgroundColor: C.hover }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex items-start gap-3">
            {order !== undefined && (
              <span
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ backgroundColor: 'rgba(255,255,255,0.20)', color: '#FFFFFF' }}
              >
                {order}
              </span>
            )}
            <h3 className="text-base font-bold leading-snug" style={{ color: '#FFFFFF', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {title}
            </h3>
          </div>
          {/* Completed check badge */}
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.22)', border: '1.5px solid rgba(255,255,255,0.35)' }}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
          </div>
        </div>

        <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          {description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Completion badge */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <CheckCircle2 size={14} /> সম্পন্ন
          </span>
          {/* Review link */}
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.22)', fontFamily: "'Hind Siliguri', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.22)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)' }}
          >
            <BookOpen size={14} /> পুনরায় দেখুন
          </Link>
        </div>
      </div>
    </article>
  )
}

// ── Active card (unlocked, not completed) ─────────────────────────────────────
function ActiveCard({ id, title, description, href, order, onComplete }: Omit<ClassCardProps, 'locked' | 'completed' | 'level'>) {
  return (
    <article
      className="group relative rounded-[20px] overflow-hidden transition-all duration-250 hover:-translate-y-1 cursor-default"
      style={{
        backgroundColor: C.cardBg,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 2px 8px rgba(29,158,117,0.07)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(29,158,117,0.14)'
        ;(e.currentTarget as HTMLElement).style.borderColor = C.hover
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(29,158,117,0.07)'
        ;(e.currentTarget as HTMLElement).style.borderColor = C.border
      }}
    >
      {/* Hover accent stripe */}
      <div
        className="h-1.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-250"
        style={{ backgroundColor: C.accent }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            {order !== undefined && (
              <span
                className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-transform group-hover:scale-110 duration-200"
                style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: C.accent }}
              >
                {order}
              </span>
            )}
            <h3 className="text-base font-bold leading-snug" style={{ color: C.text, fontFamily: "'Hind Siliguri', sans-serif" }}>
              {title}
            </h3>
          </div>
          <PlayCircle
            size={20}
            className="shrink-0 opacity-35 group-hover:opacity-100 transition-opacity duration-200"
            style={{ color: C.accent }}
          />
        </div>

        <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: C.secondary, fontFamily: "'Hind Siliguri', sans-serif" }}>
          {description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Start class */}
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.04]"
            style={{ backgroundColor: C.accent, boxShadow: '0 2px 8px rgba(29,158,117,0.28)', fontFamily: "'Hind Siliguri', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#178a63' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = C.accent }}
          >
            <PlayCircle size={15} /> ক্লাস চালিয়ে যান
          </Link>

          {/* Mark complete */}
          <button
            type="button"
            onClick={() => onComplete(id)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.04]"
            style={{ backgroundColor: 'rgba(29,158,117,0.09)', color: C.accent, border: `1.5px solid ${C.border}`, fontFamily: "'Hind Siliguri', sans-serif" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = C.hover
              ;(e.currentTarget as HTMLElement).style.borderColor = C.accent
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(29,158,117,0.09)'
              ;(e.currentTarget as HTMLElement).style.borderColor = C.border
            }}
          >
            <CheckCircle2 size={15} /> সম্পন্ন করুন
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────
export function ClassCard(props: ClassCardProps) {
  if (props.locked) {
    return <LockedCard title={props.title} description={props.description} order={props.order} />
  }
  if (props.completed) {
    return (
      <CompletedCard
        id={props.id} title={props.title} description={props.description}
        href={props.href} order={props.order}
      />
    )
  }
  return (
    <ActiveCard
      id={props.id} title={props.title} description={props.description}
      href={props.href} order={props.order} onComplete={props.onComplete}
    />
  )
}
