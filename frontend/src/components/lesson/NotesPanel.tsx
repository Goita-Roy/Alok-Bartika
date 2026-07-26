import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Edit3, Download, X, Search, Trash2 } from 'lucide-react'

// ── Shared Notes Panel ────────────────────────────────────────────────
// Reusable slide-in panel for all three course levels (Beginner, Intermediate,
// Advanced). Handles its own localStorage persistence, search, export, and
// auto-save — parent only provides theme colors, lesson metadata, and callbacks.

export interface NoteEntry {
  content: string
  updatedAt: string
}

export type NotesMap = Record<string, NoteEntry>

export interface LessonMeta {
  /** The canonical mock/storage id used as the key in NotesMap */
  mockId: string
  /** Display label (e.g. "Class 01") */
  label: string
  /** Display title */
  title: string
}

export interface ThemeColors {
  bg: string
  surface: string
  accent: string
  text: string
  muted: string
  border: string
}

interface NotesPanelProps {
  open: boolean
  onClose: () => void
  storageKey: string
  theme: ThemeColors
  lessons: LessonMeta[]
  currentMockId: string
  onNavigateToLesson: (lesson: LessonMeta) => void
}

function loadNotes(storageKey: string): NotesMap {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

function saveNotes(storageKey: string, notes: NotesMap) {
  try { localStorage.setItem(storageKey, JSON.stringify(notes)) } catch {}
}

export function NotesPanel({
  open,
  onClose,
  storageKey,
  theme,
  lessons,
  currentMockId,
  onNavigateToLesson,
}: NotesPanelProps) {
  const T = theme
  const [notesMap, setNotesMap] = useState<NotesMap>(() => loadNotes(storageKey))
  const [currentNoteText, setCurrentNoteText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentLesson = useMemo(
    () => lessons.find(l => l.mockId === currentMockId),
    [lessons, currentMockId],
  )

  // Load current note text when lesson or notes change
  useEffect(() => {
    const note = notesMap[currentMockId]
    setCurrentNoteText(note?.content || '')
  }, [currentMockId, notesMap])

  // Auto-save with debounce
  const handleNoteChange = useCallback((text: string) => {
    setCurrentNoteText(text)
    setSaveStatus('idle')
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saving')
      setNotesMap(prev => {
        const next = { ...prev, [currentMockId]: { content: text, updatedAt: new Date().toISOString() } }
        saveNotes(storageKey, next)
        return next
      })
      setSaveStatus('saved')
    }, 800)
  }, [currentMockId, storageKey])

  const handleSaveNote = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    setSaveStatus('saving')
    setNotesMap(prev => {
      const next = { ...prev, [currentMockId]: { content: currentNoteText, updatedAt: new Date().toISOString() } }
      saveNotes(storageKey, next)
      return next
    })
    setSaveStatus('saved')
  }, [currentMockId, currentNoteText, storageKey])

  const handleClearNote = useCallback(() => {
    setCurrentNoteText('')
    setNotesMap(prev => {
      const next = { ...prev }
      delete next[currentMockId]
      saveNotes(storageKey, next)
      return next
    })
  }, [currentMockId, storageKey])

  const handleExportNotes = useCallback(() => {
    let text = '═══════════════════════════════════════\n'
    text += '  আমার নোট — অ্যালকবার্তিকা\n'
    text += '═══════════════════════════════════════\n\n'
    Object.entries(notesMap).forEach(([lId, note]) => {
      const l = lessons.find(lesson => lesson.mockId === lId)
      text += `পাঠ: ${l?.label} — ${l?.title || 'অজানা'}\n`
      text += `সর্বশেষ আপডেট: ${new Date(note.updatedAt).toLocaleString()}\n`
      text += `----------------------------------------\n`
      text += `${note.content}\n`
      text += `========================================\n\n`
    })
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'alokbartika_notes.txt'
    link.title = 'নোট এক্সপোর্ট করুন'
    link.click()
    URL.revokeObjectURL(url)
  }, [notesMap, lessons])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return Object.entries(notesMap)
      .map(([lId, note]) => {
        const l = lessons.find(lesson => lesson.mockId === lId)
        return { lessonId: lId, lessonTitle: l?.title || 'অজানা', content: note.content, updatedAt: note.updatedAt }
      })
      .filter(item => item.content.toLowerCase().includes(q) || item.lessonTitle.toLowerCase().includes(q))
  }, [searchQuery, notesMap, lessons])

  return (
    <div
      className="fixed top-16 right-0 bottom-0 flex flex-col z-[60] transition-transform duration-300 w-[min(360px,100vw)]"
      style={{
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        backgroundColor: T.bg,
        borderLeft: `1px solid ${T.border}`,
        boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2">
          <Edit3 size={15} style={{ color: T.accent }} />
          <span className="font-black text-sm" style={{ color: T.text }}>আমার নোট</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
            style={{ backgroundColor: `${T.accent}18`, color: T.accent }}>
            {Object.keys(notesMap).length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Object.keys(notesMap).length > 0 && (
            <button onClick={handleExportNotes}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: T.muted }} title="সকল নোট .txt হিসেবে এক্সপোর্ট করুন">
              <Download size={14} />
            </button>
          )}
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: T.muted }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: `${T.accent}08`, border: `1px solid ${T.border}` }}>
          <Search size={13} style={{ color: T.muted }} />
          <input
            type="text" placeholder="নোট খুঁজুন..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs font-medium" style={{ color: T.text }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ color: T.muted }}><X size={12} /></button>
          )}
        </div>
      </div>

      {searchQuery ? (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {searchResults.length === 0 ? (
            <div className="text-center py-8" style={{ color: T.muted, opacity: 0.5 }}>
              <Search size={24} className="mx-auto mb-2" />
              <p className="text-xs font-semibold">কোন মিল পাওয়া যায়নি</p>
            </div>
          ) : searchResults.map(result => (
            <div key={result.lessonId}
              className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
              style={{ backgroundColor: `${T.accent}08`, border: `1px solid ${T.border}` }}
              onClick={() => {
                setSearchQuery('')
                const found = lessons.find(l => l.mockId === result.lessonId)
                if (found) onNavigateToLesson(found)
              }}
            >
              <p className="text-[11px] font-black mb-1" style={{ color: T.accent }}>{result.lessonTitle}</p>
              <p className="text-xs line-clamp-3 font-medium" style={{ color: T.muted }}>{result.content}</p>
              <p className="text-[10px] mt-2 font-bold" style={{ color: `${T.accent}66` }}>
                {new Date(result.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-3 pt-3 pb-2 shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${T.accent}66` }}>
              বর্তমান পাঠ
            </p>
            <p className="text-xs font-bold truncate" style={{ color: T.accent }}>
              {currentLesson ? `${currentLesson.label}: ${currentLesson.title}` : '—'}
            </p>
          </div>

          <div className="flex-1 px-3 pb-2 min-h-0">
            <textarea
              value={currentNoteText}
              onChange={e => handleNoteChange(e.target.value)}
              placeholder="এখানে নোট লিখুন... (Auto-save চালু আছে)"
              className="w-full h-full resize-none outline-none rounded-xl p-3 text-sm leading-relaxed font-medium"
              style={{
                backgroundColor: `${T.accent}06`,
                border: `1px solid ${T.border}`,
                color: T.text,
                fontFamily: "'Hind Siliguri', sans-serif",
                minHeight: '180px',
              }}
            />
          </div>

          <div className="px-3 py-2 shrink-0 flex items-center justify-between gap-2 flex-wrap"
            style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-2">
              <button onClick={handleSaveNote}
                className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: T.accent, backgroundColor: `${T.accent}18` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${T.accent}30` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${T.accent}18` }}
              >
                নোট সংরক্ষণ করুন
              </button>
              <span className="text-[10px] font-bold"
                style={{ color: saveStatus === 'saved' ? T.accent : saveStatus === 'saving' ? '#f5c842' : 'transparent' }}>
                {saveStatus === 'saved' ? '✓ সংরক্ষিত' : saveStatus === 'saving' ? '⏳ সংরক্ষণ হচ্ছে…' : ''}
              </span>
            </div>
            {currentNoteText.trim() && (
              <button onClick={handleClearNote}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                style={{ color: '#f87171', backgroundColor: 'rgba(248,113,113,0.08)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.18)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(248,113,113,0.08)' }}
              >
                <Trash2 size={11} /> মুছুন
              </button>
            )}
          </div>

          {/* All notes list */}
          {Object.keys(notesMap).length > 0 && (
            <div className="px-3 pb-3 shrink-0 overflow-y-auto" style={{ maxHeight: '200px', borderTop: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-black uppercase tracking-widest pt-3 pb-2" style={{ color: `${T.accent}66` }}>
                সকল নোট ({Object.keys(notesMap).length})
              </p>
              <div className="space-y-2">
                {Object.entries(notesMap).map(([lId, note]) => {
                  const l = lessons.find(lesson => lesson.mockId === lId)
                  const isThisLesson = lId === currentMockId
                  return (
                    <div key={lId} onClick={() => { if (l) onNavigateToLesson(l) }}
                      className="p-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        backgroundColor: isThisLesson ? `${T.accent}18` : `${T.accent}06`,
                        border: `1px solid ${isThisLesson ? `${T.accent}33` : T.border}`,
                      }}>
                      <p className="text-[10px] font-black mb-0.5 truncate" style={{ color: isThisLesson ? T.accent : T.muted }}>
                        {l?.title || 'অজানা'}
                      </p>
                      <p className="text-[10px] line-clamp-2 font-medium" style={{ color: T.muted }}>
                        {note.content}
                      </p>
                      <p className="text-[9px] mt-1 font-bold" style={{ color: `${T.accent}4D` }}>
                        {new Date(note.updatedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
