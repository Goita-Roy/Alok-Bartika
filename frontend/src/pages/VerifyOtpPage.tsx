import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import { Shield, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react'

const inputCls = "block w-full text-center font-black outline-none transition-all duration-200 rounded-xl"
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)', border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)', fontSize: '24px', letterSpacing: '4px',
}

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true })
  }, [email, navigate])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = ['', '', '', '', '', '']
    for (let i = 0; i < text.length; i++) newOtp[i] = text[i]
    setOtp(newOtp)
    const nextIndex = Math.min(text.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) { setError('অনুগ্রহ করে সম্পূর্ণ 6-ডিজিটের OTP দিন'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp: otpCode })
      sessionStorage.setItem('resetToken', data.resetToken)
      navigate(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.response?.data?.message || 'ভুল OTP। আবার চেষ্টা করুন।')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('')
    try {
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })
      setSuccess('আপনার ইমেইলে একটি নতুন OTP পাঠানো হয়েছে।')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP পুনরায় পাঠাতে ব্যর্থ।')
    } finally { setResending(false) }
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
              <Shield size={28} style={{ color: 'var(--color-accent)' }} />
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              OTP যাচাই করুন
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {email}-এ পাঠানো 6-ডিজিটের OTP দিন
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input key={index} ref={el => { inputRefs.current[index] = el }}
                  type="text" inputMode="numeric" autoComplete="one-time-code"
                  value={digit} onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  required className={`${inputCls} w-12 sm:w-14 h-14 sm:h-16`} style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.12)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }} />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.join('').length !== 6}
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              {loading ? <span className="loading loading-spinner loading-sm" /> : 'যাচাই করুন'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={handleResend} disabled={resending}
              className="text-sm font-bold hover:underline inline-flex items-center gap-1.5 transition-colors"
              style={{ color: 'var(--color-accent)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
              {resending ? 'পাঠানো হচ্ছে...' : 'পুনরায় OTP পাঠান'}
            </button>
          </div>

          <p className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm font-bold hover:underline inline-flex items-center gap-1.5"
              style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <ArrowLeft size={15} /> ইমেইল পরিবর্তন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
