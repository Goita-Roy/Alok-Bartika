import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Settings, Globe, Shield, Key, Mail, Save, Loader2, CheckCircle,
  AlertTriangle, RefreshCw, X,
} from 'lucide-react'
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

const inputCls =
  'input input-sm w-full transition-colors duration-200 focus:outline-none'
const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

function FieldRow({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{label}</label>
      {hint && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>}
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
      className="flex items-center justify-between rounded-xl p-3.5 transition-all duration-200"
      style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
    >
      <div className="min-w-0 pr-3">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        style={{
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
          cursor: 'pointer',
        }}
        role="switch"
        aria-checked={checked}
        aria-label={title}
      >
        <span
          className="inline-block h-5 w-5 transform rounded-full bg-white shadow"
          style={{
            translate: checked ? '104% 0' : '-4% 0',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-5 py-3.5 border-b"
      style={{
        backgroundColor: 'var(--color-accent-pale)',
        borderColor: 'var(--color-border)',
      }}
    >
      {icon}
      <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
    </div>
  )
}

export function SuperAdminSettingsPage() {
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleReset = () => {
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
      <div className="space-y-6 pb-24">
        {/* ── Premium hero header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-5 sm:p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>System Settings</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Configure system-wide platform settings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: statusBadge?.bg ?? 'var(--color-surface)',
                  color: statusBadge?.color ?? 'var(--color-text-muted)',
                  border: statusBadge?.border ?? '1px solid var(--color-border)',
                }}
              >
                {statusBadge && (
                  <>
                    {statusBadge.icon}
                    {statusBadge.text}
                  </>
                )}
              </div>
              <button
                onClick={() => loadSettings()}
                className="btn btn-sm btn-ghost"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Load error ── */}
        {loadError && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: 'rgba(226, 75, 74, 0.10)',
              border: '1px solid rgba(226, 75, 74, 0.2)',
              color: 'var(--color-error)',
            }}
          >
            <span className="flex items-center gap-2 font-semibold">
              <AlertTriangle size={16} />
              {loadError}
            </span>
            <button onClick={() => loadSettings()} className="btn btn-sm btn-ghost" style={{ color: 'var(--color-error)' }} aria-label="Retry">
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <div className="h-10 border-b" style={{ backgroundColor: 'var(--color-border)' }} />
                <div className="p-5 space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-3 rounded animate-pulse"
                      style={{ backgroundColor: 'var(--color-border)', width: j === 0 ? '60%' : '100%' }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* ── Platform ── */}
            <div
              className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SectionHeader icon={<Globe size={18} style={{ color: 'var(--color-accent)' }} />} title="Platform" />
              <div className="p-5 space-y-4">
                <FieldRow label="Platform Name" hint="The public name of your platform shown to all users" htmlFor="platformName">
                  <input
                    id="platformName"
                    type="text"
                    className={inputCls}
                    style={inputStyle}
                    value={form.platformName}
                    onChange={(e) => update('platformName', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Platform Description" hint="Short description shown on the platform" htmlFor="platformDescription">
                  <textarea
                    id="platformDescription"
                    className="textarea textarea-sm w-full resize-y"
                    style={inputStyle}
                    rows={3}
                    value={form.platformDescription}
                    onChange={(e) => update('platformDescription', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Logo URL" hint="URL of the platform logo" htmlFor="logo">
                  <input
                    id="logo"
                    type="url"
                    className={inputCls}
                    style={inputStyle}
                    placeholder="https://..."
                    value={form.logo}
                    onChange={(e) => update('logo', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Favicon URL" hint="URL of the platform favicon" htmlFor="favicon">
                  <input
                    id="favicon"
                    type="url"
                    className={inputCls}
                    style={inputStyle}
                    placeholder="https://..."
                    value={form.favicon}
                    onChange={(e) => update('favicon', e.target.value)}
                  />
                </FieldRow>
                <ToggleRow
                  title="Maintenance Mode"
                  description="Temporarily disable access to the platform for non-admin users"
                  checked={form.maintenanceMode}
                  onChange={(v) => update('maintenanceMode', v)}
                />
                <FieldRow label="Maintenance Message" hint="Message shown to users while maintenance mode is active" htmlFor="maintenanceMessage">
                  <textarea
                    id="maintenanceMessage"
                    className="textarea textarea-sm w-full resize-y"
                    style={inputStyle}
                    rows={2}
                    placeholder="We are currently performing scheduled maintenance..."
                    value={form.maintenanceMessage}
                    onChange={(e) => update('maintenanceMessage', e.target.value)}
                  />
                </FieldRow>
              </div>
            </div>

            {/* ── Security ── */}
            <div
              className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SectionHeader icon={<Key size={18} style={{ color: 'var(--color-accent)' }} />} title="Security" />
              <div className="p-5 space-y-4">
                <ToggleRow
                  title="Registration"
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
                  title="OTP Authentication"
                  description="Allow OTP-based verification for password reset and login"
                  checked={form.otpEnabled}
                  onChange={(v) => update('otpEnabled', v)}
                />
                <FieldRow label="Maximum Login Attempts" hint="Lock an account after this many failed login attempts" htmlFor="maxLoginAttempts">
                  <input
                    id="maxLoginAttempts"
                    type="number"
                    min={1}
                    max={100}
                    className={inputCls}
                    style={inputStyle}
                    value={form.maxLoginAttempts ?? ''}
                    onChange={updateNumber('maxLoginAttempts')}
                  />
                </FieldRow>
                <FieldRow label="Session Timeout (minutes)" hint="Inactive sessions are logged out after this many minutes" htmlFor="sessionTimeout">
                  <input
                    id="sessionTimeout"
                    type="number"
                    min={5}
                    max={1440}
                    className={inputCls}
                    style={inputStyle}
                    value={form.sessionTimeout ?? ''}
                    onChange={updateNumber('sessionTimeout')}
                  />
                </FieldRow>
              </div>
            </div>

            {/* ── Email ── */}
            <div
              className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SectionHeader icon={<Mail size={18} style={{ color: 'var(--color-accent)' }} />} title="Email" />
              <div className="p-5 space-y-4">
                <FieldRow label="Support Email" hint="Contact email for support inquiries and system notifications" htmlFor="supportEmail">
                  <input
                    id="supportEmail"
                    type="email"
                    className={inputCls}
                    style={inputStyle}
                    value={form.supportEmail}
                    onChange={(e) => update('supportEmail', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="Support Phone" hint="Contact phone number for support inquiries" htmlFor="supportPhone">
                  <input
                    id="supportPhone"
                    type="tel"
                    className={inputCls}
                    style={inputStyle}
                    placeholder="+880..."
                    value={form.supportPhone}
                    onChange={(e) => update('supportPhone', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="SMTP Host" hint="Outgoing mail server hostname" htmlFor="smtpHost">
                  <input
                    id="smtpHost"
                    type="text"
                    className={inputCls}
                    style={inputStyle}
                    placeholder="smtp.gmail.com"
                    value={form.smtpHost}
                    onChange={(e) => update('smtpHost', e.target.value)}
                  />
                </FieldRow>
                <FieldRow label="SMTP Port" hint="Outgoing mail server port (1–65535)" htmlFor="smtpPort">
                  <input
                    id="smtpPort"
                    type="number"
                    min={1}
                    max={65535}
                    className={inputCls}
                    style={inputStyle}
                    value={form.smtpPort ?? ''}
                    onChange={updateNumber('smtpPort')}
                  />
                </FieldRow>
                <FieldRow label="SMTP User" hint="Username for SMTP authentication" htmlFor="smtpUser">
                  <input
                    id="smtpUser"
                    type="text"
                    className={inputCls}
                    style={inputStyle}
                    value={form.smtpUser}
                    onChange={(e) => update('smtpUser', e.target.value)}
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

            {/* ── System ── */}
            <div
              className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <SectionHeader icon={<Shield size={18} style={{ color: 'var(--color-accent)' }} />} title="System" />
              <div className="p-5 space-y-4">
                <ToggleRow
                  title="Google OAuth"
                  description="Allow users to sign in with their Google accounts"
                  checked={form.googleOAuthEnabled}
                  onChange={(v) => update('googleOAuthEnabled', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Sticky Save / Reset bar ── */}
        {loading ? null : loadError ? null : (
          <div className="fixed inset-x-0 bottom-0 z-30">
            <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6">
              <div
                className="rounded-2xl shadow-lg border flex items-center justify-between px-4 py-3 sm:py-3.5"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <button
                  onClick={handleReset}
                  disabled={!isDirty || saving}
                  className="btn btn-sm btn-ghost"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className="btn btn-sm font-semibold gap-2"
                  style={{
                    backgroundColor: !isDirty || saving ? 'var(--color-border)' : 'var(--color-accent)',
                    color: '#fff',
                    border: 'none',
                    opacity: saving ? 0.75 : 1,
                  }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
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
      </div>
    </SuperAdminLayout>
  )
}
