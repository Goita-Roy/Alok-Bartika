import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { SupportConversationList } from '../../components/admin/SupportConversationList'
import { SupportChatWindow } from '../../components/admin/SupportChatWindow'

export function AdminStudentSupportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const conversationParam = searchParams.get('conversation')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversationParam)

  // Sync from URL query param (e.g. when navigated from MessageCenter)
  useEffect(() => {
    if (conversationParam && conversationParam !== selectedConversationId) {
      setSelectedConversationId(conversationParam)
    }
  }, [conversationParam])

  const handleSelect = (id: string | null) => {
    setSelectedConversationId(id)
    if (id) {
      setSearchParams({ conversation: id }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-4rem)] gap-4">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar)' }}>
          <SupportConversationList
            onSelect={handleSelect}
            selectedId={selectedConversationId}
          />
        </div>

        {/* Chat Window */}
        <SupportChatWindow conversationId={selectedConversationId} />
      </div>
    </AdminLayout>
  )
}