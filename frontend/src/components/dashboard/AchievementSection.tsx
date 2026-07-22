type AchievementStats = {
  lessons: number
  courses: number
  badges: number
  streak?: number
}

// Convert English digits to Bengali digits (display only)
function toBnDigits(value: string | number): string {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
  return String(value).replace(/[0-9]/g, d => bn[Number(d)])
}

const ACHIEVEMENTS = [
  { label: 'সম্পন্ন পাঠ', key: 'lessons' as const, color: '#0F766E', bgColor: '#E7F8EE' },
  { label: 'সম্পন্ন কোর্স', key: 'courses' as const, color: '#4F46E5', bgColor: '#E5EEFF' },
  { label: 'অর্জিত ব্যাজ', key: 'badges' as const, color: '#F59E0B', bgColor: '#FEF3C7' },
  { label: 'বর্তমান স্ট্রিক', key: 'streak' as const, color: '#F97316', bgColor: '#FFF0E6' },
]

export function AchievementSection({ stats }: { stats: AchievementStats }) {
  return (
    <section
      className="rounded-[20px] p-6 transition-all duration-200"
      style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #D4E8DE', boxShadow: '0 8px 24px rgba(15,118,110,0.08)' }}
    >
      <h3 className="text-base font-bold mb-5" style={{ color: '#64748B', fontFamily: "'Hind Siliguri', sans-serif" }}>
        অর্জন
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ACHIEVEMENTS.map(a => {
          const value = stats[a.key] ?? 0
          return (
            <div key={a.key} className="rounded-[16px] p-4 text-center transition-all duration-200 hover:-translate-y-1"
              style={{ backgroundColor: a.bgColor, border: '1.5px solid transparent' }}>
              <p className="text-2xl font-black" style={{ color: a.color }}>{toBnDigits(value)}</p>
              <p className="text-xs font-bold mt-1" style={{ color: '#64748B', fontFamily: "'Hind Siliguri', sans-serif" }}>
                {a.label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
