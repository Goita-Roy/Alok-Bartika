import { Link } from 'react-router-dom'
import { Code, Layers, Star, Zap, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const AI_TOPICS = [
  {
    label: 'ভেরিয়েবল',
    description: 'পরিবর্তনশীল ও ডাটা টাইপ',
    href: '/courses',
    icon: Code,
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    label: 'লুপ',
    description: 'লুপ ও পুনরাবৃত্তি',
    href: '/courses',
    icon: Layers,
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    label: 'ফাংশন',
    description: 'ফাংশন ও মডিউল',
    href: '/courses',
    icon: Star,
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    label: 'কুইজ',
    description: 'প্র্যাকটিস কুইজ',
    href: '/practice',
    icon: Zap,
    color: '#DC2626',
    bg: '#FEF2F2',
  },
]

export function AIBuddyPage() {
  const { user } = useAuth()
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          <Sparkles size={28} color="#fff" />
        </div>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
          🤖 AI বাডি
        </h1>
        <p className="text-base font-medium max-w-lg mx-auto" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          তোমার ব্যক্তিগত AI সহায়ক — যেকোনো বিষয়ে সাহায্য, গাইড ও প্র্যাকটিসের জন্য তৈরি
        </p>
      </div>

      {/* Topic cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AI_TOPICS.map(t => {
          const Icon = t.icon
          return (
            <Link key={t.label} to={t.href}
              className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
              style={{ backgroundColor: t.bg, border: '1.5px solid transparent', borderColor: t.color }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                  <Icon size={20} color={t.color} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{t.description}</p>
                </div>
              </div>
              <p className="text-xs font-semibold group-hover:underline" style={{ color: t.color }}>
                {user ? 'শেখা চালিয়ে যান →' : 'শেখা শুরু করুন →'}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Bottom info */}
      <div className="mt-10 text-center rounded-2xl p-6"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
          আরও ফিচার শীঘ্রই আসছে — চ্যাট, কোড জেনারেশন, ব্যক্তিগতকৃত সুপারিশ!
        </p>
      </div>
    </div>
  )
}
