import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../config/api'
import { GoogleButton } from '../components/GoogleButton'
import { Eye, EyeOff, Lock, Mail, ArrowRight, BookOpen } from 'lucide-react'

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{label}</label>
      <div className="relative">{children}</div>
    </div>
  )
}

const inputCls = "block w-full py-3.5 rounded-xl font-medium transition-all duration-200 outline-none text-sm"
const inputStyle = { backgroundColor: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' } as React.CSSProperties

function useInputFocus() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'var(--color-accent)'
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.12)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'var(--color-border)'
      e.currentTarget.style.boxShadow = 'none'
    },
  }
}

export function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const focus = useInputFocus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      login(data); navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে।')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 8px 40px rgba(29,158,117,0.08)' }}>

        {/* Left promo panel */}
        <div className="hidden md:flex md:w-5/12 flex-col justify-between p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #1D9E75, #178a63)', borderRight: '1px solid var(--color-border)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20"><BookOpen size={16} color="#fff" /></div>
              <span className="text-lg font-black text-white" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>আলোকবর্তিকা</span>
            </Link>
            <h2 className="text-3xl font-black leading-tight text-white mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              আপনার কোডিং যাত্রা<br />পুনরায় শুরু করুন।
            </h2>
            <p className="text-white/75 leading-relaxed text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              আমাদের প্ল্যাটফর্মে ফিরে আসা শিক্ষার্থীদের জন্য রয়েছে নতুন কোর্স এবং চ্যালেঞ্জ।
            </p>
          </div>
          <div className="relative z-10 p-5 rounded-2xl bg-white/15 border border-white/20">
            <p className="text-sm italic text-white/85 leading-relaxed" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              "কোডিং শেখা কেবল একটি দক্ষতা নয়, এটি নতুনভাবে চিন্তা করার একটি মাধ্যম।"
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 p-8 lg:p-12">
          <div className="max-w-sm mx-auto">
            <h2 className="text-3xl font-black mb-1" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>লগইন করুন</h2>
            <p className="mb-8 text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন</p>

            {error && (
              <div className="p-3.5 rounded-xl text-sm font-bold mb-6 flex items-center gap-2"
                style={{ backgroundColor: '#FFF0F0', color: 'var(--color-error)', border: '1px solid #fecaca', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="ইমেইল বা ফোন নম্বর" icon={<Mail size={17} />}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Mail size={17} />
                </div>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} required
                  className={`${inputCls} pl-11 pr-4`} style={inputStyle}
                  placeholder="example@mail.com বা 01XXXXXXXXX" {...focus} />
              </Field>

              <Field label="পাসওয়ার্ড" icon={<Lock size={17} />}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={17} />
                </div>
                <div className="flex justify-end mb-1 absolute -top-7 right-0">
                  <Link to="/forgot-password" className="text-xs font-bold transition-colors" style={{ color: 'var(--color-accent)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                    পাসওয়ার্ড ভুলে গেছেন?
                  </Link>
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className={`${inputCls} pl-11 pr-12`} style={inputStyle}
                  placeholder="••••••••" {...focus} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </Field>

              <div className="flex items-center gap-2">
                <input id="remember-me" type="checkbox" style={{ accentColor: 'var(--color-accent)' }} className="w-4 h-4 rounded" />
                <label htmlFor="remember-me" className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>আমাকে মনে রাখুন</label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] text-white disabled:opacity-60 mt-2"
                style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#178a63' }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)'}>
                {loading ? <span className="loading loading-spinner loading-sm" /> : (<>লগইন করুন <ArrowRight size={18} /></>)}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>অথবা</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            <GoogleButton mode="login" />

            <p className="mt-8 text-center text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              অ্যাকাউন্ট নেই?{' '}
              <Link to="/signup" className="font-bold hover:underline" style={{ color: 'var(--color-accent)' }}>নতুন তৈরি করুন</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
