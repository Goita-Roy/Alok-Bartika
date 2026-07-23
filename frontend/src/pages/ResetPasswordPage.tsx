import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../config/api'
import { Lock, Shield, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const inputCls = "block w-full py-3.5 rounded-xl font-medium transition-all duration-200 outline-none text-sm"
const inputStyle: React.CSSProperties = { backgroundColor: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }

function useFocus() {
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

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const focus = useFocus()

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('পাসওয়ার্ড মিলছে না'); return }
    if (password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return }
    const resetToken = sessionStorage.getItem('resetToken')
    if (!resetToken) { setError('সেশন শেষ হয়েছে। অনুগ্রহ করে পাসওয়ার্ড রিসেট প্রক্রিয়া আবার শুরু করুন।'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const { data } = await api.post('/auth/reset-password', { email, resetToken, password })
      setSuccess(data.message)
      sessionStorage.removeItem('resetToken')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'পাসওয়ার্ড রিসেট করতে ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally { setLoading(false) }
  }

  if (!email) return null

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 lg:p-10"
          style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 8px 40px rgba(29,158,117,0.08)' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-accent-pale)', border: '1px solid var(--color-border)' }}>
              <Lock size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              নতুন পাসওয়ার্ড সেট করুন
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              আপনার নতুন পাসওয়ার্ডটি লিখুন।
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-sm font-bold mb-6 flex items-center gap-3"
              style={{ backgroundColor: '#FFF0F0', color: 'var(--color-error)', border: '1px solid #fecaca', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <Shield size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl text-sm font-bold mb-6 flex items-center gap-3"
              style={{ backgroundColor: '#F0FFF4', color: '#16a34a', border: '1px solid #bbf7d0', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <CheckCircle2 size={18} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                নতুন পাসওয়ার্ড
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={17} />
                </div>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required minLength={6}
                  className={`${inputCls} pl-11 pr-12`} style={inputStyle}
                  placeholder="••••••••" {...focus} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Lock size={17} />
                </div>
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required minLength={6}
                  className={`${inputCls} pl-11 pr-4`} style={inputStyle}
                  placeholder="••••••••" {...focus} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'পাসওয়ার্ড আপডেট করুন'}
            </button>
          </form>

          {success && (
            <p className="mt-8 text-center">
              <Link to="/login" className="text-sm font-bold hover:underline inline-flex items-center gap-1.5"
                style={{ color: 'var(--color-accent)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                <ArrowLeft size={15} /> লগইনে যান
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
