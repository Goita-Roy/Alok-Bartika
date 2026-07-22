import { useState, useEffect, useRef } from 'react'
import { X, Camera, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface ProfileData {
  avatar?: string
  schoolName?: string
  roll?: string
  address?: string
  bio?: string
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile?: ProfileData
  currentAvatar?: string
  currentName: string
  onSaved: (profile: ProfileData, avatar?: string) => void
}

export function ProfileModal({ isOpen, onClose, currentProfile, currentAvatar, currentName, onSaved }: ProfileModalProps) {
  const { token } = useAuth()
  const [schoolName, setSchoolName] = useState(currentProfile?.schoolName || '')
  const [roll, setRoll] = useState(currentProfile?.roll || '')
  const [address, setAddress] = useState(currentProfile?.address || '')
  const [bio, setBio] = useState(currentProfile?.bio || '')
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentProfile?.avatar || currentAvatar)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSchoolName(currentProfile?.schoolName || '')
    setRoll(currentProfile?.roll || '')
    setAddress(currentProfile?.address || '')
    setBio(currentProfile?.bio || '')
    setAvatarPreview(currentProfile?.avatar || currentAvatar)
  }, [currentProfile, currentAvatar])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    try {
      const profilePayload: Partial<ProfileData> = { schoolName, roll, address, bio }
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profilePayload),
      })
      if (!res.ok) throw new Error('Failed to save profile')

      if (avatarPreview && avatarPreview.startsWith('data:')) {
        await fetch(`${API_BASE_URL}/profile/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatar: avatarPreview }),
        })
      }

      onSaved({ schoolName, roll, address, bio }, avatarPreview)
      onClose()
    } catch (err) {
      console.error('Profile save error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ backgroundColor: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
            প্রোফাইল সেটিংস
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--color-accent-pale)', border: '2px solid var(--color-border)' }}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black"
                style={{ color: 'var(--color-accent)' }}>
                {currentName.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 p-1.5 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>
              <Camera size={14} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              স্কুলের নাম
            </label>
            <input value={schoolName} onChange={e => setSchoolName(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              placeholder="আপনার স্কুলের নাম" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              রোল নম্বর
            </label>
            <input value={roll} onChange={e => setRoll(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              placeholder="আপনার রোল নম্বর" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ঠিকানা
            </label>
            <input value={address} onChange={e => setAddress(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              placeholder="আপনার ঠিকানা" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              নিজের সম্পর্কে
            </label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none transition-colors resize-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1.5px solid var(--color-border)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              placeholder="নিজের সম্পর্কে কিছু বলুন..." />
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all"
          style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}>
          <Save size={16} />
          {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
      </div>
    </div>
  )
}
