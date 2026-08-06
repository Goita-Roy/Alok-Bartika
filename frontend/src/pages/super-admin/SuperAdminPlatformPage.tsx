import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Settings, Globe, Shield, Key, Mail, Database, Save, Loader2,
  CheckCircle, AlertTriangle, RefreshCw, CalendarRange,
  Info, UserPlus,
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

type TabId = 'general' | 'security' | 'email' | 'maintenance' | 'backup'

const TABS: { id: TabId; label: string; icon: React.ReactElement }[] = [
  { id: 'general', label: 'General', icon: <Globe size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  { id: 'email', label: 'Email', icon: <Mail size={16} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Settings size={16} /> },
  { id: 'backup', label: 'Backup', icon: <Database size={16} /> },
]

const inputCls =
  'w-full rounded-xl border bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15'

const labelCls =
  'block text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1'

export function SuperAdminPlatformPage() {
  const { token } = useAuth()

  const [form, setForm] = useState<Settings>(DEFAULT_FORM)
  const savedRef = useRef<Settings>(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('general')

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ── Tab panel renderers ──────────────────────────────────────────────────

  function renderGeneralTab() {
    return (
      <>
        {/* Platform Identity */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md mb-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span style={{ color: 'var(--color-accent)' }}><Globe size={20} /></span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Platform Identity</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Basic platform information visible to users</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">
            <div>
              <label className={labelCls} htmlFor="platformName">Platform Name</label>
              <input
                id="platformName"
                type="text"
                value={form.platformName}
                onChange={(e) => update('platformName', e.target.value)}
                className={inputCls}
                placeholder="Alokbartika"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="supportEmail">Support Email</label>
              <input
                id="supportEmail"
                type="email"
                value={form.supportEmail}
                onChange={(e) => update('supportEmail', e.target.value)}
                className={inputCls}
                placeholder="support@alokbartika.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="platformDescription">Platform Description</label>
              <input
                id="platformDescription"
                type="text"
                value={form.platformDescription}
                onChange={(e) => update('platformDescription', e.target.value)}
                className={inputCls}
                placeholder="Short description of your platform"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="supportPhone">Support Phone</label>
              <input
                id="supportPhone"
                type="tel"
                value={form.supportPhone}
                onChange={(e) => update('supportPhone', e.target.value)}
                className={inputCls}
                placeholder="+880..."
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="logo">Logo URL</label>
              <input
                id="logo"
                type="text"
                value={form.logo}
                onChange={(e) => update('logo', e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="favicon">Favicon URL</label>
              <input
                id="favicon"
                type="text"
                value={form.favicon}
                onChange={(e) => update('favicon', e.target.value)}
                className={inputCls}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Registration */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span style={{ color: 'var(--color-accent)' }}><UserPlus size={20} /></span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Registration & Access</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Who can join and how they authenticate</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <ToggleRow
              title="Allow New Registrations"
              description="Allow new users to register accounts on the platform"
              checked={form.registrationEnabled}
              onChange={(v) => update('registrationEnabled', v)}
            />
            <ToggleRow
              title="Google OAuth Login"
              description="Allow users to sign in with their Google accounts"
              checked={form.googleOAuthEnabled}
              onChange={(v) => update('googleOAuthEnabled', v)}
            />
            <ToggleRow
              title="Email Verification Required"
              description="Require email verification before users can access the platform"
              checked={form.emailVerificationRequired}
              onChange={(v) => update('emailVerificationRequired', v)}
            />
            <ToggleRow
              title="OTP Verification"
              description="Enable OTP-based verification for password reset and login"
              checked={form.otpEnabled}
              onChange={(v) => update('otpEnabled', v)}
            />
          </div>
        </div>
      </>
    )
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-6">
        {/* Authentication Policy */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span style={{ color: 'var(--color-accent)' }}><Key size={20} /></span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Authentication Policy</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Password, session, and login attempt settings</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">
            <div>
              <label className={labelCls} htmlFor="maxLoginAttempts">Maximum Login Attempts</label>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Lock an account after this many failed login attempts
              </p>
              <input
                id="maxLoginAttempts"
                type="number"
                min={1}
                max={100}
                value={form.maxLoginAttempts ?? ''}
                onChange={updateNumber('maxLoginAttempts')}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Inactive sessions expire after this many minutes
              </p>
              <input
                id="sessionTimeout"
                type="number"
                min={5}
                max={1440}
                value={form.sessionTimeout ?? ''}
                onChange={updateNumber('sessionTimeout')}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderEmailTab() {
    return (
      <div className="space-y-6">
        {/* SMTP Configuration */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span style={{ color: 'var(--color-accent)' }}><Mail size={20} /></span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>SMTP Configuration</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Outgoing mail server settings for email delivery</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">
            <div>
              <label className={labelCls} htmlFor="smtpHost">SMTP Host</label>
              <input
                id="smtpHost"
                type="text"
                value={form.smtpHost}
                onChange={(e) => update('smtpHost', e.target.value)}
                className={inputCls}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="smtpPort">SMTP Port</label>
              <input
                id="smtpPort"
                type="number"
                min={1}
                max={65535}
                value={form.smtpPort ?? ''}
                onChange={updateNumber('smtpPort')}
                className={inputCls}
                placeholder="587"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="smtpUser">SMTP User (Sender Identity)</label>
              <input
                id="smtpUser"
                type="text"
                value={form.smtpUser}
                onChange={(e) => update('smtpUser', e.target.value)}
                className={inputCls}
                placeholder="noreply@yourplatform.com"
              />
            </div>
            <div className="sm:col-span-2">
              <ToggleRow
                title="SMTP Secure (TLS/SSL)"
                description="Use a secure encrypted connection for email delivery"
                checked={form.smtpSecure}
                onChange={(v) => update('smtpSecure', v)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="smtpSenderEmail">Sender Email</label>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                The email address from which system notifications are sent (uses Support Email)
              </p>
              <input
                id="smtpSenderEmail"
                type="email"
                value={form.supportEmail}
                onChange={(e) => update('supportEmail', e.target.value)}
                className={inputCls}
                readOnly
                style={{ backgroundColor: 'rgba(128,128,128,0.06)', cursor: 'default' }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderMaintenanceTab() {
    return (
      <div className="space-y-6">
        {/* Maintenance Mode */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-b"
            style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <span style={{ color: 'var(--color-accent)' }}><Settings size={20} /></span>
            </div>
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Maintenance Mode</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Temporarily restrict access while performing updates</p>
            </div>
          </div>
          <div className="p-6">
            <ToggleRow
              title="Enable Maintenance Mode"
              description="Block non-admin access and display a maintenance message to visitors"
              checked={form.maintenanceMode}
              onChange={(v) => update('maintenanceMode', v)}
            />

            {!form.maintenanceMode ? null : (
              <div
                className="mt-4 p-4 rounded-xl border"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.08)',
                  borderColor: 'rgba(245,158,11,0.3)',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} style={{ color: '#f59e0b', marginTop: '2px' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>
                      Maintenance mode is active
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      When enabled, the platform will be inaccessible to students and regular users.
                      Only Super Admins and administrators can access the platform.
                      Ensure the maintenance message below is clear and helpful.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className={labelCls} htmlFor="maintenanceMessage">Maintenance Message</label>
              <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Message shown to users while maintenance mode is active
              </p>
              <textarea
                id="maintenanceMessage"
                value={form.maintenanceMessage}
                onChange={(e) => update('maintenanceMessage', e.target.value)}
                className={inputCls}
                placeholder="We are currently performing scheduled maintenance. Please check back soon."
                rows={3}
                disabled={!form.maintenanceMode}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderBackupTab() {
    return (
      <div
        className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderBottomColor: 'var(--color-border)', backgroundColor: 'var(--color-accent-pale)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <span style={{ color: 'var(--color-accent)' }}><Database size={20} /></span>
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Backup Configuration</h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Database and platform backup settings</p>
          </div>
        </div>
        <div className="p-6">
          <div
            className="flex items-start gap-3 p-4 rounded-xl border"
            style={{
              backgroundColor: 'rgba(59,130,246,0.06)',
              borderColor: 'rgba(59,130,246,0.2)',
            }}
          >
            <Info size={20} style={{ color: '#3b82f6', marginTop: '2px' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#3b82f6' }}>
                Automatic backup configuration is not available in the current backend.
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Backup scheduling and retention settings will appear here once the backend supports them.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tabRenderers: Record<TabId, () => React.ReactNode> = {
    general: renderGeneralTab,
    security: renderSecurityTab,
    email: renderEmailTab,
    maintenance: renderMaintenanceTab,
    backup: renderBackupTab,
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* ── Premium hero header ── */}
        <div
          className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md p-6 lg:p-8"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
              >
                <Settings size={26} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Platform Settings
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Configure system-wide platform preferences and policies
                </p>
                <p
                  className="inline-flex items-center gap-1.5 text-xs font-semibold mt-2.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <CalendarRange size={14} />
                  {today}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadSettings()}
                className="btn btn-sm btn-ghost transition-transform duration-200 hover:scale-110"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Reload settings"
              >
                <RefreshCw size={16} />
              </button>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isDirty ? 'rgba(245,158,11,0.08)' : 'var(--color-accent-pale)',
                  color: isDirty ? '#f59e0b' : 'var(--color-accent)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {isDirty ? <Settings size={14} /> : <CheckCircle size={14} />}
                {isDirty ? 'Unsaved Changes' : 'All Changes Saved'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Error state ── */}
        {loadError && (
          <div
            className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} />
              {loadError}
            </span>
            <button onClick={() => loadSettings()} className="btn btn-sm btn-ghost" style={{ color: '#dc2626' }} aria-label="Retry">
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={38} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading settings…</p>
          </div>
        ) : (
          <>
            {/* ── Tab navigation ── */}
            <div
              className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-1 p-2 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      style={{
                        backgroundColor: isActive ? 'var(--color-accent-pale)' : 'transparent',
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: isActive ? '2px solid var(--color-accent)' : 'transparent',
                      }}
                      aria-pressed={isActive}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="pb-20">
              {tabRenderers[activeTab]()}
            </div>

            {/* ── Sticky bottom action bar ── */}
            <div
              className="fixed bottom-0 left-0 right-0 border-t shadow-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 py-4 gap-4">
                <div className="flex items-center gap-3">
                  {isDirty ? (
                    <>
                      <Settings size={16} style={{ color: '#f59e0b' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        You have unsaved changes
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} style={{ color: 'var(--color-accent)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        All changes saved
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={!isDirty || saving}
                    className="btn btn-sm btn-ghost transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className="btn btn-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                    style={{
                      backgroundColor: saving || !isDirty ? 'var(--color-border)' : 'var(--color-accent)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
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
              </div>
            </div>
          </>
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

// ── Reusable sub-components ───────────────────────────────────────────────

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
      className="flex items-center justify-between rounded-xl border p-4 transition-all duration-200"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      <div>
        <label className="block text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </label>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
          cursor: 'pointer',
        }}
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
