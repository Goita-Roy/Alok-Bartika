import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import type { ReactNode } from 'react'
import { BookOpen, LayoutDashboard, LogOut, Menu, Moon, Sun, User, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { BackButton } from './BackButton'
import { NotificationBell } from './NotificationBell'

interface LayoutProps { children: ReactNode }

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLessonPage = location.pathname.startsWith('/courses/') && location.pathname.length > '/courses/'.length

  const navLinks = [
    { to: '/',        label: 'হোম' },
    { to: '/about',   label: 'আমাদের সম্পর্কে' },
    { to: '/contact', label: 'যোগাযোগ' },
    ...(user ? [{ to: '/courses', label: 'কোর্সসমূহ' }] : []),
  ]

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <div className={`min-h-screen flex flex-col ${isLessonPage ? 'overflow-hidden' : ''}`} style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{ backgroundColor: 'var(--color-navbar-bg)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--color-border)', boxShadow: '0 1px 8px rgba(29,158,117,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #9FE1CB)', boxShadow: '0 2px 10px rgba(29,158,117,0.30)' }}>
              <BookOpen size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              আলোকবর্তিকা
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  color: isActive(link.to) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  backgroundColor: isActive(link.to) ? 'var(--color-accent-pale)' : 'transparent',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
                onMouseEnter={e => { if (!isActive(link.to)) { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)' } }}
                onMouseLeave={e => { if (!isActive(link.to)) { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' } }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Notifications */}
            <NotificationBell />
            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label={theme === 'light' ? 'ডার্ক মোড' : 'লাইট মোড'}
              className="p-2.5 rounded-xl transition-all duration-200"
              style={{ color: 'var(--color-text-muted)', border: '1.5px solid var(--color-border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-light)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {!user ? (
              <>
                <Link to="/login"
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface)' }}
                >
                  লগইন করুন
                </Link>
                <Link to="/signup"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 2px 8px rgba(29,158,117,0.25)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#178a63' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent)' }}
                >
                  শুরু করুন
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent-light)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)' }}
                >
                  <LayoutDashboard size={15} /> ড্যাশবোর্ড
                </Link>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black cursor-pointer"
                    style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)', border: '1.5px solid var(--color-border)' }}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-card-hover menu menu-sm dropdown-content rounded-2xl w-56"
                    style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <li>
                      <Link to="/profile" className="flex items-center gap-2 font-semibold text-sm rounded-xl py-2"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                        <User size={14} /> আমার প্রোফাইল
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" className="flex items-center gap-2 font-semibold text-sm rounded-xl py-2"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                        <Settings size={14} /> সেটিংস
                      </Link>
                    </li>
                    <li><hr className="my-1" style={{ borderColor: 'var(--color-border)' }} /></li>
                    <li>
                      <button onClick={logout} className="flex items-center gap-2 font-semibold text-sm rounded-xl py-2 w-full"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-error)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-error-pale, rgba(255,107,74,0.1))' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                        <LogOut size={14} /> লগআউট করুন
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-xl transition-all"
            style={{ color: 'var(--color-text-muted)', border: '1.5px solid var(--color-border)' }}
            onClick={() => setMobileOpen(v => !v)} aria-label="মেনু">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 px-4 pt-2 space-y-1" style={{ borderTop: '1px solid var(--color-border)' }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  color: isActive(link.to) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  backgroundColor: isActive(link.to) ? 'var(--color-accent-pale)' : 'transparent',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2">
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ color: 'var(--color-accent)', border: '1.5px solid var(--color-border)' }}>
                    লগইন
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: 'var(--color-accent)' }}>
                    শুরু করুন
                  </Link>
                </>
              ) : (
                <button onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                  style={{ color: 'var(--color-error)', border: '1.5px solid var(--color-error-border, rgba(255,107,74,0.3))' }}>
                  <LogOut size={14} /> লগআউট
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <BackButton />
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-auto" style={{ backgroundColor: 'var(--color-footer-bg)' }}>
        {/* Top accent glow bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1D9E75, #34D399, #6EE7B7)' }} />

        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 pt-10 pb-5 md:pt-12 md:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* ── Column 1: Brand ── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #34D399, #1D9E75)' }}>
                  <BookOpen size={20} color="#fff" />
                </div>
                <span style={{ fontSize: '34px', fontWeight: 800, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আলোকবর্তিকা
                </span>
              </div>
              <p style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--color-footer-text-muted)' }}>
                তরুণ শিক্ষার্থীদের জন্য আধুনিক প্রোগ্রামিং শেখার প্ল্যাটফর্ম, যেখানে শেখা, অনুশীলন এবং AI সহায়তার মাধ্যমে দক্ষতা অর্জন সহজ ও আনন্দদায়ক।
              </p>
            </div>

            {/* ── Column 2: Courses ── */}
            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
                📚 কোর্সসমূহ
              </h4>
              <ul className="space-y-3.5">
                {[
                  { label: 'শিক্ষানবিশ', to: '/courses/beginner' },
                  { label: 'মধ্যবর্তী', to: '/courses/intermediate' },
                  { label: 'উন্নত', to: '/courses?level=advanced' },
                  { label: 'আরও অনুশীলন', to: '/development' },
                  { label: 'নিজে অনুশীলন', to: '/practice' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.to}
                      className="transition-all duration-200 hover:translate-x-0.5 inline-block"
                      style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-footer-text)' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Institution ── */}
            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
                🏢 প্রতিষ্ঠান
              </h4>
              <ul className="space-y-3.5">
                {[
                  { label: 'আমাদের সম্পর্কে', to: '/about' },
                  { label: 'যোগাযোগ', to: '/contact' },
                  { label: 'গোপনীয়তা নীতি', to: '/privacy' },
                  { label: 'শর্তাবলী', to: '/terms' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.to}
                      className="transition-all duration-200 hover:translate-x-0.5 inline-block"
                      style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-footer-text)' }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Column 4: Social ── */}
            <div>
              <h4 className="mb-4 tracking-wider" style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: "'Hind Siliguri', sans-serif" }}>
                🌐 আমাদের সাথে যুক্ত থাকুন
              </h4>
              <div className="flex gap-3">
                {[
                  { label: 'Facebook', href: '#', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { label: 'Youtube', href: '#', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                  { label: 'LinkedIn', href: '#', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                  { label: 'GitHub', href: '#', path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
                ].map(social => (
                  <a key={social.label} href={social.href} aria-label={social.label} target="_blank" rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 bg-white/5 text-white/60 hover:bg-[#1D9E75] hover:text-white hover:scale-110 hover:-translate-y-1">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 pt-3 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-footer-text-muted)' }}>
              © ২০২৬ আলোকবর্তিকা। বাংলাদেশের কিশোর শিক্ষার্থীদের জন্য তৈরি।
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
