import { useState } from 'react'
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  HardDrive,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'

interface BackupRecord {
  id: string
  date: string
  size: string
  status: 'completed' | 'failed'
  type: 'manual' | 'scheduled'
}

const mockBackups: BackupRecord[] = [
  { id: 'bk-001', date: '2026-07-22 03:00 AM', size: '245 MB', status: 'completed', type: 'scheduled' },
  { id: 'bk-002', date: '2026-07-21 02:15 PM', size: '241 MB', status: 'completed', type: 'manual' },
  { id: 'bk-003', date: '2026-07-20 03:00 AM', size: '238 MB', status: 'failed', type: 'scheduled' },
  { id: 'bk-004', date: '2026-07-19 11:42 AM', size: '236 MB', status: 'completed', type: 'manual' },
]

export function SuperAdminBackupPage() {
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [dailyEnabled, setDailyEnabled] = useState(true)
  const [weeklyEnabled, setWeeklyEnabled] = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCreateBackup = () => {
    setCreating(true)
    setTimeout(() => {
      setCreating(false)
      showToast('Backup created successfully', 'success')
    }, 2000)
  }

  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '8px',
              backgroundColor: toast.type === 'success' ? 'var(--color-accent-pale)' : 'var(--color-error)',
              color: 'var(--color-text)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'opacity 0.3s ease',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} color="var(--color-accent)" />
            ) : (
              <AlertTriangle size={18} color="var(--color-error)" />
            )}
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{toast.message}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-accent-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HardDrive size={24} color="var(--color-accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                Backup & Restore
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                Create, schedule, and restore system data backups
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              {creating ? <Loader2 size={16} className="spin" /> : <Database size={16} />}
              {creating ? 'Creating...' : 'Create Backup'}
            </button>

            <div style={{ position: 'relative' }} title="Coming soon">
              <button
                disabled
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'not-allowed',
                  opacity: 0.5,
                }}
              >
                <Upload size={16} />
                Restore Backup
              </button>
            </div>
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
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                Backup History
              </h2>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg)' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Size</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockBackups.map((backup) => (
                  <tr
                    key={backup.id}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <td style={tdStyle}>{backup.date}</td>
                    <td style={tdStyle}>{backup.size}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor:
                            backup.type === 'manual' ? 'var(--color-accent-pale)' : 'var(--color-bg)',
                          color: backup.type === 'manual' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        }}
                      >
                        {backup.type === 'manual' ? 'Manual' : 'Scheduled'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor:
                            backup.status === 'completed' ? 'var(--color-accent-pale)' : '#fef2f2',
                          color:
                            backup.status === 'completed' ? 'var(--color-accent)' : 'var(--color-error)',
                        }}
                      >
                        {backup.status === 'completed' ? (
                          <CheckCircle size={12} />
                        ) : (
                          <AlertTriangle size={12} />
                        )}
                        {backup.status === 'completed' ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        title="Download backup"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: 'var(--color-bg)',
                          color: 'var(--color-text)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-accent)'
                          e.currentTarget.style.color = 'var(--color-accent)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.color = 'var(--color-text)'
                        }}
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                Scheduled Backups
              </h2>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                  Daily Backup
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Automatically backup every day at 3:00 AM
                </p>
              </div>
              <button
                onClick={() => setDailyEnabled(!dailyEnabled)}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: dailyEnabled ? 'var(--color-accent)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: dailyEnabled ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                  Weekly Backup
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Automatically backup every Sunday at 3:00 AM
                </p>
              </div>
              <button
                onClick={() => setWeeklyEnabled(!weeklyEnabled)}
                style={{
                  position: 'relative',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: weeklyEnabled ? 'var(--color-accent)' : 'var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: weeklyEnabled ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              <Clock size={16} color="var(--color-text-muted)" />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Last scheduled backup:{' '}
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  July 22, 2026 at 3:00 AM
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 640px) {
          table {
            font-size: 13px;
          }
        }
      `}</style>
    </SuperAdminLayout>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: '14px',
  color: 'var(--color-text)',
}
