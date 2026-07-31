import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { ChatInput } from '../components/ai-buddy/ChatInput'
import { MessageList } from '../components/ai-buddy/MessageList'
import { PrefsProvider } from '../components/ai-buddy/PrefsProvider'
import { SettingsPanel } from '../components/ai-buddy/SettingsPanel'
import { Sidebar } from '../components/ai-buddy/Sidebar'
import { SpeechProvider } from '../components/ai-buddy/SpeechProvider'
import { useSpeech } from '../components/ai-buddy/useSpeech'
import { Toast } from '../components/ai-buddy/Toast'
import type { Notice } from '../components/ai-buddy/Toast'
import { TopBar } from '../components/ai-buddy/TopBar'
import { useConversations } from '../components/ai-buddy/useConversations'
import { usePrefs } from '../components/ai-buddy/usePrefs'
import { buildHistory, markdownToSpeechText, toFriendlyError, uid } from '../components/ai-buddy/utils'
import type { Attachment, ChatTurn } from '../components/ai-buddy/types'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'

function AIBuddyInner() {
  const { user } = useAuth()
  const { fontSize, autoRead } = usePrefs()
  const speech = useSpeech()
  const {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePin,
    addTurn,
    removeTurns,
    clearAll,
  } = useConversations()

  const [loading, setLoading] = useState(false)
  const [online, setOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const noticeKeyRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const freshIdsRef = useRef<Set<string>>(new Set())
  const readIdsRef = useRef<Set<string>>(new Set())
  const unsupportedToastRef = useRef(false)
  const autoReadRef = useRef(autoRead)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const showNotice = useCallback((text: string) => {
    noticeKeyRef.current += 1
    setNotice({ text, key: noticeKeyRef.current })
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    autoReadRef.current = autoRead
  }, [autoRead])

  useEffect(() => {
    if (autoRead) freshIdsRef.current.clear()
  }, [autoRead])

  useEffect(() => {
    if (!autoRead) speech.stop()
  }, [autoRead, speech])

  useEffect(() => {
    if (!autoRead || loading || !activeConversation) return
    const msgs = activeConversation.messages
    const last = msgs[msgs.length - 1]
    if (!last || last.role !== 'assistant' || last.error) return
    if (!freshIdsRef.current.has(last.id) || readIdsRef.current.has(last.id)) return
    if (!speech.supported) {
      if (!unsupportedToastRef.current) {
        unsupportedToastRef.current = true
        showNotice('এই ব্রাউজারে ভয়েস রিডআউট সাপোর্ট করা হয় না')
      }
      return
    }
    readIdsRef.current.add(last.id)
    speech.speak(markdownToSpeechText(last.content))
  }, [autoRead, loading, activeConversation, speech, showNotice])

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
        const answerId = uid()
        addTurn(convId, { id: answerId, role: 'assistant', content, createdAt: Date.now() })
        if (autoReadRef.current) freshIdsRef.current.add(answerId)
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
    (text: string, attachments: Attachment[]) => {
      if (loading) return
      if (attachments.some((a) => a.kind === 'image')) {
        showNotice('ছবি বিশ্লেষণ সুবিধা শীঘ্রই যুক্ত হবে')
      }
      if (attachments.some((a) => a.kind === 'file')) {
        showNotice('ফাইল বিশ্লেষণ সুবিধা শীঘ্রই যুক্ত হবে')
      }
      if (!text.trim()) return
      const userTurn: ChatTurn = { id: uid(), role: 'user', content: text.trim(), createdAt: Date.now() }
      if (!activeConversation) {
        const conv = createConversation()
        addTurn(conv.id, userTurn)
        void requestAnswer(conv.id, text.trim(), [])
      } else {
        const history = buildHistory(activeConversation.messages)
        addTurn(activeConversation.id, userTurn)
        void requestAnswer(activeConversation.id, text.trim(), history)
      }
    },
    [loading, activeConversation, createConversation, addTurn, requestAnswer, showNotice],
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
    speech.stop()
    createConversation()
    setSidebarOpen(false)
  }, [speech, createConversation])

  const handleClearAll = useCallback(() => {
    speech.stop()
    clearAll()
    setSidebarOpen(false)
  }, [speech, clearAll])

  const handleSelect = useCallback(
    (id: string) => {
      speech.stop()
      selectConversation(id)
      setSidebarOpen(false)
    },
    [speech, selectConversation],
  )

  const userInitial = (user?.fullName ?? 'U').charAt(0).toUpperCase()
  const userFullName = user?.fullName ?? ''
  const hasConversation = activeConversation !== null

  return (
    <div className="aibuddy-page min-h-[460px] pb-safe">
      <div
        className="relative flex h-full overflow-hidden rounded-none border-0 sm:rounded-2xl sm:border sm:shadow-[var(--shadow-card)]"
        style={{
          backgroundColor: 'var(--color-bg)',
          borderColor: 'var(--color-border)',
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
          onTogglePin={togglePin}
          onOpenSettings={() => setSettingsOpen(true)}
          onClearAll={handleClearAll}
        />
        <div className="flex min-w-0 flex-1 flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
          <TopBar
            title={activeConversation?.title ?? 'AI বাডি'}
            loading={loading}
            online={online}
            userInitial={userInitial}
            userFullName={userFullName}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          <MessageList
            key={activeConversation?.id ?? 'empty'}
            messages={activeConversation?.messages ?? []}
            loading={loading}
            userInitial={userInitial}
            hasConversation={hasConversation}
            fontSize={fontSize}
            onRetry={handleRetry}
            onSuggestedPrompt={(text) => handleSend(text, [])}
          />
          <div className="border-t px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="mx-auto w-full max-w-3xl">
              <ChatInput loading={loading} onSend={handleSend} onStop={handleStop} onNotice={showNotice} />
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
      <SettingsPanel
        open={settingsOpen}
        online={online}
        onClose={() => setSettingsOpen(false)}
        onClearAll={handleClearAll}
      />
      <Toast notice={notice} />
    </div>
  )
}

export function AIBuddyPage() {
  return (
    <PrefsProvider>
      <SpeechProvider>
        <AIBuddyInner />
      </SpeechProvider>
    </PrefsProvider>
  )
}
