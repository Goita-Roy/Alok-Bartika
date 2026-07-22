/**
 * OfflineBanner — shown at the top of the app ONLY when the browser is actually
 * offline (navigator.onLine === false). Server/API failures (500/401/404/429,
 * timeout, backend down) are NOT internet failures and must not show this banner.
 * Visibility is driven purely by the browser's network state via useOnlineStatus.
 */
import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  if (isOnline) return null

  return (
    <div
      className="sticky top-0 z-[100] flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-bold"
      style={{
        backgroundColor: '#7C2D12',
        color: '#FED7AA',
        borderBottom: '1px solid #9A3412',
      }}
      role="alert"
    >
      <WifiOff size={14} />
      অফলাইন — ইন্টারনেট সংযোগ নেই। সংযোগ ফিরে এলে আবার চেষ্টা করা হবে।
    </div>
  )
}
