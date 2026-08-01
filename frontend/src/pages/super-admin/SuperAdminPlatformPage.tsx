import { useState, useEffect, useMemo, useRef } from 'react'
import { Settings, Globe, Shield, Key, Mail, Save, Loader2, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

interface Settings {
  platformName: string
  platformDescription: string
  supportEmail: string
  supportPhone: string
  logo: string
  favicon: string
  maintenanceMode: boolean
  maintenanceMessage: string
  googleOAuthEnabled: boolean
  emailVerificationRequired: boolean
  otpEnabled: boolean
  registrationEnabled: boolean
  maxLoginAttempts: number | null
  sessionTimeout: number | null
  smtpHost: string
  smtpPort: number | null
  smtpUser: string
  smtpSecure: boolean
}

type SettingsField = keyof Settings
type NumericField = 'maxLoginAttempts' | 'sessionTimeout' | 'smtpPort'

const DEFAULT_FORM: Settings = {
  platformName: 'Alokbartika',
  platformDescription: '',
  supportEmail: 'support@alokbartika.com',
  supportPhone: '',
  logo: '',
  favicon: '',
  maintenanceMode: false,
  maintenanceMessage: '',
  googleOAuthEnabled: false,
  emailVerificationRequired: false,
  otpEnabled: true,
  registrationEnabled: true,
  maxLoginAttempts: 5,
  sessionTimeout: 30,
  smtpHost: '',
  smtpPort: 587,
  smtpUser: '',
  smtpSecure: false,
}

function normalize(d: Partial<Settings>): Settings {
  return {
    platformName: typeof d.platformName === 'string' ? d.platformName : DEFAULT_FORM.platformName,
    platformDescription: typeof d.platformDescription === 'string' ? d.platformDescription : '',
    supportEmail: typeof d.supportEmail === 'string' ? d.supportEmail : '',
    supportPhone: typeof d.supportPhone === 'string' ? d.supportPhone : '',
    logo: typeof d.logo === 'string' ? d.logo : '',
    favicon: typeof d.favicon === 'string' ? d.favicon : '',
    maintenanceMode: !!d.maintenanceMode,
    maintenanceMessage: typeof d.maintenanceMessage === 'string' ? d.maintenanceMessage : '',
    googleOAuthEnabled: !!d.googleOAuthEnabled,
    emailVerificationRequired: !!d.emailVerificationRequired,
    otpEnabled: !!d.otpEnabled,
    registrationEnabled: !!d.registrationEnabled,
    maxLoginAttempts: typeof d.maxLoginAttempts === 'number' ? d.maxLoginAttempts : null,
    sessionTimeout: typeof d.sessionTimeout === 'number' ? d.sessionTimeout : null,
    smtpHost: typeof d.smtpHost === 'string' ? d.smtpHost : '',
    smtpPort: typeof d.smtpPort === 'number' ? d.smtpPort : null,
    smtpUser: typeof d.smtpUser === 'string' ? d.smtpUser : '',
    smtpSecure: !!d.smtpSecure,
  }
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{hint}</p>}
      {children}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div>
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
          {title}
        </label>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          flexShrink: 0,
          marginLeft: '16px',
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: 'white',
            position: 'absolute',
            top: '3px',
            left: checked ? '23px' : '3px',
            transition: 'left 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '20px 24px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-accent-pale)',
      }}
    >
      {icon}
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{title}</h3>
    </div>
  )
}

export function SuperAdminPlatformPage() {
  const { token } = useAuth()

  const [form, setForm] = useState<Settings>(DEFAULT_FORM)
  const savedRef = useRef<Settings>(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadSettings = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true)
      setLoadError(null)
      const res = await fetch(`${API_BASE_URL}/system/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 403) throw new Error('Access denied. Super Admin privileges required.')
        if (res.status === 401) throw new Error('Session expired. Please log in again.')
        throw new Error('Failed to load settings')
      }
      const json = await res.json()
      const normalized = normalize(json.data)
      savedRef.current = normalized
      setForm(normalized)
      setSaved(true)
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedRef.current),
    [form]
  )

  const update = (field: SettingsField, value: string | number | boolean | null) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const updateNumber =
    (field: NumericField) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      update(field, v === '' ? null : Number(v))
    }

  const handleSave = async () => {
    if (!isDirty || saving) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`${API_BASE_URL}/system/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || 'Failed to save settings')
      }
      const normalized = normalize(json.data)
      savedRef.current = normalized
      setForm(normalized)
      setSaved(true)
      showToast('Settings saved successfully', 'success')
      loadSettings({ silent: true })
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (saving) return
    setForm(JSON.parse(JSON.stringify(savedRef.current)))
    setSaved(true)
  }

  const statusBadge = loading
    ? null
    : loadError
      ? null
      : isDirty
        ? {
            bg: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            icon: <Shield size={16} />,
            text: 'Changes unsaved',
          }
        : {
            bg: 'var(--color-accent-pale)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
            icon: <Settings size={16} />,
            text: 'Settings saved',
          }

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '4px',
              }}
            >
              Platform Settings
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Configure system-wide settings
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: statusBadge?.bg ?? 'var(--color-surface)',
              border: statusBadge?.border ?? '1px solid var(--color-border)',
              fontSize: '13px',
              fontWeight: 500,
              color: statusBadge?.color ?? 'var(--color-text-muted)',
              transition: 'all 0.3s ease',
            }}
          >
            {statusBadge && (
              <>
                {statusBadge.icon}
                {statusBadge.text}
              </>
            )}
          </div>
        </div>

        {loadError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: 'rgba(226,75,74,0.10)',
              border: '1px solid rgba(226,75,74,0.2)',
              color: 'var(--color-error)',
              fontSize: '14px',
            }}
          >
            <span className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} />
              {loadError}
            </span>
            <button onClick={() => loadSettings()} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-error)' }}>
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
              gap: '16px',
            }}
          >
            <Loader2 size={36} style={{ color: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading settings…</p>
          </div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* General Settings */}
              <div style={{ borderBottom: '1px solid var(--color-border)' }}>
                <SectionHeader
                  icon={<Globe size={18} style={{ color: 'var(--color-accent)' }} />}
                  title="General Settings"
                />
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                      gap: '24px',
                    }}
                  >
                    <FieldRow label="Platform Name" hint="The public name of your platform shown to all users">
                      <input
                        type="text"
                        value={form.platformName}
                        onChange={(e) => update('platformName', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Platform Description" hint="Short description shown on the platform">
                      <input
                        type="text"
                        value={form.platformDescription}
                        onChange={(e) => update('platformDescription', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Support Email" hint="Contact email for support inquiries and system notifications">
                      <input
                        type="email"
                        value={form.supportEmail}
                        onChange={(e) => update('supportEmail', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Support Phone" hint="Contact phone number for support inquiries">
                      <input
                        type="tel"
                        value={form.supportPhone}
                        placeholder="+880..."
                        onChange={(e) => update('supportPhone', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Logo URL" hint="URL of the platform logo">
                      <input
                        type="text"
                        value={form.logo}
                        onChange={(e) => update('logo', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Favicon URL" hint="URL of the platform favicon">
                      <input
                        type="text"
                        value={form.favicon}
                        onChange={(e) => update('favicon', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                  </div>
                </div>
              </div>

              {/* Registration & Access */}
              <div style={{ borderBottom: '1px solid var(--color-border)' }}>
                <SectionHeader
                  icon={<Shield size={18} style={{ color: 'var(--color-accent)' }} />}
                  title="Registration & Access"
                />
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                      gap: '16px',
                    }}
                  >
                    <ToggleRow
                      title="Allow Registration"
                      description="Allow new users to register accounts on the platform"
                      checked={form.registrationEnabled}
                      onChange={(v) => update('registrationEnabled', v)}
                    />
                    <ToggleRow
                      title="Email Verification Required"
                      description="Require users to verify their email before accessing the platform"
                      checked={form.emailVerificationRequired}
                      onChange={(v) => update('emailVerificationRequired', v)}
                    />
                    <ToggleRow
                      title="OTP Enabled"
                      description="Allow OTP-based verification for password reset and login"
                      checked={form.otpEnabled}
                      onChange={(v) => update('otpEnabled', v)}
                    />
                    <ToggleRow
                      title="Google OAuth"
                      description="Allow sign in with Google accounts"
                      checked={form.googleOAuthEnabled}
                      onChange={(v) => update('googleOAuthEnabled', v)}
                    />
                    <ToggleRow
                      title="Maintenance Mode"
                      description="Temporarily disable access to the platform for non-admin users"
                      checked={form.maintenanceMode}
                      onChange={(v) => update('maintenanceMode', v)}
                    />
                    <div style={{ display: 'flex', alignItems: 'stretch', flexDirection: 'column' }}>
                      <ToggleRow
                        title="Maintenance Message"
                        description="Message shown to users while maintenance mode is active"
                        checked={form.maintenanceMode}
                        onChange={(v) => update('maintenanceMode', v)}
                      />
                      <div style={{ marginTop: '12px' }}>
                        <input
                          type="text"
                          value={form.maintenanceMessage}
                          placeholder="We are currently performing scheduled maintenance..."
                          onChange={(e) => update('maintenanceMessage', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Session */}
              <div style={{ borderBottom: '1px solid var(--color-border)' }}>
                <SectionHeader
                  icon={<Key size={18} style={{ color: 'var(--color-accent)' }} />}
                  title="Security & Session"
                />
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                      gap: '24px',
                    }}
                  >
                    <FieldRow label="Maximum Login Attempts" hint="Lock an account after this many failed login attempts">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={form.maxLoginAttempts ?? ''}
                        onChange={updateNumber('maxLoginAttempts')}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="Session Timeout (minutes)" hint="Inactive sessions are logged out after this many minutes">
                      <input
                        type="number"
                        min={5}
                        max={1440}
                        value={form.sessionTimeout ?? ''}
                        onChange={updateNumber('sessionTimeout')}
                        style={inputStyle}
                      />
                    </FieldRow>
                  </div>
                </div>
              </div>

              {/* SMTP Settings */}
              <div>
                <SectionHeader
                  icon={<Mail size={18} style={{ color: 'var(--color-accent)' }} />}
                  title="SMTP Settings"
                />
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
                      gap: '24px',
                    }}
                  >
                    <FieldRow label="SMTP Host" hint="Outgoing mail server hostname">
                      <input
                        type="text"
                        value={form.smtpHost}
                        placeholder="smtp.gmail.com"
                        onChange={(e) => update('smtpHost', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="SMTP Port" hint="Outgoing mail server port (1–65535)">
                      <input
                        type="number"
                        min={1}
                        max={65535}
                        value={form.smtpPort ?? ''}
                        onChange={updateNumber('smtpPort')}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <FieldRow label="SMTP User" hint="Username for SMTP authentication">
                      <input
                        type="text"
                        value={form.smtpUser}
                        onChange={(e) => update('smtpUser', e.target.value)}
                        style={inputStyle}
                      />
                    </FieldRow>
                    <ToggleRow
                      title="SMTP Secure"
                      description="Use a secure TLS connection (SSL/TLS)"
                      checked={form.smtpSecure}
                      onChange={(v) => update('smtpSecure', v)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              {isDirty && (
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: saving || !isDirty ? 'var(--color-border)' : 'var(--color-accent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: saving || !isDirty ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
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
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className="toast toast-end toast-bottom z-50">
          <div
            className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg text-sm font-semibold`}
            style={{ border: 'none' }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {toast.message}
          </div>
        </div>
      )}

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
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--color-text)',
  marginBottom: '4px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
}
