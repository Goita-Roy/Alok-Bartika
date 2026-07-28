import { useEffect, useRef, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion'
import { ArrowRight, Sparkles, Bot, Award, BookOpen, TrendingUp, Code2, Cpu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const BN = "'Hind Siliguri', sans-serif"

/* ── Floating particles background ────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 170, ${p.a})`
        ctx.fill()
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 212, 170, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

/* ── Grid overlay ────────────────────────────────────────────────── */
function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,170,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,170,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

/* ── Glow orbs ──────────────────────────────────────────────────── */
function GlowOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: '-15%',
          left: '10%',
          background: 'radial-gradient(circle, rgba(0,163,122,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: '30%',
          left: '30%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  )
}

/* ── Glass badge pill ───────────────────────────────────────────── */
function GlassBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold"
      style={{
        background: 'rgba(0,212,170,0.08)',
        border: '1px solid rgba(0,212,170,0.2)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#00D4AA',
        boxShadow: '0 0 20px rgba(0,212,170,0.06), inset 0 1px 0 rgba(255,255,255,0.04)',
        fontFamily: BN,
      }}
    >
      <span style={{ color: '#00D4AA' }}>✓</span>
      {children}
    </span>
  )
}

/* ── Floating holographic card ──────────────────────────────────── */
function FloatingCard({
  icon: Icon,
  label,
  color,
  className,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  color: string
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute ${className ?? ''}`}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(0,212,170,0.06)',
          border: '1px solid rgba(0,212,170,0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 20px ${color}15`,
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
        <span className="text-xs font-semibold text-white/70 whitespace-nowrap" style={{ fontFamily: BN }}>
          {label}
        </span>
      </div>
    </motion.div>
  )
}

/* ── Right-side illustration (SVG-based futuristic scene) ────────── */
function HeroIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glass desk */}
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[85%] h-[45%] rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(0,212,170,0.06) 0%, rgba(0,212,170,0.02) 100%)',
          border: '1px solid rgba(0,212,170,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(0,212,170,0.05)',
        }}
      />

      {/* Monitor */}
      <motion.div
        className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[70%]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d1f35 100%)',
            border: '2px solid rgba(0,212,170,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,212,170,0.08)',
          }}
        >
          {/* Monitor header */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(0,212,170,0.1)' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <span className="text-[10px] text-white/30 font-mono ml-2">main.py — আলোকবর্তিকা IDE</span>
          </div>
          {/* Code area */}
          <div className="p-3 font-mono text-[11px] leading-relaxed" style={{ minHeight: 100 }}>
            <div><span className="text-purple-400">def</span> <span className="text-cyan-300">greet</span><span className="text-white/60">(</span><span className="text-orange-300">name</span><span className="text-white/60">):</span></div>
            <div className="pl-4"><span className="text-purple-400">print</span><span className="text-white/60">(</span><span className="text-emerald-400">f"আলোকবর্তিকায় স্বাগতম, {'{'}name{'}'}!"</span><span className="text-white/60">)</span></div>
            <div className="mt-1"><span className="text-cyan-300">greet</span><span className="text-white/60">(</span><span className="text-emerald-400">"রহিম"</span><span className="text-white/60">)</span></div>
            <div className="mt-2 text-emerald-400/70 text-[10px]">▸ আলোকবর্তিকায় স্বাগতম, রহিম!</div>
          </div>
        </div>
        {/* Monitor stand */}
        <div className="flex justify-center">
          <div className="w-12 h-4 rounded-b-lg" style={{ background: 'rgba(0,212,170,0.08)', borderLeft: '1px solid rgba(0,212,170,0.12)', borderRight: '1px solid rgba(0,212,170,0.12)', borderBottom: '1px solid rgba(0,212,170,0.12)' }} />
        </div>
        <div className="flex justify-center">
          <div className="w-24 h-1.5 rounded-full" style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.12)' }} />
        </div>
      </motion.div>

      {/* Students silhouettes */}
      <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2 flex gap-6">
        {/* Boy */}
        <motion.div
          className="relative"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <div className="w-14 h-16 rounded-t-full" style={{ background: 'linear-gradient(180deg, rgba(0,212,170,0.15) 0%, rgba(0,212,170,0.05) 100%)', border: '1px solid rgba(0,212,170,0.15)' }} />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.2) 0%, rgba(0,163,122,0.1) 100%)', border: '1px solid rgba(0,212,170,0.2)' }} />
          {/* Headphones */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 rounded-t-full" style={{ border: '2px solid rgba(0,212,170,0.25)', borderBottom: 'none' }} />
          <div className="absolute -top-1.5 -left-1 w-2.5 h-3 rounded-full" style={{ background: 'rgba(0,212,170,0.25)' }} />
          <div className="absolute -top-1.5 -right-1 w-2.5 h-3 rounded-full" style={{ background: 'rgba(0,212,170,0.25)' }} />
        </motion.div>
        {/* Girl */}
        <motion.div
          className="relative"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="w-14 h-16 rounded-t-full" style={{ background: 'linear-gradient(180deg, rgba(56,189,248,0.15) 0%, rgba(56,189,248,0.05) 100%)', border: '1px solid rgba(56,189,248,0.15)' }} />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(56,189,248,0.1) 100%)', border: '1px solid rgba(56,189,248,0.2)' }} />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 rounded-t-full" style={{ border: '2px solid rgba(56,189,248,0.25)', borderBottom: 'none' }} />
          <div className="absolute -top-1.5 -left-1 w-2.5 h-3 rounded-full" style={{ background: 'rgba(56,189,248,0.25)' }} />
          <div className="absolute -top-1.5 -right-1 w-2.5 h-3 rounded-full" style={{ background: 'rgba(56,189,248,0.25)' }} />
        </motion.div>
      </div>

      {/* RGB keyboard */}
      <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[50%] h-3 rounded-md"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,100,0.12), rgba(0,212,170,0.12), rgba(56,189,248,0.12))',
          border: '1px solid rgba(0,212,170,0.1)',
          boxShadow: '0 0 20px rgba(0,212,170,0.06)',
        }}
      />

      {/* Floating holographic cards */}
      <FloatingCard icon={Bot} label="AI সহায়ক" color="#00D4AA" className="top-[6%] -left-[5%]" delay={0} />
      <FloatingCard icon={Award} label="সার্টিফিকেট" color="#F4C53A" className="top-[15%] -right-[8%]" delay={0.8} />
      <FloatingCard icon={Code2} label="Python কোড" color="#38BDF8" className="bottom-[40%] -left-[10%]" delay={1.5} />
      <FloatingCard icon={TrendingUp} label="প্রগ্রেস" color="#A78BFA" className="bottom-[35%] -right-[12%]" delay={2.2} />
      <FloatingCard icon={BookOpen} label="পাঠ ০১" color="#34D399" className="top-[35%] -left-[14%]" delay={1} />
      <FloatingCard icon={Cpu} label="কোডিং" color="#F472B6" className="top-[45%] -right-[6%]" delay={1.8} />

      {/* Python logo */}
      <motion.div
        className="absolute top-[2%] right-[15%]"
        animate={{ y: [0, -6, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            boxShadow: '0 4px 20px rgba(56,189,248,0.1)',
          }}>
          🐍
        </div>
      </motion.div>

      {/* Achievement card */}
      <motion.div
        className="absolute bottom-[48%] left-[8%]"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="px-2.5 py-1.5 rounded-lg"
          style={{
            background: 'rgba(244,197,58,0.08)',
            border: '1px solid rgba(244,197,58,0.2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-[10px] font-bold" style={{ color: '#F4C53A', fontFamily: BN }}>🏅 +150 XP</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main Hero Section ──────────────────────────────────────────── */
export function HeroSection() {
  const { user } = useAuth()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const parallaxX = useSpring(useTransform(mouseX, [-500, 500], [-12, 12]), { stiffness: 100, damping: 30 })
  const parallaxY = useSpring(useTransform(mouseY, [-500, 500], [-8, 8]), { stiffness: 100, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden"
      style={{
        height: 'min(720px, 90vh)',
        background: 'linear-gradient(160deg, #031B24 0%, #082C37 40%, #0E3E48 100%)',
      }}
    >
      {/* Background layers */}
      <GridOverlay />
      <ParticleField />
      <GlowOrbs />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto h-full px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] h-full items-center gap-8 lg:gap-4">

          {/* ── LEFT: Text content ─────────────────────────────── */}
          <motion.div
            className="space-y-7 py-8 lg:py-0"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <motion.div variants={itemVariants} className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-2"
                style={{
                  background: 'rgba(0,212,170,0.08)',
                  border: '1px solid rgba(0,212,170,0.15)',
                }}
              >
                <Sparkles size={12} style={{ color: '#00D4AA' }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#00D4AA', fontFamily: BN }}>
                  বাংলাদেশের #১ কোডিং প্ল্যাটফর্ম
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-black leading-[1.08] tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 5.5vw, 72px)',
                color: '#FFFFFF',
                fontFamily: BN,
              }}
            >
              বাংলায় কোডিং শেখো,
              <br />
              <span className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #00D4AA 0%, #38BDF8 50%, #A78BFA 100%)',
                }}
              >
                ভবিষ্যৎ গড়ো
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="leading-relaxed"
              style={{
                color: '#D4EAF4',
                fontSize: 'clamp(0.9rem, 1.2vw, 1.05rem)',
                maxWidth: 520,
                fontFamily: BN,
              }}
            >
              আলোকবর্তিকা — বাংলাদেশের প্রথম বাংলা মাধ্যম Python শেখার প্ল্যাটফর্ম।
              ৬ষ্ঠ–৮ম শ্রেণির শিক্ষার্থীদের জন্য সম্পূর্ণ ইন্টারঅ্যাক্টিভ।
            </motion.p>

            {/* Feature pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2.5">
              <GlassBadge>সম্পূর্ণ বাংলায়</GlassBadge>
              <GlassBadge>AI সহায়ক</GlassBadge>
              <GlassBadge>শিক্ষানবিশ বান্ধব</GlassBadge>
            </motion.div>

            {/* CTA buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={user ? '/courses' : '/signup'}
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A37A 100%)',
                  boxShadow: '0 4px 20px rgba(0,212,170,0.3), 0 0 40px rgba(0,212,170,0.1)',
                  fontFamily: BN,
                }}
              >
                <span>{user ? 'শেখা চালিয়ে যান' : 'শেখা শুরু করুন'}</span>
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: '0 8px 40px rgba(0,212,170,0.4), 0 0 60px rgba(0,212,170,0.15)' }}
                />
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:bg-white/5"
                style={{
                  color: '#FFFFFF',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  fontFamily: BN,
                }}
              >
                আরও জানুন
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-2">
              {[
                { value: '৫০০+', label: 'শিক্ষার্থী' },
                { value: '৫০+', label: 'পাঠ' },
                { value: '১০০%', label: 'বিনামূল্যে' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-black" style={{ color: '#00D4AA', fontFamily: BN }}>{s.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(212,234,244,0.5)', fontFamily: BN }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Illustration ────────────────────────────── */}
          <motion.div
            className="relative h-[400px] lg:h-[560px]"
            style={{ x: parallaxX, y: parallaxY }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 100%)', zIndex: 2 }}
      />
    </section>
  )
}
