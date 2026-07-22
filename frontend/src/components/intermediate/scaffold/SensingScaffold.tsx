import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export function SensingScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [watchStep, setWatchStep] = useState(0);

  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const availableBlocks = ['If', 'touching color [কালো]?', 'move -10 steps'];
  const [placedBlocks, setPlacedBlocks] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');

  const handleNextWatch = useCallback(() => {
    if (watchStep < 5) {
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
      
      if (newSlots.filter(s => s !== null).length === 3) {
        if (newSlots[0] === 'If' && newSlots[1] === 'touching color [কালো]?' && newSlots[2] === 'move -10 steps') {
          setFeedback('success');
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
            <Button variant={phase === 1 ? 'primary' : 'ghost'} onClick={() => { setPhase(1); setWatchStep(0); }}>Phase 1: Watch & Learn</Button>
            <Button variant={phase === 2 ? 'primary' : 'ghost'} onClick={() => setPhase(2)}>Phase 2: Try Yourself</Button>
          </div>
        </motion.div>

        {phase === 1 ? (
          <Card className="p-8 bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
            <h3 className="text-2xl font-bold mb-8 text-center text-emerald-500">Watch & Learn</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="min-h-[250px] bg-gray-100 dark:bg-gray-900 rounded-xl p-6 relative">
                {watchStep >= 1 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-2">
                    <div className="bg-orange-400 text-white px-4 py-2 rounded-t-xl font-bold text-lg inline-block">If</div>
                    <div className="bg-orange-300 w-8 h-4"></div>
                  </motion.div>
                )}
                {watchStep >= 2 && (
                  <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute left-16 top-6">
                    <div className="bg-blue-300 text-blue-900 px-3 py-1 rounded-full font-mono font-bold border-2 border-blue-400 flex items-center gap-2">
                      touching color <span className="w-4 h-4 bg-black rounded-full inline-block"></span>?
                    </div>
                  </motion.div>
                )}
                {watchStep >= 3 && (
                  <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute left-12 top-[4.5rem]">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-mono font-bold">
                      move -10 steps
                    </div>
                  </motion.div>
                )}
                {watchStep >= 1 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute left-6 top-[7rem]">
                    <div className="bg-orange-400 w-16 h-4 rounded-b-xl"></div>
                  </motion.div>
                )}
                {watchStep === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 mt-16 font-bold text-xl">Display a Maze...</p>
                )}
              </div>
              
              <div className="bg-white dark:bg-black border-4 border-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                <div className="absolute right-8 top-0 bottom-0 w-8 bg-black"></div>
                <div className="absolute left-8 top-0 bottom-0 w-8 bg-black"></div>
                
                <motion.div 
                  initial={{ x: -40 }} 
                  animate={watchStep >= 4 ? { x: [ -40, 60, 40 ] } : { x: -40 }}
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl z-10 shadow-lg"
                >
                  😎
                </motion.div>

                {watchStep >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute text-red-500 font-bold bg-white px-2 py-1 rounded shadow-sm z-20"
                    style={{ right: '40px', top: '40%' }}
                  >
                    BUMP!
                  </motion.div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button onClick={handleNextWatch} variant="primary">
                {watchStep === 0 ? 'Start' : watchStep < 4 ? 'Next Step' : 'Try Yourself'}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className={`p-8 bg-white dark:bg-gray-800 border-4 transition-colors duration-300 ${feedback === 'success' ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : feedback === 'error' ? 'border-red-500' : 'border-emerald-500/20'}`}>
            <h3 className="text-2xl font-bold mb-4 text-center text-emerald-500">Try Yourself</h3>
            <p className="text-center mb-8 text-gray-500 dark:text-gray-400">নিচের ব্লকগুলো টেনে এনে সঠিক জায়গায় বসাও।</p>
            
            <div className="flex justify-center flex-wrap gap-4 mb-12 min-h-[60px]">
              {availableBlocks.map((block) => !placedBlocks.includes(block) && (
                <div 
                  key={block}
                  draggable
                  onDragStart={(e) => handleDragStart(e, block)}
                  className={`cursor-grab active:cursor-grabbing px-6 py-3 rounded-lg font-mono font-bold border-2 shadow-sm ${
                    block === 'If' ? 'bg-orange-400 text-white border-orange-500' : 
                    block.includes('touching') ? 'bg-blue-300 text-blue-900 border-blue-400 rounded-full' :
                    'bg-blue-500 text-white border-blue-600'
                  }`}
                >
                  {block}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 bg-gray-100 dark:bg-gray-900 p-8 rounded-xl max-w-md mx-auto">
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
              
              <div 
                onDrop={(e) => handleDrop(e, 2)}
                onDragOver={handleDragOver}
                className={`w-4/5 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ml-16 ${slots[2] ? 'border-transparent bg-transparent' : 'border-gray-400 bg-gray-50 dark:bg-gray-800'}`}
              >
                {slots[2] && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-blue-500 text-white w-full h-full rounded-lg font-mono font-bold flex items-center justify-center border-2 border-blue-600">
                    {slots[2]}
                  </motion.div>
                )}
              </div>
            </div>

            {feedback === 'error' && (
              <p className="text-center text-red-500 font-bold mt-6">আবার চেষ্টা করো!</p>
            )}
            {feedback === 'success' && (
              <p className="text-center text-green-500 font-bold mt-6">দারুণ! তুমি সঠিক লজিক তৈরি করেছ!</p>
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={resetActivity} variant="ghost">Reset</Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
