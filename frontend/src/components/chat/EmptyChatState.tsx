/**
 * EmptyChatState — shown when the conversation has no messages yet.
 */

import React from 'react'
import { MessageCircle } from 'lucide-react'

const EmptyChatState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full gap-4 py-12 px-6 text-center font-bengali">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
      style={{ background: 'linear-gradient(135deg, #0E7C66 0%, #04342C 100%)' }}
    >
      <MessageCircle className="w-8 h-8 text-white" />
    </div>
    <div>
      <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
        সহায়তা শুরু করুন
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        আপনার যেকোনো প্রশ্ন বা সমস্যা শেয়ার করুন।
        <br />
        আমাদের টিম দ্রুত সাড়া দেবে।
      </p>
    </div>
  </div>
)

export default EmptyChatState
