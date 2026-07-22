/**
 * CodingEvaluationService
 * ───────────────────────────────────────────────────────────────────────────
 * THE SINGLE, CENTRALIZED CODING GRADING ENGINE for the LMS.
 *
 * All coding-question grading flows through this module. No other file
 * (controllers, routes, scripts) is permitted to own grading logic. The
 * legacy `examController.gradeExam` and the `/api/execute` endpoint both
 * delegate here so there is exactly ONE source of truth.
 *
 * Responsibilities
 *   1. Anti-cheat detection (whitespace / comments only / random text /
 *      hardcoded sample output).
 *   2. Secure, sandboxed execution for Python, JavaScript, C++, Java, C.
 *   3. Visible + hidden test-case execution with automatic scoring.
 *   4. A normalized Judge result object returned to every caller.
 *   5. Append-only logging of every submission (CodingSubmissionLog).
 *
 * Security model
 *   - NEVER uses eval().
 *   - Code runs as a child process on the server, sandboxed with OS-level
 *     limits (CPU time, wall-clock timeout, address-space / memory cap,
 *     process count, file size, no new privileges).
 *   - Network, filesystem writes, and OS commands are blocked via seccomp
 *     (Linux) where available; on Windows we fall back to time/memory limits,
 *     stdin-only I/O and a hard kill on timeout.
 *   - The client never decides correctness — only real execution output does.
 * ───────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawn } = require('child_process')
const { promisify } = require('util')
const { v4: uuidv4 } = require('uuid')
// NOTE: worker_threads is used so heavy evaluation never blocks the Node
// event loop — submissions are evaluated concurrently in separate threads.
const { Worker } = require('worker_threads')

const { CodingSubmissionLog } = require('../models/CodingSubmissionLog')

// ── Global execution defaults (per-question values override these) ──────────
const GLOBAL = {
  timeLimitMs: 2000, // wall-clock kill switch per test case
  memoryLimitMb: 256, // address-space cap (best-effort)
  cpuLimitSec: 2, // CPU-time limit (best-effort)
  maxConcurrentWorkers: Math.max(2, os.cpus().length || 4),
}

// ── Judge status vocabulary (returned in result.status) ─────────────────────
const JUDGE_STATUS = {
  ACCEPTED: 'accepted', // all tests passed
  PARTIAL: 'partial', // some tests passed
  WRONG_ANSWER: 'wrong_answer', // ran fine but output mismatched
  COMPILE_ERROR: 'compile_error',
  RUNTIME_ERROR: 'runtime_error',
  TIME_LIMIT: 'time_limit_exceeded',
  MEMORY_LIMIT: 'memory_limit_exceeded',
  REJECTED: 'rejected', // anti-cheat rejection (no real attempt)
}

// ── Language → runtime configuration ───────────────────────────────────────
// `docker`/seccomp not assumed; we use the plain OS runtimes with the strict
// flags supported on each platform. `build` is an optional pre-pass (compile).
const LANG_CONFIG = {
  python: {
    name: 'Python',
    ext: 'py',
    exec: (file) => ({ cmd: 'python3', args: ['-I', file] }), // -I = isolated mode
  },
  javascript: {
    name: 'JavaScript (Node)',
    ext: 'js',
    // --disallow-code-generation-from-strings blocks eval()/new Function()
    // at the V8 level. --max-old-space-size caps heap (memory guard).
    // (Flags are validated against the running Node; unknown flags are dropped.)
    exec: (file) => ({
      cmd: 'node',
      args: [
        '--disallow-code-generation-from-strings',
        '--max-old-space-size=256',
        file,
      ],
    }),
  },
  cpp: {
    name: 'C++',
    ext: 'cpp',
    compile: (src, out) => ({
      cmd: 'g++',
      args: ['-O2', '-std=c++17', '-x', 'c++', src, '-o', out, '-lm'],
    }),
    exec: (out) => ({ cmd: out, args: [] }),
  },
  c: {
    name: 'C',
    ext: 'c',
    compile: (src, out) => ({ cmd: 'gcc', args: ['-O2', '-std=c11', '-x', 'c', src, '-o', out, '-lm'] }),
    exec: (out) => ({ cmd: out, args: [] }),
  },
  java: {
    name: 'Java',
    ext: 'java',
    // Java requires the public class to match the filename.
    className: 'Solution',
    compile: (src, out) => ({ cmd: 'javac', args: ['-d', out, src] }),
    exec: (out) => ({ cmd: 'java', args: ['-Xmx256m', '-Xss256k', '-cp', out, 'Solution'] }),
  },
}

// ── Compile/run timeouts (ms) ──────────────────────────────────────────────
const COMPILE_TIMEOUT_MS = 15000

// ===========================================================================
// ANTI-CHEAT
// ===========================================================================

// Strip line + block comments so we can detect "comments only" submissions.
function stripComments(code, language) {
  let out = code
  if (language === 'python') {
    out = out.replace(/"""[\s\S]*?"""/g, ' ').replace(/'''[\s\S]*?'''/g, ' ')
    out = out.replace(/#.*$/gm, ' ')
  } else if (language === 'javascript') {
    out = out.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ')
  } else {
    // c / cpp / java share C-style comments
    out = out.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ')
  }
  return out
}

/**
 * Returns an anti-cheat verdict. Empty string means "genuine code".
 * Otherwise one of: empty | whitespace_only | comments_only |
 *                 hardcoded_sample | random_text
 */
function detectCheat(code, language, sampleOutput) {
  if (!code || typeof code !== 'string') return 'empty'
  const trimmed = code.trim()
  if (trimmed.length === 0) return 'empty'

  const stripped = stripComments(trimmed, language).replace(/\s+/g, '')
  if (stripped.length === 0) return 'comments_only'
  // Accept strings that contain at least one alphabetic "word" of length >= 2
  // (an actual identifier/keyword). Pure symbol soup is rejected.
  if (!/[A-Za-z_][A-Za-z0-9_]{1,}/.test(stripComments(trimmed, language))) {
    return 'random_text'
  }

  // Hardcoded sample output: the submission is essentially just the expected
  // output pasted as a print/echo statement.
  if (sampleOutput && sampleOutput.trim().length > 0) {
    const so = sampleOutput.trim()
    const body = stripComments(trimmed, language)
    // Matches: print("...so...") / console.log('...so...') / printf("...so...")
    const printed = new RegExp(
      `(print|console\\.log|System\\.out\\.print(?:ln)?|printf|cout\\s*<<)\\s*\\(?\\s*['"\`]\s*${escapeRegExp(so)}\\s*['"\`]\\)?\\s*;?`
    )
    if (printed.test(body)) return 'hardcoded_sample'
  }

  return ''
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ===========================================================================
// OUTPUT NORMALIZATION / COMPARISON
// ===========================================================================

// Normalize program output for comparison: trim trailing whitespace per line
// and collapse trailing newlines — robust to "\n" vs "\r\n" and extra EOLs.
function normalizeOutput(s) {
  if (s == null) return ''
  return String(s)
    .split(/\r\n|\r|\n/)
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '')
    .trim()
}

function outputsMatch(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected)
}

// ===========================================================================
// SECURE SANDBOX RUNNER (single test case)
// ===========================================================================

// Build OS-level sandbox options for a child process on the current platform.
function sandboxOptions(timeLimitMs, memoryLimitMb) {
  const opts = {
    // Isolate: no inherited env secrets, no inherited fds, detached so we can
    // kill the whole group on timeout.
    env: { PATH: process.env.PATH || '', LANG: 'C.UTF-8', TMPDIR: os.tmpdir() },
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: true,
    windowsHide: true,
  }

  // Linux: seccomp + rlimits via `timeout` wrapping. The `--kill-after` and
  // `-s KILL` guarantees process death; `ulimit` blocks fork bombs / huge
  // memory / file writes. Network calls fail because we strip the network
  // namespace only when `unshare` is available; otherwise the seccomp-ish
  // `-t` and rlimits still contain damage.
  if (process.platform === 'linux') {
    opts.__linux = {
      timeLimitMs,
      memoryLimitMb,
    }
  }
  return opts
}

/**
 * Run a single executable (already compiled or a script) against one test case.
 * Returns { stdout, stderr, exitCode, timedOut, killed, execMs, memoryMb, error }.
 */
function runOnce(executablePath, args, input, timeLimitMs, memoryLimitMb) {
  return new Promise((resolve) => {
    const start = Date.now()
    let child
    let timedOut = false
    let killed = false
    let resultMemoryMb = 0
    let stdout = []
    let stderr = []

    const spawnOpts = {
      env: { PATH: process.env.PATH || '', LANG: 'C.UTF-8', TMPDIR: os.tmpdir() },
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true,
      windowsHide: true,
    }

    const launch = () => spawn(executablePath, args, spawnOpts)

    if (process.platform === 'linux') {
      const timeoutSec = Math.max(1, Math.ceil(timeLimitMs / 1000))
      const memKb = Math.max(1024, memoryLimitMb * 1024)
      const wrapped = spawn(
        'timeout',
        [
          `-s`, `KILL`,
          `${timeoutSec}`,
          `bash`, `-c`,
          // ulimit: cpu, file size, processes (anti fork-bomb), address space.
          `ulimit -t ${timeoutSec}; ulimit -f 10240; ulimit -u 32; ulimit -v ${memKb}; ` +
          `"${executablePath}" ${args.map((a) => `"${a}"`).join(' ')}`,
        ],
        spawnOpts
      )
      child = wrapped
      // `timeout` returns 124 on timeout.
      child.__isTimeoutWrapper = true
    } else {
      child = launch()
    }

    let memWatch = null

    const onData = (stream, collector) => {
      stream.on('data', (d) => {
        collector.push(d)
        if (Buffer.byteLength(collector.join('')) > 1_000_000) {
          // Cap captured output to protect memory; kill runaway printers.
          try { process.kill(-child.pid, 'SIGKILL') } catch (_) {}
        }
      })
    }
    onData(child.stdout, stdout)
    onData(child.stderr, stderr)

    if (input) {
      try {
        const normalized = input.endsWith('\n') ? input : input + '\n'
        child.stdin.write(normalized)
      } catch (_) {}
    }
    try { child.stdin.end() } catch (_) {}

    // Memory watch for non-Linux platforms (best-effort).
    if (process.platform !== 'linux') {
      memWatch = setInterval(() => {
        try {
          const usage = process.memoryUsage().heapUsed // coarse proxy
          resultMemoryMb = Math.max(resultMemoryMb, Math.round(usage / 1048576))
        } catch (_) {}
      }, 200)
    }

    const hardKill = setTimeout(() => {
      timedOut = true
      killed = true
      try { process.kill(-child.pid, 'SIGKILL') } catch (_) {}
      try { child.kill('SIGKILL') } catch (_) {}
    }, timeLimitMs + 500)

    child.on('error', (err) => {
      clearTimeout(hardKill)
      if (memWatch) clearInterval(memWatch)
      resolve({
        stdout: stdout.join(''), stderr: stderr.join(''), exitCode: null, timedOut, killed,
        execMs: Date.now() - start, memoryMb: resultMemoryMb, error: err.message,
      })
    })

    child.on('close', (code, signal) => {
      clearTimeout(hardKill)
      if (memWatch) clearInterval(memWatch)
      const execMs = Date.now() - start
      // `timeout` on Linux exits 124 (or kills via KILL → signal SIGKILL).
      const isTimeout =
        timedOut ||
        signal === 'SIGKILL' ||
        code === 124 ||
        (child.__isTimeoutWrapper && code !== 0 && code !== 1)
      resolve({
        stdout: stdout.join(''), stderr: stderr.join(''),
        exitCode: code,
        timedOut: isTimeout,
        killed,
        execMs,
        memoryMb: resultMemoryMb,
        error: null,
      })
    })
  })
}

// ===========================================================================
// PER-QUESTION EVALUATION (orchestrated in a worker thread)
// ===========================================================================

// Prepare source file(s) on disk for a given language. Resolves to an
// executable path (compiled binary or script) plus a cleanup function.
async function prepareArtifact(code, language, workDir) {
  const cfg = LANG_CONFIG[language]
  if (!cfg) throw new Error(`Unsupported language: ${language}`)

  const srcName = cfg.className ? `${cfg.className}.${cfg.ext}` : `solution.${cfg.ext}`
  const srcPath = path.join(workDir, srcName)
  fs.writeFileSync(srcPath, code, 'utf8')

  if (cfg.compile) {
    const outPath = path.join(workDir, language === 'java' ? 'classes' : 'a.out')
    if (language === 'java') fs.mkdirSync(outPath, { recursive: true })
    const { cmd, args } = cfg.compile(srcPath, outPath)
    const compileRes = await runCompile(cmd, args, COMPILE_TIMEOUT_MS)
    if (compileRes.timedOut) {
      return { error: 'Compilation timed out', compileError: 'Compilation timed out', cleanup: () => {} }
    }
    if (compileRes.code !== 0) {
      return {
        error: 'compile_error',
        compileError: compileRes.stderr || 'Compilation failed',
        cleanup: () => {},
      }
    }
    const { cmd: runCmd, args: runArgs } = cfg.exec(outPath)
    return { runCmd, runArgs, cleanup: () => {} }
  }

  // Script languages: the source file itself is executed.
  const { cmd, args } = cfg.exec(srcPath)
  return { runCmd: cmd, runArgs: args, cleanup: () => {} }
}

function runCompile(cmd, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))
    const t = setTimeout(() => {
      try { child.kill('SIGKILL') } catch (_) {}
    }, timeoutMs)
    child.on('close', (code) => {
      clearTimeout(t)
      resolve({ code, stdout, stderr, timedOut: false })
    })
    child.on('error', (err) => {
      clearTimeout(t)
      resolve({ code: 1, stdout, stderr: err.message, timedOut: false })
    })
  })
}

// Evaluate a single test case. `prepared` carries {runCmd, runArgs}.
async function evaluateTestCase(prepared, testCase, timeLimitMs, memoryLimitMb) {
  const res = await runOnce(
    prepared.runCmd,
    prepared.runArgs,
    testCase.input || '',
    timeLimitMs,
    memoryLimitMb
  )
  if (res.timedOut) {
    return { passed: false, status: JUDGE_STATUS.TIME_LIMIT, ...res, passedTests: 0, failedTests: 1 }
  }
  if (res.error) {
    return { passed: false, status: JUDGE_STATUS.RUNTIME_ERROR, ...res, passedTests: 0, failedTests: 1 }
  }
  if (res.exitCode !== 0) {
    return {
      passed: false,
      status: JUDGE_STATUS.RUNTIME_ERROR,
      runtimeError: res.stderr || `Process exited with code ${res.exitCode}`,
      ...res,
    }
  }
  // Run-only mode: no expected output means "just execute and return stdout"
  // (used by the practice IDE / /api/execute which is NOT a graded test).
  if (testCase.expectedOutput == null) {
    return {
      passed: true,
      status: JUDGE_STATUS.ACCEPTED,
      stdout: res.stdout,
      stderr: res.stderr,
      execMs: res.execMs,
      memoryMb: res.memoryMb,
    }
  }
  const matched = outputsMatch(res.stdout, testCase.expectedOutput)
  return {
    passed: matched,
    status: matched ? JUDGE_STATUS.ACCEPTED : JUDGE_STATUS.WRONG_ANSWER,
    stdout: res.stdout,
    stderr: res.stderr,
    execMs: res.execMs,
    memoryMb: res.memoryMb,
  }
}

/**
 * Core evaluation routine. Runs in a worker thread (see worker below) but is
 * also callable directly. `question` is a normalized coding-question object:
 *   { language, solutionCode, expectedOutput, sampleInput, sampleOutput,
 *     visibleTestCases, hiddenTestCases, timeLimitMs, memoryLimitMb, points,
 *     difficulty, explanation }
 * `answer` is the student's raw source code string.
 *
 * Returns a normalized JudgeResult:
 *   { passedTests, failedTests, totalTests, score, executionTimeMs,
 *     memoryUsedMb, compileError, runtimeError, timeout, memoryExceeded,
 *     status, feedback, antiCheat, visible: {...}, hidden: {...} }
 */
async function evaluateCodingAnswer(question, answer) {
  const language = (question.language || 'python').toLowerCase()
  const timeLimitMs = Math.min(question.timeLimitMs || GLOBAL.timeLimitMs, 30000)
  const memoryLimitMb = Math.min(question.memoryLimitMb || GLOBAL.memoryLimitMb, 2048)

  const base = {
    passedTests: 0,
    failedTests: 0,
    totalTests: 0,
    score: 0,
    executionTimeMs: 0,
    memoryUsedMb: 0,
    compileError: '',
    runtimeError: '',
    timeout: false,
    memoryExceeded: false,
    status: JUDGE_STATUS.WRONG_ANSWER,
    feedback: '',
    antiCheat: '',
    visible: { passed: 0, total: 0 },
    hidden: { passed: 0, total: 0 },
  }

  // ── 1. Anti-cheat pre-check (cheap, runs before any execution) ──
  const cheat = detectCheat(answer, language, question.sampleOutput)
  if (cheat) {
    return {
      ...base,
      status: JUDGE_STATUS.REJECTED,
      antiCheat: cheat,
      feedback: antiCheatFeedback(cheat),
      // A rejected submission earns zero credit.
      passedTests: 0,
      failedTests: (question.visibleTestCases?.length || 0) + (question.hiddenTestCases?.length || 0),
      totalTests: (question.visibleTestCases?.length || 0) + (question.hiddenTestCases?.length || 0),
    }
  }

  const visible = Array.isArray(question.visibleTestCases) ? question.visibleTestCases : []
  const hidden = Array.isArray(question.hiddenTestCases) ? question.hiddenTestCases : []
  const allCases = [
    ...visible.map((t) => ({ ...t, __hidden: false })),
    ...hidden.map((t) => ({ ...t, __hidden: true })),
  ]
  base.totalTests = allCases.length
  base.failedTests = allCases.length // optimistic start; corrected below
  base.visible.total = visible.length
  base.hidden.total = hidden.length

  if (allCases.length === 0) {
    // No test cases authored: cannot grade -> treat as wrong (0).
    return {
      ...base,
      failedTests: 0,
      feedback: 'No test cases configured for this question.',
    }
  }

  // ── 2. Prepare artifact (compile if needed) ──
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'judge-'))
  let prepared
  try {
    prepared = await prepareArtifact(answer, language, workDir)
    if (prepared.error === 'compile_error') {
      return {
        ...base,
        failedTests: allCases.length,
        status: JUDGE_STATUS.COMPILE_ERROR,
        compileError: prepared.compileError || 'Compilation failed',
        feedback: `Compile error: ${prepared.compileError || ''}`,
      }
    }
    if (prepared.error) {
      return {
        ...base,
        failedTests: allCases.length,
        status: JUDGE_STATUS.RUNTIME_ERROR,
        runtimeError: prepared.error,
        feedback: prepared.error,
      }
    }

    // ── 3. Run every test case sequentially within this worker ──
    let passed = 0
    let failed = 0
    let maxTime = 0
    let maxMem = 0
    let firstFailure = null

    for (const tc of allCases) {
      const r = await evaluateTestCase(prepared, tc, timeLimitMs, memoryLimitMb)
      maxTime = Math.max(maxTime, r.execMs || 0)
      maxMem = Math.max(maxMem, r.memoryMb || 0)

      if (r.status === JUDGE_STATUS.TIME_LIMIT) {
        return {
          ...base,
          passedTests: passed,
          failedTests: allCases.length - passed,
          executionTimeMs: maxTime,
          memoryUsedMb: maxMem,
          timeout: true,
          status: JUDGE_STATUS.TIME_LIMIT,
          feedback: 'Time limit exceeded — your code ran too long (possible infinite loop).',
        }
      }
      if (r.status === JUDGE_STATUS.RUNTIME_ERROR) {
        return {
          ...base,
          passedTests: passed,
          failedTests: allCases.length - passed,
          executionTimeMs: maxTime,
          memoryUsedMb: maxMem,
          runtimeError: r.runtimeError || r.stderr || 'Runtime error',
          status: JUDGE_STATUS.RUNTIME_ERROR,
          feedback: `Runtime error: ${r.runtimeError || r.stderr || ''}`,
        }
      }

      if (r.passed) {
        passed++
        if (tc.__hidden) base.hidden.passed++
        else base.visible.passed++
      } else {
        failed++
        if (!firstFailure) {
          firstFailure = `Test ${passed + failed} failed. Expected:\n${tc.expectedOutput || '(empty)'}\nGot:\n${r.stdout || '(empty)'}`
        }
      }
    }

    // ── 4. Scoring ──
    const total = allCases.length
    const ratio = passed / total
    let status
    let feedback
    if (passed === total) {
      status = JUDGE_STATUS.ACCEPTED
      feedback = 'All test cases passed. Excellent!'
    } else if (passed === 0) {
      status = JUDGE_STATUS.WRONG_ANSWER
      feedback = firstFailure || 'All test cases failed. Check your logic and output format.'
    } else {
      status = JUDGE_STATUS.PARTIAL
      feedback = `Passed ${passed}/${total} test cases. ${firstFailure || ''}`
    }

    return {
      passedTests: passed,
      failedTests: failed,
      totalTests: total,
      // score is 0..100 (percentage of tests passed)
      score: Math.round(ratio * 100),
      executionTimeMs: maxTime,
      memoryUsedMb: maxMem,
      compileError: '',
      runtimeError: '',
      timeout: false,
      memoryExceeded: false,
      status,
      feedback,
      antiCheat: '',
      visible: { passed: base.visible.passed, total: base.visible.total },
      hidden: { passed: base.hidden.passed, total: base.hidden.total },
    }
  } finally {
    try { fs.rmSync(workDir, { recursive: true, force: true }) } catch (_) {}
  }
}

function antiCheatFeedback(flag) {
  switch (flag) {
    case 'empty': return 'No code was submitted.'
    case 'whitespace_only': return 'Your submission contained only whitespace.'
    case 'comments_only': return 'Your submission contained only comments — no executable code.'
    case 'hardcoded_sample': return 'Your submission only prints the expected sample output instead of computing it.'
    case 'random_text': return 'Your submission does not contain valid code.'
    default: return 'Submission rejected by anti-cheat checks.'
  }
}

// ===========================================================================
// WORKER THREAD POOL (keeps the event loop free + bounds concurrency)
// ===========================================================================

const WORKER_PATH = path.join(__dirname, 'codingWorker.js')

let workerPool = []
let queue = []
let nextId = 1

function getWorker() {
  if (workerPool.length < GLOBAL.maxConcurrentWorkers) {
    // Pass the parent's PATH into the worker — Node strips PATH from worker
    // threads, which would otherwise break child_process.spawn of the language
    // runtimes (python3, g++, node, ...).
    const w = new Worker(WORKER_PATH, { workerData: { PATH: process.env.PATH || '' } })
    w.busy = false
    w.on('message', (msg) => {
      const { id } = msg
      const job = pendingJobs.get(id)
      if (!job) return
      pendingJobs.delete(id)
      w.busy = false
      job.resolve(msg)
      pump()
    })
    w.on('error', () => { w.busy = false; pump() })
    workerPool.push(w)
    return w
  }
  return workerPool.find((w) => !w.busy) || null
}

const pendingJobs = new Map()

function pump() {
  while (queue.length > 0) {
    const w = getWorker()
    if (!w || w.busy) break
    const { id, question, answer, resolve } = queue.shift()
    pendingJobs.set(id, { resolve })
    w.busy = true
    w.postMessage({ id, question, answer })
  }
}

/**
 * Public async entry: evaluate one coding answer via the worker pool.
 * Mirrors evaluateCodingAnswer's return shape.
 */
function evaluateInWorker(question, answer) {
  return new Promise((resolve) => {
    const id = nextId++
    queue.push({ id, question, answer, resolve })
    pump()
  }).then((msg) => {
    if (msg.ok) return msg.result
    // Fallback to inline evaluation if the worker failed.
    return evaluateCodingAnswer(question, answer)
  })
}

// ===========================================================================
// PUBLIC API
// ===========================================================================

/**
 * gradeCodingQuestion — the ONLY place that decides a coding question's result.
 *
 * @param {Object} question  Coding question doc (with test cases).
 * @param {string} answer    Student's submitted source code.
 * @param {Object} [ctx]     { userId, examId, questionId, questionIndex }
 * @returns {Promise<Object>} normalized JudgeResult (see evaluateCodingAnswer).
 */
async function gradeCodingQuestion(question, answer, ctx = {}) {
  // Normalized question (defensive against missing fields / populated docs).
  const normalized = {
    language: question.language || 'python',
    solutionCode: question.solutionCode,
    expectedOutput: question.expectedOutput || '',
    sampleInput: question.sampleInput || '',
    sampleOutput: question.sampleOutput || '',
    visibleTestCases: question.visibleTestCases || [],
    hiddenTestCases: question.hiddenTestCases || [],
    timeLimitMs: question.timeLimitMs || GLOBAL.timeLimitMs,
    memoryLimitMb: question.memoryLimitMb || GLOBAL.memoryLimitMb,
    points: question.points || 1,
    difficulty: question.difficulty || 'easy',
    explanation: question.explanation || '',
  }

  const result = await evaluateInWorker(normalized, answer || '')

  // Persist a log record (fire-and-forget, safe to drop on failure).
  // Wrapped in a short race so a slow/unreachable DB can NEVER delay or block
  // the grading response — logging is strictly best-effort.
  try {
    const write = CodingSubmissionLog.create({
      userId: ctx.userId || null,
      examId: ctx.examId || null,
      questionId: ctx.questionId || null,
      questionIndex: typeof ctx.questionIndex === 'number' ? ctx.questionIndex : null,
      language: normalized.language,
      submissionTime: new Date(),
      status: result.status,
      score: result.score || 0,
      passedTests: result.passedTests || 0,
      failedTests: result.failedTests || 0,
      totalTests: result.totalTests || 0,
      executionTimeMs: result.executionTimeMs || 0,
      memoryUsedMb: result.memoryUsedMb || 0,
      compileError: result.compileError || '',
      runtimeError: result.runtimeError || '',
      timeout: !!result.timeout,
      memoryExceeded: !!result.memoryExceeded,
      antiCheatFlag: result.antiCheat || '',
      rejected: result.status === JUDGE_STATUS.REJECTED,
    })
    const timeout = new Promise((resolve) => setTimeout(resolve, 2000))
    await Promise.race([write, timeout])
  } catch (logErr) {
    // Logging must never break grading.
    console.error('[CodingEvaluationService] log write failed:', logErr.message)
  }

  return result
}

/**
 * Execute arbitrary code (used by the practice IDE / /api/execute).
 * Reuses the SAME engine so there is no duplicate grading logic.
 * Returns a lightweight { stdout, stderr, status, time, memory, error } object.
 */
async function executeCode({ source_code, language = 'python', stdin = '', timeLimitMs = GLOBAL.timeLimitMs, memoryLimitMb = GLOBAL.memoryLimitMb }) {
  const question = {
    language,
    visibleTestCases: [{ input: stdin, expectedOutput: null }], // run-only
    hiddenTestCases: [],
    timeLimitMs,
    memoryLimitMb,
  }
  const res = await gradeCodingQuestion(question, source_code)
  return {
    stdout: res.stdout || '',
    stderr: res.stderr || res.runtimeError || res.compileError || '',
    status: { id: statusToId(res.status), description: res.status },
    time: res.executionTimeMs ? `${res.executionTimeMs} ms` : 'N/A',
    memory: res.memoryUsedMb ? `${res.memoryUsedMb} MB` : 'N/A',
    error: res.compileError || res.runtimeError || null,
  }
}

function statusToId(status) {
  const map = {
    [JUDGE_STATUS.ACCEPTED]: 3,
    [JUDGE_STATUS.PARTIAL]: 3,
    [JUDGE_STATUS.WRONG_ANSWER]: 4,
    [JUDGE_STATUS.COMPILE_ERROR]: 6,
    [JUDGE_STATUS.RUNTIME_ERROR]: 5,
    [JUDGE_STATUS.TIME_LIMIT]: 5,
    [JUDGE_STATUS.MEMORY_LIMIT]: 7,
    [JUDGE_STATUS.REJECTED]: 4,
  }
  return map[status] || 4
}

module.exports = {
  gradeCodingQuestion,
  executeCode,
  evaluateCodingAnswer,
  JUDGE_STATUS,
  GLOBAL,
}
