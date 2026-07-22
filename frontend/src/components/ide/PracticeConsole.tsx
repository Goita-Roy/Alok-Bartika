import React, { useEffect, useRef } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface PracticeConsoleProps {
  output: string | null;
  error: string | null;
  banglaGuidance: string | null;
  isRunning: boolean;
}

export const PracticeConsole: React.FC<PracticeConsoleProps> = ({ output, error, banglaGuidance, isRunning }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, error, banglaGuidance, isRunning]);

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto p-5 font-mono text-sm selection:bg-[#a98af8]/30 scroll-smooth"
    >
      {isRunning && (
        <div className="flex items-center gap-3 text-[#5c5a75] animate-pulse mb-4">
          <span className="w-2 h-2 rounded-full bg-[#a98af8] animate-ping" />
          <span>প্রোগ্রাম চালানো হচ্ছে...</span>
        </div>
      )}

      {!isRunning && !output && !error && (
        <div className="text-[#3b3659] italic">
          <p className="mb-2">// আউটপুট এখানে দেখানো হবে।</p>
          <p className="">// "কোড চালান" বাটনে ক্লিক করে এক্সিকিউশন শুরু করুন।</p>
        </div>
      )}

      {(error || banglaGuidance) && (
        <div className="space-y-4 mb-6">
          {error && (
            <div className="bg-[#f43f5e]/5 border-l-2 border-[#f43f5e] p-4 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-[#f43f5e]" />
                <span className="text-[10px] font-bold text-[#f43f5e] uppercase tracking-widest">রানটাইম ত্রুটি</span>
              </div>
              <pre className="text-[#f43f5e] whitespace-pre-wrap leading-relaxed">{error}</pre>
            </div>
          )}

          {banglaGuidance && (
            <div className="bg-[#a98af8]/5 border-l-2 border-[#a98af8] p-4 rounded-r-lg animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-[#a98af8]" />
                <span className="text-[10px] font-bold text-[#a98af8] uppercase tracking-widest">বাংলা গাইডেন্স</span>
              </div>
              <p className="text-slate-300 font-sans text-sm leading-relaxed">
                {banglaGuidance}
              </p>
            </div>
          )}
        </div>
      )}

      {output && (
        <div className="space-y-1">
          <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
          <div className="h-4" />
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#3b3659] uppercase tracking-widest pt-4 border-t border-[#2d2a3f]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            প্রক্রিয়া সফলভাবে শেষ হয়েছে
          </div>
        </div>
      )}
    </div>
  );
};

