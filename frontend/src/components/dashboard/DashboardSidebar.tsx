import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardIcon } from './icons'
import type { SidebarItem } from '../../data/dashboardData'

type DashboardSidebarProps = {
  items: SidebarItem[]
  activeItemId: string
  student: { name: string; className: string; avatar: string; profilePicture?: string; profile?: { avatar?: string } }
  mobileOpen: boolean
  onCloseMobile: () => void
  xp?: { totalXP: number; level: number; currentLevelXP: number; nextLevelXP: number }
  badgesCount?: number
}

function SidebarContent({ items, activeItemId, student, xp, badgesCount }: Omit<DashboardSidebarProps, 'mobileOpen' | 'onCloseMobile'>) {
  const progress = xp ? Math.min((xp.currentLevelXP / xp.nextLevelXP) * 100, 100) : 0
  const avatar = student.profilePicture || student.profile?.avatar || ''
  const initials = student.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="h-full rounded-[24px] p-5 flex flex-col gap-5"
      style={{ backgroundColor: '#CFE7DD', boxShadow: '0 8px 24px rgba(15,118,110,0.08)' }}>

      {/* Brand */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center font-black text-base text-white"
          style={{ background: 'linear-gradient(135deg, #0F766E, #22C55E)', boxShadow: '0 4px 12px rgba(15,118,110,0.25)' }}>
          AB
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#0F766E', fontFamily: "'Hind Siliguri', sans-serif" }}>আলোকবর্তিকা</p>
          <p className="text-xs" style={{ color: '#065F46', fontFamily: "'Hind Siliguri', sans-serif" }}>শিক্ষার্থী পোর্টাল</p>
        </div>
      </div>

      {/* Student card */}
      <div className="rounded-[20px] p-4"
        style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #B8D8CB' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-[14px] flex items-center justify-center font-black text-lg overflow-hidden shrink-0"
            style={{ backgroundColor: '#EAF8F2', color: '#0F766E', border: '2px solid #B8D8CB' }}>
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: '#0F766E' }}>{student.name}</p>
            <p className="text-xs" style={{ color: '#065F46', fontFamily: "'Hind Siliguri', sans-serif" }}>{student.className}</p>
          </div>
        </div>

        {xp && (
          <div className="mt-3 pt-3" style={{ borderTop: '1.5px solid #B8D8CB' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#065F46', fontFamily: "'Hind Siliguri', sans-serif" }}>মোট Score</span>
              <span className="text-sm font-black" style={{ color: '#0F766E' }}>{xp.totalXP.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#065F46', fontFamily: "'Hind Siliguri', sans-serif" }}>লেভেল</span>
              <span className="text-sm font-black" style={{ color: '#F59E0B' }}>{xp.level}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: '#065F46', fontFamily: "'Hind Siliguri', sans-serif" }}>ব্যাজ</span>
              <span className="text-sm font-black" style={{ color: '#6366F1' }}>{badgesCount ?? 0}</span>
            </div>
            <div className="h-2 rounded-full" style={{ backgroundColor: '#B8D8CB' }}>
              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #22C55E, #0F766E)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {items.map(item => {
          const Icon = getDashboardIcon(item.icon)
          const isActive = item.id === activeItemId
          return (
            <Link key={item.id} to={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                color: isActive ? '#FFFFFF' : '#065F46',
                background: isActive ? '#0F766E' : 'transparent',
                borderRadius: '100px',
                fontFamily: "'Hind Siliguri', sans-serif",
                boxShadow: isActive ? '0 4px 12px rgba(15,118,110,0.25)' : 'none',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#B8D8CB'; (e.currentTarget as HTMLElement).style.color = '#065F46' } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#065F46' } }}
            >
              <Icon size={18} style={{ color: isActive ? '#FFFFFF' : '#0F766E' }} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <>
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] lg:block">
        <SidebarContent items={props.items} activeItemId={props.activeItemId} student={props.student} xp={props.xp} badgesCount={props.badgesCount} />
      </aside>
      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={props.onCloseMobile} aria-label="বন্ধ করুন" />
          <aside className="absolute left-0 top-0 h-full w-[280px] p-3">
            <div className="relative h-full">
              <button type="button" onClick={props.onCloseMobile}
                className="absolute right-4 top-4 z-10 rounded-lg p-1.5 transition-colors"
                style={{ color: '#065F46', border: '1.5px solid #B8D8CB', background: '#FFFFFF' }}
                aria-label="বন্ধ করুন">
                <X size={16} />
              </button>
              <SidebarContent items={props.items} activeItemId={props.activeItemId} student={props.student} xp={props.xp} badgesCount={props.badgesCount} />
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
