import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL } from '../config/api'
import { ArrowLeft, Calendar, Camera, Eye, EyeOff, Key, Save } from 'lucide-react'

export function SettingsPage() {
  const { token } = useAuth()

  const [schoolName, setSchoolName] = useState('')
  const [roll, setRoll] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [avatarFile, setAvatarFile] = useState<string>('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const d = await res.json()
        setSchoolName(d.profile?.schoolName || d.schoolName || '')
        setRoll(d.profile?.roll || '')
        setAddress(d.profile?.address || '')
        setPhone(d.phone || d.profile?.phone || '')
        setBio(d.profile?.bio || '')
        setAvatarPreview(d.profile?.avatar || d.profilePicture || '')
        if (d.profile?.birthDate) {
          const bd = new Date(d.profile.birthDate)
          if (!Number.isNaN(bd.getTime())) {
            setBirthDate(bd.toISOString().split('T')[0])
          }
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [token])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      setAvatarFile(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setMessage(null)
    try {
      const profilePayload: Record<string, any> = {
        schoolName,
        roll,
        address,
        phone,
        bio,
      }
      if (birthDate) {
        profilePayload.birthDate = new Date(birthDate).toISOString()
      } else {
        profilePayload.birthDate = null
      }

      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          phone,
          schoolName,
          profile: profilePayload,
        }),
      })
      if (!res.ok) throw new Error('Update failed')

      if (avatarFile) {
        await fetch(`${API_BASE_URL}/profile/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatar: avatarFile }),
        })
        setAvatarFile('')
      }

      setMessage({ type: 'success', text: 'প্রোফাইল আপডেট করা হয়েছে!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'আপডেট ব্যর্থ হয়েছে' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: 'error', text: 'নতুন পাসওয়ার্ড মেলেনি' })
      return
    }
    if (newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' })
      return
    }
    setChangingPass(true)
    setPassMessage(null)
    try {
      const res = await fetch(`${API_BASE_URL}/profile/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed')
      setPassMessage({ type: 'success', text: 'পাসওয়ার্ড পরিবর্তন করা হয়েছে!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে' })
    } finally {
      setChangingPass(false)
    }
  }

  const fieldStyle = {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1.5px solid var(--color-border)',
  }

  const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" style={{ color: 'var(--color-accent)' }}></span>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'}>
        <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরুন
      </Link>

      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>সেটিংস</h1>

      {/* Profile Settings */}
      <div className="rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>প্রোফাইল তথ্য</h2>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-accent-pale)', border: '2px solid var(--color-border)' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                style={{ color: 'var(--color-accent)' }}>
                {schoolName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 p-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="স্কুলের নাম" value={schoolName} onChange={setSchoolName} placeholder="আপনার স্কুলের নাম" />
          <Input label="জন্ম তারিখ" type="date" value={birthDate} onChange={setBirthDate} icon={<Calendar size={16} />} />
          <Input label="রোল নম্বর" value={roll} onChange={setRoll} placeholder="যেমন: ১২৩" />
          <Input label="ঠিকানা" value={address} onChange={setAddress} placeholder="আপনার ঠিকানা" />
          <Input label="ফোন নম্বর" value={phone} onChange={setPhone} placeholder="01XXX-XXXXXX" />
        </div>

        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>নিজের সম্পর্কে</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className={`${inputCls} resize-none`} style={fieldStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            placeholder="নিজের সম্পর্কে কিছু বলুন..." />
        </div>

        {message && (
          <div className={`text-sm font-semibold p-3 rounded-xl`}
            style={{
              backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              color: message.type === 'success' ? '#065F46' : '#991B1B',
            }}>
            {message.text}
          </div>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all"
          style={{ backgroundColor: 'var(--color-accent)' }}>
          <Save size={16} /> {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Key size={18} /> পাসওয়ার্ড পরিবর্তন
        </h2>

        <div className="space-y-4">
          <PasswordInput label="বর্তমান পাসওয়ার্ড" value={currentPassword} onChange={setCurrentPassword}
            show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordInput label="নতুন পাসওয়ার্ড" value={newPassword} onChange={setNewPassword}
            show={showNew} onToggle={() => setShowNew(v => !v)} />
          <PasswordInput label="নতুন পাসওয়ার্ড (আবার)" value={confirmPassword} onChange={setConfirmPassword}
            show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
        </div>

        {passMessage && (
          <div className={`text-sm font-semibold p-3 rounded-xl`}
            style={{
              backgroundColor: passMessage.type === 'success' ? '#D1FAE5' : '#FEE2E2',
              color: passMessage.type === 'success' ? '#065F46' : '#991B1B',
            }}>
            {passMessage.text}
          </div>
        )}

        <button onClick={handleChangePassword} disabled={changingPass || !currentPassword || !newPassword || !confirmPassword}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#fff',
            opacity: changingPass || !currentPassword || !newPassword || !confirmPassword ? 0.6 : 1,
          }}>
          <Key size={16} /> {changingPass ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
        </button>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', value, onChange, placeholder, icon }: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>{icon}</div>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${icon ? 'pl-10' : ''}`}
          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
      </div>
    </div>
  )
}

function PasswordInput({ label, value, onChange, show, onToggle }: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm outline-none transition-colors"
          style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
