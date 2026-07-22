import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import { User, Mail, Lock, Phone, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { GoogleButton } from '../components/GoogleButton'

const inputCls = "block w-full py-3.5 rounded-xl font-medium transition-all duration-200 outline-none text-sm"
const inputStyle: React.CSSProperties = { backgroundColor: 'var(--color-bg)', border: '1.5px solid var(--color-border)', color: 'var(--color-text)' }

function useFocus() {
  return {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = 'var(--color-accent)'
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,158,117,0.12)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = 'var(--color-border)'
      e.currentTarget.style.boxShadow = 'none'
    },
  }
}

function MintInput({ label, name, type = 'text', value, onChange, placeholder, icon, required }: any) {
  const focus = useFocus()
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>{icon}</div>
        )}
        <input name={name} type={type} value={value} onChange={onChange} required={!!required}
          className={`${inputCls} ${icon ? 'pl-11' : 'px-4'} pr-4`}
          style={inputStyle} placeholder={placeholder} {...(focus as any)} />
      </div>
    </div>
  )
}

export function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const focus = useFocus()
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '', phone: '', gender: 'male',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) { setError('পাসওয়ার্ড মিলছে না'); return }
    if (formData.password.length < 6) { setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'); return }

    const trimmedEmail = formData.email.trim().toLowerCase()
    const trimmedPhone = formData.phone.trim()

    if (!trimmedEmail && !trimmedPhone) {
      setError('ইমেইল বা ফোন নম্বর অন্তত একটি দিন।')
      return
    }

    setLoading(true); setError('')
    try {
      // Pre-check availability of provided identifiers (non-blocking UX guard).
      const availabilityRes = await axios.post(`${API_BASE_URL}/auth/check-availability`, {
        email: trimmedEmail,
        username: formData.username.trim().toLowerCase(),
      })
      if (!availabilityRes.data.available) {
        const conflicts = availabilityRes.data.conflicts || []
        const messages = []
        if (conflicts.includes('email')) messages.push('এই ইমেইলটি ইতিমধ্যেই ব্যবহৃত')
        if (conflicts.includes('username')) messages.push('এই ইউজারনেমটি ইতিমধ্যেই ব্যবহৃত')
        setError(messages.join(' এবং '))
        return
      }

      // Send verification OTP (email if provided, otherwise phone/SMS).
      const sendRes = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
        email: trimmedEmail || undefined,
        phone: trimmedPhone || undefined,
      })

      navigate('/verify-signup-otp', {
        state: {
          ...formData,
          email: trimmedEmail,
          phone: trimmedPhone,
          channel: sendRes.data.channel,
          identifier: sendRes.data.identifier,
        },
      })
    } catch (err: any) {
      const errData = err.response?.data
      if (err.response?.status === 409) {
        setError('এই ইমেইল বা ইউজারনেম ইতিমধ্যেই ব্যবহার হচ্ছে। লগইন করুন বা ভিন্ন তথ্য ব্যবহার করুন।')
      } else {
        setError(errData?.error || errData?.message || 'OTP পাঠাতে ব্যর্থ হয়েছে')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>আলোকবর্তিকা পরিবারের সদস্য হতে নিচের তথ্যগুলো দিন</p>
        </div>

        <div className="rounded-3xl p-8 lg:p-12"
          style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)', boxShadow: '0 4px 32px rgba(29,158,117,0.07)' }}>

          {error && (
            <div className="p-3.5 rounded-xl text-sm font-bold mb-8 flex items-center gap-3"
              style={{ backgroundColor: '#FFF0F0', color: 'var(--color-error)', border: '1px solid #fecaca', fontFamily: "'Hind Siliguri', sans-serif" }}>
              <Shield size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1.5px solid var(--color-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>
                <User size={18} />
              </div>
              <h2 className="text-lg font-black" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>ব্যক্তিগত তথ্য</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <MintInput label="পুরো নাম" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="যেমন: মো: রহিম আলী" icon={<User size={17} />} />
              <MintInput label="ইউজারনেম" name="username" value={formData.username} onChange={handleChange} placeholder="rahim_coding" icon={<User size={17} />} />
              <MintInput label="ইমেইল (ফোন অথবা ইমেইল যেকোনো একটি)" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" icon={<Mail size={17} />} />
              <MintInput label="ফোন নম্বর (ফোন অথবা ইমেইল যেকোনো একটি)" name="phone" value={formData.phone} onChange={handleChange} placeholder="01XXX-XXXXXX" icon={<Phone size={17} />} />

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>পাসওয়ার্ড</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}><Lock size={17} /></div>
                  <input name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                    required minLength={6} className={`${inputCls} pl-11 pr-12`} style={inputStyle} placeholder="••••••••" {...(focus as any)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center" style={{ color: 'var(--color-text-muted)' }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <MintInput label="পাসওয়ার্ড নিশ্চিত করুন" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" icon={<Lock size={17} />} />

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>লিঙ্গ</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required
                  className={`${inputCls} px-4 appearance-none`} style={{ ...inputStyle, fontFamily: "'Hind Siliguri', sans-serif" }} {...(focus as any)}>
                  <option value="male" style={{ backgroundColor: 'white' }}>পুরুষ</option>
                  <option value="female" style={{ backgroundColor: 'white' }}>মহিলা</option>
                  <option value="other" style={{ backgroundColor: 'white' }}>অন্যান্য</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(29,158,117,0.25)', fontFamily: "'Hind Siliguri', sans-serif" }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#178a63' }}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)'}>
                {loading ? <span className="loading loading-spinner loading-sm" /> : (<>অ্যাকাউন্ট তৈরি করুন <CheckCircle2 size={18} /></>)}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>অথবা</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              </div>

              <GoogleButton mode="signup" />
            </form>

          <p className="mt-8 text-center text-sm font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="font-bold hover:underline" style={{ color: 'var(--color-accent)' }}>লগইন করুন</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
