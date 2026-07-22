// useSelectedTextReader.ts
// ---------------------------------------------------------------------------
// Shows a small floating Read toolbar when the student selects text inside a
// container. Clicking Read speaks only the selected text.
//
// Reusable across courses. No lesson files are modified.
//
// Responsive / touch behaviour:
//   * Works with mouse (mouseup) and touch (long-press -> touchend / the
//     document `selectionchange` event used by iOS/Android).
//   * The toolbar repositions itself on scroll, resize and device rotation so
//     it always follows the live selection and stays inside the viewport.
//   * It is clamped so it never overflows the screen and never sits behind the
//     mobile bottom audio bar.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from 'react'
import { speechService, normalizeBanglaLang } from '../services/speechService'

export interface SelectionToolbarState {
  visible: boolean
  x: number
  y: number
  text: string
}

export interface UseSelectedTextReaderOptions {
  containerRef: React.RefObject<HTMLElement | null>
  enabled?: boolean
  ignoreSelector?: string
}

// Estimated toolbar width used only for horizontal clamping.
const EST_TOOLBAR_WIDTH = 140
// Space reserved at the bottom of small screens for the sticky audio bar
// (covers it wrapping onto two/three rows on narrow phones).
const MOBILE_BOTTOM_SAFE = 120

function isInsideContainer(container: HTMLElement | null, node: Node | null): boolean {
  if (!container || !node) return false
  return container.contains(node)
}

export function useSelectedTextReader(options: UseSelectedTextReaderOptions) {
  const { containerRef, enabled = true, ignoreSelector } = options
  const [toolbar, setToolbar] = useState<SelectionToolbarState>({
    visible: false,
    x: 0,
    y: 0,
    text: '',
  })
  const enabledRef = useRef(enabled)
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const isVisibleRef = useRef(false)
  const frameRef = useRef<number | null>(null)

  const hide = useCallback(() => {
    isVisibleRef.current = false
    setToolbar((t) => (t.visible ? { ...t, visible: false } : t))
  }, [])

  const getSelectedText = useCallback((): string => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return ''
    return sel.toString().trim()
  }, [])

  const readSelection = useCallback(() => {
    const text = toolbar.text
    if (!text) return
    speechService.stop()
    speechService.speak({
      text,
      lang: normalizeBanglaLang(undefined),
    })
    hide()
  }, [toolbar.text, hide])

  const computePosition = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      hide()
      return
    }
    const range = sel.getRangeAt(0)
    if (!isInsideContainer(container, range.commonAncestorContainer)) {
      hide()
      return
    }
    const text = sel.toString().trim()
    if (!text) {
      hide()
      return
    }
    const rect = range.getBoundingClientRect()
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      hide()
      return
    }

    // Clamp inside the viewport; on small screens keep clear of the bottom bar.
    // `x` is the CENTRE of the toolbar (the component centres it via
    // translateX(-50%)), so clamp the centre, not the left edge.
    const vw = window.innerWidth
    const vh = window.innerHeight
    const isSmall = vw < 768
    const bottomSafe = isSmall ? MOBILE_BOTTOM_SAFE : 12
    const half = EST_TOOLBAR_WIDTH / 2
    const centerX = rect.left + rect.width / 2
    const left = Math.max(half + 8, Math.min(centerX, vw - half - 8))
    // Sit just above the selection, never above the top edge, never behind the
    // bottom controls.
    let top = rect.top - 8 - 44
    top = Math.min(top, vh - bottomSafe - 44)
    top = Math.max(8, top)

    isVisibleRef.current = true
    setToolbar({ visible: true, x: left, y: top, text })
  }, [containerRef, hide])

  const scheduleCompute = useCallback(() => {
    if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      computePosition()
    })
  }, [computePosition])

  const onSelectionMaybeChanged = useCallback(() => {
    if (!enabledRef.current) {
      hide()
      return
    }
    // Ignore selections that originate inside interactive controls.
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer
      const el = node.nodeType === 3 ? node.parentElement : (node as HTMLElement | null)
      if (el && ignoreSelector && el.closest(ignoreSelector)) {
        hide()
        return
      }
    }
    scheduleCompute()
  }, [hide, ignoreSelector, scheduleCompute])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseUp = () => {
      setTimeout(() => onSelectionMaybeChanged(), 10)
    }
    const onTouchEnd = () => {
      // Give mobile browsers time to finalise the long-press selection.
      setTimeout(() => onSelectionMaybeChanged(), 50)
    }
    const onSelectionChange = () => onSelectionMaybeChanged()
    const onScrollOrResize = () => {
      // Reposition the existing toolbar to follow the selection / rotation
      // rather than hiding it.
      if (isVisibleRef.current) scheduleCompute()
    }

    container.addEventListener('mouseup', onMouseUp)
    container.addEventListener('touchend', onTouchEnd)
    document.addEventListener('selectionchange', onSelectionChange)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('orientationchange', onScrollOrResize)

    return () => {
      container.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('orientationchange', onScrollOrResize)
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ignoreSelector, onSelectionMaybeChanged, scheduleCompute])

  return {
    toolbar,
    readSelection,
    hide,
  }
}
