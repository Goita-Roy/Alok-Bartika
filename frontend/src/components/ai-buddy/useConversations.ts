import { useCallback, useEffect, useState } from 'react'
import type { Conversation, ChatTurn } from './types'
import { STORAGE_KEY, makeTitle, uid } from './utils'

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (c): c is Conversation =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as Conversation).id === 'string' &&
        Array.isArray((c as Conversation).messages),
    )
  } catch {
    return []
  }
}

export interface UseConversationsResult {
  conversations: Conversation[]
  activeId: string | null
  activeConversation: Conversation | null
  createConversation: () => Conversation
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  renameConversation: (id: string, title: string) => void
  addTurn: (conversationId: string, turn: ChatTurn) => void
  removeTurns: (conversationId: string, turnIds: string[]) => void
  clearConversation: (id: string) => void
  clearAll: () => void
}

export function useConversations(): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(
    () => loadConversations()[0]?.id ?? null,
  )

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch {
      // storage full or unavailable — ignore
    }
  }, [conversations])

  const createConversation = useCallback((): Conversation => {
    const now = Date.now()
    const conv: Conversation = {
      id: uid(),
      title: 'নতুন কথোপকথন',
      createdAt: now,
      updatedAt: now,
      messages: [],
    }
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
    return conv
  }, [])

  const selectConversation = useCallback((id: string) => setActiveId(id), [])

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveId((prev) => (prev === id ? null : prev))
  }, [])

  const renameConversation = useCallback((id: string, title: string) => {
    const t = title.trim()
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: t || 'নতুন কথোপকথন' } : c)),
    )
  }, [])

  const patchConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)))
    },
    [],
  )

  const addTurn = useCallback(
    (conversationId: string, turn: ChatTurn) => {
      patchConversation(conversationId, (c) => {
        const updated: Conversation = {
          ...c,
          messages: [...c.messages, turn],
          updatedAt: turn.createdAt,
        }
        if (turn.role === 'user' && c.messages.length === 0) {
          updated.title = makeTitle(turn.content)
        }
        return updated
      })
    },
    [patchConversation],
  )

  const removeTurns = useCallback(
    (conversationId: string, turnIds: string[]) => {
      const ids = new Set(turnIds)
      patchConversation(conversationId, (c) => ({
        ...c,
        messages: c.messages.filter((m) => !ids.has(m.id)),
      }))
    },
    [patchConversation],
  )

  const clearConversation = useCallback(
    (id: string) => {
      patchConversation(id, (c) => ({ ...c, messages: [] }))
    },
    [patchConversation],
  )

  const clearAll = useCallback(() => {
    setConversations([])
    setActiveId(null)
  }, [])

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  return {
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
    clearAll,
  }
}
