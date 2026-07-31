import { useEffect, useRef, useState, type ClipboardEvent } from 'react'
import { File, FileCode, FileText, ImagePlus, Mic, Paperclip, SendHorizontal, Square, X } from 'lucide-react'
import type { Attachment } from './types'
import { MAX_MESSAGE_CHARS, compressImage, formatBytes, isSupportedFile, isSupportedImageFile, uid } from './utils'
import { useSpeechRecognition } from './useSpeechRecognition'

interface ChatInputProps {
  loading: boolean
  onSend: (text: string, attachments: Attachment[]) => void
  onStop: () => void
  onNotice: (message: string) => void
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase()
  const Icon = ext === 'pdf' || ext === 'txt' ? FileText : ext === 'zip' ? File : FileCode
  return <Icon size={15} />
}

export function ChatInput({ loading, onSend, onStop, onNotice }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [dragging, setDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)
  const attachmentsRef = useRef<Attachment[]>(attachments)

  const appendTranscript = (t: string) => {
    setValue((prev) => (prev ? `${prev} ${t}` : t))
  }

  const rec = useSpeechRecognition({ langs: ['bn-BD', 'en-US'], onFinal: appendTranscript, onError: onNotice })

  useEffect(() => {
    attachmentsRef.current = attachments
  }, [attachments])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      attachmentsRef.current.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
      })
    }
  }, [])

  useEffect(() => {
    if (loading && rec.listening) rec.stop()
  }, [loading, rec])

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const revokeAttachment = (a: Attachment) => {
    if (a.previewUrl) URL.revokeObjectURL(a.previewUrl)
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target) revokeAttachment(target)
      return prev.filter((a) => a.id !== id)
    })
  }

  const addImageFiles = (files: File[]) => {
    for (const file of files) {
      if (!isSupportedImageFile(file)) {
        onNotice('শুধু PNG, JPG, JPEG বা WEBP ছবি ৫ এমবি-র মধ্যে আপলোড করা যায়।')
        continue
      }
      const id = uid()
      const previewUrl = URL.createObjectURL(file)
      const attach: Attachment = { id, kind: 'image', name: file.name, size: file.size, file, previewUrl, status: 'processing' }
      setAttachments((prev) => [...prev, attach])
      void compressImage(file).then((compressed) => {
        if (!mountedRef.current) return
        setAttachments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, file: compressed, size: compressed.size, status: 'ready' } : a,
          ),
        )
      })
    }
  }

  const addFileItems = (files: File[]) => {
    for (const file of files) {
      if (!isSupportedFile(file)) {
        onNotice('এই ফাইল টাইপ সমর্থিত নয়। (py, cpp, c, java, js, ts, txt, pdf, zip — সর্বোচ্চ ১০ এমবি)')
        continue
      }
      setAttachments((prev) => [
        ...prev,
        { id: uid(), kind: 'file', name: file.name, size: file.size, file, status: 'ready' },
      ])
    }
  }

  const processFiles = (list: FileList | File[]) => {
    const files = Array.from(list)
    const images: File[] = []
    const others: File[] = []
    for (const f of files) {
      if (f.type.startsWith('image/')) images.push(f)
      else others.push(f)
    }
    if (images.length) addImageFiles(images)
    if (others.length) addFileItems(others)
  }

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'))
    const itemImages = Array.from(e.clipboardData.items)
      .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
      .map((i) => i.getAsFile())
      .filter((f): f is File => f !== null)
    const images = [...files, ...itemImages]
    if (images.length > 0) {
      e.preventDefault()
      processFiles(images)
    }
  }

  const submit = () => {
    const text = value.trim()
    if ((!text && attachments.length === 0) || loading) return
    if (attachments.some((a) => a.status === 'processing')) return
    const payload = attachments.filter((a) => a.status === 'ready')
    onSend(text, payload)
    setValue('')
    attachments.forEach(revokeAttachment)
    setAttachments([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const toggleMic = () => {
    if (rec.listening) {
      rec.stop()
      return
    }
    if (!rec.supported) {
      onNotice('আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। Chrome বা Edge ব্যবহার করুন।')
      return
    }
    rec.start()
  }

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !loading && !attachments.some((a) => a.status === 'processing')
  const overLimit = value.length > MAX_MESSAGE_CHARS
  const hasProcessing = attachments.some((a) => a.status === 'processing')

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative flex flex-col gap-1.5 rounded-2xl border p-2 transition-colors focus-within:border-[color:var(--color-accent)]"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: dragging ? 'var(--color-accent)' : 'var(--color-border)' }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
        }}
      >
        {dragging && (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed"
            style={{ backgroundColor: 'var(--color-accent-pale)', borderColor: 'var(--color-accent)' }}
          >
            <p className="text-sm font-black" style={{ color: 'var(--color-accent)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ছবি বা ফাইল এখানে ছেড়ে দিন
            </p>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-1 pt-0.5">
            {attachments.map((a) =>
              a.kind === 'image' ? (
                <div key={a.id} className="relative">
                  <div
                    className="relative h-16 w-16 overflow-hidden rounded-xl border"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {a.previewUrl && <img src={a.previewUrl} alt={a.name} className="h-full w-full object-cover" />}
                    {a.status === 'processing' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <RefreshSpin />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label={`ছবি সরান: ${a.name}`}
                    onClick={() => removeAttachment(a.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'var(--color-error)' }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ) : (
                <div
                  key={a.id}
                  className="flex max-w-[220px] items-center gap-1.5 rounded-xl border px-2 py-1.5"
                  style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
                >
                  <span style={{ color: 'var(--color-accent)' }}>
                    <FileIcon name={a.name} />
                  </span>
                  <div className="min-w-0">
                    <p className="max-w-[130px] truncate text-[11px] font-bold" style={{ color: 'var(--color-text)' }}>
                      {a.name}
                    </p>
                    <p className="text-[9px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {formatBytes(a.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`ফাইল সরান: ${a.name}`}
                    onClick={() => removeAttachment(a.id)}
                    className="rounded p-0.5"
                    style={{ color: 'var(--color-error)' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {hasProcessing && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <div className="h-full w-1/3 animate-progress-slide rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
            </div>
            <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ছবি প্রস্তুত হচ্ছে…
            </span>
          </div>
        )}

        {rec.listening && (
          <div className="flex items-center gap-2 rounded-xl px-2 py-1.5" style={{ backgroundColor: 'rgba(255,107,74,0.1)' }}>
            <WaveBars />
            <span className="flex-1 truncate text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
              শুনছি…{rec.interim && <span style={{ color: 'var(--color-text-muted)' }}> «{rec.interim}</span>}
            </span>
            <button
              type="button"
              onClick={rec.cancel}
              aria-label="ভয়েস ইনপুট বাতিল করুন"
              className="rounded p-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-1.5">
          <div className="flex items-center gap-0.5 pb-1">
            <button
              type="button"
              onClick={toggleMic}
              disabled={loading}
              aria-label={rec.listening ? 'রেকর্ডিং বন্ধ করুন' : 'ভয়েস দিয়ে প্রশ্ন করুন'}
              title="ভয়েস দিয়ে প্রশ্ন করুন"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-40"
              style={{
                color: rec.listening ? 'var(--color-error)' : 'var(--color-text-muted)',
                backgroundColor: rec.listening ? 'rgba(255,107,74,0.1)' : 'transparent',
              }}
            >
              <span className={rec.listening ? 'animate-mic-pulse flex items-center justify-center rounded-full' : ''}>
                {rec.listening ? <Mic size={16} /> : <Mic size={16} />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={loading}
              aria-label="ছবি আপলোড করুন"
              title="ছবি আপলোড করুন"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-40"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <ImagePlus size={16} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              aria-label="ফাইল সংযুক্ত করুন"
              title="ফাইল সংযুক্ত করুন"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors disabled:opacity-40"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) processFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.cpp,.c,.java,.js,.ts,.txt,.pdf,.zip"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) processFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(e) => {
              setValue(e.target.value)
              grow(e.target)
            }}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            disabled={loading}
            placeholder="বার্তা লিখুন…"
            aria-label="বার্তা"
            className="chat-textarea max-h-40 flex-1 resize-none bg-transparent px-2 py-2 outline-none placeholder:text-[color:var(--color-text-muted)]"
            style={{ color: 'var(--color-text)' }}
          />

          {!loading && value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setValue('')
                if (textareaRef.current) textareaRef.current.style.height = 'auto'
              }}
              aria-label="ইনপুট মুছুন"
              title="ইনপুট মুছুন"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={15} />
            </button>
          )}

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="থামাও"
              title="থামাও"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: 'var(--color-error)' }}
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              aria-label="পাঠান"
              title="পাঠান"
              disabled={!canSend}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
              style={{
                backgroundColor: 'var(--color-accent)',
                boxShadow: canSend ? '0 2px 8px rgba(14,124,102,0.3)' : 'none',
              }}
            >
              <SendHorizontal size={18} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-1">
        <p
          className="text-[11px] font-medium"
          style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          Enter দিয়ে পাঠান · Shift+Enter দিয়ে নতুন লাইন
        </p>
        <span
          className="text-[11px] font-semibold tabular-nums"
          style={{ color: overLimit ? 'var(--color-error)' : 'var(--color-text-muted)' }}
        >
          {value.length}/{MAX_MESSAGE_CHARS}
        </span>
      </div>
    </div>
  )
}

function RefreshSpin() {
  return (
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-label="প্রস্তুত হচ্ছে"
    />
  )
}

function WaveBars() {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="h-3 w-0.5 animate-typing-bounce rounded-full"
          style={{ backgroundColor: 'var(--color-error)', animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  )
}
