export interface Notice {
  text: string
  key: number
}

export function Toast({ notice }: { notice: Notice | null }) {
  if (!notice) return null
  return (
    <div
      key={notice.key}
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-fade-up px-4"
    >
      <div
        className="flex max-w-md items-center gap-2 rounded-2xl border px-4 py-2.5 text-center text-sm font-bold"
        style={{
          backgroundColor: 'var(--color-text)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-bg)',
          boxShadow: 'var(--shadow-card-hover)',
          fontFamily: "'Hind Siliguri', sans-serif",
        }}
      >
        {notice.text}
      </div>
    </div>
  )
}
