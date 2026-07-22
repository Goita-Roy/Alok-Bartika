import React from 'react';
import { Layout, Palette, MousePointer2 } from 'lucide-react';

interface VisualPreviewProps {
  code: string;
}

export const VisualPreview: React.FC<VisualPreviewProps> = ({ code }) => {
  const isTurtleCode = code.includes('import turtle');

  return (
    <div className="h-full flex flex-col bg-[#0e0c13] p-6 text-slate-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[#a98af8]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#a98af8]">ভিজ্যুয়াল আউটপুট</span>
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-[#1b1928] rounded border border-[#2d2a3f] text-[10px] font-bold text-[#5c5a75]">640x480</div>
        </div>
      </div>

      <div className="flex-1 bg-[#14121c] rounded-xl border border-[#2d2a3f] relative overflow-hidden flex items-center justify-center group shadow-inner">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#a98af8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        {isTurtleCode ? (
          <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-[#a98af8]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#a98af8]/20 group-hover:scale-110 transition-transform">
              <Layout className="text-[#a98af8]" size={32} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">টার্টল গ্রাফিক্স সিমুলেশন</h3>
            <p className="text-xs text-[#5c5a75] max-w-[240px]">
              এনভায়রনমেন্ট গ্রাফিক্যাল আউটপুট রেন্ডার করার জন্য প্রস্তুত। সিমুলেশন লগ দেখতে কোড চালান।
            </p>
          </div>
        ) : (
          <div className="text-center z-10">
            <MousePointer2 className="text-[#2d2a3f] mx-auto mb-4" size={40} />
            <p className="text-xs text-[#3b3659] italic uppercase tracking-widest">
              GUI/গ্রাফিক্স কোডের জন্য অপেক্ষা করছে...
            </p>
          </div>
        )}
        
        {/* Corner Decor */}
        <div className="absolute top-4 right-4 flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#3b3659]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3b3659]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#3b3659]" />
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#1b1928] rounded-xl border border-[#2d2a3f]">
        <h4 className="text-[10px] font-bold text-[#5c5a75] uppercase tracking-widest mb-3 flex items-center gap-2">
          <div className="w-1 h-3 bg-[#a98af8] rounded-full" />
          সিমুলেশন বৈশিষ্ট্য
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] text-[#3b3659] uppercase font-bold">রেন্ডারার</p>
            <p className="text-xs text-slate-300 font-mono">Virtual Canvas 2D</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[#3b3659] uppercase font-bold">API সাপোর্ট</p>
            <p className="text-xs text-[#4ade80] font-mono">Full (Simulated)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
