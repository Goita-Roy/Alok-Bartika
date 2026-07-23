import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'
import {
  LayoutDashboard, Shield, Users, Key, Settings, ClipboardList,
  BarChart3, Database, UserCog,
  LogOut, Menu, X, Moon, Sun, ChevronDown,
} from 'lucide-react'

const navItems = [
  { to: '/super-admin/dashboard', label: 'Dashboard',                icon: LayoutDashboard },
  { to: '/super-admin/admins',    label: 'Admin Management',         icon: Shield },
  { to: '/super-admin/users',     label: 'User Management',          icon: Users },
  { to: '/super-admin/roles',     label: 'Role & Permissions',       icon: Key },
  { to: '/super-admin/platform',  label: 'Platform Settings',        icon: Settings },
  { to: '/super-admin/security',  label: 'Security & Audit Logs',    icon: ClipboardList },
  { to: '/super-admin/analytics', label: 'System Analytics',          icon: BarChart3 },
  { to: '/super-admin/backup',    label: 'Backup & Restore',         icon: Database },
  { to: '/super-admin/profile',   label: 'Profile & Settings',       icon: UserCog },
]

interface SuperAdminLayoutProps {
  children: ReactNode
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <Link to="/super-admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                       boxShadow: '0 2px 10px rgba(124,58,237,0.30)' }}>
              <Shield size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              Super Admin
            </span>
          </Link>
          <button className="lg:hidden p-1 rounded-lg" style={{ color: 'var(--color-text-muted)' }}
            onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  backgroundColor: active ? 'var(--color-accent-pale)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'
                    e.currentTarget.style.color = 'var(--color-accent)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full transition-all duration-200"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'; e.currentTarget.style.color = 'var(--color-error)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top navbar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6 shrink-0"
          style={{
            backgroundColor: 'var(--color-navbar-bg)',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl"
              style={{ color: 'var(--color-text-muted)' }}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {navItems.find(n => location.pathname === n.to || location.pathname.startsWith(n.to + '/'))?.label || 'Super Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'; e.currentTarget.style.color = 'var(--color-accent)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user && (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                  style={{ color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--color-accent-pale)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
                  >
                    {user.fullName?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold max-w-[120px] truncate">
                    {user.fullName || 'Super Admin'}
                  </span>
                  <ChevronDown size={14} />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu rounded-xl shadow-lg p-2 w-48 mt-2"
                  style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <li>
                    <Link to="/profile" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link to="/settings" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                      Settings
                    </Link>
                  </li>
                  <li><hr style={{ borderColor: 'var(--color-border)' }} /></li>
                  <li>
                    <button onClick={logout} className="w-full text-left" style={{ color: 'var(--color-error)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
