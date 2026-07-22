import type { SupportedLanguage } from '../data/ideLessonData'

export type ErrorType = 'syntax' | 'runtime' | 'logic' | 'warning'

export type CodeErrorDetail = {
  line: number
  column?: number
  type: ErrorType
  message: string
  banglaExplanation: string
  suggestedFix: string
  correctedExample?: string
  learningTip?: string
  fixStatus: 'pending' | 'resolved'
}

function lineTrim(lines: string[], index: number) {
  return lines[index]?.trim() ?? ''
}

export function analyzeCode(language: SupportedLanguage, code: string): CodeErrorDetail[] {
  if (!code.trim()) return []

  switch (language) {
    case 'python':
      return analyzePython(code)
    case 'javascript':
      return analyzeJavaScript(code)
    case 'html':
      return analyzeHtml(code)
    case 'css':
      return analyzeCss(code)
    case 'c':
    case 'cpp':
      return analyzeCStyle(code, language)
    case 'java':
      return analyzeJava(code)
    default:
      return []
  }
}

function analyzePython(code: string): CodeErrorDetail[] {
  const lines = code.split('\n')
  const errors: CodeErrorDetail[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lineTrim(lines, i)
    const lineNum = i + 1
    if (!line || line.startsWith('#')) continue

    if (/^(if|for|while|def|elif|else)\b/.test(line) && !line.endsWith(':') && !line.includes(':')) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Missing colon ':' at end of line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ কোলন (:) অনুপস্থিত রয়েছে। if, for, while বা def এর শেষে ':' দিতে হয়।`,
        suggestedFix: "statement এর শেষে ':' যোগ করুন।",
        correctedExample: line.replace(/\s*$/, ':'),
        learningTip: 'Python-এ block শুরু করতে সবসময় colon (:) লাগে।',
        fixStatus: 'pending',
      })
    }

    if (/^print\s+["']/.test(line) && !line.includes('(')) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Missing parentheses in print() on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ print() এর জন্য ব্র্যাকেট () ব্যবহার করতে হবে।`,
        suggestedFix: 'print("message") ফরম্যাট ব্যবহার করুন।',
        correctedExample: line.replace(/^print\s+/, 'print(') + (line.endsWith(')') ? '' : ')'),
        learningTip: 'Python 3-এ print একটি function, তাই ব্র্যাকেট দরকার।',
        fixStatus: 'pending',
      })
    }

    const openParen = (line.match(/\(/g) || []).length
    const closeParen = (line.match(/\)/g) || []).length
    if (openParen !== closeParen) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Unmatched parentheses on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ ব্র্যাকেট () সঠিকভাবে বন্ধ করা হয়নি।`,
        suggestedFix: 'খোলা ও বন্ধ ব্র্যাকেটের সংখ্যা মিলিয়ে নিন।',
        learningTip: "প্রতিটি '(' এর জন্য একটি ')' থাকতে হবে।",
        fixStatus: 'pending',
      })
    }

    if (/^(if|while)\s+.*[^!=<>]=\s*[^:]+$/.test(line)) {
      errors.push({
        line: lineNum,
        type: 'logic',
        message: `Use '==' for comparison on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ তুলনার জন্য == ব্যবহার করুন, = নয়।`,
        suggestedFix: 'ভ্যালু assign করতে =, compare করতে == ব্যবহার করুন।',
        learningTip: '= মান রাখে, == মান তুলনা করে।',
        fixStatus: 'pending',
      })
    }

    const printVarMatch = line.match(/^print\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\)/)
    if (printVarMatch) {
      const varName = printVarMatch[1]
      const declaredBefore = lines.slice(0, i).some((l) => new RegExp(`^${varName}\\s*=`).test(l.trim()))
      if (!declaredBefore) {
        errors.push({
          line: lineNum,
          type: 'runtime',
          message: `NameError: name '${varName}' is not defined`,
          banglaExplanation: `লাইন ${lineNum}-এ '${varName}' variable declare করা হয়নি।`,
          suggestedFix: `প্রথমে ${varName} = value লিখে variable declare করুন, তারপর ব্যবহার করুন।`,
          correctedExample: `${varName} = "মান"\nprint(${varName})`,
          learningTip: 'Variable ব্যবহারের আগে অবশ্যই declare করতে হয়।',
          fixStatus: 'pending',
        })
      }
    }
  }

  const quotes = code.match(/["']/g) || []
  if (quotes.length % 2 !== 0) {
    errors.push({
      line: 1,
      type: 'syntax',
      message: 'Unclosed string literal',
      banglaExplanation: 'কোডে একটি string এর quote (" বা \') বন্ধ করা হয়নি।',
      suggestedFix: 'প্রতিটি খোলা quote এর জন্য বন্ধ quote যোগ করুন।',
      fixStatus: 'pending',
    })
  }

  return errors
}

function analyzeJavaScript(code: string): CodeErrorDetail[] {
  const lines = code.split('\n')
  const errors: CodeErrorDetail[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lineTrim(lines, i)
    const lineNum = i + 1
    if (!line || line.startsWith('//')) continue

    if (line.includes('console.log') && !line.trim().endsWith(';') && !line.includes('{')) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Missing semicolon on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ semicolon (;) অনুপস্থিত রয়েছে।`,
        suggestedFix: "statement এর শেষে ';' যোগ করুন।",
        correctedExample: line.endsWith(';') ? line : `${line};`,
        learningTip: 'JavaScript-এ প্রতিটি statement এর শেষে semicolon দেওয়া ভালো অভ্যাস।',
        fixStatus: 'pending',
      })
    }

    const openBrace = (line.match(/\{/g) || []).length
    const closeBrace = (line.match(/\}/g) || []).length
    if (openBrace !== closeBrace && (line.includes('function') || line.includes('{'))) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Unmatched braces on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ closing bracket '}' অনুপস্থিত রয়েছে।`,
        suggestedFix: "Function বা block এর শেষে '}' যোগ করুন।",
        learningTip: 'প্রতিটি { এর জন্য একটি } থাকতে হবে।',
        fixStatus: 'pending',
      })
    }
  }

  try {
    // eslint-disable-next-line no-new-func
    new Function(code)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const lineMatch = msg.match(/line (\d+)/i)
    errors.push({
      line: lineMatch ? Number(lineMatch[1]) : 1,
      type: 'syntax',
      message: msg,
      banglaExplanation: `JavaScript syntax error: ${msg}`,
      suggestedFix: 'ব্র্যাকেট, quote এবং semicolon চেক করুন।',
      fixStatus: 'pending',
    })
  }

  return errors
}

function analyzeHtml(code: string): CodeErrorDetail[] {
  const errors: CodeErrorDetail[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1
    const openTags = line.match(/<([a-zA-Z][a-zA-Z0-9]*)[^>/]*>/g) || []
    for (const tag of openTags) {
      const name = tag.match(/<([a-zA-Z][a-zA-Z0-9]*)/)?.[1]
      if (!name) continue
      if (['br', 'img', 'input', 'meta', 'link', 'hr'].includes(name.toLowerCase())) continue
      if (!line.includes(`</${name}>`) && !code.includes(`</${name}>`)) {
        errors.push({
          line: lineNum,
          type: 'syntax',
          message: `Unclosed <${name}> tag`,
          banglaExplanation: `লাইন ${lineNum}-এ <${name}> tag বন্ধ করা হয়নি।`,
          suggestedFix: `</${name}> closing tag যোগ করুন।`,
          correctedExample: `<${name}>...</${name}>`,
          fixStatus: 'pending',
        })
      }
    }
  }

  return errors
}

function analyzeCss(code: string): CodeErrorDetail[] {
  const errors: CodeErrorDetail[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lineTrim(lines, i)
    const lineNum = i + 1
    if (!line || line.startsWith('/*')) continue

    if (line.includes(':') && !line.includes('{') && !line.endsWith(';') && !line.endsWith('}')) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Missing semicolon in CSS on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ CSS property এর শেষে semicolon (;) দিন।`,
        suggestedFix: "property: value; ফরম্যাট ব্যবহার করুন।",
        fixStatus: 'pending',
      })
    }
  }

  return errors
}

function analyzeCStyle(code: string, language: 'c' | 'cpp'): CodeErrorDetail[] {
  const errors: CodeErrorDetail[] = []
  const lines = code.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lineTrim(lines, i)
    const lineNum = i + 1
    if (!line || line.startsWith('//') || line.startsWith('/*')) continue

    if (!line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && line.length > 0 && !line.startsWith('#')) {
      if (/printf|cout|return|int |char |float |double /.test(line)) {
        errors.push({
          line: lineNum,
          type: 'syntax',
          message: `Missing semicolon on line ${lineNum}`,
          banglaExplanation: `লাইন ${lineNum}-এ semicolon (;) অনুপস্থিত রয়েছে।`,
          suggestedFix: "statement এর শেষে ';' যোগ করুন।",
          correctedExample: line.endsWith(';') ? line : `${line};`,
          learningTip: `${language === 'c' ? 'C' : 'C++'}-তে প্রায় সব statement এর শেষে semicolon লাগে।`,
          fixStatus: 'pending',
        })
      }
    }

    if (language === 'c' && line.includes('printf') && !line.includes('\\n')) {
      errors.push({
        line: lineNum,
        type: 'warning',
        message: 'printf without newline',
        banglaExplanation: `লাইন ${lineNum}-এ printf-এ \\n যোগ করলে output নতুন লাইনে যাবে।`,
        suggestedFix: 'printf("message\\n"); ব্যবহার করুন।',
        fixStatus: 'pending',
      })
    }
  }

  return errors
}

function analyzeJava(code: string): CodeErrorDetail[] {
  const errors: CodeErrorDetail[] = []
  const lines = code.split('\n')

  if (!code.includes('class ')) {
    errors.push({
      line: 1,
      type: 'syntax',
      message: 'Missing class definition',
      banglaExplanation: 'Java program-এ public class থাকতে হয়।',
      suggestedFix: 'public class Main { ... } যোগ করুন।',
      fixStatus: 'pending',
    })
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lineTrim(lines, i)
    const lineNum = i + 1
    if (!line || line.startsWith('//')) continue

    if (line.includes('System.out.println') && !line.endsWith(';')) {
      errors.push({
        line: lineNum,
        type: 'syntax',
        message: `Missing semicolon on line ${lineNum}`,
        banglaExplanation: `লাইন ${lineNum}-এ semicolon (;) অনুপস্থিত রয়েছে।`,
        suggestedFix: "statement এর শেষে ';' যোগ করুন।",
        correctedExample: line.endsWith(';') ? line : `${line};`,
        fixStatus: 'pending',
      })
    }
  }

  return errors
}

export function parseRuntimeError(stderr: string | null, language: SupportedLanguage): CodeErrorDetail | null {
  if (!stderr) return null

  const lineMatch = stderr.match(/line\s*(\d+)/i) || stderr.match(/Line\s*(\d+)/)
  const line = lineMatch ? Number(lineMatch[1]) : 1

  let banglaExplanation = stderr
  let suggestedFix = 'কোডটি পুনরায় চেক করুন।'
  let type: ErrorType = 'runtime'

  if (stderr.includes('NameError') || stderr.includes('not defined')) {
    const varMatch = stderr.match(/name '([^']+)'/)
    const varName = varMatch?.[1] ?? 'variable'
    banglaExplanation = `লাইন ${line}-এ '${varName}' variable declare করা হয়নি। প্রথমে variable declare করুন, তারপর ব্যবহার করুন।`
    suggestedFix = `${varName} = মান লিখে declare করুন।`
  } else if (stderr.includes('SyntaxError') || stderr.includes('Missing')) {
    type = 'syntax'
    banglaExplanation = `লাইন ${line}-এ syntax সমস্যা রয়েছে। ${stderr}`
    suggestedFix = 'colon, bracket, quote এবং indentation চেক করুন।'
  } else if (stderr.includes('Compilation error')) {
    type = 'syntax'
    banglaExplanation = `${language} compile error: ${stderr}`
    suggestedFix = 'semicolon, bracket এবং include/import statements চেক করুন।'
  }

  return {
    line,
    type,
    message: stderr,
    banglaExplanation,
    suggestedFix,
    fixStatus: 'pending',
  }
}

export function buildVoiceErrorMessage(error: CodeErrorDetail): string {
  const typeLabel =
    error.type === 'syntax'
      ? 'Syntax Error'
      : error.type === 'runtime'
        ? 'Runtime Error'
        : error.type === 'logic'
          ? 'Logic Error'
          : 'Warning'
  return `লাইন ${error.line}-তে ${typeLabel} পাওয়া গেছে। ${error.banglaExplanation} ${error.suggestedFix}`
}

const BENGALI_ORDINALS = ['প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম']

export function buildRunVoiceSequence(errors: CodeErrorDetail[], success: boolean): string[] {
  if (success) {
    return ['কোনো error পাওয়া যায়নি। আপনার কোড সফলভাবে execute হয়েছে।']
  }
  if (!errors.length) return []

  if (errors.length === 1) {
    return [buildVoiceErrorMessage(errors[0])]
  }

  const lines: string[] = [`মোট ${errors.length}টি error পাওয়া গেছে।`]
  errors.forEach((error, index) => {
    const ordinal = BENGALI_ORDINALS[index] ?? `${index + 1} নং`
    lines.push(`${ordinal} error: লাইন ${error.line}-তে ${error.banglaExplanation} ${error.suggestedFix}`)
  })
  return lines
}

export function mergeErrors(...groups: CodeErrorDetail[][]): CodeErrorDetail[] {
  const map = new Map<string, CodeErrorDetail>()
  for (const group of groups) {
    for (const e of group) {
      map.set(`${e.line}-${e.type}-${e.message}`, e)
    }
  }
  return Array.from(map.values()).sort((a, b) => a.line - b.line)
}

export function answerBengaliVoiceQuestion(
  question: string,
  errors: CodeErrorDetail[],
  code: string,
): string {
  const q = question.trim().toLowerCase()

  if (
    q.includes('কী সমস্যা') ||
    q.includes('ki somossa') ||
    q.includes('what') ||
    q.includes('error')
  ) {
    if (!errors.length) return 'এখন কোনো error পাওয়া যায়নি। কোড run করে দেখুন।'
    const e = errors[0]
    return buildVoiceErrorMessage(e)
  }

  if (q.includes('explain') || q.includes('ব্যাখ্যা') || q.includes('explain করো')) {
    if (!errors.length) return 'বর্তমানে কোনো error নেই।'
    return errors.map((e) => `লাইন ${e.line}: ${e.banglaExplanation}`).join(' ')
  }

  if (q.includes('কেন') || q.includes('why') || q.includes('line')) {
    const lineMatch = q.match(/(\d+)/)
    const targetLine = lineMatch ? Number(lineMatch[1]) : errors[0]?.line
    const err = errors.find((e) => e.line === targetLine)
    if (!err) return `লাইন ${targetLine}-এ কোনো error detect হয়নি।`
    return `লাইন ${err.line} error দিচ্ছে কারণ: ${err.banglaExplanation} ${err.learningTip ?? ''}`
  }

  if (q.includes('fix') || q.includes('suggestion') || q.includes('দাও')) {
    if (!errors.length) return 'Fix করার মতো কোনো error নেই।'
    const e = errors[0]
    return `সমাধান: ${e.suggestedFix}${e.correctedExample ? ` উদাহরণ: ${e.correctedExample}` : ''}`
  }

  return `আপনার কোডে ${errors.length}টি সমস্যা পাওয়া গেছে। লাইন ${errors[0]?.line ?? '?'} দেখুন।`
}
