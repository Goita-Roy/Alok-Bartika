import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCircle2, GraduationCap, Award, Trophy, Star, Unlock,
  Dumbbell, UserCheck, Trash2, CheckCheck, ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { useAuth } from '../context/AuthContext'

// Map backend `icon` string → lucide component.
const ICONS: Record<string, LucideIcon> = {
  Bell, CheckCircle2, GraduationCap, Award, Trophy, Star, Unlock, Dumbbell, UserCheck,
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'এইমাত্র'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} মিনিট আগে`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ঘণ্টা আগে`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} দিন আগে`
  return new Date(iso).toLocaleDateString('bn-BD')
}

export function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const enabled = Boolean(user)
  const {
    items, unreadCount, total, hasMore, loading, loadingMore,
    markAsRead, markAllAsRead, remove, loadMore,
  } = useNotifications(enabled)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleClick = (item: { _id: string; read: boolean; link?: string }) => {
    if (!item.read) markAsRead(item._id)
    if (item.link) {
      setOpen(false)
      navigate(item.link)
    }
  }

  const getIcon = (name?: string): LucideIcon => ICONS[name || 'Bell'] || Bell

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="নোটিফিকেশন"
        className="relative p-2.5 rounded-xl transition-all duration-200"
        style={{
          color: 'var(--color-text-muted)',
          border: '1.5px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-accent)'
          e.currentTarget.style.borderColor = 'var(--color-accent-light)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)'
          e.currentTarget.style.borderColor = 'var(--color-border)'
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white rounded-full"
            style={{ backgroundColor: 'var(--color-error, #FF6B4A)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-3 z-[60] w-[340px] max-w-[92vw] max-h-[70vh] flex flex-col rounded-2xl shadow-card-hover overflow-hidden"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              নোটিফিকেশন {unreadCount > 0 && <span style={{ color: 'var(--color-accent)' }}>({unreadCount})</span>}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                <CheckCheck size={13} /> সব পঠিত
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                লোড হচ্ছে...
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                কোনো নোটিফিকেশন নেই
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {items.map((n) => {
                  const Icon = getIcon(n.icon)
                  return (
                    <li
                      key={n._id}
                      className="group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: n.read ? 'transparent' : 'var(--color-accent-pale)',
                      }}
                      onClick={() => handleClick(n)}
                    >
                      <div
                        className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${n.color || '#1D9E75'}22`, color: n.color || '#1D9E75' }}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-accent)' }} />
                          )}
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                            {n.title}
                          </p>
                        </div>
                        <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
                          {n.message}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.8 }}>
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(n._id) }}
                        aria-label="মুছে ফেলুন"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg shrink-0"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 flex items-center justify-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                {loadingMore ? 'লোড হচ্ছে...' : <>আরও দেখুন <ChevronDown size={14} /></>}
              </button>
            )}
          </div>

          <div className="px-4 py-2 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              মোট {total} টি নোটিফিকেশন
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
