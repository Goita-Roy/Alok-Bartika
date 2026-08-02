import { useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { SupportConversationList } from '../../components/admin/SupportConversationList'
import { SupportChatWindow } from '../../components/admin/SupportChatWindow'

export function AdminStudentSupportPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-4rem)] gap-4">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-sidebar)' }}>
          <SupportConversationList
            onSelect={setSelectedConversationId}
            selectedId={selectedConversationId}
          />
        </div>

        {/* Chat Window */}
        <SupportChatWindow conversationId={selectedConversationId} />
      </div>
    </AdminLayout>
  )
}