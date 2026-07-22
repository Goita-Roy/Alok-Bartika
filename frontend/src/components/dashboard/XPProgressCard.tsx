type XPProgressCardProps = {
  totalXP: number; level: number; currentLevelXP: number; nextLevelXP: number
}

export function XPProgressCard({ totalXP, level, currentLevelXP, nextLevelXP }: XPProgressCardProps) {
  const progress = Math.min((currentLevelXP / nextLevelXP) * 100, 100)
  const remaining = Math.max(nextLevelXP - currentLevelXP, 0)
  return (
    <section className="rounded-[24px] p-6 h-full"
      style={{ background: 'linear-gradient(135deg, #16A34A 0%, #0F766E 100%)', boxShadow: '0 8px 32px rgba(15,118,110,0.25)' }}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-white/70 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>মোট Score</p>
            <h2 className="text-5xl font-black text-white tracking-tight">{totalXP.toLocaleString()}</h2>
          </div>
          <div className="px-4 py-2 rounded-full text-sm font-black text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1.5px solid rgba(255,255,255,0.25)' }}>
            Level {level}
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.20)' }}>
            <div className="h-3 rounded-full bg-white transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/80 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {Math.round(progress)}% সম্পন্ন
            </span>
            <span className="text-white/80 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {remaining.toLocaleString()} Score বাকি → Level {level + 1}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
