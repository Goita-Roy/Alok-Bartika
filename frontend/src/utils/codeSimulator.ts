import { analyzePythonCode } from './errorAssistant';

interface SimulationResult {
  stdout: string;
  stderr: string | null;
  banglaGuidance: string | null;
}

type Scope = Record<string, unknown>;

function evaluateExpression(expr: string, variables: Scope): unknown {
  const trimmed = expr.trim()

  // String literal (single or double quoted)
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }

  // f-string: f"..." or f'...'
  if ((trimmed.startsWith('f"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("f'") && trimmed.endsWith("'"))) {
    let template = trimmed.slice(2, -1)
    template = template.replace(/\{([^}]+)\}/g, (_match, varName: string) => {
      const v = evaluateExpression(varName.trim(), variables)
      return v !== undefined ? String(v) : `{undefined: ${varName}}`
    })
    return template
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed, 10)
  }

  // Boolean
  if (trimmed === 'True') return true
  if (trimmed === 'False') return false
  if (trimmed === 'None') return null

  // Variable lookup
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
    if (trimmed in variables) return variables[trimmed]
    return undefined
  }

  // String concatenation with +
  if (trimmed.includes('+')) {
    const parts = trimmed.split('+').map(p => p.trim())
    let result = ''
    for (const part of parts) {
      const val = evaluateExpression(part, variables)
      result += val !== undefined && val !== null ? String(val) : ''
    }
    return result
  }

  return trimmed
}

export const simulateExecution = (code: string, stdin = ''): SimulationResult => {
  const syntaxError = analyzePythonCode(code);
  if (syntaxError) {
    return {
      stdout: '',
      stderr: syntaxError.message,
      banglaGuidance: syntaxError.banglaGuidance
    };
  }

  const lines = code.split('\n');
  const stdout: string[] = [];
  const variables: Scope = {};
  const inputs = stdin.split('\n').filter(line => line.trim() !== '');
  let inputIndex = 0;

  try {
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip empty / comments
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Handle input() assignment: x = input("prompt?")
      const inputMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*input\s*\((.*)\)$/);
      if (inputMatch) {
        const varName = inputMatch[1];
        const inputValue = inputs[inputIndex] ?? '';
        variables[varName] = inputValue;
        inputIndex++;
        continue;
      }

      // Handle simple variable assignment: x = <value>
      const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.startsWith('for ') && !trimmed.startsWith('while ')) {
        const varName = assignMatch[1];
        const valueExpr = assignMatch[2].trim();
        const val = evaluateExpression(valueExpr, variables);
        if (val === undefined && /^[a-zA-Z_]/.test(valueExpr) && !valueExpr.includes('"') && !valueExpr.includes("'")) {
          const lineNum = i + 1;
          throw new Error(`NameError on line ${lineNum}: name '${valueExpr}' is not defined`);
        }
        variables[varName] = val;
        continue;
      }

      // Handle print(): print(...)
      if (trimmed.startsWith('print(') && trimmed.endsWith(')')) {
        const inner = trimmed.slice(6, -1).trim()
        if (inner === '') {
          stdout.push('')
          continue
        }

        // Split on top-level commas (not inside quotes/parens)
        const args = splitTopLevelCommas(inner)
        const parts = args.map(arg => {
          const val = evaluateExpression(arg, variables)
          if (val === undefined) {
            const cleaned = arg.trim()
            if (/^[a-zA-Z_]/.test(cleaned) && !cleaned.includes('"') && !cleaned.includes("'")) {
              const lineNum = i + 1
              throw new Error(`NameError on line ${lineNum}: name '${cleaned}' is not defined`)
            }
            return ''
          }
          return val === null ? 'None' : String(val)
        })
        stdout.push(parts.join(' '))
        continue
      }

      // Handle for loop: for x in range(...)
      const forRangeMatch = trimmed.match(/^for\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+in\s+range\s*\(([^)]*)\)\s*:\s*$/);
      if (forRangeMatch) {
        const loopVar = forRangeMatch[1]
        const rangeArgs = forRangeMatch[2].split(',').map(a => {
          const val = evaluateExpression(a.trim(), variables)
          return typeof val === 'number' ? val : parseInt(String(val), 10) || 0
        })
        let start = 0, end = 0, step = 1
        if (rangeArgs.length === 1) { end = rangeArgs[0] }
        else if (rangeArgs.length === 2) { start = rangeArgs[0]; end = rangeArgs[1] }
        else if (rangeArgs.length >= 3) { start = rangeArgs[0]; end = rangeArgs[1]; step = rangeArgs[2] }

        // Find loop body (indented lines after this)
        const baseIndent = line.search(/\S/)
        const bodyLines: { line: string; index: number }[] = []
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) continue
          const nextIndent = nextLine.search(/\S/)
          if (nextIndent <= baseIndent) break
          bodyLines.push({ line: nextLine, index: j })
        }

        // Execute loop
        const loopStdout: string[] = []
        for (let v = start; v < end; v += step) {
          variables[loopVar] = v
          for (const bl of bodyLines) {
            // We only handle print and assignment inside loop body
            const blTrimmed = bl.line.trim()
            if (blTrimmed.startsWith('print(') && blTrimmed.endsWith(')')) {
              const inner = blTrimmed.slice(6, -1).trim()
              if (inner === '') { loopStdout.push(''); continue }
              const args = splitTopLevelCommas(inner)
              const parts = args.map(arg => {
                const val = evaluateExpression(arg, variables)
                return val === null ? 'None' : val !== undefined ? String(val) : ''
              })
              loopStdout.push(parts.join(' '))
            } else {
              const assignM = blTrimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
              if (assignM) {
                const vn = assignM[1]
                const ve = assignM[2].trim()
                variables[vn] = evaluateExpression(ve, variables)
              }
            }
          }
        }
        stdout.push(...loopStdout)
        i += bodyLines.length
        continue
      }

      // Handle if/else (basic) - single condition
      const ifMatch = trimmed.match(/^if\s+(.+)\s*:\s*$/)
      if (ifMatch) {
        const condition = ifMatch[1]
        const condVal = evaluateExpression(condition, variables)
        const truthy = condVal !== false && condVal !== 0 && condVal !== null && condVal !== undefined && condVal !== '' && condVal !== 'False' && condVal !== '0'

        const baseIndent = line.search(/\S/)
        const ifBody: { line: string; index: number }[] = []
        let elseBody: { line: string; index: number }[] | null = null
        let foundElse = false

        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j]
          if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) continue
          const nextIndent = nextLine.search(/\S/)

          if (nextIndent <= baseIndent && nextLine.trim().startsWith('else')) {
            foundElse = true
            continue
          }

          if (nextIndent <= baseIndent) break

          if (foundElse) {
            elseBody = elseBody ?? []
            elseBody.push({ line: nextLine, index: j })
          } else {
            ifBody.push({ line: nextLine, index: j })
          }
        }

        const bodyToExec = truthy ? ifBody : (elseBody ?? [])

        for (const bl of bodyToExec) {
          const blTrimmed = bl.line.trim()
          if (blTrimmed.startsWith('print(') && blTrimmed.endsWith(')')) {
            const inner = blTrimmed.slice(6, -1).trim()
            if (inner === '') { stdout.push(''); continue }
            const args = splitTopLevelCommas(inner)
            const parts = args.map(arg => {
              const val = evaluateExpression(arg, variables)
              return val === null ? 'None' : val !== undefined ? String(val) : ''
            })
            stdout.push(parts.join(' '))
          } else {
            const assignM = blTrimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/)
            if (assignM) {
              const vn = assignM[1]
              const ve = assignM[2].trim()
              variables[vn] = evaluateExpression(ve, variables)
            }
          }
        }

        const totalBodyLines = ifBody.length + (elseBody?.length ?? 0)
        i += totalBodyLines + (foundElse ? 1 : 0)
        continue
      }

      // Try to handle expressions without assignment (like arithmetic)
      // If we reach here with an assignment-like line we missed, try to evaluate
      if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=') && !trimmed.includes('<=') && !trimmed.includes('>=')) {
        const eqIdx = trimmed.indexOf('=')
        const varName = trimmed.slice(0, eqIdx).trim()
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          const valueExpr = trimmed.slice(eqIdx + 1).trim()
          variables[varName] = evaluateExpression(valueExpr, variables)
          continue
        }
      }
    }

    return {
      stdout: stdout.join('\n'),
      stderr: null,
      banglaGuidance: null
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      stdout: stdout.join('\n'),
      stderr: message,
      banglaGuidance: message
    };
  }
};

function splitTopLevelCommas(text: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  let inQuote: string | null = null

  for (const ch of text) {
    if (inQuote) {
      current += ch
      if (ch === inQuote && (current.length < 2 || current[current.length - 2] !== '\\')) {
        inQuote = null
      }
    } else if (ch === '"' || ch === "'") {
      current += ch
      inQuote = ch
    } else if (ch === '(' || ch === '[' || ch === '{') {
      depth++
      current += ch
    } else if (ch === ')' || ch === ']' || ch === '}') {
      depth--
      current += ch
    } else if (ch === ',' && depth === 0) {
      parts.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current)
  return parts
}

export const getSimulatedHint = (code: string, error: string | null): string => {
  if (error) {
    if (error.includes('SyntaxError')) return "তোমার কোডে সিনট্যাক্স ভুল আছে। কোলন (:) বা ব্র্যাকেট () গুলো ঠিক আছে কি না চেক করো।";
    if (error.includes('NameError')) return "তুমি এমন একটি ভেরিয়েবল ব্যবহার করেছ যা আগে ডিফাইন করা হয়নি। ভেরিয়েবল স্পেলিং চেক করো।";
    return "ভুলটি সংশোধন করতে কোডটি পুনরায় চেক করো।";
  }

  if (code.includes('input') && !code.includes('print')) {
    return "তুমি ইনপুট নিয়েছ কিন্তু কিছু আউটপুট করনি। print() ব্যবহার করে আউটপুট দেখো।";
  }

  if (code.length < 20) {
    return "আরও কোড লেখো! যেমন: loops বা conditional statements ব্যবহার করার চেষ্টা করো।";
  }

  return "তোমার কোডটি বেশ ভালো হয়েছে! এখন এটি আরও জটিল করার চেষ্টা করো।";
};
