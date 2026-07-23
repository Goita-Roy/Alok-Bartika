import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { Shield, Clock, UserCheck, UserX, LogIn, Settings, AlertTriangle, Key, Database } from 'lucide-react'

interface AuditEvent {
  id: string
  icon: typeof Shield
  iconColor: string
  iconBg: string
  action: string
  actor: string
  detail: string
  time: string
  severity: 'info' | 'warning' | 'danger'
}

const mockEvents: AuditEvent[] = [
  { id: '1', icon: LogIn, iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.10)', action: 'Admin Login', actor: 'superadmin@alokbartika.com', detail: 'Successful login from 192.168.1.1', time: '2 minutes ago', severity: 'info' },
  { id: '2', icon: UserCheck, iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.10)', action: 'Admin Created', actor: 'superadmin@alokbartika.com', detail: 'Created admin account: admin@alokbartika.com', time: '1 hour ago', severity: 'info' },
  { id: '3', icon: AlertTriangle, iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.10)', action: 'Failed Login', actor: 'unknown@test.com', detail: '3 failed attempts from IP 10.0.0.5', time: '3 hours ago', severity: 'warning' },
  { id: '4', icon: UserX, iconColor: '#dc2626', iconBg: 'rgba(220,38,38,0.10)', action: 'Admin Suspended', actor: 'superadmin@alokbartika.com', detail: 'Suspended admin: test-admin@alokbartika.com', time: '1 day ago', severity: 'danger' },
  { id: '5', icon: Settings, iconColor: '#7c3aed', iconBg: 'rgba(124,58,237,0.10)', action: 'Settings Changed', actor: 'superadmin@alokbartika.com', detail: 'Platform name updated', time: '2 days ago', severity: 'info' },
  { id: '6', icon: Key, iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.10)', action: 'Password Reset', actor: 'superadmin@alokbartika.com', detail: 'Reset password for admin@alokbartika.com', time: '3 days ago', severity: 'info' },
  { id: '7', icon: Database, iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.10)', action: 'Backup Completed', actor: 'System', detail: 'Automated daily backup succeeded', time: '3 days ago', severity: 'info' },
  { id: '8', icon: AlertTriangle, iconColor: '#dc2626', iconBg: 'rgba(220,38,38,0.10)', action: 'Unauthorized Access', actor: 'unknown', detail: 'Attempted access to /super-admin from student session', time: '5 days ago', severity: 'danger' },
]

const severityStyles: Record<string, { bg: string; color: string; border: string }> = {
  info: { bg: 'rgba(59,130,246,0.08)', color: '#3b82f6', border: 'rgba(59,130,246,0.2)' },
  warning: { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)' },
  danger: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626', border: 'rgba(220,38,38,0.2)' },
}

export function SuperAdminSecurityPage() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-pale)' }}>
            <Shield size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Security & Audit Logs</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Monitor platform security and activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-5 flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.10)' }}>
                <LogIn size={22} style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Successful Logins</p>
                <p className="text-2xl font-bold" style={{ color: '#3b82f6' }}>24</p>
              </div>
            </div>
          </div>
          <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-5 flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.10)' }}>
                <AlertTriangle size={22} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Failed Attempts</p>
                <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>3</p>
              </div>
            </div>
          </div>
          <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="card-body p-5 flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.10)' }}>
                <Shield size={22} style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Critical Events</p>
                <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="card-body p-6">
            <h2 className="text-base font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Clock size={18} style={{ color: 'var(--color-accent)' }} />
              Audit Log
            </h2>
            <div className="space-y-0">
              {mockEvents.map((event, idx) => {
                const Icon = event.icon
                const sev = severityStyles[event.severity]
                return (
                  <div key={event.id} className="flex gap-4" style={{ paddingBottom: idx < mockEvents.length - 1 ? '20px' : '0' }}>
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: event.iconBg }}>
                        <Icon size={16} style={{ color: event.iconColor }} />
                      </div>
                      {idx < mockEvents.length - 1 && (
                        <div className="w-px flex-1 mt-2" style={{ background: 'var(--color-border)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{event.action}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold self-start" style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                          {event.severity}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{event.time}</span>
                      </div>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{event.detail}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>by {event.actor}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
