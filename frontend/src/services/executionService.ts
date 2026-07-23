import api from '../config/api'
import { simulateExecution } from '../utils/codeSimulator'
import type { ExecutionStatus, RunResult } from '../utils/codeRunner'

type BackendResponse = {
  stdout: string | null
  stderr: string | null
  status: { id: number; description: string }
  time: string
  memory: string
}

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
}

export async function executeCodeOnBackend(
  sourceCode: string,
  language: string,
  stdin = '',
): Promise<RunResult | null> {
  const langId = LANGUAGE_IDS[language]
  if (!langId) return null

  try {
    const { data } = await api.post<BackendResponse>(
      '/execute',
      { source_code: sourceCode, language_id: langId, stdin },
      { timeout: 15000 },
    )

    const statusDesc = data.status?.description ?? ''
    let status: ExecutionStatus = 'success'
    if (statusDesc === 'Runtime Error') status = 'error'
    else if (statusDesc === 'Time Limit Exceeded') status = 'timeout'
    else if (statusDesc === 'Internal Error') status = 'error'

    return {
      stdout: data.stdout ?? '',
      stderr: data.stderr ?? '',
      guidance: null,
      status,
    }
  } catch (err) {
    if (api.isAxiosError(err) && err.code === 'ECONNABORTED') {
      return {
        stdout: '',
        stderr: 'Execution timed out. Your code took too long to run.',
        guidance: 'Execution timed out. Your code took too long to run.',
        status: 'timeout',
      }
    }
    if (api.isAxiosError(err) && !err.response) {
      return null
    }
    if (api.isAxiosError(err) && err.response?.data) {
      return {
        stdout: '',
        stderr: err.response.data.message ?? err.response.data.stderr ?? 'Execution failed on server.',
        guidance: null,
        status: 'error',
      }
    }
    return null
  }
}

export async function executePython(
  code: string,
  stdin = '',
): Promise<RunResult> {
  const backendResult = await executeCodeOnBackend(code, 'python', stdin)
  if (backendResult) return backendResult

  const sim = simulateExecution(code, stdin)
  return {
    stdout: sim.stdout,
    stderr: sim.stderr || '',
    guidance: sim.banglaGuidance,
    status: sim.stderr ? 'error' : 'success',
  }
}

export async function executeJavaScript(
  code: string,
  stdin = '',
): Promise<RunResult> {
  const backendResult = await executeCodeOnBackend(code, 'javascript', stdin)
  if (backendResult) return backendResult

  const sim = simulateExecution(code, stdin)
  return {
    stdout: sim.stdout,
    stderr: sim.stderr || '',
    guidance: sim.banglaGuidance,
    status: sim.stderr ? 'error' : 'success',
  }
}
