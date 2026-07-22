import { useCallback, useEffect, useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import type { CodeErrorDetail } from '../../utils/codeAnalyzer'

type IDECodeEditorProps = {
  fileId: string
  language: string
  theme: 'dark' | 'light'
  value: string
  errors: CodeErrorDetail[]
  highlightLine?: number | null
  onChange: (value: string) => void
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void
  onCursorChange?: (line: number, column: number) => void
  onScrollChange?: (scrollTop: number) => void
}

export function IDECodeEditor({
  fileId,
  language,
  theme,
  value,
  errors,
  highlightLine,
  onChange,
  onEditorMount,
  onCursorChange,
  onScrollChange,
}: IDECodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null)
  const decorationsRef = useRef<string[]>([])
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [fileId])

  const applyMarkers = useCallback(
    (errs: CodeErrorDetail[]) => {
      const ed = editorRef.current
      const monaco = monacoRef.current
      if (!ed || !monaco) return
      const model = ed.getModel()
      if (!model) return

      const markers = errs.map((e) => {
        const line = Math.max(1, Math.min(e.line, model.getLineCount()))
        return {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: Math.max(2, model.getLineMaxColumn(line)),
          message: `${e.banglaExplanation}\n💡 ${e.suggestedFix}`,
          severity: monaco.MarkerSeverity.Error,
        }
      })

      monaco.editor.setModelMarkers(model, 'alokbartika-analyzer', markers)

      const errorLines = [...new Set(errs.map((e) => e.line).filter((l) => l > 0))]
      decorationsRef.current = ed.deltaDecorations(
        decorationsRef.current,
        errorLines.map((line) => ({
          range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
          options: {
            isWholeLine: true,
            className: 'ide-error-line-bg',
            glyphMarginClassName: 'ide-error-line-glyph',
            overviewRuler: {
              color: '#ef4444',
              position: monaco.editor.OverviewRulerLane.Right,
            },
          },
        })),
      )
    },
    [],
  )

  useEffect(() => {
    applyMarkers(errors)
  }, [errors, applyMarkers])

  useEffect(() => {
    const ed = editorRef.current
    if (!ed || !highlightLine) return
    ed.revealLineInCenter(highlightLine)
    ed.setPosition({ lineNumber: highlightLine, column: 1 })
  }, [highlightLine])

  const handleMount: OnMount = (ed, monaco) => {
    editorRef.current = ed
    monacoRef.current = monaco

    ed.updateOptions({
      readOnly: false,
      domReadOnly: false,
      tabSize: 4,
      insertSpaces: true,
      automaticLayout: true,
      fontSize: 14,
      minimap: { enabled: false },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      renderValidationDecorations: 'on',
      quickSuggestions: true,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
      fontLigatures: true,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'all',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: 'active',
        highlightActiveIndentation: true,
      },
      selectionHighlight: true,
      occurrencesHighlight: 'singleFile',
      renderWhitespace: 'selection',
      hideCursorInOverviewRuler: true,
      overviewRulerLanes: 3,
      overviewRulerBorder: false,
    })

    ed.focus()
    applyMarkers(errors)
    onEditorMount?.(ed)

    ed.addCommand(monaco.KeyCode.Tab, () => {
      ed.trigger('keyboard', 'type', { text: '    ' })
    })

    ed.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column)
    })

    ed.onDidScrollChange((e) => {
      onScrollChange?.(e.scrollTop)
    })
  }

  const handleChange = (next: string | undefined) => {
    const text = next ?? ''
    setLocalValue(text)
    onChange(text)
  }

  return (
    <div className="h-full w-full min-h-[220px]">
      <Editor
        key={fileId}
        height="100%"
        language={language}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        value={localValue}
        onChange={handleChange}
        onMount={handleMount}
        loading={
          <div className="flex h-full items-center justify-center text-xs text-slate-400">এডিটর লোড হচ্ছে...</div>
        }
        options={{
          readOnly: false,
          domReadOnly: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
