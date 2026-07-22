// Verification harness for Dashboard Reliability & Error Handling.
// Exercises the core logic without a browser.
import { fetchWithRetry, OfflineError, HttpError } from '../src/hooks/fetchWithRetry'
import { get, toNumber, toStr, toArray, safeMap, safeParse } from '../src/utils/safe'
import { parseDashboard } from '../src/hooks/useStudentDashboardData'

let pass = 0, fail = 0
function check(name, cond) {
  if (cond) { pass++; console.log('  PASS', name) }
  else { fail++; console.log('  FAIL', name) }
}

// ── safe utils ──
check('get missing nested -> default', get({}, 'a.b.c', 'def') === 'def')
check('get present', get({a:{b:5}}, 'a.b', 0) === 5)
check('toNumber NaN -> fallback', toNumber('x', 7) === 7)
check('toNumber ok', toNumber('42', 0) === 42)
check('toStr num', toStr(9, '') === '9')
check('toArray non-array -> []', Array.isArray(toArray(null)) && toArray(null).length === 0)
check('safeMap drops throws', safeMap([1,2,'x',3], (i)=>{ if(typeof i!=='number') throw new Error('bad'); return i*2 }, []).length === 3)
check('safeParse catches', safeParse(()=>{ throw new Error('x') }, 'fb') === 'fb')

// ── parseDashboard: missing fields / partial response ──
const partial = parseDashboard({ student: { name: 'Rina' } }) // only name given
check('partial: name present', partial.student.name === 'Rina')
check('partial: className default empty', partial.student.className === '')
check('partial: xp defaults', partial.xp.totalXP === 0 && partial.xp.level === 1)
check('partial: leaderboard default []', Array.isArray(partial.leaderboard) && partial.leaderboard.length === 0)
check('partial: learningAnalytics default', partial.learningAnalytics.dailyLogs.length === 0)
const empty = parseDashboard(null)
check('null response -> safe defaults', empty.student.name === '' && empty.courses.length === 0)
const malformed = parseDashboard({ xp: 'not-an-object', leaderboard: 'nope', learningAnalytics: { dailyLogs: 'bad' } })
check('malformed xp -> 0', malformed.xp.totalXP === 0)
check('malformed leaderboard -> []', malformed.leaderboard.length === 0)
check('malformed dailyLogs -> []', malformed.learningAnalytics.dailyLogs.length === 0)

// ── fetchWithRetry: 500 then success (retry) ──
let calls = 0
const flakyFetch = (url, opts) => {
  calls++
  if (calls < 3) return Promise.resolve({ ok: false, status: 500, json: async()=>({}) })
  return Promise.resolve({ ok: true, status: 200, json: async()=>({ ok: true }) })
}
global.fetch = flakyFetch
calls = 0
const r1 = await fetchWithRetry('http://x/api', {}, { retries: 3, baseDelayMs: 5, timeoutMs: 1000 })
check('retry recovers after 500s', r1.ok === true && calls === 3)

// ── fetchWithRetry: always 500 -> throws HttpError after retries ──
calls = 0
global.fetch = () => { calls++; return Promise.resolve({ ok: false, status: 500, json: async()=>({}) }) }
let threw = null
try { await fetchWithRetry('http://x/api', {}, { retries: 3, baseDelayMs: 5, timeoutMs: 1000 }) } catch(e){ threw = e }
console.log('    [debug] 500 test: calls=', calls, 'threw=', threw?.constructor?.name)
check('consistent 500 -> HttpError after 3 retries', threw instanceof HttpError && calls === 4)

// ── fetchWithRetry: timeout -> throws ──
global.fetch = () => { calls++; return new Promise(res => setTimeout(()=>res({ok:true,status:200,json:async()=>({})}), 500)) }
calls = 0
threw = null
try { await fetchWithRetry('http://x/api', {}, { retries: 1, baseDelayMs: 5, timeoutMs: 50 }) } catch(e){ threw = e }
check('timeout -> abort/throw', threw != null)

// ── fetchWithRetry: offline -> OfflineError, no network ──
calls = 0
global.fetch = () => { calls++; return Promise.resolve({ ok:true, status:200, json:async()=>({}) }) }
threw = null
try { await fetchWithRetry('http://x/api', {}, { retries: 3, online: false }) } catch(e){ threw = e }
check('offline -> OfflineError, no fetch', threw instanceof OfflineError && calls === 0)

// ── fetchWithRetry: 4xx fatal (no retry) ──
calls = 0
global.fetch = () => { calls++; const r = { ok:false, status:404, json:async()=>({}) }; console.log('    [debug] 404 fake called, ok=', r.ok); return Promise.resolve(r) }
threw = null
try { await fetchWithRetry('http://x/api', {}, { retries: 3, baseDelayMs: 5 }) } catch(e){ threw = e }
console.log('    [debug] 404 test: calls=', calls, 'threw=', threw?.constructor?.name)
check('404 -> HttpError, single attempt (no retry)', threw instanceof HttpError && calls === 1)

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`)
process.exit(fail === 0 ? 0 : 1)
