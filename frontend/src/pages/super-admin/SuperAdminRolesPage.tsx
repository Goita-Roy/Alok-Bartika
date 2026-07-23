import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import {
  Key,
  Shield,
  Users,
  GraduationCap,
  UserCheck,
  Crown,
  Check,
  X,
} from 'lucide-react'

const permissions = [
  'Manage Users',
  'Manage Admins',
  'Manage Courses',
  'Manage Lessons',
  'Manage Exams',
  'Manage Notices',
  'Student Support',
  'Platform Settings',
  'Security Logs',
  'Backup & Restore',
  'Analytics',
  'Role Management',
]

interface Role {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  color: string
  allowedPermissions: string[]
}

const roles: Role[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    icon: <Crown className="w-6 h-6" />,
    description:
      'Full access to every feature and setting across the entire platform. Can manage all users, roles, and system configurations.',
    color: 'var(--color-accent)',
    allowedPermissions: [...permissions],
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: <Shield className="w-6 h-6" />,
    description:
      'Manages students, courses, lessons, exams, notices, and student support tickets. Cannot access platform settings or security logs.',
    color: 'var(--color-accent)',
    allowedPermissions: [
      'Manage Users',
      'Manage Courses',
      'Manage Lessons',
      'Manage Exams',
      'Manage Notices',
      'Student Support',
      'Analytics',
    ],
  },
  {
    id: 'teacher',
    name: 'Teacher',
    icon: <Users className="w-6 h-6" />,
    description:
      'Views assigned courses and manages lesson content. Can track student progress within their courses but cannot modify exams or system settings.',
    color: 'var(--color-accent)',
    allowedPermissions: ['Manage Courses', 'Manage Lessons', 'Analytics'],
  },
  {
    id: 'student',
    name: 'Student',
    icon: <GraduationCap className="w-6 h-6" />,
    description:
      'Accesses enrolled courses, takes exams, and views their personal dashboard and results. No administrative permissions.',
    color: 'var(--color-accent)',
    allowedPermissions: ['Manage Courses', 'Manage Exams'],
  },
  {
    id: 'parent',
    name: 'Parent',
    icon: <UserCheck className="w-6 h-6" />,
    description:
      'Views child progress, attendance, and exam results. Can communicate with teachers through the support system.',
    color: 'var(--color-accent)',
    allowedPermissions: ['Student Support'],
  },
]

export function SuperAdminRolesPage() {
  return (
    <SuperAdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '0.75rem',
                background: 'var(--color-accent-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key style={{ width: '1.35rem', height: '1.35rem', color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  lineHeight: 1.2,
                }}
              >
                Roles & Permissions
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                Overview of system roles and their access levels
              </p>
            </div>
          </div>

          <div className="badge badge-outline" style={{ gap: '0.35rem', color: 'var(--color-text-muted)' }}>
            <Key style={{ width: '0.8rem', height: '0.8rem' }} />
            <span>{roles.length} Roles</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>{permissions.length} Permissions</span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {roles.map((role) => (
            <div
              key={role.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 4px 16px rgba(0,0,0,0.06)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: '0.65rem',
                    background: 'var(--color-accent-pale)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-accent)',
                    flexShrink: 0,
                  }}
                >
                  {role.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 650,
                      color: 'var(--color-text)',
                      lineHeight: 1.3,
                    }}
                  >
                    {role.name}
                  </h3>
                  <span className="badge badge-sm" style={{ background: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: 'none', marginTop: '0.2rem' }}>
                    {role.id}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.55,
                }}
              >
                {role.description}
              </p>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
                <p
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)',
                    marginBottom: '0.6rem',
                  }}
                >
                  Permissions
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.35rem',
                  }}
                >
                  {permissions.map((perm) => {
                    const granted = role.allowedPermissions.includes(perm)
                    return (
                      <div
                        key={perm}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.45rem',
                          borderRadius: '0.35rem',
                          background: granted ? 'transparent' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        {granted ? (
                          <Check
                            style={{
                              width: '0.85rem',
                              height: '0.85rem',
                              color: '#16a34a',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <X
                            style={{
                              width: '0.85rem',
                              height: '0.85rem',
                              color: 'var(--color-error)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            color: granted ? 'var(--color-text)' : 'var(--color-text-muted)',
                            opacity: granted ? 1 : 0.5,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {perm}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                <div className="badge badge-outline" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    {role.allowedPermissions.length}
                  </span>
                  <span>/</span>
                  <span>{permissions.length}</span>
                  <span>permissions granted</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: 'var(--color-accent-pale)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Key style={{ width: '1rem', height: '1rem', color: 'var(--color-accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
              About Permissions
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.55,
                marginTop: '0.25rem',
              }}
            >
              Permissions define what actions each role can perform across the platform. The Super Admin
              role has unrestricted access to all features. Other roles are limited to specific modules.
              Contact the platform owner to request role changes or custom permission sets.
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
