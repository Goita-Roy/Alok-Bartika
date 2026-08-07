import { useSearchParams } from 'react-router-dom'
import { IDELearningEnvironment } from '../components/ide-learning/IDELearningEnvironment'
import { useDailyCodingTracker } from '../hooks/useDailyCodingTracker'

export function PracticePage() {
  useDailyCodingTracker(true)
  const [searchParams] = useSearchParams()
  const resumeKey = searchParams.get('resume') || undefined
  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-hidden p-2 sm:p-3 lg:p-4 animate-in fade-in duration-500"
      style={{ backgroundColor: 'var(--color-bg)' }}>
      <IDELearningEnvironment mode="sandbox" practiceKey={resumeKey} />
    </div>
  )
}
