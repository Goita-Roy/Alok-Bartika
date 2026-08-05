import api from '../config/api'

// Reusable anti-cheat reporting for the exam flow.
//
// While an exam is active, ExamPage sets the current student + exam ids via
// setExamContext(). Event handlers in the anti-cheat hooks call
// reportViolation(...) which fills in the ids, adds a timestamp and POSTs to
// the existing backend intake endpoint — asynchronously and never blocking the
// student's exam.

let currentStudentId: string | null = null
let currentExamId: string | null = null

// Deduplication: repeated identical events within this window produce only one
// request (e.g. copy keydown + copy event, beforeunload + pagehide).
const DEDUPE_WINDOW_MS = 3000
const lastSentAt: Record<string, number> = {}

export function setExamContext(studentId: string, examId: string) {
  currentStudentId = studentId
  currentExamId = examId
}

export function clearExamContext() {
  currentStudentId = null
  currentExamId = null
}

export type ViolationEventType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'copy'
  | 'paste'
  | 'right_click'
  | 'devtools'
  | 'window_blur'
  | 'keyboard_shortcut'
  | 'multiple_monitor'

export function reportViolation(eventType: ViolationEventType, metadata?: Record<string, unknown>) {
  if (!currentStudentId || !currentExamId) return

  const now = Date.now()
  const last = lastSentAt[eventType] || 0
  if (now - last < DEDUPE_WINDOW_MS) return
  lastSentAt[eventType] = now

  api
    .post('/admin/exam-monitoring/violations', {
      studentId: currentStudentId,
      examId: currentExamId,
      eventType,
      timestamp: new Date(now).toISOString(),
      metadata: metadata || {},
    })
    .catch(() => {
      // Best-effort reporting: never interrupt the exam if the request fails.
    })
}
