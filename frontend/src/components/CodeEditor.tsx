import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { simulateExecution, getSimulatedHint } from '../utils/codeSimulator';
import { analyzeCode } from '../utils/codeAnalyzer';
import { Play, RotateCcw, Trash2, CheckCircle2, XCircle, Trophy, Sparkles } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string
  language?: string
  problemDescription?: string
  expectedOutput?: string
  isSolved?: boolean
  onSuccess?: () => void
  onChange?: (code: string) => void
}

export function CodeEditor({ 
  initialCode = '# Write your Python code here\nprint("Hello World")', 
  language = 'python', 
  problemDescription = '',
  expectedOutput,
  isSolved,
  onSuccess,
  onChange
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const isTypingRef = useRef(false)

  useEffect(() => {
    setCode(initialCode)
    isTypingRef.current = false
    if (onChange) onChange(initialCode)
  }, [initialCode])
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isGettingHint, setIsGettingHint] = useState(false)
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)
  const [liveErrors, setLiveErrors] = useState<ReturnType<typeof analyzeCode>>([])

  useEffect(() => {
    const t = window.setTimeout(() => setLiveErrors(analyzeCode('python', code)), 300)
    return () => window.clearTimeout(t)
  }, [code])

  const runCode = () => {
    setIsRunning(true)
    setOutput(null)
    setError(null)
    setFeedback(null)
    
    setTimeout(() => {
      const result = simulateExecution(code, stdin);
      if (result.stderr) {
        setError(result.stderr);
        setFeedback('error');
      } else {
        setOutput(result.stdout);
        
        // Validation logic
        if (expectedOutput) {
          const normalizedActual = result.stdout.trim().replace(/\r\n/g, '\n');
          const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, '\n');
          
          if (normalizedActual === normalizedExpected) {
            setFeedback('success');
            if (onSuccess) onSuccess();
          } else {
            setFeedback('error');
          }
        }
      }
      setIsRunning(false);
    }, 600);
  }

  const getAIHint = () => {
    setIsGettingHint(true)
    setHint(null)
    
    setTimeout(() => {
      const simulatedHint = getSimulatedHint(code, error);
      setHint(simulatedHint);
      setIsGettingHint(false);
    }, 800);
  }

  const handleReset = () => {
    if (window.confirm('কোড রিসেট করে শুরুর অবস্থায় নিয়ে যাবেন?')) {
      setCode(initialCode);
      setFeedback(null);
      setOutput(null);
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e0c13] overflow-hidden text-sm">
      {/* Problem Description Area */}
      <div className="p-6 border-b border-[#2d2a3f] text-slate-300 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
           <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#a98af8] uppercase tracking-widest block">বর্তমান টাস্ক</span>
              <p className="text-lg font-bold text-white leading-tight">{problemDescription}</p>
           </div>
           {isSolved && (
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">সম্পন্ন</span>
             </div>
           )}
        </div>
        
        {!expectedOutput && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b1928] text-[#7e7b99] rounded border border-[#2d2a3f] text-[10px] font-bold uppercase tracking-wider">
             রেফারেন্স উপাদান
          </div>
        )}
      </div>

      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#14121c] border-b border-[#2d2a3f]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3b3659]">main.py</span>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleReset}
             className="p-1.5 hover:bg-[#1b1928] rounded-md text-[#3b3659] hover:text-[#a98af8] transition-colors"
             title="কোড রিসেট করুন"
           >
             <RotateCcw size={14} />
           </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-0">
        <Editor
          height="100%"
          defaultLanguage={language}
          theme="vs-dark"
          value={code}
          onChange={(value) => {
            isTypingRef.current = true
            setCode(value || '')
            if (onChange) onChange(value || '')
          }}
          options={{
            readOnly: false,
            domReadOnly: false,
            fontSize: 15,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            renderLineHighlight: 'all',
            lineNumbers: 'on',
            glyphMargin: true,
            tabSize: 4,
            insertSpaces: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto'
            }
          }}
          onMount={(editor, monaco) => {
             monaco.editor.defineTheme('custom-dark', {
               base: 'vs-dark',
               inherit: true,
               rules: [],
               colors: {
                 'editor.background': '#0e0c13',
                 'editor.lineHighlightBackground': '#1b1928',
                 'editorLineNumber.foreground': '#2d2a3f',
                 'editorLineNumber.activeForeground': '#a98af8'
               }
             });
             monaco.editor.setTheme('custom-dark');
             editor.focus();
             editor.onDidChangeModelContent(() => {
               const model = editor.getModel();
               if (!model) return;
               const errs = analyzeCode('python', model.getValue());
               monaco.editor.setModelMarkers(model, 'analyzer', errs.map((e) => ({
                 startLineNumber: Math.max(1, e.line),
                 startColumn: 1,
                 endLineNumber: Math.max(1, e.line),
                 endColumn: model.getLineMaxColumn(Math.max(1, e.line)),
                 message: e.banglaExplanation,
                 severity: monaco.MarkerSeverity.Error,
               })));
             });
          }}
        />
      </div>

      {/* Feedback Overlay */}
      {feedback && (
        <div className={`absolute bottom-24 right-6 px-6 py-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-right-10 duration-300 shadow-2xl ${
          feedback === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
        }`}>
           {feedback === 'success' ? <Trophy size={20} /> : <XCircle size={20} />}
           <div className="flex flex-col">
              <span className="font-bold text-sm">{feedback === 'success' ? 'সঠিক সমাধান!' : 'ভুল আউটপুট'}</span>
              <span className="text-[10px] opacity-70 uppercase font-bold tracking-widest">
                {feedback === 'success' ? 'দারুণ! সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।' : 'প্রবলেম স্টেটমেন্ট আবার দেখুন।'}
              </span>
           </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="border-t border-[#2d2a3f] bg-[#0e0c13] flex flex-col">
        {/* Stdin */}
        <div className="flex items-center border-b border-[#2d2a3f] px-6">
           <span className="text-[10px] font-bold text-[#3b3659] uppercase tracking-widest mr-4">stdin</span>
           <input
             type="text"
             value={stdin}
             onChange={(e) => setStdin(e.target.value)}
             placeholder="কোড চালানোর জন্য ঐচ্ছিক ইনপুট..."
             className="flex-1 bg-transparent py-4 text-xs text-slate-300 font-mono outline-none placeholder-[#2d2a3f]"
           />
        </div>
        
        {/* Actions & Output */}
        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  isRunning ? 'bg-[#1b1928] text-[#3b3659]' : 'bg-[#a98af8] hover:bg-[#9674f5] text-black shadow-lg shadow-[#a98af8]/10'
                }`}
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
                {isRunning ? 'চলছে...' : 'কোড চালান'}
              </button>
              <button
                onClick={() => { setOutput(null); setError(null); setFeedback(null); }}
                className="px-6 py-3 bg-[#1b1928] hover:bg-[#252236] border border-[#2d2a3f] text-[#7e7b99] hover:text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                <span>পরিষ্কার</span>
              </button>
            </div>
            
            <button
               onClick={getAIHint}
               disabled={isGettingHint || isRunning}
               className="px-5 py-3 bg-transparent hover:bg-[#1b1928] text-[#a98af8] border border-[#a98af8]/20 text-sm font-bold rounded-xl transition-all"
            >
               {isGettingHint ? 'বিশ্লেষণ করছে...' : '✨ AI ইঙ্গিত'}
            </button>
          </div>
          
          <div className="min-h-[100px] max-h-[200px] overflow-y-auto bg-[#0e0c13] rounded-xl border border-[#2d2a3f] p-4 font-mono text-xs shadow-inner custom-scrollbar">
            {hint && (
              <div className="mb-4 text-[#a98af8] bg-[#a98af8]/5 border-l-2 border-[#a98af8] p-3 rounded-r-lg animate-in slide-in-from-left-2">
                 <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} />
                    <span className="font-bold uppercase tracking-widest text-[10px]">AI সহায়ক</span>
                 </div>
                 <p className="leading-relaxed">{hint}</p>
              </div>
            )}
            
            {output && (
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-[#3b3659] uppercase tracking-widest">আউটপুট:</span>
                 <pre className="text-slate-200 whitespace-pre-wrap">{output}</pre>
              </div>
            )}
            
            {error && (
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-widest">ত্রুটি:</span>
                 <pre className="text-[#f43f5e] whitespace-pre-wrap leading-relaxed">{error}</pre>
              </div>
            )}

            {liveErrors.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-[#2d2a3f] pt-3">
                <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-widest">ত্রুটি বিশ্লেষণ</span>
                {liveErrors.slice(0, 3).map((e, i) => (
                  <div key={i} className="rounded-lg border border-[#f43f5e]/30 bg-[#f43f5e]/5 p-2 text-[11px]">
                    <div className="font-bold text-[#f43f5e]">Line {e.line} — {e.type}</div>
                    <div className="text-slate-300 mt-1">{e.banglaExplanation}</div>
                    <div className="text-[#a98af8] mt-1">💡 {e.suggestedFix}</div>
                  </div>
                ))}
              </div>
            )}
            
            {!output && !error && !isRunning && (
              <p className="text-[#2d2a3f] italic font-medium">// কোডের আউটপুট এখানে দেখা যাবে...</p>
            )}
            
            {isRunning && (
              <div className="flex items-center gap-3 text-[#5c5a75]">
                 <div className="w-1.5 h-1.5 bg-[#5c5a75] rounded-full animate-bounce" />
                 <div className="w-1.5 h-1.5 bg-[#5c5a75] rounded-full animate-bounce [animation-delay:0.2s]" />
                 <div className="w-1.5 h-1.5 bg-[#5c5a75] rounded-full animate-bounce [animation-delay:0.4s]" />
                 <span className="ml-2">পাইথন কোড চালানো হচ্ছে...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
