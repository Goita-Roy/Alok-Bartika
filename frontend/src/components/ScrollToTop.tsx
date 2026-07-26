import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls to the top of the page on every pathname change.
 *
 * Why this is needed:
 * - React Router v6 with BrowserRouter does NOT reliably scroll to top on
 *   POP navigation (browser Back/Forward button). It defers to the browser's
 *   native scroll restoration, which restores the previous scroll position.
 * - PUSH navigation (Link, navigate()) can also miss scroll-to-top when
 *   pages use fixed positioning (e.g. LessonViewPage).
 * - This component listens to pathname changes and forces scrollTo(0, 0),
 *   ensuring every route change starts from the top.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
