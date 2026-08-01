/**
 * ChatHeader — top bar of the live chat modal.
 * Shows status (connected / reconnecting), admin name if assigned, and close button.
 */

import React from 'react'
import { X, Wifi, WifiOff, Loader2 } from 'lucide-react'
import type { SocketStatus } from '../../hooks/useSupportSocket'

interface ChatHeaderProps {
  status: SocketStatus
  adminName?: string | null
  onClose: () => void
}

const statusLabel: Record<SocketStatus, string> = {
  idle: 'অপ্রস্তুত',
  connecting: 'সংযুক্ত হচ্ছে...',
  connected: 'অনলাইন',
  error: 'সংযোগ ত্রুটি',
  disconnected: 'সংযোগ বিচ্ছিন্ন',
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ status, adminName, onClose }) => {
  const isOnline = status === 'connected'
  const isConnecting = status === 'connecting'

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
            style={{ backgroundColor: isOnline ? '#34D399' : isConnecting ? '#FBBF24' : '#6B7280' }}
          />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">
            {adminName ? adminName : 'আলোকবর্তিকা সহায়তা'}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isConnecting ? (
              <Loader2 className="w-3 h-3 text-yellow-300 animate-spin" />
            ) : isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-300" />
            ) : (
              <WifiOff className="w-3 h-3 text-gray-400" />
            )}
            <span className="text-xs" style={{ color: isOnline ? '#6EE7B7' : '#9CA3AF' }}>
              {statusLabel[status]}
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
