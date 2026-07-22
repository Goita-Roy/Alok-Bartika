import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function OperatorsScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [watchStep, setWatchStep] = useState(0);

  // Drag and drop state for Phase 2
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const availableBlocks = ['Age > 11', 'and', 'Age < 16'];
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');

  const handleNextWatch = useCallback(() => {
    if (watchStep < 4) {
      setWatchStep(prev => prev + 1);
    } else {
      setPhase(2);
    }
  }, [watchStep]);

  const handleDragStart = (e: React.DragEvent, block: string) => {
    e.dataTransfer.setData('text/plain', block);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('text/plain');
    if (!placedBlocks.includes(block)) {
      const newSlots = [...slots];
      newSlots[index] = block;
      setSlots(newSlots);
      setPlacedBlocks([...placedBlocks, block]);
      
      // Check if full
      if (newSlots.filter(s => s !== null).length === 3) {
        if (newSlots[0] === 'Age > 11' && newSlots[1] === 'and' && newSlots[2] === 'Age < 16') {
          setFeedback('success');
        } else if (newSlots[0] === 'Age < 16' && newSlots[1] === 'and' && newSlots[2] === 'Age > 11') {
          setFeedback('success'); // Also valid conceptually, but let's allow it
        } else {
          setFeedback('error');
        }
      } else {
        setFeedback('none');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetActivity = () => {
    setSlots([null, null, null]);
    setPlacedBlocks([]);
    setFeedback('none');
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
          </h2>
          <div className="flex justify-center gap-4 mt-8">
            <Button variant={phase === 1 ? 'primary' : 'outline'} onClick={() => setPhase(1)}>Phase 1: Watch & Learn</Button>
            <Button variant={phase === 2 ? 'primary' : 'outline'} onClick={() => setPhase(2)}>Phase 2: Try Yourself</Button>
          </div>
        </motion.div>

        {phase === 1 ? (
          <Card className="p-8 bg-white dark:bg-card-dark border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-8 text-center text-primary">Watch & Learn</h3>
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-xl p-8 overflow-hidden relative">
              {watchStep >= 1 && watchStep < 4 && (
                <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: watchStep === 3 ? -100 : 0, opacity: 1 }} className="absolute bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 px-6 py-3 rounded-lg font-mono text-xl border-2 border-green-400">
                  Age &gt; 11
                </motion.div>
              )}
              {watchStep >= 2 && watchStep < 4 && (
                <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: watchStep === 3 ? 100 : 0, opacity: 1, y: watchStep === 3 ? 0 : 60 }} className="absolute bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100 px-6 py-3 rounded-lg font-mono text-xl border-2 border-green-400">
                  Age &lt; 16
                </motion.div>
              )}
              {watchStep >= 3 && watchStep < 4 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 px-4 py-3 rounded-lg font-mono text-xl border-2 border-purple-400 z-10">
                  and
                </motion.div>
              )}
              {watchStep >= 4 && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center bg-purple-200 dark:bg-purple-800 p-2 rounded-xl border-2 border-purple-400">
                  <div className="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 px-4 py-2 rounded-lg font-mono mr-2">Age &gt; 11</div>
                  <div className="text-purple-900 dark:text-purple-100 font-bold mx-2">and</div>
                  <div className="bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-100 px-4 py-2 rounded-lg font-mono ml-2">Age &lt; 16</div>
                </motion.div>
              )}
            </div>
            <div className="mt-8 flex justify-center">
              <Button onClick={handleNextWatch} variant="primary">
                {watchStep === 0 ? 'Start' : watchStep < 4 ? 'Next Step' : 'Try Yourself'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`p-8 bg-white dark:bg-card-dark border-4 transition-colors duration-300 ${feedback === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : feedback === 'error' ? 'border-red-500' : 'border-primary/20'}`}>
            <h3 className="text-2xl font-bold mb-4 text-center text-primary">Try Yourself</h3>
            <p className="text-center mb-8 text-muted dark:text-muted-dark">নিচের ব্লকগুলো টেনে এনে সঠিক জায়গায় বসাও।</p>
            
            <div className="flex justify-center gap-4 mb-12 min-h-[60px]">
              {availableBlocks.map(block => !placedBlocks.includes(block) && (
                <div 
                  key={block}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                  className={`cursor-grab active:cursor-grabbing px-6 py-3 rounded-lg font-mono text-xl font-bold border-2 shadow-sm ${
                    block === 'and' ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300'
                  }`}
                >
                  {block}
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 bg-gray-100 dark:bg-gray-900 p-8 rounded-xl">
              {[0, 1, 2].map(index => (
                <div 
                  key={index}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                  className={`w-32 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${slots[index] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
                >
                  {slots[index] && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-full h-full flex items-center justify-center rounded-lg font-mono text-sm sm:text-base font-bold border-2 shadow-sm ${
                      slots[index] === 'and' ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {slots[index]}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {feedback === 'error' && (
              <p className="text-center text-red-500 font-bold mt-6">আবার চেষ্টা করো!</p>
            )}
            {feedback === 'success' && (
              <p className="text-center text-green-500 font-bold mt-6">দারুণ! তুমি পেরেছ!</p>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={resetActivity} variant="outline">Reset</Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
