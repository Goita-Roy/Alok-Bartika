/**
 * ChatHeader — top bar of the live chat modal.
 * Shows connection status with emoji indicators, admin name if assigned, and close button.
 */

import React from 'react'
import { X, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'
import type { SocketStatus } from '../../hooks/useSupportSocket'

interface ChatHeaderProps {
  status: SocketStatus
  adminName?: string | null
  onClose: () => void
}

const statusConfig: Record<SocketStatus, { label: string; emoji: string; color: string }> = {
  idle: { label: 'অপ্রস্তুত', emoji: '🔴', color: '#6B7280' },
  connecting: { label: 'সংযুক্ত হচ্ছে...', emoji: '🟡', color: '#FBBF24' },
  connected: { label: 'অনলাইন', emoji: '🟢', color: '#34D399' },
  reconnecting: { label: 'পুনঃসংযোগ হচ্ছে...', emoji: '🟡', color: '#FBBF24' },
  error: { label: 'সংযোগ ত্রুটি', emoji: '🔴', color: '#EF4444' },
  disconnected: { label: 'অফলাইন', emoji: '🔴', color: '#6B7280' },
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ status, adminName, onClose }) => {
  const config = statusConfig[status] || statusConfig.disconnected

  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
      style={{ background: 'linear-gradient(135deg, #04342C 0%, #0E7C66 100%)' }}
    >
      {/* Left: avatar + info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg select-none">
            আ
          </div>
          {/* Online dot */}
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#04342C]"
            style={{ backgroundColor: config.color }}
          />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">
            {adminName ? adminName : 'আলোকবর্তিকা সহায়তা'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs leading-none" aria-hidden="true">{config.emoji}</span>
            {status === 'connecting' || status === 'reconnecting' ? (
              <Loader2 className="w-3 h-3 text-yellow-300 animate-spin" />
            ) : status === 'connected' ? (
              <Wifi className="w-3 h-3 text-emerald-300" />
            ) : status === 'error' ? (
              <RefreshCw className="w-3 h-3 text-red-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-xs" style={{ color: status === 'connected' ? '#6EE7B7' : '#9CA3AF' }}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        id="live-chat-close-btn"
        onClick={onClose}
        aria-label="চ্যাট বন্ধ করুন"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}

export default ChatHeader
