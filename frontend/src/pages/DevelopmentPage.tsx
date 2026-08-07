import { IDELearningEnvironment } from '../components/ide-learning/IDELearningEnvironment'
import { useLearningTracker } from '../hooks/useLearningTracker'
import { useDailyCodingTracker } from '../hooks/useDailyCodingTracker'

export function DevelopmentPage() {
  useLearningTracker()
  useDailyCodingTracker(true)
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-hidden p-2 sm:p-3 lg:p-4 animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <IDELearningEnvironment mode="learning" />
    </div>
  )
}

export default DevelopmentPage
