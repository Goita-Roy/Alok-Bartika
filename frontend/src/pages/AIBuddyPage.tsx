import { useCallback, useRef, useState } from 'react'
import axios from 'axios'
import { ChatInput } from '../components/ai-buddy/ChatInput'
import { MessageList } from '../components/ai-buddy/MessageList'
import { Sidebar } from '../components/ai-buddy/Sidebar'
import { TopBar } from '../components/ai-buddy/TopBar'
import { useConversations } from '../components/ai-buddy/useConversations'
import { buildHistory, toFriendlyError, uid } from '../components/ai-buddy/utils'
import type { ChatTurn } from '../components/ai-buddy/types'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'

export function AIBuddyPage() {
  const { user } = useAuth()
  const {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    addTurn,
    removeTurns,
    clearConversation,
  } = useConversations()

  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const requestAnswer = useCallback(
    async (convId: string, message: string, history: ChatTurn[]) => {
      setLoading(true)
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await api.post('/ai/chat', { message, history }, { signal: controller.signal })
        const content: unknown = res.data && (res.data as { content?: unknown }).content
        if (typeof content !== 'string' || !content.trim()) {
          throw new Error('empty response')
        }
        addTurn(convId, { id: uid(), role: 'assistant', content, createdAt: Date.now() })
      } catch (err) {
        if (axios.isCancel(err)) return
        const friendly = toFriendlyError(err)
        addTurn(convId, {
          id: uid(),
          role: 'assistant',
          content: friendly,
          error: true,
          createdAt: Date.now(),
        })
      } finally {
        abortRef.current = null
        setLoading(false)
      }
    },
    [addTurn],
  )

  const handleSend = useCallback(
    (text: string) => {
      if (loading) return
      const userTurn: ChatTurn = { id: uid(), role: 'user', content: text, createdAt: Date.now() }
      if (!activeConversation) {
        const conv = createConversation()
        addTurn(conv.id, userTurn)
        void requestAnswer(conv.id, text, [])
      } else {
        const history = buildHistory(activeConversation.messages)
        addTurn(activeConversation.id, userTurn)
        void requestAnswer(activeConversation.id, text, history)
      }
    },
    [loading, activeConversation, createConversation, addTurn, requestAnswer],
  )

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const handleRetry = useCallback(
    (errorTurnId: string) => {
      if (loading || !activeConversation) return
      const msgs = activeConversation.messages
      const idx = msgs.findIndex((m) => m.id === errorTurnId)
      if (idx <= 0) return
      const userTurn = msgs[idx - 1]
      if (userTurn.role !== 'user') return
      const history = buildHistory(msgs.slice(0, idx - 1))
      removeTurns(activeConversation.id, [errorTurnId])
      void requestAnswer(activeConversation.id, userTurn.content, history)
    },
    [loading, activeConversation, removeTurns, requestAnswer],
  )

  const handleNewChat = useCallback(() => {
    createConversation()
    setSidebarOpen(false)
  }, [createConversation])

  const handleClear = useCallback(() => {
    if (activeConversation) clearConversation(activeConversation.id)
  }, [activeConversation, clearConversation])

  const handleSelect = useCallback(
    (id: string) => {
      selectConversation(id)
      setSidebarOpen(false)
    },
    [selectConversation],
  )

  const userInitial = (user?.fullName ?? 'U').charAt(0).toUpperCase()
  const hasConversation = activeConversation !== null

  return (
    <div className="h-[calc(100vh-64px)] min-h-[460px]">
      <div
        className="relative flex h-full overflow-hidden rounded-2xl"
        style={{
          backgroundColor: 'var(--color-bg)',
          border: '1.5px solid var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
          onSelect={handleSelect}
          onRename={renameConversation}
          onDelete={deleteConversation}
        />
        <div className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
          <TopBar
            title={activeConversation?.title ?? 'AI বাডি'}
            loading={loading}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onClear={handleClear}
          />
          <MessageList
            messages={activeConversation?.messages ?? []}
            loading={loading}
            userInitial={userInitial}
            hasConversation={hasConversation}
            onRetry={handleRetry}
            onSuggestedPrompt={handleSend}
          />
          <div className="border-t px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <ChatInput loading={loading} onSend={handleSend} onStop={handleStop} />
            <p
              className="mt-2 text-center text-[11px] font-medium"
              style={{ color: 'var(--color-text-muted)', fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              AI বাডি তোমাকে গাইড করে — উত্তর বলে দেয় না, শেখার পথ দেখায়
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
