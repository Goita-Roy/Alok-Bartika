import { useState, useEffect, useCallback } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import api from '../../config/api'
import {
  UserCog,
  Save,
  Loader2,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Camera,
  KeyRound,
} from 'lucide-react'

interface AdminProfileData {
  id: string
  fullName: string
  email: string
  username: string
  phone: string
  avatar: string
  role: string
  emailVerified: boolean
  createdAt: string
  updatedAt?: string
}

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

export function SuperAdminProfilePage() {
  const { user, updateUser } = useAuth()

  // Profile data & loading states
  const [profile, setProfile] = useState<AdminProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Action loading & feedback
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  // Fetch real profile data
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const response = await api.get('/admins/me')
      const data: AdminProfileData = response.data?.data || response.data
      setProfile(data)
      setFullName(data.fullName || '')
      setPhone(data.phone || '')
      setAvatar(data.avatar || '')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to load profile'
      setLoadError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Password strength check
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' }
    if (score <= 4) return { score, label: 'Medium', color: '#f59e0b' }
    return { score, label: 'Strong', color: '#10b981' }
  }

  const pwdStrength = getPasswordStrength(newPassword)

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrors({})

    const errors: Record<string, string> = {}
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters long'
    }
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors)
      return
    }

    setSavingProfile(true)
    try {
      const response = await api.put('/admins/me', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
      })

      const updated = response.data?.data || response.data
      setProfile(updated)
      updateUser({ fullName: updated.fullName, phone: updated.phone })
      addToast('success', 'Profile updated successfully')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile'
      addToast('error', msg)
      if (err.response?.data?.errors) {
        const errMap: Record<string, string> = {}
        err.response.data.errors.forEach((e: string) => {
          if (e.toLowerCase().includes('name')) errMap.fullName = e
          else errMap.general = e
        })
        setProfileErrors(errMap)
      }
    } finally {
      setSavingProfile(false)
    }
  }

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})

    const errors: Record<string, string> = {}
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long'
    } else if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      errors.newPassword = 'Password must include uppercase, lowercase, number, and special character'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setSavingPassword(true)
    try {
      const response = await api.put('/admins/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      addToast('success', response.data?.message || 'Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to change password'
      addToast('error', msg)
      if (msg.toLowerCase().includes('current password')) {
        setPasswordErrors({ currentPassword: msg })
      } else if (msg.toLowerCase().includes('different')) {
        setPasswordErrors({ newPassword: msg })
      }
    } finally {
      setSavingPassword(false)
    }
  }

  // Handle Avatar file pick
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      addToast('error', 'Image size must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const displayEmail = profile?.email || user?.email || ''
  const displayRole = profile?.role || user?.role || 'super-admin'
  const displayInitials = (fullName || profile?.fullName || 'SA').charAt(0).toUpperCase()

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {/* Toast Container */}
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                borderRadius: 8,
                background: t.type === 'success' ? '#15803d' : '#b91c1c',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              {t.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {t.message}
            </div>
          ))}
        </div>

        {/* Page Header */}
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <UserCog size={26} />
            Super Admin Profile & Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Manage your super admin credentials and security options
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 48,
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p>Loading profile information...</p>
          </div>
        ) : loadError ? (
          /* Error State with Retry */
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
              Failed to load profile
            </h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>{loadError}</p>
            <button
              onClick={fetchProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 8,
                background: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <RefreshCw size={16} />
              Retry Loading
            </button>
          </div>
        ) : (
          <>
            {/* Profile Overview Card */}
            <div
              className="flex flex-col sm:flex-row items-center gap-6 p-6"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
              }}
            >
              <div style={{ position: 'relative' }}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--color-border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 32,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {displayInitials}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'var(--color-accent, #7c3aed)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                  title="Upload avatar"
                >
                  <Camera size={14} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>
                  {fullName || 'Super Admin'}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Mail size={14} />
                  {displayEmail}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--color-accent-pale, #ede9fe)',
                      color: 'var(--color-accent, #7c3aed)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {displayRole}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Information Form */}
            <form
              onSubmit={handleProfileSubmit}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Shield size={18} />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setProfileErrors((prev) => ({ ...prev, fullName: '' }))
                    }}
                    placeholder="Enter full name"
                    style={inputStyle}
                  />
                  {profileErrors.fullName && <span style={errorStyle}>{profileErrors.fullName}</span>}
                </div>

                {/* Email (Read-Only) */}
                <div>
                  <label style={labelStyle}>Email Address (Read-Only)</label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                    Email address cannot be modified for security reasons
                  </span>
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880..."
                    style={inputStyle}
                  />
                </div>

                {/* Avatar Image URL */}
                <div>
                  <label style={labelStyle}>Avatar URL / Image Data</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--color-accent, #7c3aed)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    opacity: savingProfile ? 0.7 : 1,
                  }}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security / Password Change Form */}
            <form
              onSubmit={handlePasswordSubmit}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <KeyRound size={18} />
                Security & Password
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Current Password */}
                <div>
                  <label style={labelStyle}>Current Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value)
                        setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }))
                      }}
                      placeholder="Enter current password"
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={toggleButtonStyle}
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <span style={errorStyle}>{passwordErrors.currentPassword}</span>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label style={labelStyle}>New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setPasswordErrors((prev) => ({ ...prev, newPassword: '' }))
                      }}
                      placeholder="Min 8 chars with upper, lower, number, symbol"
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={toggleButtonStyle}
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                        {[1, 2, 3, 4, 5].map((idx) => (
                          <div
                            key={idx}
                            style={{
                              flex: 1,
                              background: idx <= pwdStrength.score ? pwdStrength.color : 'var(--color-border)',
                              transition: 'all 0.2s',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: pwdStrength.color, fontWeight: 600, marginTop: 2, display: 'block' }}>
                        Strength: {pwdStrength.label}
                      </span>
                    </div>
                  )}
                  {passwordErrors.newPassword && <span style={errorStyle}>{passwordErrors.newPassword}</span>}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label style={labelStyle}>Confirm New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }))
                      }}
                      placeholder="Re-enter new password"
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={toggleButtonStyle}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span style={errorStyle}>{passwordErrors.confirmPassword}</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={savingPassword}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: savingPassword ? 'not-allowed' : 'pointer',
                    opacity: savingPassword ? 0.7 : 1,
                  }}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </SuperAdminLayout>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--color-text-muted)',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#ef4444',
  marginTop: 4,
  display: 'block',
}

const toggleButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-muted)',
  padding: 0,
  display: 'flex',
}

