import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import { Mail, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react'

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

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const focus = useFocus()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl p-8 lg:p-10"
          style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 8px 40px rgba(29,158,117,0.08)' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--color-accent-pale)', border: '1px solid var(--color-border)' }}>
              <Shield size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              পাসওয়ার্ড ভুলে গেছেন?
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              আপনার ইমেইল ঠিকানা দিন। আমরা একটি 6-ডিজিটের OTP পাঠাব।
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-sm font-bold mb-6 flex items-center gap-3"
              style={{ backgroundColor: '#FFF0F0', color: 'var(--color-error)', border: '1px solid #fecaca', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <Shield size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <Mail size={17} />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required className={`${inputCls} pl-11 pr-4`} style={inputStyle}
                  placeholder="আপনার ইমেইল লিখুন" {...focus} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'OTP পাঠান'}
            </button>
          </form>

          <p className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold hover:underline inline-flex items-center gap-1.5"
              style={{ color: 'var(--color-accent)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <ArrowLeft size={15} /> লগইনে ফিরে যান
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
