import { executePython } from '../services/executionService'
import { simulateExecution } from './codeSimulator'
import type { SupportedLanguage } from '../data/ideLessonData'

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'timeout' | 'cancelled'

export type RunResult = {
  stdout: string
  stderr: string
  guidance: string | null
  status: ExecutionStatus
  previewHtml?: string
}

type WorkspaceFile = { name: string; language: SupportedLanguage; content: string }

function extractPrintfMessage(code: string): string | null {
  const match = code.match(/printf\s*\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"/)
  if (!match) return null
  return match[1].replace(/\\n/g, '\n')
}

function extractJavaPrintln(code: string): string | null {
  const match = code.match(/System\.out\.println\s*\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*\)/)
  if (!match) return null
  return match[1]
}

function extractCppOutput(code: string): string | null {
  const match = code.match(/<<\s*"([^"\\]*(?:\\.[^"\\]*)*)"/)
  if (!match) return null
  return match[1]
}

function runJavaScript(code: string): RunResult {
  const logs: string[] = []
  const originalLog = console.log
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(console as any).log = (...args: unknown[]) => {
      logs.push(args.map(String).join(' '))
    }
    // eslint-disable-next-line no-new-func
    const fn = new Function(code)
    fn()
    return {
      stdout: logs.join('\n'),
      stderr: '',
      guidance: null,
      status: 'success',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      stdout: logs.join('\n'),
      stderr: message,
      guidance: 'JavaScript error: check brackets, quotes, and variable names.',
      status: 'error',
    }
  } finally {
    console.log = originalLog
  }
}

function runWeb(files: WorkspaceFile[]): RunResult {
  const html = files.find((f) => f.language === 'html')?.content ?? ''
  const css = files.find((f) => f.language === 'css')?.content ?? ''
  const js = files.find((f) => f.language === 'javascript')?.content ?? ''

  let doc = html
  if (css && !doc.includes('style.css')) {
    doc = doc.replace('</head>', `<style>\n${css}\n</style>\n</head>`)
  }
  if (js) {
    doc = doc.replace('</body>', `<script>\n${js}\n</script>\n</body>`)
  }

  return {
    stdout: 'Preview panel-এ web page render হয়েছে।',
    stderr: '',
    guidance: null,
    status: 'success',
    previewHtml: doc,
  }
}

export async function runWorkspaceCode(
  activeLanguage: SupportedLanguage,
  files: WorkspaceFile[],
  activeFile: WorkspaceFile,
  stdin = '',
): Promise<RunResult> {
  if (activeLanguage === 'python') {
    try {
      return await executePython(activeFile.content, stdin)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { stdout: '', stderr: message, guidance: null, status: 'error' }
    }
  }

  if (activeLanguage === 'javascript') {
    return runJavaScript(activeFile.content)
  }

  if (activeLanguage === 'html' || activeLanguage === 'css') {
    return runWeb(files)
  }

  if (activeLanguage === 'c') {
    const msg = extractPrintfMessage(activeFile.content)
    if (!msg) {
      return {
        stdout: '',
        stderr: 'Compilation error: could not find printf output.',
        guidance: 'Use printf("your message\\n"); inside main().',
        status: 'error',
      }
    }
    return {
      stdout: msg,
      stderr: '',
      guidance: null,
      status: 'success',
    }
  }

  if (activeLanguage === 'cpp') {
    const msg = extractCppOutput(activeFile.content)
    if (!msg) {
      return {
        stdout: '',
        stderr: 'Compilation error on line 1: check #include <iostream> and std::cout.',
        guidance: 'std::cout << "message" << std::endl; ব্যবহার করুন।',
        status: 'error',
      }
    }
    return {
      stdout: msg,
      stderr: '',
      guidance: null,
      status: 'success',
    }
  }

  if (activeLanguage === 'java') {
    const msg = extractJavaPrintln(activeFile.content)
    if (!msg) {
      return {
        stdout: '',
        stderr: 'Compilation error on line 1: check class name and System.out.println.',
        guidance: 'Class name অবশ্যই file name এর সাথে মিলতে হবে (Main.java → class Main).',
        status: 'error',
      }
    }
    return {
      stdout: msg,
      stderr: '',
      guidance: null,
      status: 'success',
    }
  }

  return {
    stdout: '',
    stderr: 'Unsupported language',
    guidance: null,
    status: 'error',
  }
}

export function validateAgainstExpected(actual: string, expected?: string): boolean {
  if (!expected) return true
  return actual.trim().replace(/\r\n/g, '\n') === expected.trim().replace(/\r\n/g, '\n')
}
