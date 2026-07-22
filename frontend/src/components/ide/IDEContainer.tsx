import React, { useState, useEffect } from 'react';
import { ClassSidebar } from './ClassSidebar';
import { ProblemListPanel } from './ProblemListPanel';
import { CodeEditor } from '../CodeEditor';
import { ideClasses, type Problem } from '../../data/ideData';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const IDEContainer: React.FC = () => {
  const [selectedClassId, setSelectedClassId] = useState(ideClasses[0].id);
  const [selectedProblemId, setSelectedProblemId] = useState(ideClasses[0].problems[0].id);
  const [activeProblem, setActiveProblem] = useState<Problem>(ideClasses[0].problems[0]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // IDE practice-problem completion is ephemeral sandbox state (in-memory only).
  // It is intentionally NOT persisted to localStorage — MongoDB is the single
  // source of truth for LMS learning progress, and the IDE playground is a
  // separate practice tool that resets on refresh by design.
  useEffect(() => {
    setCompletedIds([]);
  }, []);

  useEffect(() => {
    const cls = ideClasses.find(c => c.id === selectedClassId);
    if (cls && cls.problems.length > 0) {
      if (!cls.problems.find(p => p.id === selectedProblemId)) {
        setSelectedProblemId(cls.problems[0].id);
        setActiveProblem(cls.problems[0]);
      }
    }
  }, [selectedClassId]);

  useEffect(() => {
    const cls = ideClasses.find(c => c.id === selectedClassId);
    const prob = cls?.problems.find(p => p.id === selectedProblemId);
    if (prob) {
      setActiveProblem(prob);
    }
    setShowSuccess(false);
  }, [selectedProblemId]);

  const handleProblemSolved = (id: string) => {
    if (!completedIds.includes(id)) {
      setCompletedIds(prev => [...prev, id]);
    }
    setShowSuccess(true);
  };

  const handleNextProblem = () => {
    setShowSuccess(false);
    const currentClass = ideClasses.find(c => c.id === selectedClassId);
    if (!currentClass) return;

    const currentIndex = currentClass.problems.findIndex(p => p.id === selectedProblemId);
    if (currentIndex < currentClass.problems.length - 1) {
      // Next problem in same class
      const nextProb = currentClass.problems[currentIndex + 1];
      setSelectedProblemId(nextProb.id);
    } else {
      // Next class
      const currentClassIndex = ideClasses.findIndex(c => c.id === selectedClassId);
      if (currentClassIndex < ideClasses.length - 1) {
        const nextClass = ideClasses[currentClassIndex + 1];
        setSelectedClassId(nextClass.id);
        setSelectedProblemId(nextClass.problems[0].id);
      }
    }
  };

  const currentClass = ideClasses.find(c => c.id === selectedClassId) || ideClasses[0];

  return (
    <div className="flex h-full bg-[#0e0c13] rounded-2xl shadow-2xl border border-[#2d2a3f] overflow-hidden font-sans relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#1b1928] p-8 rounded-3xl border border-[#a98af8]/30 shadow-2xl shadow-[#a98af8]/10 flex flex-col items-center text-center max-w-sm animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-[#a98af8]/20 rounded-full flex items-center justify-center mb-6 relative">
                 <Sparkles className="text-[#a98af8] absolute -top-1 -right-1" size={24} />
                 <CheckCircle2 className="text-[#a98af8]" size={48} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">সমস্যা সফলভাবে সমাধান হয়েছে!</h2>
              <p className="text-[#7e7b99] text-sm mb-8 leading-relaxed">
                দারুণ! আপনি এই চ্যালেঞ্জ সম্পন্ন করেছেন। পরবর্তী চ্যালেঞ্জে যাচ্ছি।
              </p>
              <button 
                onClick={handleNextProblem}
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#a98af8] hover:bg-[#9674f5] text-black font-bold rounded-2xl transition-all shadow-lg shadow-[#a98af8]/20 group"
              >
                <span>চালিয়ে যান</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      )}

      {/* Left Sidebar - Classes */}
      <div className="w-64 flex-shrink-0">
        <ClassSidebar 
          classes={ideClasses} 
          selectedClassId={selectedClassId} 
          onSelectClass={setSelectedClassId} 
        />
      </div>

      {/* Middle Panel - Problems */}
      <div className="w-[340px] flex-shrink-0">
        <ProblemListPanel 
          problems={currentClass.problems} 
          selectedProblemId={selectedProblemId} 
          onSelectProblem={setSelectedProblemId}
          completedIds={completedIds}
        />
      </div>

      {/* Right Panel - Code Editor */}
      <div className="flex-1 flex flex-col bg-[#0e0c13] overflow-hidden">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2d2a3f]">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-[#5c5a75] uppercase tracking-widest">ইন্টারেক্টিভ মোড</span>
           </div>
          <span className="text-xs font-bold px-3 py-1 bg-[#1b1928] text-slate-300 rounded border border-[#2d2a3f]">
            Python
          </span>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col">
           <CodeEditor 
             key={activeProblem.id}
             initialCode={activeProblem.initialCode} 
             language={activeProblem.language}
             problemDescription={activeProblem.description}
             expectedOutput={activeProblem.expectedOutput}
             isSolved={completedIds.includes(activeProblem.id)}
             onSuccess={() => handleProblemSolved(activeProblem.id)}
           />
        </div>
      </div>
    </div>
  );
};
