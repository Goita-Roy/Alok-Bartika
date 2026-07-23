import { useState } from 'react'
import { Settings, Globe, Shield, Palette, Save, Loader2 } from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

export function SuperAdminPlatformPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    platformName: 'Alokbartika',
    supportEmail: 'support@alokbartika.com',
    allowRegistration: true,
    maintenanceMode: false,
    maxUploadSize: '10MB',
    defaultLanguage: 'English',
  })

  const handleSave = () => {
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 1200)
  }

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              backgroundColor: saved ? 'var(--color-accent-pale)' : 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
              fontWeight: 500,
              color: saved ? 'var(--color-accent)' : 'var(--color-text-muted)',
              transition: 'all 0.3s ease',
            }}
          >
            {saved ? (
              <>
                <Settings size={16} />
                Settings saved
              </>
            ) : (
              <>
                <Shield size={16} />
                Changes unsaved
              </>
            )}
          </div>
        </div>

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
              <Globe size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                General Settings
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* Platform Name */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '4px',
                    }}
                  >
                    Platform Name
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    The public name of your platform shown to all users
                  </p>
                  <input
                    type="text"
                    value={form.platformName}
                    onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Support Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '4px',
                    }}
                  >
                    Support Email
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Contact email for support inquiries and system notifications
                  </p>
                  <input
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registration & Access */}
          <div style={{ borderBottom: '1px solid var(--color-border)' }}>
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
              <Shield size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                Registration & Access
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* Allow Registration */}
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
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        marginBottom: '2px',
                      }}
                    >
                      Allow Registration
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Allow new users to register accounts on the platform
                    </p>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, allowRegistration: !form.allowRegistration })}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: form.allowRegistration ? 'var(--color-accent)' : 'var(--color-border)',
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
                        left: form.allowRegistration ? '23px' : '3px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>

                {/* Maintenance Mode */}
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
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        marginBottom: '2px',
                      }}
                    >
                      Maintenance Mode
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Temporarily disable access to the platform for non-admin users
                    </p>
                  </div>
                  <button
                    onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: form.maintenanceMode ? 'var(--color-accent)' : 'var(--color-border)',
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
                        left: form.maintenanceMode ? '23px' : '3px',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File & Language */}
          <div>
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
              <Palette size={18} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                File & Language
              </h3>
            </div>
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* Max Upload Size */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '4px',
                    }}
                  >
                    Max Upload Size
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Maximum file size allowed for document and image uploads
                  </p>
                  <select
                    value={form.maxUploadSize}
                    onChange={(e) => setForm({ ...form, maxUploadSize: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="5MB">5 MB</option>
                    <option value="10MB">10 MB</option>
                    <option value="25MB">25 MB</option>
                  </select>
                </div>

                {/* Default Language */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      marginBottom: '4px',
                    }}
                  >
                    Default Language
                  </label>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    Default language for new users and platform interface
                  </p>
                  <select
                    value={form.defaultLanguage}
                    onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: saving ? 'var(--color-border)' : 'var(--color-accent)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
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
      </div>
    </SuperAdminLayout>
  )
}
