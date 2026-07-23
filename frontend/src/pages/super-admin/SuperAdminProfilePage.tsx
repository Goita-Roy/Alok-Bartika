import { useState } from 'react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
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
} from 'lucide-react'

interface FormState {
  fullName: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function SuperAdminProfilePage() {
  const { user } = useAuth()

  const [form, setForm] = useState<FormState>({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.fullName.trim()) e.fullName = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (form.currentPassword || form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) e.currentPassword = 'Current password is required'
      if (form.newPassword.length < 6) e.newPassword = 'Minimum 6 characters'
      if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    setSaved(false)
    await new Promise((r) => setTimeout(r, 1200))
    setSaving(false)
    setSaved(true)
    setForm((prev) => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }))
    setTimeout(() => setSaved(false), 3000)
  }

  const initials = (form.fullName || 'A').charAt(0).toUpperCase()

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
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
            Profile & Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 4 }}>
            Update your super admin profile and personal preferences
          </p>
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 28,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text)' }}>
              {form.fullName || 'Super Admin'}
            </div>
            <div
              style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Mail size={14} />
              {form.email}
            </div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 8,
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: 'var(--color-accent-pale)',
                color: 'var(--color-accent)',
                textTransform: 'uppercase',
              }}
            >
              super-admin
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: 32,
          }}
        >
          {/* Personal Information */}
          <div style={{ marginBottom: 32 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  style={inputStyle}
                />
                {errors.fullName && <span style={errorStyle}>{errors.fullName}</span>}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
                  Email cannot be changed
                </span>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+977-..."
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '0 0 32px' }} />

          {/* Change Password */}
          <div>
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
              <Lock size={18} />
              Change Password
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {(
                [
                  { key: 'currentPassword', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { key: 'newPassword', label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
                  { key: 'confirmPassword', label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ] as const
              ).map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={show ? 'text' : 'password'}
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      style={{ ...inputStyle, paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      style={{
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
                      }}
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors[key] && <span style={errorStyle}>{errors[key]}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--color-accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>

            {saved && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 14,
                  color: '#16a34a',
                  fontWeight: 500,
                }}
              >
                <CheckCircle size={16} />
                Profile updated
              </span>
            )}
          </div>
        </div>

        {/* Session Info */}
        <div
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
              marginBottom: 16,
            }}
          >
            Session Info
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Logged in as: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{form.fullName || 'Super Admin'}</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Role: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>Super Admin</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              Session expires in: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>30 days</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
  color: 'var(--color-error)',
  marginTop: 4,
  display: 'block',
}
