import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const AVAILABLE = ['When S Key Pressed', 'switch backdrop to Forest', 'play sound Bird until done'];
const CORRECT = ['When S Key Pressed', 'switch backdrop to Forest', 'play sound Bird until done'];

const BLOCK_STYLE: Record<string, string> = {
  'When S Key Pressed': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300',
  'switch backdrop to Forest': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300',
  'play sound Bird until done': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
};

export function BackgroundSoundChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');
  const [history, setHistory] = useState<{ slots: (string | null)[]; placed: string[] }[]>([]);

  const saveHistory = () => setHistory(h => [...h, { slots: [...slots], placed: [...placed] }]);

  const handleDragStart = (e: React.DragEvent, block: string) => {
    e.dataTransfer.setData('text/plain', block);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('text/plain');
    if (placed.includes(block) || slots[idx] !== null) return;
    saveHistory();
    const ns = [...slots]; ns[idx] = block;
    setSlots(ns);
    setPlaced(p => [...p, block]);
    setFeedback('none');
  };

  const handleUndo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setSlots(last.slots);
    setPlaced(last.placed);
    setHistory(h => h.slice(0, -1));
    setFeedback('none');
  };
  const handleReset = () => {
    saveHistory();
    setSlots([null, null, null]);
    setPlaced([]);
    setFeedback('none');
  };
  const handleSubmit = () => {
    if (slots.filter(Boolean).length < 3) { setFeedback('error'); return; }
    setFeedback(slots.every((s, i) => s === CORRECT[i]) ? 'success' : 'error');
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">Challenge</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            কীবোর্ডের 'S' বাটন চাপলে বনের পাখির ডাক শোনা যাবে এবং ব্যাকগ্রাউন্ডে একটি জঙ্গল দেখা যাবে।
          </p>
        </motion.div>

        <Card className="p-8 bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
          {/* Available blocks */}
          <div className="flex justify-center flex-wrap gap-3 mb-12 min-h-[56px]">
            {AVAILABLE.map(block => !placed.includes(block) && (
              <div
                key={block}
                draggable
                onDragStart={e => handleDragStart(e, block)}
                className={`cursor-grab active:cursor-grabbing px-5 py-3 rounded-xl border-2 font-mono font-bold select-none hover:scale-105 transition-transform text-sm ${BLOCK_STYLE[block]}`}
              >
                {block}
              </div>
            ))}
          </div>

          {/* Workspace */}
          <div className="max-w-md mx-auto bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 mb-8">
            {/* Hat block slot (event) */}
            <div
              onDrop={e => handleDrop(e, 0)}
              onDragOver={handleDragOver}
              className={`h-14 rounded-t-2xl rounded-b-none border-2 border-dashed flex items-center justify-center transition-colors mb-0 ${slots[0] ? 'border-transparent' : 'border-gray-400 dark:border-gray-600 bg-white/60 dark:bg-gray-800 hover:border-emerald-500'}`}
            >
              {slots[0] ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-full h-full flex items-center justify-center px-4 rounded-t-2xl rounded-b-none border-2 font-mono font-bold text-sm ${BLOCK_STYLE[slots[0]!]}`}>
                  {slots[0]}
                </motion.div>
              ) : <span className="text-gray-400 text-sm">When [key] pressed — drop here</span>}
            </div>
            {/* Body slots */}
            <div className="flex flex-col gap-1 bg-yellow-300/30 dark:bg-yellow-900/20 rounded-b-2xl px-3 pb-3 pt-1 border-l-2 border-r-2 border-b-2 border-dashed border-yellow-400 dark:border-yellow-700">
              {[1, 2].map(idx => (
                <div
                  key={idx}
                  onDrop={e => handleDrop(e, idx)}
                  onDragOver={handleDragOver}
                  className={`h-12 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${slots[idx] ? 'border-transparent' : 'border-gray-400 dark:border-gray-600 bg-white/40 hover:border-emerald-500'}`}
                >
                  {slots[idx] ? (
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-full h-full flex items-center justify-center px-4 rounded-lg border-2 font-mono font-bold text-sm ${BLOCK_STYLE[slots[idx]!]}`}>
                      {slots[idx]}
                    </motion.div>
                  ) : <span className="text-gray-400 text-xs">drop block {idx}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {feedback === 'error' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 font-bold mb-4">
              সঠিকভাবে সাজানো হয়নি। আবার চেষ্টা করো!
            </motion.p>
          )}
          {feedback === 'success' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-500 font-bold mb-4">
              অসাধারণ! কীবোর্ড ইভেন্টের সাথে Backdrop ও Sound যুক্ত করা হয়েছে! 🎉
            </motion.p>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={handleUndo} variant="ghost" disabled={!history.length}>Undo</Button>
            <Button onClick={handleReset} variant="ghost">Reset</Button>
            <Button onClick={handleSubmit} variant="primary">Submit</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}



