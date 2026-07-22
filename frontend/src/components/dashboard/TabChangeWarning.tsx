import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const slideDownKeyframes = `
@keyframes tabWarningSlideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`

export function TabChangeWarning({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible && !mounted) setMounted(true)
  }, [visible, mounted])

  if (!mounted && !visible) return null

  if (!visible && mounted) return null

  return (
    <>
      <style>{slideDownKeyframes}</style>
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
        style={{
          maxWidth: '520px',
          width: '90%',
          animation: 'tabWarningSlideDown 0.3s ease-out',
        }}
      >
        <div
          className="rounded-2xl p-4 pr-12 shadow-2xl flex items-start gap-3 relative"
          style={{
            backgroundColor: '#FEF2F2',
            border: '2px solid #FCA5A5',
          }}
        >
          <div className="shrink-0 mt-0.5" style={{ color: '#EF4444' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <p
              className="font-bold leading-relaxed"
              style={{
                fontSize: '15px',
                color: '#991B1B',
                fontFamily: "'Hind Siliguri', sans-serif",
              }}
            >
              ⚠️ আপনি বারবার ট্যাব পরিবর্তন করছেন। মনে হচ্ছে আপনি পড়াশোনায় মনোযোগী নন। অনুগ্রহ করে পড়ায় মনোযোগ দিন।
            </p>
          </div>
          <button
            onClick={() => { setMounted(false); onDismiss() }}
            className="absolute top-3 right-3 rounded-full p-1 transition-colors"
            style={{ color: '#EF4444' }}
            aria-label="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
