import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/api'
import { Eye, EyeOff, KeyRound, Loader2, Lock, Save, Shield, UserCircle2 } from 'lucide-react'

interface AdminProfileData {
  id: string
  fullName: string
  username: string
  email: string
  phone: string
  avatar: string
  role: string
  createdAt: string
}

export function AdminSettingsPage() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState<AdminProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admins/me')
      const data = response.data?.data || response.data
      setProfile(data)
      setFullName(data.fullName || '')
      setUsername(data.username || '')
      setPhone(data.phone || '')
      setAvatar(data.avatar || '')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unable to load admin profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      setStatus(null)
      const response = await api.put('/admins/me', {
        fullName: fullName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
      })
      const updated = response.data?.data || response.data
      setProfile(updated)
      updateUser({ fullName: updated.fullName, phone: updated.phone })
      setStatus({ type: 'success', message: response.data?.message || 'Profile updated' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to update profile' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSavingPassword(true)
      setStatus(null)
      const response = await api.put('/admins/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setStatus({ type: 'success', message: response.data?.message || 'Password changed' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to change password' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Profile & Settings</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage your admin profile and security details</p>
        </div>

        {status && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {status.message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="card p-8 text-center shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <Loader2 size={24} className="mx-auto animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading profile…</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <form onSubmit={handleProfileSubmit} className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body gap-4">
                <div className="flex items-center gap-2">
                  <UserCircle2 size={18} style={{ color: 'var(--color-accent)' }} />
                  <h2 className="text-lg font-semibold">Profile details</h2>
                </div>

                <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{fullName || profile?.fullName || user?.fullName || 'Admin'}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{profile?.email || user?.email || '—'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Full name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Avatar URL</label>
                  <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="input input-sm w-full mt-1" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                </div>

                <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={savingProfile}>
                  {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save profile
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordSubmit} className="card shadow-sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="card-body gap-4">
                <div className="flex items-center gap-2">
                  <KeyRound size={18} style={{ color: 'var(--color-accent)' }} />
                  <h2 className="text-lg font-semibold">Change password</h2>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Current password</label>
                  <div className="relative mt-1">
                    <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input input-sm w-full pr-10" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>New password</label>
                  <div className="relative mt-1">
                    <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input input-sm w-full pr-10" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Confirm password</label>
                  <div className="relative mt-1">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input input-sm w-full pr-10" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button className="btn btn-sm btn-primary w-fit" type="submit" disabled={savingPassword}>
                  {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                  Update password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
