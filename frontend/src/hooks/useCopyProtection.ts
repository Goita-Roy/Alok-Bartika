import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export function useCopyProtection(enabled = true) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!enabled || isAdmin) return

    // Inject styles to prevent print and text selection
    const styleEl = document.createElement('style')
    styleEl.innerHTML = `
      @media print {
        body {
          display: none !important;
        }
      }
      .no-copy-zone {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
      }
      .no-copy-zone input,
      .no-copy-zone textarea,
      .no-copy-zone [contenteditable="true"],
      .no-copy-zone .monaco-editor,
      .no-copy-zone .cm-content {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }
      /* The Audio Learning System needs real text selection (to read a
         selection aloud) but copy itself stays blocked by the handlers below. */
      .no-copy-zone .tts-selectable,
      .no-copy-zone .tts-selectable * {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `
    document.head.appendChild(styleEl)

    // Add className to body
    document.body.classList.add('no-copy-zone')

    const preventDefault = (e: Event) => {
      // Safely resolve e.target to an Element (it may be a Text or Comment node)
      const node = e.target
      const element =
        node instanceof Element
          ? node
          : node instanceof Node
            ? node.parentElement
            : null
      if (
        !element ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        (element as HTMLElement).isContentEditable ||
        element.closest('.monaco-editor') ||
        element.closest('.cm-content')
      ) {
        return
      }
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const node = e.target
      const element =
        node instanceof Element
          ? node
          : node instanceof Node
            ? node.parentElement
            : null
      const isInput = !element ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        (element as HTMLElement).isContentEditable ||
        element.closest('.monaco-editor') ||
        element.closest('.cm-content')

      const key = e.key.toLowerCase()
      const ctrlOrCmd = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // Save: Ctrl+S
      if (ctrlOrCmd && key === 's') {
        e.preventDefault()
        return
      }

      // Print: Ctrl+P
      if (ctrlOrCmd && key === 'p') {
        e.preventDefault()
        return
      }

      // Dev tools shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+Shift+C
      if (
        key === 'f12' ||
        (ctrlOrCmd && shift && (key === 'i' || key === 'j' || key === 'c')) ||
        (ctrlOrCmd && key === 'u')
      ) {
        e.preventDefault()
        return
      }

      // Copy, Cut & Paste: Ctrl+C, Ctrl+X, Ctrl+V (block outside input/code-editor)
      if (ctrlOrCmd && (key === 'c' || key === 'x' || key === 'v') && !isInput) {
        e.preventDefault()
        return
      }

      // Select All: Ctrl+A (block outside input/code-editor)
      if (ctrlOrCmd && key === 'a' && !isInput) {
        e.preventDefault()
        return
      }
    }

    // Context menu block (Right click) — allowed inside Audio Learning content
    // so the native text-selection menu can appear (copy stays blocked below).
    const handleContextMenu = (e: MouseEvent) => {
      const node = e.target
      const element =
        node instanceof Element
          ? node
          : node instanceof Node
            ? node.parentElement
            : null
      if (element && element.closest('.tts-selectable')) return
      preventDefault(e)
    }

    // Drag and drop block
    const handleDragStart = (e: DragEvent) => {
      preventDefault(e)
    }

    // Selection block (selectstart) — but allow it inside the Audio Learning
    // content so students can select text to be read aloud.
    const handleSelectStart = (e: Event) => {
      const node = e.target
      const element =
        node instanceof Element
          ? node
          : node instanceof Node
            ? node.parentElement
            : null
      if (element && element.closest('.tts-selectable')) return
      preventDefault(e)
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', preventDefault)
    document.addEventListener('cut', preventDefault)
    document.addEventListener('paste', preventDefault)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      if (styleEl.parentNode) {
        document.head.removeChild(styleEl)
      }
      document.body.classList.remove('no-copy-zone')
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', preventDefault)
      document.removeEventListener('cut', preventDefault)
      document.removeEventListener('paste', preventDefault)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, isAdmin])
}
