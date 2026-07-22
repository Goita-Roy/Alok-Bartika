/**
 * WidgetErrorState — the graceful fallback UI for a failed dashboard card.
 * Replaces the old "infinite skeleton" with an error illustration, a Bengali
 * message and a Retry button. Never shows a stack trace.
 */
import { AlertTriangle, RotateCw } from 'lucide-react'

interface Props {
  title?: string
  onRetry?: () => void
  compact?: boolean
}

export function WidgetErrorState({ title, onRetry, compact }: Props) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center gap-3 rounded-[20px] p-${compact ? '5' : '8'}`}
      style={{
        backgroundColor: '#FFF5F5',
        border: '1.5px solid #FECACA',
        color: '#9F1239',
      }}
      role="alert"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
      >
        <AlertTriangle size={22} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          {title ? `${title} লোড করা যায়নি` : 'এই অংশটি লোড করা যায়নি'}
        </p>
        <p className="text-xs mt-1" style={{ color: '#B91C1C' }}>
          সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-[1.03]"
          style={{ backgroundColor: '#EF4444', color: '#fff' }}
        >
          <RotateCw size={13} /> আবার চেষ্টা করুন
        </button>
      )}
    </div>
  )
}
