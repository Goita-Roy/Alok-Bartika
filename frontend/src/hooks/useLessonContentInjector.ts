import { useCallback, useEffect, useRef } from 'react'

type AccordionConfig = {
  headerSelector: string
  toggleClass: string
  closeOthers: boolean
} | null

const ACCORDION_META: Record<string, AccordionConfig> = {
  'accordion-item':       { headerSelector: '.accordion-header', toggleClass: 'active', closeOthers: true },
  'acc-item':             { headerSelector: '.acc-trigger',      toggleClass: 'open',   closeOthers: false },
  details:                null,
  'details-acc-trigger': null,
  'acc-btn':              { headerSelector: '.acc-btn',          toggleClass: 'open',   closeOthers: false },
  'acc-head':             { headerSelector: '.acc-head',         toggleClass: 'open',   closeOthers: false },
  'acc-left':             { headerSelector: '.acc-head',         toggleClass: 'open',   closeOthers: false },
}

function attachAccordionHandler(practiceEl: Element, type: string): void {
  const meta = ACCORDION_META[type]
  if (!meta) return
  const header = practiceEl.querySelector(meta.headerSelector) as HTMLElement | null
  if (!header) return
  const toggle = () => {
    const item = header.closest('.accordion-item, .acc-item, details, .card-neon') || header.parentElement
    if (!item) return
    item.classList.toggle(meta.toggleClass)
    if (meta.closeOthers) {
      const container = item.parentElement
      if (container) {
        container.querySelectorAll(`.${meta.toggleClass}`).forEach((el) => {
          if (el !== item) el.classList.remove(meta.toggleClass)
        })
      }
    }
  }
  header.onclick = toggle
}

const PRACTICE_HTML_BY_TYPE: Record<string, string> = {
  'accordion-item': `<div class="accordion-item">
  <div class="accordion-header">
    <span>\u{1F4BB} Practice in Python IDE</span>
    <span class="accordion-icon">\u25BC</span>
  </div>
  <div class="accordion-content">
    <p style="margin:0;font-size:14px;line-height:1.6;color:#B8C5C1">\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p>
    <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;align-self:flex-start;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">\u{1F680} Open Python IDE</a>
  </div>
</div>`,

  'acc-item': `<div class="acc-item">
  <button class="acc-trigger">
    <div class="acc-trigger-left">
      <div class="acc-icon" style="background:rgba(101,209,178,0.15);color:#65D1B2">\u{1F4BB}</div>
      <div style="text-align:left">
        <div class="acc-title">Practice in Python IDE</div>
        <div class="acc-sub">\u0986\u09B2\u09CB\u0995\u09AC\u09B0\u09CD\u09A4\u09BF\u0995\u09BE IDE-\u09A4\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8</div>
      </div>
    </div>
    <div class="acc-chevron">\u25BC</div>
  </button>
  <div class="acc-body">
    <div class="acc-content">
      <div class="acc-content-inner">
        <p>\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p>
        <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2)">\u{1F680} Open Python IDE</a>
      </div>
    </div>
  </div>
</div>`,

  details: `<details class="accordion">
  <summary><span class="ico" style="background:rgba(101,209,178,.15);color:var(--cyan)">\u{1F4BB}</span><span style="color:var(--cyan)">Practice in Python IDE</span></summary>
  <div class="body"><p style="margin:0;color:#d1d5db">\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">\u{1F680} Open Python IDE</a></div>
</details>`,

  'details-acc-trigger': `<details class="acc-item" style="border-color:rgba(101,209,178,0.3)">
  <summary class="acc-trigger"><span class="left"><span style="font-size:1.3rem;color:#65D1B2">\u{1F4BB}</span><span style="color:#65D1B2">Practice in Python IDE</span></span><span class="chev">\u25BE</span></summary>
  <div class="acc-body">
    <div class="hint"><span class="e" style="font-size:1.3rem;">\u{1F4BB}</span><div><p class="font-pixel" style="font-size:10px;margin:0 0 6px;color:#65D1B2">IDE A\u2009ONLINE</p><p style="margin:0;">\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p><a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">\u{1F680} Open Python IDE</a></div></div>
  </div>
</details>`,

  'acc-btn': `<div class="acc-item" style="border-color:rgba(101,209,178,0.3)">
  <button class="acc-btn">
    <span class="acc-emoji">\u{1F4BB}</span>
    <span class="acc-title">Practice in Python IDE</span>
    <span class="acc-chev">\u25BC</span>
  </button>
  <div class="acc-body">
    <div class="ai-row">
      <div class="ai-icon">\u{1F4BB}</div>
      <p>\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p>
      <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">\u{1F680} Open Python IDE</a>
    </div>
  </div>
</div>`,

  'acc-head': `<div class="acc-item">
  <button class="acc-head"><span><span class="ico">\u{1F4BB}</span> Practice in Python IDE</span><span class="chev">\u25BC</span></button>
  <div class="acc-body">
    <div style="display:flex;gap:14px;align-items:center;padding:14px;border-radius:12px;background:#0a0b22;border:1px solid var(--border)">
      <div style="font-size:46px;animation:bounce 2s ease-in-out infinite">\u{1F4BB}</div>
      <div>
        <div style="font-family:'Press Start 2P',cursive;font-size:10px;color:#65D1B2">IDE OPEN</div>
        <div style="color:var(--muted);font-size:14px;margin-top:6px">\u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</div>
        <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;margin-top:8px">\u{1F680} Open Python IDE</a>
      </div>
    </div>
  </div>
</div>`,

  'acc-left': `<div class="acc-item">
  <div class="acc-head">
    <div class="left"><span class="ico">\u{1F4BB}</span><span>Practice in Python IDE</span></div>
    <span class="arrow">\u25BC</span>
  </div>
  <div class="acc-body">
    <div class="ai-box">
      <div class="avatar">\u{1F4BB}</div>
      <p><strong>IDE \u09AA\u09CD\u09B0\u09B8\u09CD\u09A4\u09C1\u09A4:</strong> \u098F\u0996\u09A8 \u09A8\u09BF\u099C\u09C7\u0987 \u0995\u09CB\u09A1 \u09B2\u09BF\u0996\u09C7 \u0985\u09A8\u09C1\u09B6\u09C0\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8\u0964 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09BE\u099F\u09A8\u09C7 \u0995\u09CD\u09B2\u09BF\u0995 \u0995\u09B0\u09C7 Python IDE-\u09A4\u09C7 \u0997\u09BF\u09DF\u09C7 \u098F\u0987 \u09AA\u09BE\u09A0\u09C7\u09B0 \u0995\u09CB\u09A1 \u09A8\u09BF\u099C\u09C7 \u09B2\u09BF\u0996\u09C7 \u09A6\u09C7\u0996\u09C1\u09A8\u0964</p>
      <a href="/development" target="_parent" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;background:#65D1B2;color:#04342C;text-decoration:none;box-shadow:0 0 16px rgba(101,209,178,0.2);margin-top:8px">\u{1F680} Open Python IDE</a>
    </div>
  </div>
</div>`,
}

function detectAccordionType(aiEl: Element): string | null {
  const item = aiEl.closest('.accordion-item, .acc-item, details, .card-neon')
  if (!item) return null
  if (item.matches('.accordion-item')) return 'accordion-item'
  if (item.matches('details')) {
    if (item.querySelector('.acc-trigger')) return 'details-acc-trigger'
    return 'details'
  }
  if (item.matches('.card-neon')) return 'card-neon'
  if (item.matches('.acc-item')) {
    if (item.querySelector('.acc-btn')) return 'acc-btn'
    if (item.querySelector('.acc-head')) {
      // Check for .left pattern (c6_calculator, c6_mars_orbiter)
      if (item.querySelector('.acc-head .left')) return 'acc-left'
      return 'acc-head'
    }
    if (item.querySelector('.acc-header')) return 'acc-item'
    if (item.querySelector('.acc-trigger')) return 'acc-item'
    return 'acc-item'
  }
  return 'acc-item'
}

function injectPractice(doc: Document): boolean {
  if (!doc?.body) { console.log('[PI] no body'); return false }

  if (doc.querySelector('[data-practice-injected]')) { console.log('[PI] already injected'); return true }

  // If the card text already exists in the document (manually added), skip injection to avoid duplicates
  if ((doc.body.textContent || '').includes('Practice in Python IDE')) {
    console.log('[PI] Practice card already present in document (manually added), skipping injection')
    return true
  }

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
  let node: Text | null
  let count = 0
  while ((node = walker.nextNode() as Text | null)) {
    count++
    const text = node.textContent || ''
    if (text.includes('AI Coding Companion') || text.includes('AI Coding Companion')) {
      console.log('[PI] found AI Coding Companion text')
      const parent = node.parentElement
      if (!parent) { console.log('[PI] no parent'); continue }
      const aiItem = parent.closest('.accordion-item, .acc-item, details, .card-neon')
      if (!aiItem || !aiItem.parentNode) { console.log('[PI] no aiItem container'); continue }

      const type = detectAccordionType(parent)
      if (!type) { console.log('[PI] no type detected'); continue }
      console.log('[PI] detected type:', type)

      let html = PRACTICE_HTML_BY_TYPE[type]
      if (!html) html = PRACTICE_HTML_BY_TYPE['acc-item']

      const temp = doc.createElement('div')
      temp.innerHTML = html
      const practiceEl = temp.firstElementChild
      if (!practiceEl) { console.log('[PI] no practiceEl'); continue }

      practiceEl.setAttribute('data-practice-injected', '')
      aiItem.parentNode.insertBefore(practiceEl, aiItem.nextSibling)
      console.log('[PI] PRACTICE INSERTED after aiItem')

      attachAccordionHandler(practiceEl, type)
      console.log('[PI] handler attached for type:', type, '| toggleAccordion exists:', typeof (doc.defaultView as any)?.toggleAccordion === 'function')

      if (typeof (doc.defaultView as any)?.onPracticeAdded === 'function') {
        ;(doc.defaultView as any).onPracticeAdded()
      }

      return true
    }
  }
  console.log('[PI] text nodes scanned:', count, '- no AI Coding Companion found')
  return false
}

// Hide the original HTML "Chapter Progress" bar and the in-lesson
// Previous/Next navigation that ship inside the embedded Advanced lesson.
// Both are duplicates of the React navigation/progress system. We only hide
// the UI — the lesson content itself is never modified.
function hideChapterProgress(doc: Document): void {
  if (!doc?.body) return
  if (doc.querySelector('[data-chapter-progress-hidden]')) return

  const style = doc.createElement('style')
  style.setAttribute('data-chapter-progress-hidden', '')
  style.textContent = `
    .progress-bar-sticky,
    .progress-header,
    .progress-track,
    .nav-footer { display: none !important; }
  `
  doc.head.appendChild(style)

  const bar = doc.querySelector('.progress-bar-sticky')
  if (bar instanceof HTMLElement) {
    bar.style.display = 'none'
  }
  const nav = doc.querySelector('.nav-footer')
  if (nav instanceof HTMLElement) {
    nav.style.display = 'none'
  }
}

export function useLessonContentInjector(iframeRef: React.RefObject<HTMLIFrameElement | null>, lessonUrl?: string) {
  const injectedRef = useRef(false)

  const inject = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe || injectedRef.current) return
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (!doc) { console.log('[PI] no doc'); return }
      if (injectPractice(doc)) {
        console.log('[PI] SUCCESS - Practice injected')
        injectedRef.current = true
      } else {
        console.log('[PI] injectPractice returned false')
      }
      hideChapterProgress(doc)
    } catch (e) {
      console.error('[PI] inject error:', e)
    }
  }, [iframeRef])

  useEffect(() => {
    if (!lessonUrl) { console.log('[PI] no lessonUrl'); return }
    console.log('[PI] effect running, lessonUrl:', lessonUrl)
    injectedRef.current = false

    const iframe = iframeRef.current
    if (!iframe) { console.log('[PI] no iframe ref'); return }

    const onLoad = () => {
      console.log('[PI] iframe load event fired')
      inject()
      setTimeout(inject, 500)
      setTimeout(inject, 1500)
    }

    iframe.addEventListener('load', onLoad)
    if (iframe.contentDocument?.readyState === 'complete') {
      console.log('[PI] iframe already complete')
      onLoad()
    }

    return () => {
      iframe.removeEventListener('load', onLoad)
    }
  }, [lessonUrl, inject, iframeRef])
}
