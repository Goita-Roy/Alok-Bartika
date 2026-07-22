import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type Problem } from '../../data/ideData';
import { CheckCircle2, BookOpen, PenTool } from 'lucide-react';

interface ProblemListPanelProps {
  problems: Problem[];
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
  completedIds?: string[];
}

export const ProblemListPanel: React.FC<ProblemListPanelProps> = ({ problems, selectedProblemId, onSelectProblem, completedIds = [] }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-full bg-[#14121c] border-r border-[#2d2a3f]">
      {/* Top Header */}
      <div className="p-5 border-b border-[#2d2a3f] flex items-center justify-between bg-[#1b1928]/30">
        <h2 className="font-bold text-white text-lg uppercase tracking-tighter">
          {problems[0]?.id.startsWith('pb') ? 'পাইথন বেসিক্স' : 
           problems[0]?.id.startsWith('ds') ? 'ডাটা স্ট্রাকচার' :
           problems[0]?.id.startsWith('alg') ? 'অ্যালগরিদম' :
           problems[0]?.id.startsWith('oop') ? 'অবজেক্ট-ওরিয়েন্টেড' :
           problems[0]?.id.startsWith('fp') ? 'ফাংশনাল প্রোগ্রামিং' :
           problems[0]?.id.startsWith('ml') ? 'মডিউল ও লাইব্রেরি' :
           problems[0]?.id.startsWith('gg') ? 'GUI ও গ্রাফিক্স' : 'সমস্যা'}
        </h2>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold px-2 py-1 bg-[#a98af8]/10 text-[#a98af8] rounded border border-[#a98af8]/20">
             {problems.length} টাস্ক
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-5 space-y-8">
          {problems.map((prob, idx) => {
            const isSelected = selectedProblemId === prob.id;
            const isCompleted = completedIds.includes(prob.id);
            const isPractice = !!prob.expectedOutput;

            return (
              <div 
                key={prob.id} 
                className={`group cursor-pointer transition-all ${isSelected ? 'opacity-100 scale-[1.02]' : 'opacity-70 hover:opacity-100 hover:translate-x-1'}`}
                onClick={() => onSelectProblem(prob.id)}
              >
                <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all ${
                        isCompleted ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 
                        isSelected ? 'bg-[#a98af8] text-black shadow-lg shadow-[#a98af8]/20' : 
                        'bg-[#1b1928] text-[#5c5a75]'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>
                      <h3 className={`font-bold text-sm transition-colors ${
                        isCompleted ? 'text-emerald-400' :
                        isSelected ? 'text-[#a98af8]' : 
                        'text-slate-300 group-hover:text-white'
                      }`}>
                        {prob.title}
                      </h3>
                   </div>
                   {isPractice && (
                     <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                       isCompleted ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 
                       'border-amber-500/30 text-amber-500 bg-amber-500/5 animate-pulse'
                     }`}>
                       {isCompleted ? 'সমাধান' : 'প্র্যাকটিস'}
                     </span>
                   )}
                </div>

                <div className="pl-10 space-y-4">
                  <div className="text-xs text-slate-400 leading-relaxed bg-[#0e0c13]/50 p-3 rounded-xl border border-[#2d2a3f]/30">
                    <div className="flex items-center gap-2 mb-2 text-[#7e7b99]">
                       {isPractice ? <PenTool size={10} /> : <BookOpen size={10} />}
                       <span className="font-bold uppercase tracking-widest text-[9px]">{isPractice ? 'প্র্যাকটিস টাস্ক' : 'রেফারেন্স গাইড'}</span>
                    </div>
                    {prob.description}
                  </div>

                  {prob.solution && (
                    <div className="space-y-2">
                      <div className="relative group/code">
                        <pre className="bg-[#0e0c13] p-4 rounded-xl border border-[#2d2a3f] text-[10px] font-mono text-[#a98af8]/80 overflow-x-auto whitespace-pre leading-relaxed shadow-inner group-hover:text-[#a98af8] transition-colors">
                          {prob.solution}
                        </pre>
                        <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                           <span className="text-[8px] font-bold text-[#3b3659] uppercase bg-[#14121c] px-2 py-1 rounded border border-[#2d2a3f]">রেফারেন্স</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isCompleted && (
                    <button 
                      className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${isSelected ? 'text-[#a98af8]' : 'text-[#3b3659] group-hover:text-[#5c5a75]'}`}
                    >
                      {isSelected ? (
                        <span className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-[#a98af8] animate-ping" />
                          সমাধান করা হচ্ছে...
                        </span>
                      ) : 'প্র্যাকটিস করতে নির্বাচন করুন →'}
                    </button>
                  )}
                </div>
                
                {idx !== problems.length - 1 && (
                  <div className="mt-8 border-b border-[#2d2a3f]/30 w-full ml-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Button */}
      <div className="p-4 border-t border-[#2d2a3f] bg-[#14121c]">
        <button 
          onClick={() => navigate('/practice')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1b1928] hover:bg-[#252236] border border-[#2d2a3f] rounded-xl text-[#4ade80] text-xs font-bold transition-colors"
        >
          <PenTool size={14} />
          <span>স্যান্ডবক্স মোড খুলুন</span>
        </button>
      </div>
    </div>
  );
};
