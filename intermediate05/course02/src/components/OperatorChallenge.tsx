import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function OperatorChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const availableBlocks = ['Num1', '*', 'Num2'];
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
      // Correct is Num1 * Num2 or Num2 * Num1
      if ((slots[0] === 'Num1' && slots[1] === '*' && slots[2] === 'Num2') ||
          (slots[0] === 'Num2' && slots[1] === '*' && slots[2] === 'Num1')) {
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
          <p className="text-xl text-muted dark:text-muted-dark">
            একটি ক্যালকুলেটরের কোড ডিজাইন করো যা দুটি ভেরিয়েবল Num1 এবং Num2 কে গুণ করবে।
          </p>
        </motion.div>

        <Card className="p-8 bg-white dark:bg-card-dark border-2 border-primary/20">
          <div className="flex justify-center gap-4 mb-12 min-h-[60px]">
            {availableBlocks.map((block, i) => !placedBlocks.includes(`${block}-${i}`) && (
              <div 
                key={`${block}-${i}`}
                draggable
                onDragStart={(e) => handleDragStart(e, `${block}-${i}`)}
                className={`cursor-grab active:cursor-grabbing px-6 py-3 rounded-lg font-mono text-xl font-bold border-2 shadow-sm ${
                  block === '*' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300'
                }`}
              >
                {block}
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 bg-gray-100 dark:bg-gray-900 p-8 rounded-xl min-h-[160px]">
            {[0, 1, 2].map(index => (
              <div 
                key={index}
                onDrop={(e) => handleDrop(e, index)}
                onDragOver={handleDragOver}
                className={`w-32 h-16 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${slots[index] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
              >
                {slots[index] && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-full h-full flex items-center justify-center rounded-lg font-mono text-lg font-bold border-2 shadow-sm ${
                    slots[index]?.split('-')[0] === '*' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300'
                  }`}>
                    {slots[index]?.split('-')[0]}
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {feedback === 'error' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 font-bold mt-6">সঠিকভাবে সাজানো হয়নি। আবার চেষ্টা করো!</motion.p>
          )}
          {feedback === 'success' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-500 font-bold mt-6">অসাধারণ! তুমি সফলভাবে গুণের কোড তৈরি করেছ!</motion.p>
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
