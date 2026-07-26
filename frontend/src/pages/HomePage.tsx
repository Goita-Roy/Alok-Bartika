import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CheckCircle, Monitor, Mic, Trophy, Bot, Smartphone, Lock, ArrowDown } from 'lucide-react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useCourseProgress, type LearningLevel } from '../hooks/useCourseProgress'
import homeBannerImage from '../assets/image/home-b-1.jpg'
import milestoneImage from '../assets/image/home-b-3.avif'

/* ── Bengali digit helper (display-only, values unchanged) ───────────── */
const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
function toBn(value: number | string): string {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[+d])
}

const BN = "'Hind Siliguri', sans-serif"

/* ── Animation Variants ────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const

const sectionReveal = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

const staggerIn = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const headingReveal = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
}

const cardReveal = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const imageReveal = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } },
}

const buttonReveal = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
}

/* ── Static marketing copy (fully Bangla) ────────────────────────────── */
const FEATURES = [
  { icon: Bot, title: 'পাইথন শিখুন', desc: 'ধাপে ধাপে Python শিখো। সহজ উদাহরণ, অনুশীলন এবং বাংলায় ব্যাখ্যার মাধ্যমে প্রোগ্রামিং দক্ষতা গড়ে তোলো।' },
  { icon: Monitor, title: 'ইনস্টল ছাড়াই IDE', desc: 'কোনো সফটওয়্যার ইনস্টল ছাড়াই সরাসরি ব্রাউজারে কোড লেখো ও চালাও। কম ক্ষমতার কম্পিউটারেও কাজ করে।' },
  { icon: Mic, title: 'বাংলা অডিও গাইড', desc: 'মাতৃভাষায় ধাপে ধাপে নির্দেশনা — ইংরেজির ভয় নেই! AI-চালিত তাৎক্ষণিক পরামর্শ বাংলাতেই পাওয়া যাবে।' },
  { icon: Trophy, title: 'খেলার ছলে শেখা', desc: 'স্কোর পয়েন্ট, ব্যাজ ও লিডারবোর্ড দিয়ে শেখাকে মজাদার করো। প্রতিটি সমস্যা সমাধানে পুরস্কার পাও।' },
  { icon: Bot, title: 'AI সহায়তা', desc: 'আটকে গেলে AI সহকারী সঙ্গে সঙ্গে পরামর্শ দেবে। ভুল ব্যাখ্যা করবে বাংলায়, নিজের মতো করে পথ দেখাবে।' },
]

/* ── Curriculum levels (labels only; unlock state comes from the LMS) ── */
const CURRICULUM: { key: LearningLevel; step: string; title: string; desc: string }[] = [
  { key: 'beginner',     step: '০১', title: 'ধাপ ১ — শিক্ষানবিশ',  desc: 'যুক্তিভিত্তিক চিন্তা শেখো। কোনো কোড না লিখেই ধাঁধা ও ধারাক্রম সমাধান করো!' },
  { key: 'intermediate', step: '০২', title: 'ধাপ ২ — মধ্যবর্তী',    desc: 'টেনে-এনে বসানো ব্লক দিয়ে লুপ ও শর্ত বোঝো। কোডের গঠন সহজে আয়ত্ত করো।' },
  { key: 'advanced',     step: '০৩', title: 'ধাপ ৩ — উন্নত (Python)', desc: 'AI সহায়তায় সত্যিকারের Python কোড লেখো। সত্যিকারের প্রোগ্রামার হয়ে ওঠো!' },
]

const LEVEL_BN: Record<LearningLevel, string> = {
  beginner: 'শিক্ষানবিশ',
  intermediate: 'মধ্যবর্তী',
  advanced: 'উন্নত',
}

/* ── Animated Icons for Feature Cards ──────────────────────────────── */
function IDEIcon() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <Monitor size={28} style={{ color: '#0E7C66' }} />
      <span className="absolute bottom-0.5 right-0.5 w-1.5 h-3 rounded-sm animate-pulse"
        style={{ backgroundColor: '#0E7C66' }} />
    </div>
  )
}

function AudioIcon() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <Mic size={28} style={{ color: '#10B981' }} />
      <div className="absolute -right-1 top-1 flex gap-0.5">
        {[1, 2, 3].map(n => (
          <span key={n} className="w-0.5 rounded-full animate-pulse"
            style={{ backgroundColor: '#10B981', height: `${6 + n * 3}px`, animationDelay: `${n * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

function GamificationIcon() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <Trophy size={28} style={{ color: '#F59E0B' }} />
      </motion.div>
      <motion.span className="absolute -top-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A' }}
        animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
        +50
      </motion.span>
    </div>
  )
}

function AIIcon() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <motion.div animate={{ boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 16px rgba(124,58,237,0.25)', '0 0 0px rgba(124,58,237,0)'] }}
        transition={{ duration: 2, repeat: Infinity }} className="rounded-full p-1">
        <Bot size={28} style={{ color: '#7C3AED' }} />
      </motion.div>
      <motion.div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
        style={{ backgroundColor: '#7C3AED' }}
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }} transition={{ duration: 2, repeat: Infinity }} />
    </div>
  )
}

function DeviceIcon() {
  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <Smartphone size={28} style={{ color: '#059669' }} />
      </motion.div>
      <div className="absolute -bottom-0.5 -right-1 flex gap-0.5">
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#0891B2', opacity: 0.4 }} />
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#0891B2', opacity: 0.7 }} />
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#0891B2', opacity: 1 }} />
      </div>
    </div>
  )
}

const ANIMATED_ICONS = [IDEIcon, AudioIcon, GamificationIcon, AIIcon, DeviceIcon]

/* ── Feature Card Component ────────────────────────────────────────── */
function FeatureCard({ feature, index }: { feature: typeof FEATURES[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = ANIMATED_ICONS[index]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-[20px] p-7 lg:p-8 cursor-pointer"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        transform: isHovered ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        borderColor: isHovered ? '#10B981' : '#E5E7EB',
        boxShadow: isHovered
          ? '0 20px 40px rgba(16,185,129,0.12), 0 4px 12px rgba(0,0,0,0.04)'
          : '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
        style={{
          backgroundColor: isHovered ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.06)',
          boxShadow: isHovered ? '0 4px 16px rgba(16,185,129,0.12)' : '0 2px 8px rgba(16,185,129,0.06)',
        }}>
        <IconComponent />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2" style={{ color: '#0F172A', fontFamily: BN }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p className="text-[15px] leading-relaxed mb-6 flex-grow" style={{ color: '#6B7280', fontFamily: BN }}>
        {feature.desc}
      </p>

      {/* CTA Button */}
      <div className="inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-300"
        style={{ color: '#10B981', fontFamily: BN }}>
        <span>আরও জানুন</span>
        <motion.span
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.25 }}
        >
          →
        </motion.span>
      </div>
    </motion.div>
  )
}

/* ── Count-Up Hook ─────────────────────────────────────────────────── */
function useCountUp(end: number, duration = 1600, startCounting: boolean) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (!startCounting) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setValue(Math.floor(progress * end))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [end, duration, startCounting])
  return value
}

/* ── Milestone Section ─────────────────────────────────────────────── */
interface StatsResponse {
  students: number
  totalClasses: number
  totalLessons: number
  learningStages: number
  successRate: number
  successRateAvailable: boolean
}

interface MilestoneItem {
  icon: string
  label: string
  value: number
  suffix?: string
}

function MilestoneCard({ item, index, inView }: { item: MilestoneItem; index: number; inView: boolean }) {
  const count = useCountUp(item.value, 1400, inView)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center rounded-[20px] p-7 lg:p-8 text-center"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(-6px) scale(1.03)'
        el.style.boxShadow = '0 20px 40px rgba(30,58,138,0.12), 0 4px 12px rgba(0,0,0,0.04)'
        el.style.borderColor = '#1E3A8A'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.transform = 'translateY(0) scale(1)'
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)'
        el.style.borderColor = '#E5E7EB'
      }}
    >
      {/* Icon with bounce */}
      <motion.span
        className="text-3xl lg:text-4xl mb-4 inline-block"
        animate={inView ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 0.6, delay: 0.5 + index * 0.15, ease: 'easeInOut' }}
      >
        {item.icon}
      </motion.span>

      {/* Number */}
      <span className="text-4xl lg:text-5xl font-black leading-tight mb-3"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: BN,
        }}>
        {item.value === 0 && !item.suffix
          ? '০'
          : <>{toBn(count)}{item.suffix ? <span className="text-2xl lg:text-3xl">{item.suffix}</span> : null}</>
        }
      </span>

      {/* Label */}
      <span className="text-sm font-semibold" style={{ color: '#4B5563', fontFamily: BN }}>
        {item.label}
      </span>
    </motion.div>
  )
}

function MilestoneSection() {
  const prefersReduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const res = await api.get<StatsResponse>('/stats')
      return res.data
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const milestones: MilestoneItem[] = [
    { icon: '🎓', label: 'মোট শিক্ষার্থী', value: stats?.students ?? 0 },
    { icon: '📚', label: 'মোট পাঠ', value: stats?.totalLessons ?? 0 },
    { icon: '🚀', label: 'শেখার ধাপ', value: stats?.learningStages ?? 0 },
    { icon: '🏆', label: 'সফলতার হার', value: stats?.successRate ?? 0, suffix: '%' },
  ]

  return (
    <motion.section 
      initial={prefersReduced ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={sectionReveal}
      className="relative pt-12 lg:pt-16 overflow-hidden" 
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Subtle blue blurred background circles */}
      <div className="absolute top-10 left-[5%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,58,138,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-10 right-[5%] w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(30,58,138,0.03) 0%, transparent 60%)', filter: 'blur(80px)' }} />

      <div ref={ref} className="relative z-10 mx-auto px-6 lg:px-12" style={{ maxWidth: '1280px' }}>
        {/* Section Title */}
        <motion.div className="text-center mb-12" variants={staggerIn}>
          <motion.h2
            variants={headingReveal}
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4"
            style={{ color: '#0F172A', fontFamily: BN }}>
            মাইলফলক
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-base lg:text-lg max-w-xl mx-auto"
            style={{ color: '#6B7280', fontFamily: BN }}>
            আমাদের প্ল্যাটফর্মের অগ্রযাত্রার গুরুত্বপূর্ণ অর্জনগুলো এক নজরে।
          </motion.p>
        </motion.div>

        {/* Content: Image Left, Cards Right */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-16">
          {/* Left Side — Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:w-[45%] flex justify-center lg:justify-end flex-shrink-0"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full max-w-[480px]"
            >
              <img
                src={milestoneImage}
                alt="মাইলফলক"
                className="w-full h-auto"
                style={{ objectFit: 'contain', objectPosition: 'center' }}
              />
            </motion.div>
          </motion.div>

          {/* Right Side — Milestone Cards */}
          <div className="w-full lg:w-[55%] grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
            {milestones.map((item, i) => (
              <MilestoneCard key={item.label} item={item} index={i} inView={isInView} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ── Timeline Step ──────────────────────────────────────────────── */
function TimelineStep({ item, index, isRight, unlocked, completed, isGuest, nodeColor, onClick }: {
  item: typeof CURRICULUM[number]; index: number; isRight: boolean; unlocked: boolean; completed: boolean; isGuest: boolean; nodeColor: string; onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div ref={ref}
      className={`relative lg:flex lg:items-center lg:min-h-[220px] ${isRight ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, x: isRight ? 60 : -60, y: 30 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.7, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className={`relative ml-[56px] lg:ml-0 lg:w-[calc(50%-50px)] ${isRight ? 'lg:mr-auto lg:pr-12' : 'lg:ml-auto lg:pl-12'}`}
      >
        <motion.div
          animate={isHovered ? { y: -6, scale: 1.02 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-3xl p-7 lg:p-8 transition-shadow duration-350 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D1FAE5',
            borderRadius: '24px',
            opacity: unlocked ? 1 : 0.7,
            boxShadow: isHovered
              ? '0 20px 50px rgba(34,197,94,0.18), 0 4px 16px rgba(0,0,0,0.04)'
              : '0 12px 40px rgba(34,197,94,0.12), 0 2px 8px rgba(0,0,0,0.03)',
          }}
        >
          {/* Step badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-black"
              style={{ backgroundColor: nodeColor + '18', color: nodeColor, border: `1.5px solid ${nodeColor}40`, fontFamily: BN }}>
              {item.step}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ backgroundColor: '#F0FDF4', color: '#059669', border: '1px solid #BBF7D0', fontFamily: BN }}>
              {LEVEL_BN[item.key]}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl lg:text-2xl font-bold mb-3" style={{ color: '#0F172A', fontFamily: BN }}>
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-[15px] leading-relaxed mb-6" style={{ color: '#4B5563', fontFamily: BN }}>
            {item.desc}
          </p>

          {/* Action button */}
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300"
            style={{ backgroundColor: '#059669', color: '#FFFFFF', fontFamily: BN }}>
            {isGuest
              ? (<>শুরু করুন <motion.span animate={isHovered ? { x: 4 } : { x: 0 }} transition={{ duration: 0.25 }}><ArrowRight size={16} /></motion.span></>)
              : !unlocked
                ? (<><Lock size={16} /> লক করা</>)
                : completed
                  ? (<>সম্পন্ন <CheckCircle size={16} /></>)
                  : (<>চালিয়ে যান <motion.span animate={isHovered ? { x: 4 } : { x: 0 }} transition={{ duration: 0.25 }}><ArrowRight size={16} /></motion.span></>)}
          </div>
        </motion.div>
      </motion.div>

      {/* Center node */}
      <div className="absolute left-[16px] lg:left-1/2 lg:-translate-x-1/2 top-0 lg:top-1/2 lg:-translate-y-1/2 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.15, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          {/* Outer glow */}
          <div className="absolute inset-[-8px] rounded-full animate-pulse"
            style={{ background: `radial-gradient(circle, ${nodeColor}25 0%, transparent 70%)` }} />
          {/* Node */}
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-black text-sm lg:text-base"
            style={{
              backgroundColor: '#FFFFFF',
              color: nodeColor,
              border: `2.5px solid ${nodeColor}`,
              boxShadow: `0 0 20px ${nodeColor}30, 0 2px 8px rgba(0,0,0,0.06)`,
              fontFamily: BN,
            }}>
            {item.step}
          </div>
        </motion.div>
      </div>

      {/* Spacer for the other side (desktop only) */}
      <div className="hidden lg:block lg:w-[calc(50%-50px)]" />
    </div>
  )
}

export function HomePage() {
  const prefersReduced = useReducedMotion() ?? false
  const { user } = useAuth()
  const navigate = useNavigate()

  // Reuse the SAME progression hook the LMS uses. classesByLevel is intentionally
  // empty here: level lock/unlock (isLevelUnlocked) depends only on completedLevels,
  // so the Home Page mirrors the exact LMS unlock rule without importing course data
  // or altering any progression logic.
  const emptyClassesByLevel = { beginner: [], intermediate: [], advanced: [] } as Record<LearningLevel, { id: string }[]>
  const { isLevelUnlocked, completedLevels } = useCourseProgress(emptyClassesByLevel)

  // Continue Learning: when logged in, resume to the canonical lesson the
  // backend computed (persisted in MongoDB — never localStorage).
  const [continueUrl, setContinueUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!user) { setContinueUrl(null); return }
    let cancelled = false
    api.get<{ continueLearning?: { continueUrl: string; title: string | null } }>('/progression')
      .then(res => { if (!cancelled && res.data?.continueLearning?.continueUrl) setContinueUrl(res.data.continueLearning.continueUrl) })
      .catch(() => { if (!cancelled) setContinueUrl(null) })
    return () => { cancelled = true }
  }, [user])

  const handleCurriculumClick = (item: typeof CURRICULUM[number]) => {
    if (!user) {
      navigate('/signup')
      return
    }
    navigate('/courses')
  }

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <motion.section 
        className="px-8 lg:px-16 pt-4 lg:pt-10 pb-0 relative z-10"
        style={{ backgroundColor: '#EFFBF6' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionReveal}
      >
        <div className="flex flex-col items-center max-w-7xl mx-auto">

          {/* ── 1. Main Heading ── */}
          <motion.div className="text-center mb-8 lg:mb-10 pt-2 lg:pt-4" variants={headingReveal}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight"
              style={{ color: '#183B2D', fontFamily: BN, textShadow: '0 1px 2px rgba(255,255,255,0.15)' }}>
              কোডিং শেখো,<br />
              স্বপ্ন গড়ো
            </h1>
          </motion.div>

          {/* ── 2. Hero Banner ── */}
          <motion.div className="relative w-[92%] max-w-[1600px] mx-auto mb-0 rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#EFFBF6' }}
            variants={imageReveal}>
            <img
              src={homeBannerImage}
              alt="আলোকবর্তিকা হিরো ব্যানার"
              className="w-full h-auto"
              style={{ objectFit: 'contain', objectPosition: 'center' }}
            />
          </motion.div>

        </div>
      </motion.section>

      {/* ── Hero Content (section below banner) ────────────────────── */}
      <motion.section 
        className="relative z-20"
        style={{ backgroundColor: '#EFFBF6' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionReveal}
      >
        <div className="px-8 lg:px-16 py-12 lg:py-16 max-w-5xl mx-auto">
          <motion.div className="flex flex-col items-start gap-6 lg:gap-8" variants={staggerIn}>

            {/* Description */}
            <motion.p className="text-base lg:text-lg leading-relaxed max-w-[700px]"
              style={{ color: '#4B5563', fontFamily: BN }}
              variants={fadeUp}>
              আলোকবর্তিকা — বাংলাদেশের প্রথম বাংলা মাধ্যম Python শিক্ষা প্ল্যাটফর্ম।
              ৬ষ্ঠ থেকে ৮ম শ্রেণীর শিক্ষার্থীদের জন্য,
              সম্পূর্ণ বিনামূল্যে।
            </motion.p>

            {/* Button */}
            <motion.div variants={buttonReveal}>
              <Link to="/courses"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#FFFFFF', color: '#1E3A8A', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', fontFamily: BN }}>
                {user ? 'শেখা চালিয়ে যান' : 'শেখা শুরু করুন'} <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Feature Badge */}
            <motion.div variants={buttonReveal}>
              <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: 'rgba(21,128,61,0.08)',
                  border: '1px solid rgba(21,128,61,0.2)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  color: '#15803D',
                  fontFamily: BN,
                }}>
                <CheckCircle size={14} style={{ color: '#15803D' }} />
                বাংলায় শেখা
              </span>
            </motion.div>

          </motion.div>
        </div>
      </motion.section>

      {/* ── মাইলফলক (Milestones) ─────────────────────────────────────── */}
      <MilestoneSection />

      {/* ── Features ────────────────────────────────────────────────────── */}
      <motion.section 
        className="relative pt-16 lg:pt-24 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F4FCF8 0%, #ECFDF5 50%, #F8FFFB 100%)' }}
        initial={prefersReduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionReveal}
      >

        {/* Background floating circles */}
        <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float-slow 12s ease-in-out infinite' }} />
        <div className="absolute bottom-20 right-[10%] w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.05) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float-slow 14s ease-in-out infinite 3s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

          {/* Section Header */}
          <motion.div className="text-center mb-14 lg:mb-20" variants={staggerIn}>
            <motion.span className="inline-block px-5 py-2 rounded-full text-sm font-bold mb-5"
              style={{ backgroundColor: '#D1FAE5', color: '#047857', border: '1px solid #A7F3D0', fontFamily: BN }}
              variants={fadeUp}>
              মূল বৈশিষ্ট্য
            </motion.span>
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4"
              style={{ color: '#064E3B', fontFamily: BN }}
              variants={headingReveal}>
              প্ল্যাটফর্মে কী <span className="relative inline-block">
                পাবে?
                <span className="absolute -bottom-1 left-0 w-full h-1 rounded-full"
                  style={{ background: '#10B981' }} />
              </span>
            </motion.h2>
            <motion.p className="text-base lg:text-lg max-w-[650px] mx-auto leading-relaxed"
              style={{ color: '#4B5563', fontFamily: BN }}
              variants={fadeUp}>
              তোমার শেখাকে আরও সহজ, মজাদার এবং স্মার্ট করার জন্য রয়েছে আধুনিক সব সুবিধা।
            </motion.p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Curriculum Timeline ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #F5FFF8 0%, #ECFDF5 50%, #F8FFFB 100%)' }}>

        {/* Background circles */}
        <div className="absolute top-20 left-[5%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-32 right-[8%] w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(250,204,21,0.04) 0%, transparent 60%)', filter: 'blur(80px)' }} />

        {/* Section Header — sits in the space between মূল বৈশিষ্ট্য and timeline */}
        <motion.div className="relative z-10 text-center pt-10 lg:pt-14 pb-10 lg:pb-14" variants={staggerIn}>
          <motion.span className="inline-block px-5 py-2 rounded-full text-sm font-bold mb-5"
            style={{ backgroundColor: '#D1FAE5', color: '#047857', border: '1px solid #A7F3D0', fontFamily: BN }}
            variants={fadeUp}>
            পাঠক্রম
          </motion.span>
          <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4"
            style={{ color: '#0F172A', fontFamily: BN }}
            variants={headingReveal}>
            তিনটি <span style={{ color: '#059669' }}>ধাপে শেখো</span>
          </motion.h2>
          <motion.p className="text-base lg:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: '#4B5563', fontFamily: BN }}
            variants={fadeUp}>
            একদম শূন্য থেকে Python পর্যন্ত — একটি সাজানো পথনির্দেশ যা তোমাকে ধীরে ধীরে এগিয়ে নিয়ে যাবে।
          </motion.p>
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">

          {/* Timeline */}
          <div className="relative">

            {/* ── SVG S-path (desktop) ── */}
            <svg className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 w-[80px] h-full pointer-events-none" preserveAspectRatio="none" style={{ zIndex: 0 }}>
              <defs>
                <linearGradient id="timelineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="40%" stopColor="#22C55E" />
                  <stop offset="70%" stopColor="#FACC15" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M 40 0 C 40 60, 65 100, 65 150 C 65 200, 15 240, 15 300 C 15 360, 65 400, 65 480 C 65 560, 15 620, 15 700 C 15 780, 40 820, 40 900"
                fill="none" stroke="url(#timelineGrad)" strokeWidth="4" strokeLinecap="round" filter="url(#pathGlow)" opacity="0.6" />
              <path d="M 40 0 C 40 60, 65 100, 65 150 C 65 200, 15 240, 15 300 C 15 360, 65 400, 65 480 C 65 560, 15 620, 15 700 C 15 780, 40 820, 40 900"
                fill="none" stroke="url(#timelineGrad)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            {/* ── Vertical line (mobile / tablet) ── */}
            <div className="lg:hidden absolute left-[28px] lg:left-1/2 top-0 bottom-0 w-[3px] rounded-full"
              style={{ background: 'linear-gradient(180deg, #34D399 0%, #22C55E 40%, #FACC15 70%, #FB923C 100%)', opacity: 0.5 }} />

            {/* ── Steps ── */}
            <div className="relative space-y-16 lg:space-y-0 lg:flex lg:flex-col lg:gap-0">
              {CURRICULUM.map((item, i) => {
                const isGuest = !user
                const unlocked = isGuest ? true : isLevelUnlocked(item.key)
                const completed = isGuest ? false : completedLevels.includes(item.key)
                const isRight = i % 2 === 0
                const nodeColors = ['#34D399', '#22C55E', '#FB923C']
                const nodeColor = nodeColors[i]

                return (
                  <TimelineStep
                    key={item.key}
                    item={item}
                    index={i}
                    isRight={isRight}
                    unlocked={unlocked}
                    completed={completed}
                    isGuest={isGuest}
                    nodeColor={nodeColor}
                    onClick={() => unlocked && handleCurriculumClick(item)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </section>


        {/* ── আমাদের সম্পর্কে ──────────────────────────────────────────────── */}
      <motion.section
        initial={prefersReduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionReveal}
      >
        <div className="rounded-3xl p-8 sm:p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-card-bg)', border: '1.5px solid var(--color-home-card-border)', boxShadow: '0 8px 32px rgba(14,124,102,0.08)' }}>
          <motion.div className="relative z-10 space-y-6 max-w-3xl mx-auto" variants={staggerIn}>
            <motion.span className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest"
              style={{ backgroundColor: 'var(--color-home-warm-badge-bg)', color: 'var(--color-home-warm-badge-text)', border: '1px solid var(--color-home-warm-badge-border)', fontFamily: BN }}
              variants={fadeUp}>
              আমাদের সম্পর্কে
            </motion.span>
            <motion.h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: 'var(--color-home-accent-dark)', fontFamily: BN }}
              variants={headingReveal}>
              বাংলাদেশের শিশুদের জন্য<br />
              <span style={{ color: 'var(--color-accent)' }}>প্রোগ্রামিং শেখার আলো</span>
            </motion.h2>
            <motion.p className="text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--color-home-text-body)', fontFamily: BN }}
              variants={fadeUp}>
              আলোকবর্তিকা — ৬ষ্ঠ থেকে ৮ম শ্রেণীর শিক্ষার্থীদের জন্য বাংলা ভাষায় ইন্টারঅ্যাকটিভ কোডিং প্ল্যাটফর্ম।
            </motion.p>
            <motion.div variants={buttonReveal}>
              <Link to="/about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-black transition-all duration-200 hover:scale-105 cursor-pointer"
                style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-accent)', backgroundColor: 'var(--color-white)', fontFamily: BN }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-surface)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-white)' }}>
                আরও জানুন <ArrowDown size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <motion.section
        initial={prefersReduced ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionReveal}
      >
        <div className="rounded-3xl p-8 sm:p-12 lg:p-20 text-center relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-home-cta-bg)', boxShadow: '0 12px 40px rgba(14,124,102,0.25)' }}>
          <motion.div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(253,248,241,0.10) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }}
            variants={imageReveal} />
          <motion.div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(253,248,241,0.06) 0%, transparent 70%)', transform: 'translate(-30%,30%)' }}
            variants={imageReveal} />
          <motion.div className="relative z-10 space-y-8" variants={staggerIn}>
            <div className="space-y-4">
              <motion.h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: 'var(--color-home-cta-text)', fontFamily: BN }}
                variants={headingReveal}>
                আজই শুরু করো তোমার<br />
                <span style={{ color: 'var(--color-home-cta-soft)' }}>কোডিং যাত্রা!</span>
              </motion.h2>
              <motion.p className="text-lg lg:text-xl font-medium max-w-2xl mx-auto" style={{ color: 'var(--color-home-cta-soft)', fontFamily: BN }}
                variants={fadeUp}>
                বিনামূল্যে রেজিস্ট্রেশন করো — কোনো ক্রেডিট কার্ড লাগবে না।
              </motion.p>
            </div>
            <motion.div variants={buttonReveal}>
              <Link to={!user ? '/signup' : (continueUrl || '/courses')}
                className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-xl font-black transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--color-home-gold)', color: 'var(--color-home-gold-text)', boxShadow: '0 4px 20px rgba(244,197,58,0.35)', fontFamily: BN }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold-hover)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-home-gold)' }}>
                {!user ? 'বিনামূল্যে শুরু করুন' : (continueUrl ? 'শেখা চালিয়ে যান' : 'কোর্সসমূহ দেখুন')} <ArrowRight size={22} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
