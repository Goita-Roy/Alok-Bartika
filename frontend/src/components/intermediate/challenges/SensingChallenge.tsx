import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export function SensingChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const availableBlocks = ['If', 'touching [Mouse-pointer]?', 'say "তুমি আমাকে ছুঁয়েছ!"'];
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');
  const [history, setHistory] = useState<{slots: (string | null)[], placed: string[]}[]>([]);

  const saveHistory = () => {
    setHistory([...history, { slots: [...slots], placed: [...placedBlocks] }]);
  };

  const handleDragStart = (e: React.DragEvent, block: string) => {
    e.dataTransfer.setData('text/plain', block);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('text/plain');
    if (!placedBlocks.includes(block)) {
      saveHistory();
      const newSlots = [...slots];
      newSlots[index] = block;
      setSlots(newSlots);
      setPlacedBlocks([...placedBlocks, block]);
      setFeedback('none');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setSlots(lastState.slots);
      setPlacedBlocks(lastState.placed);
      setHistory(history.slice(0, -1));
      setFeedback('none');
    }
  };

  const handleReset = () => {
    saveHistory();
    setSlots([null, null, null]);
    setPlacedBlocks([]);
    setFeedback('none');
  };

  const handleSubmit = () => {
    if (slots.filter(s => s !== null).length === 3) {
      if (slots[0] === 'If' && slots[1] === 'touching [Mouse-pointer]?' && slots[2] === 'say "তুমি আমাকে ছুঁয়েছ!"') {
        setFeedback('success');
      } else {
        setFeedback('error');
      }
    } else {
      setFeedback('error');
    }
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">Challenge</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            মাউসের কার্সার স্প্রাইটের উপর নিয়ে গেলে স্প্রাইটটি বলবে "তুমি আমাকে ছুঁয়েছ!"
          </p>
        </motion.div>

        <Card className="p-8 bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
          <div className="flex justify-center flex-wrap gap-4 mb-12 min-h-[60px]">
            {availableBlocks.map((block) => !placedBlocks.includes(block) && (
              <div 
                key={block}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
                className={`cursor-grab active:cursor-grabbing px-6 py-3 rounded-lg font-mono font-bold border-2 shadow-sm ${
                  block === 'If' ? 'bg-orange-400 text-white border-orange-500' : 
                  block.includes('touching') ? 'bg-blue-300 text-blue-900 border-blue-400 rounded-full' :
                  'bg-purple-500 text-white border-purple-600'
                }`}
              >
                {block}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 bg-gray-100 dark:bg-gray-900 p-8 rounded-xl max-w-md mx-auto">
            {/* If Slot */}
            <div 
              onDrop={(e) => handleDrop(e, 0)}
              onDragOver={handleDragOver}
              className={`w-full h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${slots[0] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
            >
              {slots[0] && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-400 text-white w-full h-full rounded-lg font-mono font-bold flex items-center justify-center border-2 border-orange-500">
                  {slots[0]}
                </motion.div>
              )}
            </div>
            
            {/* Condition Slot */}
            <div 
              onDrop={(e) => handleDrop(e, 1)}
              onDragOver={handleDragOver}
              className={`w-4/5 h-16 rounded-full border-2 border-dashed flex items-center justify-center ml-8 ${slots[1] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
            >
              {slots[1] && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-blue-300 text-blue-900 w-full h-full rounded-full font-mono font-bold flex items-center justify-center border-2 border-blue-400">
                  {slots[1]}
                </motion.div>
              )}
            </div>
            
            {/* Action Slot */}
            <div 
              onDrop={(e) => handleDrop(e, 2)}
              onDragOver={handleDragOver}
              className={`w-4/5 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ml-16 ${slots[2] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
            >
              {slots[2] && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-purple-500 text-white w-full h-full rounded-lg font-mono font-bold flex items-center justify-center border-2 border-purple-600">
                  {slots[2]}
                </motion.div>
              )}
            </div>
          </div>

          {feedback === 'error' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 font-bold mt-6">সঠিকভাবে সাজানো হয়নি। আবার চেষ্টা করো!</motion.p>
          )}
          {feedback === 'success' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-500 font-bold mt-6">অসাধারণ! তুমি সফলভাবে কোড তৈরি করেছ!</motion.p>
          )}

          <div className="flex justify-center gap-4 mt-12">
            <Button onClick={handleUndo} variant="outline" disabled={history.length === 0}>Undo</Button>
            <Button onClick={handleReset} variant="outline">Reset</Button>
            <Button onClick={handleSubmit} variant="primary">Submit</Button>
          </div>
        </Card>
      </div>
    </section>
  );
}



