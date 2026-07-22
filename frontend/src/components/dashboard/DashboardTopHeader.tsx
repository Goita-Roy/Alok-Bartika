import { Menu } from 'lucide-react'

type DashboardTopHeaderProps = {
  studentName: string; onOpenSidebar: () => void
  level?: number; totalXP?: number
}

export function DashboardTopHeader({ studentName, onOpenSidebar, level, totalXP }: DashboardTopHeaderProps) {
  const name = studentName?.trim()
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-6"
      style={{ background: 'linear-gradient(135deg, #E6F7F0, #DDF4EC)', border: '1.5px solid #B8D8CB', boxShadow: '0 8px 24px rgba(15,118,110,0.06)' }}>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onOpenSidebar}
          className="rounded-[14px] p-2.5 lg:hidden transition-all"
          style={{ color: '#0F766E', border: '1.5px solid #B8D8CB', backgroundColor: '#FFFFFF' }}
          aria-label="মেনু খুলুন">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: '#0F766E', fontFamily: "'Hind Siliguri', sans-serif" }}>
            {name ? `স্বাগতম, ${name}` : 'স্বাগতম'}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            {level && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold rounded-full px-3 py-1"
                style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                Level {level}
              </span>
            )}
            {totalXP !== undefined && (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold rounded-full px-3 py-1"
                style={{ backgroundColor: '#D1FAE5', color: '#16A34A' }}>
                {totalXP.toLocaleString()} Score
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
