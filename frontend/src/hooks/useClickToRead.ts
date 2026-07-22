// useClickToRead.ts
// ---------------------------------------------------------------------------
// Shared hook for the "Read from here" feature across Beginner, Intermediate
// and Advanced course pages. When audio is ON, clicking a paragraph shows a
// floating "▶ এখান থেকে শুনুন" button. Pressing it starts playback from that
// block onward.
//
// Reuses the existing useSpeechReader.playFrom() — no new speech logic.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'

const READABLE_SELECTOR = 'p, li, h1, h2, h3, h4, .tts-speak'
const EXCLUDE_SELECTOR =
  'pre, code, .monaco-editor, button, input, textarea, select, .no-tts, [aria-hidden="true"], nav, footer, .lesson-navigation, .beginner-lesson-navigation'

export interface ClickToReadPopup {
  visible: boolean
  x: number
  y: number
  index: number
}

export interface UseClickToReadOptions {
  containerRef: React.RefObject<HTMLElement | null>
  enabled: boolean
  onPlayFrom: (index: number) => void
}

export function useClickToRead(options: UseClickToReadOptions) {
  const { containerRef, enabled, onPlayFrom } = options

  const [popup, setPopup] = useState<ClickToReadPopup>({
    visible: false,
    x: 0,
    y: 0,
    index: -1,
  })
  const popupRef = useRef(popup)
  popupRef.current = popup
  const onPlayFromRef = useRef(onPlayFrom)
  onPlayFromRef.current = onPlayFrom

  // Collect readable blocks in DOM order.
  const getReadableBlocks = useCallback((): HTMLElement[] => {
    const container = containerRef.current
    if (!container) return []
    return Array.from(
      container.querySelectorAll<HTMLElement>(READABLE_SELECTOR),
    ).filter((el) => {
      if (!el.innerText || !el.innerText.trim()) return false
      if (el.closest(EXCLUDE_SELECTOR)) return false
      return true
    })
  }, [containerRef])

  // Walk up from a click target to find the enclosing readable block index.
  const findBlockIndex = useCallback(
    (target: HTMLElement): number => {
      const blocks = getReadableBlocks()
      let current: HTMLElement | null = target
      while (current && current !== containerRef.current) {
        const idx = blocks.indexOf(current)
        if (idx !== -1) return idx
        current = current.parentElement
      }
      return -1
    },
    [getReadableBlocks, containerRef],
  )

  // Show / move / dismiss the popup on every click inside the container.
  const handleClick = useCallback(
    (e: Event) => {
      if (!enabled) return

      const target = e.target as HTMLElement

      // Click on the popup itself → handled separately.
      if (target.closest('.click-to-read-popup')) return

      // Interactive elements → skip (let them do their thing).
      if (
        target.closest(
          'button, input, textarea, select, a, .alokbartika-paragraph-speaker, .audio-player-bar',
        )
      )
        return

      // If text is selected the Selected Text Reader owns this interaction.
      const sel = window.getSelection()
      if (sel && !sel.isCollapsed && sel.toString().trim()) return

      const idx = findBlockIndex(target)
      if (idx === -1) {
        // Click outside any readable block → dismiss.
        setPopup((p) => (p.visible ? { visible: false, x: 0, y: 0, index: -1 } : p))
        return
      }

      const blocks = getReadableBlocks()
      const block = blocks[idx]
      if (!block) return

      const rect = block.getBoundingClientRect()
      // Place the button just above the paragraph, clamped to viewport.
      const popupWidth = 190
      const x = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8))
      const y = Math.max(8, rect.top - 46)

      setPopup({ visible: true, x, y, index: idx })
    },
    [enabled, findBlockIndex, getReadableBlocks],
  )

  // "▶ এখান থেকে শুনুন" button handler.
  const handlePlayFromClick = useCallback(() => {
    const idx = popupRef.current.index
    if (idx >= 0) {
      onPlayFromRef.current(idx)
      setPopup({ visible: false, x: 0, y: 0, index: -1 })
    }
  }, [])

  // Programmatically dismiss (called by consuming pages on lesson change, etc.).
  const hide = useCallback(() => {
    setPopup({ visible: false, x: 0, y: 0, index: -1 })
  }, [])

  // ── Register / clean up listeners ──────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onClick = (e: MouseEvent) => {
      // Brief delay so browser selection state settles first.
      setTimeout(() => handleClick(e), 10)
    }

    container.addEventListener('click', onClick)
    return () => container.removeEventListener('click', onClick)
  }, [containerRef, handleClick])

  // Dismiss when audio is turned OFF.
  useEffect(() => {
    if (!enabled) hide()
  }, [enabled, hide])

  // Dismiss when the container scrolls (keeps UI tidy).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onScroll = () => {
      if (popupRef.current.visible) hide()
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [containerRef, hide])

  // Dismiss when the user clicks anywhere on the document outside the container.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const target = e.target as HTMLElement
      // If click is inside the container the container handler deals with it.
      if (container.contains(target)) return
      // If click is on the popup, ignore.
      if (target.closest('.click-to-read-popup')) return
      hide()
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [containerRef, hide])

  return { popup, handlePlayFromClick, hide }
}
