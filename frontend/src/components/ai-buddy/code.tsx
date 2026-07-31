import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Token {
  type: string
  value: string
}

interface Rule {
  type: string
  re: RegExp
}

const RULES: Record<string, Rule[]> = {
  python: [
    { type: 'string', re: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y },
    { type: 'comment', re: /#[^\n]*/y },
    { type: 'decorator', re: /@[\w.]+/y },
    { type: 'number', re: /\b\d[\d_]*(?:\.\d+)?\b/y },
    {
      type: 'keyword',
      re: /\b(?:def|return|import|from|if|elif|else|for|while|in|not|and|or|class|try|except|finally|with|as|None|True|False|lambda|global|nonlocal|yield|pass|break|continue|is|del|assert|raise|async|await)\b/y,
    },
    {
      type: 'builtin',
      re: /\b(?:print|input|len|range|int|float|str|list|dict|set|tuple|sum|min|max|abs|round|isinstance|type|enumerate|zip|map|filter|sorted|open|format|bool|self)\b/y,
    },
    { type: 'function', re: /[A-Za-z_]\w*(?=\()/y },
  ],
  javascript: [
    { type: 'comment', re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//y },
    { type: 'string', re: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y },
    { type: 'number', re: /\b\d[\d_]*(?:\.\d+)?\b/y },
    {
      type: 'keyword',
      re: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|import|export|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|this|null|undefined|true|false|delete|void|yield|static|extends|super)\b/y,
    },
    {
      type: 'builtin',
      re: /\b(?:console|document|window|Math|JSON|Object|Array|String|Number|Boolean|parseInt|parseFloat|setTimeout|setInterval)\b/y,
    },
    { type: 'function', re: /[A-Za-z_$][\w$]*(?=\()/y },
  ],
  html: [
    { type: 'comment', re: /<!--[\s\S]*?-->/y },
    { type: 'string', re: /"[^"]*"|'[^']*'/y },
    { type: 'tag', re: /<\/?[a-zA-Z][\w-]*/y },
    { type: 'attr', re: /[a-zA-Z-]+(?==)/y },
  ],
  css: [
    { type: 'comment', re: /\/\*[\s\S]*?\*\//y },
    { type: 'string', re: /"[^"]*"|'[^']*'/y },
    { type: 'number', re: /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?/y },
    { type: 'property', re: /[a-z-]+(?=\s*:)/y },
  ],
  bash: [
    { type: 'comment', re: /#[^\n]*/y },
    { type: 'string', re: /"[^"]*"|'[^']*'/y },
    {
      type: 'builtin',
      re: /\b(?:cd|ls|mkdir|touch|rm|cp|mv|cat|echo|pip|pip3|python|python3|npm|node|git|sudo|export|source)\b/y,
    },
  ],
}

const ALIASES: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'javascript',
  tsx: 'javascript',
  jsx: 'javascript',
  html5: 'html',
  css3: 'css',
  sh: 'bash',
  shell: 'bash',
  console: 'bash',
}

function normalizeLanguage(language: string): string {
  const lang = (language || '').trim().toLowerCase()
  return ALIASES[lang] ?? lang
}

const TOKEN_COLORS: Record<string, string> = {
  keyword: '#FBBF24',
  builtin: '#67E8F9',
  string: '#86EFAC',
  comment: '#94A3B8',
  number: '#93C5FD',
  decorator: '#F0ABFC',
  function: '#93C5FD',
  tag: '#F87171',
  attr: '#FBBF24',
  property: '#7DD3FC',
}

function tokenize(code: string, language: string): Token[] {
  const rules = RULES[language]
  if (!rules || rules.length === 0) {
    return [{ type: 'plain', value: code }]
  }
  const tokens: Token[] = []
  let i = 0
  const n = code.length
  while (i < n) {
    let matched = false
    for (const rule of rules) {
      rule.re.lastIndex = i
      const m = rule.re.exec(code)
      if (m && m.index === i && m[0].length > 0) {
        tokens.push({ type: rule.type, value: m[0] })
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      tokens.push({ type: 'plain', value: code[i] })
      i += 1
    }
  }
  return tokens
}

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const lang = normalizeLanguage(language)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const tokens = tokenize(code, lang)

  return (
    <div
      className="my-3 overflow-hidden rounded-xl border"
      style={{ backgroundColor: 'var(--color-code-bg)', borderColor: 'var(--color-border)' }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-3 py-2"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="কোড কপি করুন"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold transition-colors"
          style={{
            color: copied ? '#86EFAC' : 'rgba(255,255,255,0.6)',
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              ;(e.currentTarget as HTMLElement).style.color = '#fff'
              ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)'
            }
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.color = copied ? '#86EFAC' : 'rgba(255,255,255,0.6)'
            ;(e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'কপি হয়েছে' : 'কপি'}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed">
        <code style={{ color: '#E2E8F0' }}>
          {tokens.map((t, idx) => (
            <span key={idx} style={{ color: TOKEN_COLORS[t.type] ?? '#E2E8F0' }}>
              {t.value}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
