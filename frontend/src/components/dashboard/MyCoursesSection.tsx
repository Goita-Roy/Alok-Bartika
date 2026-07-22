import { Link } from 'react-router-dom'

type CourseItem = {
  id: string; title: string; level: string; progress: number; status: 'Completed' | 'Active' | 'Locked'
}

type MyCoursesSectionProps = {
  courses: (CourseItem & { _id?: string })[]
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  beginner:     { label: 'শিক্ষার্থী (শিক্ষানবিশ)',      color: '#059669', bgColor: '#D1FAE5', borderColor: '#A7F3D0' },
  intermediate: { label: 'অগ্রগামী (মধ্যবর্তী)',    color: '#D97706', bgColor: '#FEF3C7', borderColor: '#FDE68A' },
  advanced:     { label: 'দক্ষ (উন্নত)',             color: '#7C3AED', bgColor: '#EDE9FE', borderColor: '#DDD6FE' },
}

export function MyCoursesSection({ courses }: MyCoursesSectionProps) {
  const levels = ['beginner', 'intermediate', 'advanced']
  const grouped = levels.map(level => {
    const levelCourses = courses.filter(c => c.level === level)
    const avgProgress = levelCourses.length > 0
      ? Math.round(levelCourses.reduce((sum, c) => sum + c.progress, 0) / levelCourses.length)
      : 0
    const allCompleted = levelCourses.length > 0 && levelCourses.every(c => c.status === 'Completed')
    const allLocked    = levelCourses.length > 0 && levelCourses.every(c => c.status === 'Locked')
    const status = allCompleted ? 'Completed' : allLocked ? 'Locked' : 'Active'
    const firstCourseId = levelCourses.find(c => c.status !== 'Locked')?._id || levelCourses[0]?.id || ''
    return { level, label: LEVEL_CONFIG[level]!.label, avgProgress, status, firstCourseId }
  })

  return (
    <section className="rounded-2xl p-6"
      style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 1px 6px rgba(29,158,117,0.06)' }}>
      <div className="mb-5">
        <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          আমার কোর্সসমূহ
        </h3>
      </div>

      <div className="space-y-3">
        {grouped.map(g => {
          const config = LEVEL_CONFIG[g.level]
          const isLocked = g.status === 'Locked'
          return (
            <Link key={g.level} to={isLocked ? '/courses' : `/courses/${g.firstCourseId || ''}`}
              className="block rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: g.status === 'Completed' ? config!.bgColor : 'var(--color-bg)',
                border: `1.5px solid ${g.status === 'Completed' ? config!.borderColor : 'var(--color-border)'}`,
                opacity: isLocked ? 0.6 : 1,
                cursor: isLocked ? 'default' : 'pointer',
              }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{g.label}</span>
                <span className="text-xs font-semibold" style={{
                  color: g.status === 'Completed' ? '#059669' : g.status === 'Locked' ? '#94A3B8' : 'var(--color-accent)',
                }}>
                  {g.status === 'Completed' ? 'সম্পন্ন' : g.status === 'Locked' ? 'লকড' : `${g.avgProgress}%`}
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${g.avgProgress}%`,
                    background: g.status === 'Completed'
                      ? 'linear-gradient(90deg, #059669, #34D399)'
                      : isLocked ? '#CBD5E1' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                  }} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
