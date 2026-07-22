import { useState } from 'react'
import { Lock, Upload, Plus, FileArchive, Code2, ExternalLink, CheckCircle2, X } from 'lucide-react'
import { useProjects, type SubmitProjectInput } from '../../hooks/useProjects'

const BN = "'Hind Siliguri', sans-serif"

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']
function toBnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, d => BN_DIGITS[Number(d)])
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${toBnDigits(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBnDigits(d.getFullYear())}`
}

const ACCENT = 'var(--color-accent)'
const MUTED = 'var(--color-text-muted)'
const TEXT = 'var(--color-text)'

interface Props {
  // true once the student has PASSED the Advanced final exam
  // (completedLevels.includes('advanced'))
  unlocked: boolean
}

export function ProjectSubmissionSection({ unlocked }: Props) {
  const { projects, official, isLoading, submitProject, isSubmitting } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [showOfficial, setShowOfficial] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [images, setImages] = useState<File[]>([])
  const [zip, setZip] = useState<File | null>(null)
  const [readme, setReadme] = useState<File | null>(null)

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('')
    setGithubUrl(''); setDemoUrl('')
    setFiles([]); setImages([]); setZip(null); setReadme(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!title.trim()) {
      setError('প্রজেক্টের শিরোনাম আবশ্যক')
      return
    }
    try {
      const input: SubmitProjectInput = {
        title: title.trim(), description, category, githubUrl, demoUrl,
        files, images, zip, readme,
      }
      const res = await submitProject(input)
      resetForm()
      setShowForm(false)
      const badgeNote = res.newBadges.length > 0
        ? ` ${res.newBadges.map(b => `${b.icon} ${b.name}`).join(', ')} ব্যাজ অর্জন করেছেন!`
        : ''
      setSuccess(`প্রজেক্ট সফলভাবে জমা দেওয়া হয়েছে।${badgeNote}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'প্রজেক্ট জমা দিতে ব্যর্থ হয়েছে')
    }
  }

  // ── LOCKED STATE (before passing the Advanced final exam) ──
  if (!unlocked) {
    return (
      <div
        className="flex flex-col items-center text-center gap-2 p-6 rounded-2xl"
        style={{ backgroundColor: 'var(--color-accent-pale)', border: '1.5px dashed rgba(29,158,117,0.30)' }}
      >
        <div className="flex items-center gap-2">
          <Lock size={18} style={{ color: MUTED }} />
          <p className="font-black text-sm" style={{ color: MUTED, fontFamily: BN }}>
            🔒 প্রজেক্ট জমা (লক করা)
          </p>
        </div>
        <p className="text-xs font-semibold" style={{ color: MUTED, fontFamily: BN }}>
          প্রজেক্ট জমা দেওয়ার জন্য প্রথমে উন্নত লেভেলের চূড়ান্ত পরীক্ষায় উত্তীর্ণ হতে হবে।
        </p>
        {/* Disabled upload buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <button
            type="button" disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm cursor-not-allowed opacity-60"
            style={{ backgroundColor: 'rgba(29,158,117,0.08)', color: MUTED, fontFamily: BN }}
          >
            <FileArchive size={15} /> নির্ধারিত প্রজেক্ট দেখুন
          </button>
          <button
            type="button" disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm cursor-not-allowed opacity-60"
            style={{ backgroundColor: 'rgba(29,158,117,0.08)', color: MUTED, fontFamily: BN }}
          >
            <Plus size={15} /> নিজের প্রজেক্ট জমা দিন
          </button>
        </div>
      </div>
    )
  }

  // ── UNLOCKED STATE (after passing the Advanced final exam) ──
  return (
    <div
      className="p-5 rounded-2xl space-y-4"
      style={{ backgroundColor: 'rgba(29,158,117,0.06)', border: '1.5px solid rgba(29,158,117,0.20)' }}
    >
      <div>
        <p className="font-black text-sm" style={{ color: ACCENT, fontFamily: BN }}>📦 চূড়ান্ত প্রজেক্ট জমা</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: MUTED, fontFamily: BN }}>
          আপনি আমাদের নির্ধারিত Python প্রজেক্ট অথবা নিজের তৈরি Python প্রজেক্ট জমা দিতে পারবেন।
        </p>
      </div>

      {success && (
        <div
          className="rounded-xl p-3 flex items-center gap-2 text-sm font-bold"
          style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: ACCENT, fontFamily: BN }}
        >
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setShowOfficial(v => !v); setShowForm(false) }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
          style={{ backgroundColor: 'rgba(29,158,117,0.10)', color: ACCENT, border: '1.5px solid rgba(29,158,117,0.20)', fontFamily: BN }}
        >
          <FileArchive size={15} /> নির্ধারিত প্রজেক্ট দেখুন
        </button>
        <button
          type="button"
          onClick={() => { setShowForm(v => !v); setShowOfficial(false); setSuccess('') }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
          style={{ backgroundColor: ACCENT, color: '#fff', boxShadow: '0 0 16px rgba(29,158,117,0.25)', fontFamily: BN }}
        >
          <Plus size={15} /> নিজের প্রজেক্ট জমা দিন
        </button>
      </div>

      {showOfficial && (
        <div className="space-y-2">
          <h3 className="text-sm font-black" style={{ color: TEXT, fontFamily: BN }}>নির্ধারিত প্রজেক্টসমূহ</h3>
          {official.length === 0 ? (
            <p className="text-xs font-semibold" style={{ color: MUTED, fontFamily: BN }}>
              এখনও কোনো নির্ধারিত প্রজেক্ট যোগ করা হয়নি।
            </p>
          ) : (
            official.map(p => (
              <div key={p.id} className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-white)', border: '1.5px solid var(--color-border)' }}>
                <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: BN }}>{p.title}</p>
                {p.description && <p className="text-xs mt-1" style={{ color: MUTED, fontFamily: BN }}>{p.description}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl p-4" style={{ backgroundColor: 'var(--color-white)', border: '1.5px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: TEXT, fontFamily: BN }}>নতুন প্রজেক্ট</h3>
            <button type="button" onClick={() => { setShowForm(false); resetForm() }} style={{ color: MUTED }}><X size={16} /></button>
          </div>

          {error && (
            <p className="text-xs font-bold" style={{ color: 'var(--color-warn)', fontFamily: BN }}>{error}</p>
          )}

          <FieldLabel>প্রজেক্টের শিরোনাম *</FieldLabel>
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={inputStyle} />

          <FieldLabel>বিবরণ</FieldLabel>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-y" style={inputStyle} />

          <FieldLabel>বিভাগ</FieldLabel>
          <input value={category} onChange={e => setCategory(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={inputStyle} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>GitHub লিংক</FieldLabel>
              <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>ডেমো লিংক</FieldLabel>
              <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg outline-none" style={inputStyle} />
            </div>
          </div>

          <FieldLabel>পাইথন ফাইল (একাধিক)</FieldLabel>
          <input type="file" multiple accept=".py,.txt,.json,.md,.csv" onChange={e => setFiles(Array.from(e.target.files || []))} className="text-xs" style={{ color: MUTED }} />

          <FieldLabel>ছবি / স্ক্রিনশট</FieldLabel>
          <input type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files || []))} className="text-xs" style={{ color: MUTED }} />

          <FieldLabel>ZIP ফাইল</FieldLabel>
          <input type="file" accept=".zip" onChange={e => setZip(e.target.files?.[0] || null)} className="text-xs" style={{ color: MUTED }} />

          <FieldLabel>README ফাইল</FieldLabel>
          <input type="file" accept=".md,.txt" onChange={e => setReadme(e.target.files?.[0] || null)} className="text-xs" style={{ color: MUTED }} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-60"
            style={{ backgroundColor: ACCENT, color: '#fff', fontFamily: BN }}
          >
            <Upload size={15} /> {isSubmitting ? 'জমা হচ্ছে...' : 'জমা দিন'}
          </button>
        </form>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black" style={{ color: TEXT, fontFamily: BN }}>আমার জমা দেওয়া প্রজেক্ট</h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(29,158,117,0.12)', color: ACCENT, fontFamily: BN }}>
            মোট {toBnDigits(projects.length)}টি
          </span>
        </div>

        {isLoading ? (
          <p className="text-xs font-semibold" style={{ color: MUTED, fontFamily: BN }}>লোড হচ্ছে...</p>
        ) : projects.length === 0 ? (
          <p className="text-xs font-semibold" style={{ color: MUTED, fontFamily: BN }}>এখনও কোনো প্রজেক্ট জমা দেওয়া হয়নি।</p>
        ) : (
          <div className="space-y-2">
            {projects.map(p => (
              <div key={p.id} className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-white)', border: '1.5px solid var(--color-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold" style={{ color: TEXT, fontFamily: BN }}>{p.title}</p>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: ACCENT, fontFamily: BN }}>{formatDate(p.createdAt)}</span>
                </div>
                {p.description && <p className="text-xs mt-1" style={{ color: MUTED, fontFamily: BN }}>{p.description}</p>}
                <div className="flex flex-wrap gap-3 mt-2">
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: ACCENT }}>
                      <Code2 size={12} /> GitHub
                    </a>
                  )}
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: ACCENT }}>
                      <ExternalLink size={12} /> ডেমো
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  border: '1.5px solid var(--color-border)',
  color: 'var(--color-text)',
  fontFamily: BN,
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)', fontFamily: BN }}>
      {children}
    </label>
  )
}
