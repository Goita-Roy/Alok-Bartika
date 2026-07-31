import { useMemo, useState } from 'react'
import { Check, Moon, Pencil, Plus, RotateCcw, Search, Settings, Sparkles, Sun, Trash2, X } from 'lucide-react'
import type { Conversation, GroupKey } from './types'
import { GROUP_LABELS, GROUP_ORDER, formatConversationDate, groupKeyOf } from './utils'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  mobileOpen: boolean
  onCloseMobile: () => void
  onNewChat: () => void
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  onOpenSettings: () => void
  onClearAll: () => void
}

export function Sidebar({
  conversations,
  activeId,
  mobileOpen,
  onCloseMobile,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onOpenSettings,
  onClearAll,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const list = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
    if (!q) return list
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    )
  }, [conversations, q])

  const groups = useMemo(() => {
    const byGroup = new Map<GroupKey, Conversation[]>()
    for (const c of filtered) {
      const key = groupKeyOf(c.updatedAt)
      const arr = byGroup.get(key) ?? []
      arr.push(c)
      byGroup.set(key, arr)
    }
    return GROUP_ORDER.map((key) => ({ key, items: byGroup.get(key) ?? [] })).filter(
      (g) => g.items.length > 0,
    )
  }, [filtered])

  const startRename = (c: Conversation) => {
    setRenamingId(c.id)
    setRenameValue(c.title)
  }

  const commitRename = () => {
    if (renamingId) onRename(renamingId, renameValue)
    setRenamingId(null)
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="সাইডবার বন্ধ করুন"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-sidebar)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1D9E75, #0E7C66)',
                boxShadow: '0 4px 12px rgba(29,158,117,0.3)',
              }}
            >
              <Sparkles size={19} color="#fff" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-base font-black leading-tight"
                style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                AI বাডি
              </p>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                আলোকবর্তিকা
              </p>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="বন্ধ করুন"
              className="rounded-lg p-2 lg:hidden"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4">
            <button
              type="button"
              onClick={onNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #1D9E75, #0E7C66)',
                boxShadow: '0 4px 12px rgba(29,158,117,0.3)',
              }}
            >
              <Plus size={17} /> নতুন কথোপকথন
            </button>
          </div>

          <div className="px-4 pt-3">
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2"
              style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
              <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="খুঁজুন…"
                aria-label="কথোপকথন খুঁজুন"
                className="w-full bg-transparent text-sm outline-none placeholder:text-[color:var(--color-text-muted)]"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            {groups.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  {q ? 'কোনো কথোপকথন পাওয়া যায়নি' : 'এখনো কোনো কথোপকথন নেই'}
                </p>
              </div>
            ) : (
              groups.map((g) => (
                <div key={g.key} className="mb-3">
                  <p
                    className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {GROUP_LABELS[g.key]}
                  </p>
                  <ul className="space-y-0.5">
                    {g.items.map((c) => (
                      <li key={c.id}>
                        {renamingId === c.id ? (
                          <div className="flex items-center gap-1 rounded-lg px-2 py-1">
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitRename()
                                if (e.key === 'Escape') setRenamingId(null)
                              }}
                              onBlur={commitRename}
                              className="w-full rounded-lg border px-2 py-1 text-sm outline-none"
                              style={{
                                backgroundColor: 'var(--color-bg)',
                                borderColor: 'var(--color-accent)',
                                color: 'var(--color-text)',
                              }}
                              aria-label="নতুন নাম"
                            />
                            <button
                              type="button"
                              onClick={commitRename}
                              aria-label="সংরক্ষণ"
                              className="p-1"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className="group/item flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 transition-colors"
                            style={
                              c.id === activeId
                                ? { backgroundColor: 'var(--color-accent-pale)' }
                                : { color: 'var(--color-text-muted)' }
                            }
                            onClick={() => {
                              onSelect(c.id)
                              onCloseMobile()
                            }}
                            onMouseEnter={(e) => {
                              if (c.id !== activeId) {
                                ;(e.currentTarget as HTMLElement).style.backgroundColor =
                                  'var(--color-accent-pale)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (c.id !== activeId) {
                                ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className="truncate text-[13px] font-semibold"
                                style={{
                                  color:
                                    c.id === activeId ? 'var(--color-accent)' : 'var(--color-text)',
                                }}
                              >
                                {c.title}
                              </p>
                              <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                                {c.messages.length} বার্তা · {formatConversationDate(c.updatedAt)}
                              </p>
                            </div>
                            <div className="hidden shrink-0 items-center gap-0.5 group-hover/item:flex">
                              <button
                                type="button"
                                aria-label="নাম বদলান"
                                title="নাম বদলান"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startRename(c)
                                }}
                                className="rounded-md p-1 transition-colors"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                aria-label="মুছুন"
                                title="মুছুন"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (window.confirm('এই কথোপকথনটি মুছে ফেলতে চাও?')) onDelete(c.id)
                                }}
                                className="rounded-md p-1 transition-opacity hover:opacity-70"
                                style={{ color: 'var(--color-error)' }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </nav>

          <div className="border-t px-2 py-2" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={() => {
                onOpenSettings()
                onCloseMobile()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-semibold transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Settings size={16} /> সেটিংস
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('সব কথোপকথন মুছে ফেলতে চাও? এই কাজটি আর ফেরানো যাবে না।')) {
                  onClearAll()
                }
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-semibold transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              <RotateCcw size={16} /> ইতিহাস পরিষ্কার করুন
            </button>
          </div>

          <div className="border-t px-3 py-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#fff' }}
                >
                  {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <div className="min-w-0">
                  <p className="max-w-[120px] truncate text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    শিক্ষার্থী
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="থিম পরিবর্তন"
                className="rounded-lg p-2 transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-accent-pale)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)'
                  ;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
