/**
 * GlobalErrorBoundary — catches ANY rendering error in the React tree so a
 * single unexpected exception can never white-screen the whole LMS.
 *
 * Shows a friendly Bengali error page with:
 *   - Retry button   (re-renders the boundary's children)
 *   - Go Home button  (navigates to /)
 *   - Reload button   (full page reload)
 *
 * Stack traces are intentionally NOT shown to students; they are only logged to
 * the console (and could be forwarded to an error service in production).
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
  message: string
}

// Uses a safe, Router-independent navigation so the error view can render even
// when the GlobalErrorBoundary sits ABOVE the <BrowserRouter> (no Router
// context is available here). A full-page navigation to "/" is always safe.
function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  const goHome = () => {
    window.location.href = '/'
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#04342C' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center"
        style={{
          backgroundColor: '#0A4A3F',
          border: '1.5px solid rgba(101,209,178,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div className="text-6xl mb-5">😢</div>
        <h1 className="text-2xl font-black mb-2" style={{ color: '#65D1B2' }}>
          কিছু একটা গোলমাল হয়েছে!
        </h1>
        <p className="text-sm font-semibold mb-1" style={{ color: '#B8C5C1' }}>
          দুঃখিত, এই পাতাটি ঠিকমতো লোড হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।
        </p>
        {message ? (
          <p
            className="text-xs font-medium mb-6 mt-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: 'rgba(248,113,113,0.12)', color: '#fca5a5' }}
          >
            {message}
          </p>
        ) : (
          <div className="mb-6" />
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#65D1B2', color: '#04342C' }}
          >
            🔄 আবার চেষ্টা করুন
          </button>
          <div className="flex gap-3">
            <button
              onClick={goHome}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: '#65D1B2', border: '1px solid rgba(101,209,178,0.20)' }}
            >
              🏠 হোমে যান
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/10"
              style={{ backgroundColor: 'rgba(101,209,178,0.10)', color: '#65D1B2', border: '1px solid rgba(101,209,178,0.20)' }}
            >
              ⟳ পাতা রিলোড
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log only — never expose to students.
    // eslint-disable-next-line no-console
    console.error('[GlobalErrorBoundary]', error, info?.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView message={this.state.message} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
