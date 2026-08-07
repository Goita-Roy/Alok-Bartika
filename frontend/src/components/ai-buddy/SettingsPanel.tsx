import { useEffect } from 'react'
import { Monitor, RotateCcw, Sun, Moon, Wifi, WifiOff, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { usePrefs } from './usePrefs'
import type { FontSize } from './usePrefs'
import { useSpeech } from './useSpeech'

interface SettingsPanelProps {
  open: boolean
  online: boolean
  onClose: () => void
  onClearAll: () => void
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--color-accent-pale)', color: 'var(--color-accent)' }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-bold"
          style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          {label}
        </p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  labels: Record<T, string>
}) {
  return (
    <div
      className="flex gap-1 rounded-xl border p-1"
      style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className="flex-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors"
            style={
              active
                ? { backgroundColor: 'var(--color-accent)', color: '#fff' }
                : { color: 'var(--color-text-muted)' }
            }
          >
            {labels[opt]}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
      style={{ backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-border)' }}
    >
      <span
        className="h-5 w-5 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

const FONT_SIZE_LABELS: Record<FontSize, string> = { sm: 'ছোট', md: 'মাঝারি', lg: 'বড়' }

export function SettingsPanel({ open, online, onClose, onClearAll }: SettingsPanelProps) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { fontSize, autoRead, setFontSize, setAutoRead } = usePrefs()
  const speech = useSpeech()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const bnVoices = speech.voices.filter((v) => v.lang.toLowerCase().startsWith('bn'))
  const otherVoices = speech.voices.filter((v) => !v.lang.toLowerCase().startsWith('bn'))
  const rateLabel = speech.rate.toLocaleString('bn-BD', { maximumFractionDigits: 2 })

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="সেটিংস বন্ধ করুন"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="সেটিংস"
        className={`absolute inset-y-0 right-0 flex w-[310px] max-w-[85vw] flex-col border-l shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: 'var(--color-border)' }}>
          <p
            className="text-base font-black"
            style={{ color: 'var(--color-text)', fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            সেটিংস
          </p>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="বন্ধ করুন"
            className="rounded-lg p-2 transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <Row
            icon={online ? <Wifi size={16} /> : <WifiOff size={16} />}
            label="সংযোগ"
          >
            <p
              className="text-[11px] font-semibold"
              style={{ color: online ? '#22c55e' : 'var(--color-error)' }}
            >
              {online ? 'অনলাইন' : 'অফলাইন'}
            </p>
          </Row>

          <hr className="mx-4 my-3" style={{ borderColor: 'var(--color-border)' }} />

          <Row
            icon={
              theme === 'system' ? (
                <Monitor size={16} />
              ) : resolvedTheme === 'light' ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )
            }
            label="থিম"
          >
            <Segmented
              options={['light', 'dark', 'system'] as const}
              value={theme}
              onChange={setTheme}
              labels={{ light: 'লাইট', dark: 'ডার্ক', system: 'সিস্টেম' }}
            />
            {theme === 'system' && (
              <p className="mt-1 text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                ডিভাইসের থিম অনুযায়ী স্বয়ংক্রিয়
              </p>
            )}
          </Row>

          <Row icon={<span className="text-sm font-black">বাং</span>} label="ভাষা">
            <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              বাংলা (সম্পূর্ণ ইন্টারফেস)
            </p>
          </Row>

          <Row icon={<span className="text-sm font-black">Aa</span>} label="ফন্ট সাইজ">
            <Segmented
              options={['sm', 'md', 'lg'] as FontSize[]}
              value={fontSize}
              onChange={setFontSize}
              labels={FONT_SIZE_LABELS}
            />
          </Row>

          <hr className="mx-4 my-3" style={{ borderColor: 'var(--color-border)' }} />

          <Row icon={<span className="text-xs font-black">১x</span>} label={`স্পিচ গতি · ${rateLabel}×`}>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.25}
              value={speech.rate}
              onChange={(e) => speech.setRate(Number(e.target.value))}
              aria-label="স্পিচ গতি"
              className="w-full"
              style={{ accentColor: 'var(--color-accent)' }}
            />
          </Row>

          <Row icon={<span className="text-xs font-black">ভা</span>} label="ভয়েস">
            <select
              value={speech.voiceURI ?? ''}
              onChange={(e) => speech.setVoiceURI(e.target.value || null)}
              aria-label="ভয়েস নির্বাচন"
              className="w-full rounded-lg border bg-transparent px-2 py-1.5 text-[11px] font-semibold outline-none"
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            >
              <option value="">অটো (বাংলা পছন্দ)</option>
              {bnVoices.length > 0 && (
                <optgroup label="বাংলা ভয়েস">
                  {bnVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {otherVoices.length > 0 && (
                <optgroup label="অন্যান্য ভয়েস">
                  {otherVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </Row>

          <Row icon={<span className="text-xs font-black">▶</span>} label="উত্তর অটো শুনুন">
            <Toggle checked={autoRead} onChange={setAutoRead} label="উত্তর অটো শুনুন" />
          </Row>

          <hr className="mx-4 my-3" style={{ borderColor: 'var(--color-border)' }} />

          <div className="px-4 py-1">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('সব কথোপকথন মুছে ফেলতে চাও? এই কাজটি আর ফেরানো যাবে না।')) {
                  onClearAll()
                  onClose()
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'rgba(255,107,74,0.4)',
                color: 'var(--color-error)',
              }}
            >
              <RotateCcw size={15} /> ইতিহাস পরিষ্কার করুন
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
