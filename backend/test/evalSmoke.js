// Smoke test for the centralized CodingEvaluationService.
// Run with: node test/evalSmoke.js
process.env.NODE_ENV = 'test'

const { evaluateCodingAnswer, JUDGE_STATUS } = require('../src/services/codingEvaluationService')

function q(language, answer, hidden = [], visible = [], sampleOutput = '') {
  return { language, visibleTestCases: visible, hiddenTestCases: hidden, timeLimitMs: 3000, memoryLimitMb: 256, sampleOutput }
}

const TC = (input, expectedOutput) => ({ input, expectedOutput })

async function run(label, language, answer, visible, hidden, sampleOutput) {
  const r = await evaluateCodingAnswer(q(language, answer, hidden, visible, sampleOutput), answer)
  console.log(`\n[${label}]`)
  console.log('  status         :', r.status)
  console.log('  score          :', r.score)
  console.log('  passed/total   :', r.passedTests + '/' + r.totalTests)
  console.log('  visible        :', JSON.stringify(r.visible))
  console.log('  hidden         :', JSON.stringify(r.hidden))
  console.log('  execMs         :', r.executionTimeMs)
  console.log('  antiCheat      :', r.antiCheat || '(none)')
  if (r.compileError) console.log('  compileError   :', r.compileError.slice(0, 80))
  if (r.runtimeError) console.log('  runtimeError   :', r.runtimeError.slice(0, 80))
  if (r.timeout) console.log('  TIMEOUT=true')
  if (r.feedback) console.log('  feedback       :', r.feedback.slice(0, 80))
  return r
}

;(async () => {
  // 1. Correct Python solution (visible + hidden all pass)
  await run('Correct Python', 'python',
    'print(int(input()) * 2)',
    [TC('5', '10')],
    [TC('21', '42'), TC('-3', '-6')])

  // 2. Wrong Python solution (off by one)
  await run('Wrong Python', 'python',
    'print(int(input()) * 2 + 1)',
    [TC('5', '10')],
    [TC('21', '42')])

  // 3. Partial Python (passes visible, fails hidden)
  await run('Partial Python', 'python',
    'x = int(input())\nprint(x if x % 2 == 0 else x + 999)',
    [TC('4', '4')],
    [TC('3', '6'), TC('7', '14')])

  // 4. Compile error (C++)
  await run('Compile Error C++', 'cpp',
    'int main() { return ] }',
    [TC('', '')],
    [])

  // 5. Runtime error (ZeroDivision Python)
  await run('Runtime Error Python', 'python',
    'print(1/0)',
    [TC('', '')],
    [])

  // 6. Infinite loop -> timeout (Python)
  await run('Infinite Loop / Timeout', 'python',
    'while True:\n  pass',
    [TC('', '')],
    [])

  // 7. Anti-cheat: empty
  await run('AntiCheat empty', 'python', '', [TC('5', '10')], [])

  // 8. Anti-cheat: comments only
  await run('AntiCheat comments only', 'python', '# just a comment\n   ', [TC('5', '10')], [])

  // 9. Anti-cheat: hardcoded sample output
  await run('AntiCheat hardcoded', 'python',
    'print("42")',
    [TC('21', '42')],
    [],
    '42')

  // 10. Correct JavaScript
  await run('Correct JavaScript', 'javascript',
    'const n = parseInt(require("fs").readFileSync(0,"utf8")); console.log(n*2)',
    [TC('5', '10')],
    [TC('10', '20')])

  // 11. Correct C++
  await run('Correct C++', 'cpp',
    '#include <iostream>\nusing namespace std;\nint main(){int n;cin>>n;cout<<n*2;return 0;}',
    [TC('5', '10')],
    [TC('8', '16')])

  // 12. Correct C
  await run('Correct C', 'c',
    '#include <stdio.h>\nint main(){int n;scanf("%d",&n);printf("%d",n*2);return 0;}',
    [TC('5', '10')],
    [TC('8', '16')])

  console.log('\n=== Smoke test complete ===')
})().catch((e) => { console.error('FATAL', e); process.exit(1) })
