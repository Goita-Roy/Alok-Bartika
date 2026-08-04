import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LiveChatModal from '../components/chat/LiveChatModal'

export function StudentSupportPage() {
  const { user } = useAuth()
  const [chatOpen, setChatOpen] = useState(true)

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />
  }

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4"
      style={{ color: 'var(--color-text)' }}
    >
      {chatOpen ? (
        <LiveChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      ) : (
        <div className="text-center max-w-md">
          <h2
            className="text-xl font-bold mb-2"
            style={{
              color: 'var(--color-text)',
              fontFamily: "'Hind Siliguri', sans-serif",
            }}
          >
            সাপোর্ট চ্যাট
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            আমাদের সাপোর্ট টিমের সাথে কথা বলুন। যেকোনো প্রশ্ন বা সমস্যায় আমরা সাহায্য করতে প্রস্তুত।
          </p>
          <button
            onClick={() => setChatOpen(true)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--color-accent)',
              boxShadow: '0 2px 8px rgba(29,158,117,0.25)',
            }}
          >
            চ্যাট খুলুন
          </button>
        </div>
      )}
    </div>
  )
}
