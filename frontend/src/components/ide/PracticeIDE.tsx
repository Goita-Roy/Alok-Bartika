import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw, Trash2, Command, Terminal as TerminalIcon, Volume2, VolumeX } from 'lucide-react';
import { PracticeConsole } from './PracticeConsole';
import { VisualPreview } from './VisualPreview';
import { simulateExecution } from '../../utils/codeSimulator';

export const PracticeIDE: React.FC = () => {
  const [code, setCode] = useState('# Welcome to Self Practice!\n# You can write and test your Python code here.\n\nprint("Hello, Alokbartika!")\n\nname = input("Enter your name: ")\nprint(f"Welcome to the world of coding, {name}!")');
  const [stdin, setStdin] = useState('Explorer');
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banglaGuidance, setBanglaGuidance] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'console' | 'preview'>('console');

  const speakGuidance = (text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Stop any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a Bangla voice
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.includes('bn'));
    if (bnVoice) utterance.voice = bnVoice;
    utterance.lang = 'bn-BD';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);
    setBanglaGuidance(null);

    // Simulate small delay for better UX
    setTimeout(() => {
      const result = simulateExecution(code, stdin);
      
      if (result.stderr) {
        setError(result.stderr);
        setBanglaGuidance(result.banglaGuidance);
        if (result.banglaGuidance) speakGuidance(result.banglaGuidance);
      } else {
        setOutput(result.stdout);
      }
      
      setIsRunning(false);
    }, 600);
  };

  const handleClear = () => {
    setOutput(null);
    setError(null);
    setBanglaGuidance(null);
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি এডিটর রিসেট করতে চান?')) {
      setCode('# Start fresh...\nprint("Hello World")');
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* Editor Section */}
      <div className="flex-1 flex flex-col bg-[#14121c] rounded-2xl border border-[#2d2a3f] overflow-hidden shadow-2xl">
        <div className="h-12 flex items-center justify-between px-4 bg-[#1b1928] border-b border-[#2d2a3f]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            </div>
            <span className="text-[10px] font-bold text-[#5c5a75] uppercase tracking-widest ml-2">main.py</span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
               className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${
                 isVoiceEnabled 
                 ? 'bg-[#a98af8]/10 border-[#a98af8]/30 text-[#a98af8]' 
                 : 'bg-[#0e0c13] border-[#2d2a3f] text-[#3b3659]'
               }`}
             >
               {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
               <span className="text-[10px] font-bold uppercase tracking-wider">ভয়েস {isVoiceEnabled ? 'চালু' : 'বন্ধ'}</span>
             </button>
             <span className="text-[10px] font-bold text-[#3b3659] flex items-center gap-1 bg-[#0e0c13] px-2 py-1 rounded border border-[#2d2a3f]">
               <Command size={10} /> S
             </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              padding: { top: 20, bottom: 20 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
              }
            }}
            onMount={(editor, monaco) => {
              monaco.editor.defineTheme('practice-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#14121c',
                  'editor.lineHighlightBackground': '#1b1928',
                  'editorLineNumber.foreground': '#3b3659',
                  'editorLineNumber.activeForeground': '#a98af8',
                  'editor.selectionBackground': '#a98af820'
                }
              });
              monaco.editor.setTheme('practice-dark');
            }}
          />
        </div>
      </div>

      {/* Control & Console Section */}
      <div className="w-[450px] flex flex-col gap-6">
        {/* Controls */}
        <div className="bg-[#14121c] p-6 rounded-2xl border border-[#2d2a3f] shadow-xl">
           <div className="flex items-center gap-3 mb-6">
             <button
               onClick={handleRun}
               disabled={isRunning}
               className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-bold text-sm transition-all shadow-lg ${
                 isRunning 
                 ? 'bg-[#1b1928] text-[#5c5a75] cursor-not-allowed'
                 : 'bg-[#a98af8] hover:bg-[#9674f5] text-black shadow-[#a98af8]/10'
               }`}
             >
               <Play size={18} fill={isRunning ? 'none' : 'currentColor'} />
                {isRunning ? 'চলছে...' : 'কোড চালান'}
             </button>
             <button 
               onClick={handleReset}
               className="w-12 h-12 flex items-center justify-center bg-[#1b1928] hover:bg-[#252236] border border-[#2d2a3f] rounded-xl text-slate-400 transition-colors"
                title="কোড রিসেট করুন"
             >
               <RotateCcw size={18} />
             </button>
           </div>

            <div className="space-y-4">
             <div>
               <label className="text-[10px] font-bold text-[#5c5a75] uppercase tracking-widest block mb-2 px-1">স্ট্যান্ডার্ড ইনপুট (stdin)</label>
               <div className="relative">
                 <textarea 
                   value={stdin}
                   onChange={(e) => setStdin(e.target.value)}
                   placeholder="ইনপুট লিখুন (প্রতি লাইনে একটি)..."
                   className="w-full h-24 bg-[#0e0c13] border border-[#2d2a3f] rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-[#a98af8]/50 transition-colors placeholder-[#2d2a3f] resize-none font-mono"
                 />
               </div>
                <p className="text-[9px] text-[#3b3659] mt-2 px-1 italic">
                  * একাধিক input() কলের জন্য প্রতি লাইনে একটি করে ইনপুট দিন।
                </p>
             </div>
           </div>
        </div>

        {/* Output Panel with Tabs */}
        <div className="flex-1 flex flex-col bg-[#0e0c13] rounded-2xl border border-[#2d2a3f] overflow-hidden shadow-2xl">
          <div className="h-12 flex-shrink-0 flex items-center justify-between px-5 border-b border-[#2d2a3f] bg-[#14121c]">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('console')}
                className={`text-[10px] font-bold uppercase tracking-widest pb-3 transition-all relative ${
                  activeTab === 'console' ? 'text-[#a98af8]' : 'text-[#3b3659] hover:text-[#5c5a75]'
                }`}
              >
                কনসোল
                {activeTab === 'console' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a98af8] rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`text-[10px] font-bold uppercase tracking-widest pb-3 transition-all relative ${
                  activeTab === 'preview' ? 'text-[#a98af8]' : 'text-[#3b3659] hover:text-[#5c5a75]'
                }`}
              >
                ভিজ্যুয়াল প্রিভিউ
                {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#a98af8] rounded-full" />}
              </button>
            </div>
            <button 
              onClick={handleClear}
              className="p-1.5 hover:bg-[#1b1928] rounded-lg text-[#5c5a75] hover:text-[#f43f5e] transition-all"
              title="কনসোল পরিষ্কার করুন"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {activeTab === 'console' ? (
              <PracticeConsole output={output} error={error} banglaGuidance={banglaGuidance} isRunning={isRunning} />
            ) : (
              <VisualPreview code={code} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

