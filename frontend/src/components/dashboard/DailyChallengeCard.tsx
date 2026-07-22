import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ContinueLearningChallenge {
  title: string; description: string; rewardXP: number; ctaText: string; continueHref?: string
}

export function DailyChallengeCard({ challenge }: { challenge: ContinueLearningChallenge }) {
  const navigate = useNavigate()

  const handleContinue = () => {
    if (challenge.continueHref) {
      navigate(challenge.continueHref)
    } else {
      navigate('/courses')
    }
  }

  return (
    <section className="rounded-[24px] p-6 relative overflow-hidden h-full flex flex-col"
      style={{ background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.22)' }}>
      <div className="relative z-10 flex flex-col h-full">
        <h3 className="mb-6 text-2xl font-black text-white leading-snug flex-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>শেখা চালিয়ে যান</h3>
        
        <button
          onClick={handleContinue}
          className="inline-flex items-center gap-2.5 rounded-[14px] px-5 py-3 text-base font-bold transition-all duration-200 hover:-translate-y-1 w-fit cursor-pointer mt-auto"
          style={{ backgroundColor: '#FFFFFF', color: '#6366F1', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#EEF2FF'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FFFFFF'}>
          <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{challenge.ctaText || 'চলিয়ে যান'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}
