import type { ReactNode } from 'react'
import { CodeBlock } from './code'

function safeUrl(url: string): string {
  const t = url.trim()
  if (/^(https?:\/\/|mailto:|\/)/i.test(t)) return t
  return '#'
}

function createInlineParser() {
  let k = 0
  const parse = (text: string): ReactNode[] => {
    const nodes: ReactNode[] = []
    const re =
      /(\*\*([^*]+)\*\*)|(\*([^*\s][^*]*)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const start = m.index
      if (start > last) nodes.push(text.slice(last, start))
      if (m[2] !== undefined) {
        nodes.push(<strong key={k++}>{parse(m[2])}</strong>)
      } else if (m[4] !== undefined) {
        nodes.push(<em key={k++}>{parse(m[4])}</em>)
      } else if (m[6] !== undefined) {
        nodes.push(
          <code
            key={k++}
            className="rounded-md px-1.5 py-0.5 font-mono text-[0.85em]"
            style={{
              backgroundColor: 'var(--color-accent-pale)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-border)',
            }}
          >
            {m[6]}
          </code>,
        )
      } else if (m[7] !== undefined) {
        nodes.push(
          <a
            key={k++}
            href={safeUrl(m[9] ?? '')}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            {parse(m[8])}
          </a>,
        )
      }
      last = re.lastIndex
    }
    if (last < text.length) nodes.push(text.slice(last))
    return nodes
  }
  return parse
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && /-{3,}/.test(line)
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((s) => s.trim())
}

function renderTable(
  key: number,
  header: string[],
  body: string[][],
  inline: (text: string) => ReactNode[],
) {
  const cols = Math.max(header.length, ...body.map((r) => r.length))
  return (
    <div
      key={key}
      className="my-3 overflow-x-auto rounded-xl border"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {header.map((h, idx) => (
              <th
                key={idx}
                className="whitespace-nowrap px-3 py-2 text-left font-bold"
                style={{
                  color: 'var(--color-accent)',
                  backgroundColor: 'var(--color-accent-pale)',
                }}
              >
                {inline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              {Array.from({ length: cols }, (_, ci) => (
                <td key={ci} className="px-3 py-2 align-top" style={{ color: 'var(--color-text)' }}>
                  {inline(row[ci] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Markdown({ content }: { content: string }) {
  const inline = createInlineParser()
  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let k = 0
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    const fence = /^```([\w+-]*)\s*$/.exec(line)
    if (fence) {
      const language = fence[1] ?? ''
      const buf: string[] = []
      i += 1
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        buf.push(lines[i])
        i += 1
      }
      i += 1
      blocks.push(<CodeBlock key={k++} language={language} code={buf.join('\n')} />)
      continue
    }

    if (!line.trim()) {
      i += 1
      continue
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      const level = heading[1].length
      const style = {
        color: 'var(--color-text)',
        fontWeight: 700,
        lineHeight: 1.3,
        marginTop: '0.75rem',
        marginBottom: '0.25rem',
      } as const
      if (level === 1) {
        blocks.push(
          <h2 key={k++} className="text-xl" style={style}>
            {inline(heading[2])}
          </h2>,
        )
      } else if (level === 2) {
        blocks.push(
          <h3 key={k++} className="text-lg" style={style}>
            {inline(heading[2])}
          </h3>,
        )
      } else {
        blocks.push(
          <h4 key={k++} className="text-base" style={style}>
            {inline(heading[2])}
          </h4>,
        )
      }
      i += 1
      continue
    }

    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push(
        <hr key={k++} className="my-3 border-t" style={{ borderColor: 'var(--color-border)' }} />,
      )
      i += 1
      continue
    }

    if (/^\s*>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ''))
        i += 1
      }
      blocks.push(
        <blockquote
          key={k++}
          className="my-2 rounded-r-xl border-l-4 px-3 py-2"
          style={{
            borderLeftColor: 'var(--color-warn)',
            backgroundColor: 'var(--color-accent-pale)',
            color: 'var(--color-text-muted)',
          }}
        >
          {inline(buf.join(' '))}
        </blockquote>,
      )
      continue
    }

    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitTableRow(line)
      i += 2
      const body: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        body.push(splitTableRow(lines[i]))
        i += 1
      }
      blocks.push(renderTable(k++, header, body, inline))
      continue
    }

    const ul = /^\s*[-*+]\s+(.*)$/.exec(line)
    if (ul) {
      const items: string[] = []
      while (i < lines.length) {
        const it = /^\s*[-*+]\s+(.*)$/.exec(lines[i])
        if (it) {
          items.push(it[1])
          i += 1
        } else break
      }
      blocks.push(
        <ul key={k++} className="my-2 list-disc space-y-1 pl-5" style={{ color: 'var(--color-text)' }}>
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (ol) {
      const items: string[] = []
      while (i < lines.length) {
        const it = /^\s*\d+[.)]\s+(.*)$/.exec(lines[i])
        if (it) {
          items.push(it[1])
          i += 1
        } else break
      }
      blocks.push(
        <ol key={k++} className="my-2 list-decimal space-y-1 pl-5" style={{ color: 'var(--color-text)' }}>
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4}\s|```|>\s?|[-*+]\s|\d+[.)]\s|\|)/.test(lines[i].trimStart()) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      para.push(lines[i])
      i += 1
    }
    blocks.push(
      <p key={k++} className="my-1.5 leading-relaxed" style={{ color: 'var(--color-text)' }}>
        {inline(para.join(' '))}
      </p>,
    )
  }

  return <div className="text-sm">{blocks}</div>
}
