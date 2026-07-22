/**
 * WidgetErrorBoundary — isolates a SINGLE dashboard card/widget. If the widget
 * throws while rendering, only that card shows an error state; the rest of the
 * dashboard (XP, Leaderboard, Continue Learning, etc.) keeps working.
 *
 * It accepts an optional `onRetry` so the widget can re-fetch its data, and a
 * `title` for a friendly Bengali message.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { WidgetErrorState } from './WidgetErrorState'

interface Props {
  children: ReactNode
  title?: string
  onRetry?: () => void
}
interface State {
  hasError: boolean
}

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[WidgetErrorBoundary]', this.props.title || '', error, info?.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
    // Give the child a chance to remount successfully; then trigger data refetch.
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return <WidgetErrorState title={this.props.title} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
