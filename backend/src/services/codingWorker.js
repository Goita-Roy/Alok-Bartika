// Worker entry used by CodingEvaluationService's worker pool.
// Kept as a separate file so the service module is never re-evaluated inside
// the worker (avoiding a second worker-pool bootstrap).
//
// IMPORTANT: Node.js worker threads do NOT inherit PATH from the parent
// environment, which would make child_process.spawn('python3', ...) fail with
// ENOENT. The service passes the parent's PATH in the bootstrap message, and we
// restore it here before evaluating so language runtimes can be located.
const { parentPort, workerData } = require('worker_threads')

if (workerData && workerData.PATH) {
  process.env.PATH = workerData.PATH
}

const { evaluateCodingAnswer, JUDGE_STATUS } = require('./codingEvaluationService')

parentPort.on('message', async (msg) => {
  try {
    const result = await evaluateCodingAnswer(msg.question, msg.answer)
    parentPort.postMessage({ id: msg.id, ok: true, result })
  } catch (err) {
    parentPort.postMessage({
      id: msg.id,
      ok: false,
      error: err && err.message ? err.message : String(err),
    })
  }
})
