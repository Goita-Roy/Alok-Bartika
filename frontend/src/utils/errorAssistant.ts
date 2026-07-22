import { analyzeCode } from './codeAnalyzer'

export interface CodeError {
  line: number
  message: string
  banglaGuidance: string
  type: 'syntax' | 'logic' | 'warning'
}

export const analyzePythonCode = (code: string): CodeError | null => {
  const errors = analyzeCode('python', code)
  if (!errors.length) return null
  const e = errors[0]
  return {
    line: e.line,
    message: e.message,
    banglaGuidance: e.banglaExplanation,
    type: e.type === 'runtime' ? 'logic' : e.type === 'warning' ? 'warning' : e.type,
  }
}
