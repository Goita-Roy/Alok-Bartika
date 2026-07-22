/**
 * Lightweight skeleton + error primitives for progressive / partial loading.
 * Used so a single slow or failed widget can show its own placeholder or error
 * while the rest of the dashboard renders normally.
 */
import { AlertTriangle, RotateCw } from 'lucide-react'

/** Pulsing placeholder block for a loading widget. */
export function WidgetSkeleton({ height = 'h-40' }: { height?: string }) {
  return (
    <div
      className={`w-full ${height} rounded-[20px] animate-pulse`}
      style={{ backgroundColor: 'var(--color-border, #D4E8DE)' }}
      aria-busy="true"
      aria-label="লোড হচ্ছে"
    />
  )
}

/** Full error card for a section whose data API failed (vs a render crash). */
export function SectionErrorCard({
  title,
  onRetry,
  retryLabel = 'আবার চেষ্টা করুন',
}: {
  title?: string
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center text-center gap-3 rounded-[20px] p-8"
      style={{ backgroundColor: '#FFF5F5', border: '1.5px solid #FECACA', color: '#9F1239' }}
      role="alert"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
      >
        <AlertTriangle size={22} />
      </div>
      <p className="text-sm font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        {title || 'ডেটা লোড করা যায়নি'}
      </p>
      <p className="text-xs mt-1" style={{ color: '#B91C1C' }}>
        সাময়িক সমস্যা। অনুগ্রহ করে আবার চেষ্টা করুন।
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.03]"
          style={{ backgroundColor: '#EF4444', color: '#fff' }}
        >
          <RotateCw size={13} /> {retryLabel}
        </button>
      )}
    </div>
  )
}
