import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Key, Shield, Users, GraduationCap, Crown, LayoutDashboard,
  Save, Loader2, CheckCircle, AlertTriangle, RefreshCw,
  CalendarRange, Info, Search, Check, X,
} from 'lucide-react'
import { SuperAdminLayout } from '../../components/super-admin/SuperAdminLayout'
import { useAuth } from '../../context/AuthContext'
import { API_BASE_URL } from '../../config/api'

const PERMISSION_MODULES = [
  'Dashboard',
  'Users',
  'Admins',
  'Courses',
  'Lessons',
  'Questions',
  'Exams',
  'Exam Monitoring',
  'Feedback',
  'Analytics',
  'Platform Settings',
  'Role Management',
]

const PERMISSION_ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Export', 'Manage']

type RoleKey = 'super-admin' | 'admin' | 'student'

interface RoleDef {
  id: RoleKey
  name: string
  icon: React.ReactNode
  description: string
  color: string
}

const ROLES: RoleDef[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    icon: <Crown size={20} />,
    description: 'Full access to every feature and setting across the entire platform.',
    color: 'var(--color-accent)',
  },
  {
    id: 'admin',
    name: 'Admin',
    icon: <Shield size={20} />,
    description: 'Manages students, courses, lessons, exams, and support tickets. Cannot access platform settings or role management.',
    color: 'var(--color-accent)',
  },
  {
    id: 'student',
    name: 'Student',
    icon: <GraduationCap size={20} />,
    description: 'Accesses enrolled courses, takes exams, and views personal dashboard and results.',
    color: 'var(--color-accent)',
  },
]

// Default permission seeds per role — represents current backend capabilities.
function getDefaultPermissions(role: RoleKey): Record<string, boolean> {
  const perms: Record<string, boolean> = {}
  PERMISSION_MODULES.forEach((mod) => {
    PERMISSION_ACTIONS.forEach((act) => {
      const key = `${mod}|${act}`
      if (role === 'super-admin') {
        perms[key] = true
      } else if (role === 'admin') {
        perms[key] =
          (mod === 'Dashboard' && act === 'View') ||
          (mod === 'Users' && ['View', 'Create', 'Edit'].includes(act)) ||
          (mod === 'Admins' && act === 'View') ||
          (mod === 'Courses' && ['View', 'Create', 'Edit'].includes(act)) ||
          (mod === 'Lessons' && ['View', 'Create', 'Edit'].includes(act)) ||
          (mod === 'Questions' && ['View', 'Create'].includes(act)) ||
          (mod === 'Exams' && ['View', 'Create', 'Edit'].includes(act)) ||
          (mod === 'Exam Monitoring' && act === 'View') ||
          (mod === 'Feedback' && ['View', 'Create'].includes(act)) ||
          (mod === 'Analytics' && act === 'View') ||
          false
      } else {
        perms[key] = mod === 'Dashboard' && act === 'View'
      }
    })
  })
  return perms
}

export function SuperAdminRolesPage() {
  const { token } = useAuth()
  const [activeRole, setActiveRole] = useState<RoleKey>('super-admin')
  const [permissions, setPermissions] = useState<Record<RoleKey, Record<string, boolean>>>(
    () => ({
      'super-admin': getDefaultPermissions('super-admin'),
      admin: getDefaultPermissions('admin'),
      student: getDefaultPermissions('student'),
    })
  )
  const savedRef = useRef<Record<RoleKey, Record<string, boolean>>>({
    'super-admin': getDefaultPermissions('super-admin'),
    admin: getDefaultPermissions('admin'),
    student: getDefaultPermissions('student'),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadRoles = async () => {
    // Dynamic permission API is not available in the current backend.
    // Permission data is static and derived from the role definitions below.
    setLoadError(null)
    setLoading(false)
  }

  useEffect(() => {
    loadRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const isDirty = useMemo(
    () => JSON.stringify(permissions) !== JSON.stringify(savedRef.current),
    [permissions]
  )

  const togglePermission = (roleId: RoleKey, key: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], [key]: value },
    }))
  }

  const handleSave = async () => {
    if (!isDirty || saving) return
    setSaving(true)
    setSaved(false)
    try {
      // Attempt to call a dynamic permission API endpoint.
      const res = await fetch(`${API_BASE_URL}/roles/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(permissions),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(json?.message || 'Failed to save permissions')
      }
      savedRef.current = JSON.parse(JSON.stringify(permissions))
      setSaved(true)
      showToast('Permissions saved successfully', 'success')
    } catch (e: unknown) {
      // Dynamic permission management is not available — show the info banner.
      // The page stays in the unsaved state: savedRef is NOT updated on failure.
      const msg = e instanceof Error ? e.message : 'Failed to save permissions'
      if (msg.includes('404') || msg.includes('not available') || msg.includes('Failed to save')) {
        showToast('Dynamic role permissions are not available in the current backend.', 'error')
      } else {
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (saving) return
    setPermissions(JSON.parse(JSON.stringify(savedRef.current)))
    setSaved(true)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const rolePerms = permissions[activeRole]

  const filteredModules = searchQuery.trim()
    ? PERMISSION_MODULES.filter(
        (m) =>
          m.toLowerCase().includes(searchQuery.toLowerCase()) ||
          PERMISSION_ACTIONS.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : PERMISSION_MODULES

  const roleSummary = [
    {
      label: 'Total Roles',
      value: ROLES.length,
      icon: Crown,
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      textColor: '#7c3aed',
      tint: 'rgba(124, 58, 237, 0.06)',
    },
    {
      label: 'Total Permissions',
      value: PERMISSION_MODULES.length * PERMISSION_ACTIONS.length,
      icon: Key,
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      textColor: '#059669',
      tint: 'rgba(5, 150, 105, 0.06)',
    },
    {
      label: 'Active Roles',
      value: ROLES.length,
      icon: Shield,
      gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      textColor: '#2563eb',
      tint: 'rgba(37, 99, 235, 0.06)',
    },
    {
      label: 'Last Updated',
      value: today,
      icon: CalendarRange,
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdfa)',
      textColor: '#0ea5e9',
      tint: 'rgba(14, 165, 233, 0.06)',
    },
  ]

  return (
    <SuperAdminLayout>
      <div className="space-y-6 pb-20">

        {/* ── Premium Hero Header ── */}
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
                <Key size={26} />
              </div>
              <div>
                <h1
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  Role & Permission Management
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Define granular access controls for each system role
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
                onClick={loadRoles}
                className="btn btn-sm btn-ghost transition-transform duration-200 hover:scale-110"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Refresh"
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
                {isDirty ? <Key size={14} /> : <CheckCircle size={14} />}
                {isDirty ? 'Unsaved Changes' : 'All Changes Saved'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Information Banner ── */}
        <div
          className="rounded-2xl border p-4 lg:p-6"
          style={{
            backgroundColor: 'rgba(59,130,246,0.06)',
            borderColor: 'rgba(59,130,246,0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
            >
              <Info size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#3b82f6', marginBottom: '2px' }}>
                Dynamic role permissions are not available in the current backend.
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                The permission matrix below reflects the current static role definitions used by the platform's
                authorization middleware. Changes made via these toggles are for planning purposes and cannot be
                persisted to the backend. Role definitions are enforced through route-level authorization middleware.
              </p>
            </div>
          </div>
        </div>

        {/* ── Error State ── */}
        {loadError && (
          <div
            className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} />
              {loadError}
            </span>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roleSummary.map((stat) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="group rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 p-5"
                    style={{ backgroundColor: stat.tint, borderColor: 'var(--color-border)' }}
                  >
                    <div className="flex items-center gap-4 h-full">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ background: stat.gradient, boxShadow: '0 4px 14px rgba(0,0,0,0.10)' }}
                      >
                        <Icon size={22} color="#fff" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider truncate"
                          style={{ color: 'var(--color-text-muted)' }}>
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold mt-1" style={{ color: stat.textColor, lineHeight: 1.2, fontSize: stat.label === 'Last Updated' ? '0.85rem' : '1.5rem' }}>
                          {stat.label === 'Last Updated' ? (
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>{stat.value}</span>
                          ) : (
                            stat.value
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Role Switcher Tabs ── */}
            <div
              className="rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex items-center gap-1 p-2 overflow-x-auto scrollbar-hide border-b"
                style={{ borderBottomColor: 'var(--color-border)' }}
              >
                {ROLES.map((role) => {
                  const isActive = activeRole === role.id
                  return (
                    <button
                      key={role.id}
                      onClick={() => setActiveRole(role.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      style={{
                        backgroundColor: isActive ? 'var(--color-accent-pale)' : 'transparent',
                        color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: isActive ? '2px solid var(--color-accent)' : 'transparent',
                      }}
                      aria-pressed={isActive}
                    >
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--color-accent-pale)',
                          color: 'var(--color-accent)',
                        }}
                      >
                        {role.icon}
                      </span>
                      {role.name}
                    </button>
                  )
                })}
              </div>

              {/* Role description */}
              <div className="px-6 py-4 border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {ROLES.find((r) => r.id === activeRole)?.description}
                </p>
              </div>

              {/* Search */}
              <div className="px-6 py-3 border-b" style={{ borderBottomColor: 'var(--color-border)' }}>
                <div className="relative max-w-md">
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search modules or permissions..."
                    aria-label="Search modules or permissions"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border bg-[var(--color-bg)] pl-10 pr-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50 outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15"
                  />
                </div>
              </div>

              {/* Permission Matrix */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-accent-pale)' }}>
                      <th
                        className="sticky left-0 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: 'var(--color-text-muted)',
                          padding: '12px 16px',
                          borderBottom: '2px solid var(--color-border)',
                          backgroundColor: 'var(--color-accent-pale)',
                          zIndex: 2,
                        }}
                      >
                        Module
                      </th>
                      {PERMISSION_ACTIONS.map((action) => (
                        <th
                          key={action}
                          className="text-center text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color: 'var(--color-text-muted)',
                            padding: '12px 8px',
                            borderBottom: '2px solid var(--color-border)',
                            minWidth: '80px',
                          }}
                        >
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map((module) => (
                      <tr
                        key={module}
                        className="transition-all duration-200"
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(59,130,246,0.03)'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
                        }}
                      >
                        <td
                          className="sticky left-0 text-sm font-medium"
                          style={{
                            color: 'var(--color-text)',
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                          }}
                        >
                          {module}
                        </td>
                        {PERMISSION_ACTIONS.map((action) => {
                          const key = `${module}|${action}`
                          const isChecked = rolePerms[key]
                          return (
                            <td
                              key={key}
                              className="text-center"
                              style={{
                                padding: '10px 4px',
                                borderBottom: '1px solid var(--color-border)',
                              }}
                            >
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isChecked}
                                onClick={() => togglePermission(activeRole, key, !isChecked)}
                                className="mx-auto flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                                style={{
                                  backgroundColor: isChecked ? 'var(--color-accent)' : 'transparent',
                                  border: isChecked ? 'none' : '1px solid var(--color-border)',
                                  cursor: 'pointer',
                                }}
                                title={`${isChecked ? 'Revoke' : 'Grant'} ${module} → ${action}`}
                                aria-label={`${isChecked ? 'Revoke' : 'Grant'} ${module} ${action}`}
                              >
                                {isChecked ? (
                                  <Check size={14} color="white" strokeWidth={3} />
                                ) : (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: 'var(--color-text-muted)' }}
                                  />
                                )}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Role Permissions Summary */}
              <div className="px-6 py-4 border-t" style={{ borderTopColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {ROLES.map((role) => {
                      const granted = Object.values(permissions[role.id]).filter(Boolean).length
                      const total = PERMISSION_MODULES.length * PERMISSION_ACTIONS.length
                      return (
                        <div key={role.id} className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                          >
                            {role.icon}
                          </span>
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                            {role.name}:
                          </span>
                          <span className="text-xs font-bold" style={{ color: role.color }}>
                            {granted}/{total}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {filteredModules.length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No modules match "{searchQuery}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={38} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading roles and permissions…</p>
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

        {/* ── Sticky Bottom Action Bar ── */}
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
                  <Key size={16} style={{ color: '#f59e0b' }} />
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
                onClick={handleReset}
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
      </div>
    </SuperAdminLayout>
  )
}
