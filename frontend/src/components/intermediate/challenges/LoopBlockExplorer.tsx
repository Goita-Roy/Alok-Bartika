import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

type Block = 'repeat10' | 'forever' | null;

export function LoopBlockExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedBlock, setSelectedBlock] = useState<Block>(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [foreverRunning, setForeverRunning] = useState(false);
  const [foreverCount, setForeverCount] = useState(0);
  const foreverRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (foreverRef.current) clearInterval(foreverRef.current);
    };
  }, []);

  const handleSelect = useCallback((block: Block) => {
    setSelectedBlock(block);
    setRepeatCount(0);
    setForeverRunning(false);
    setForeverCount(0);
    if (foreverRef.current) {
      clearInterval(foreverRef.current);
      foreverRef.current = null;
    }
  }, []);

  const handleRunRepeat = useCallback(() => {
    setRepeatCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setRepeatCount(i);
      if (i >= 10) {
        clearInterval(timer);
      }
    }, 400);
  }, []);

  const handleRunForever = useCallback(() => {
    if (foreverRunning) return;
    setForeverRunning(true);
    setForeverCount(0);
    let i = 0;
    foreverRef.current = setInterval(() => {
      i++;
      setForeverCount(i);
    }, 500);
  }, [foreverRunning]);

  const handleStopForever = useCallback(() => {
    setForeverRunning(false);
    if (foreverRef.current) {
      clearInterval(foreverRef.current);
      foreverRef.current = null;
    }
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
        </motion.h2>

        <Card>
          {/* Block selection */}
          {!selectedBlock && (
            <motion.div key="blocks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">লুপ ব্লক এক্সপ্লোরার</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">একটি ব্লকে ক্লিক করে দেখো কীভাবে কাজ করে:</p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <motion.button
                  onClick={() => handleSelect('repeat10')}
                  className="px-8 py-6 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg text-xl flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">🔁</span> Repeat 10
                </motion.button>
                <motion.button
                  onClick={() => handleSelect('forever')}
                  className="px-8 py-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg text-xl flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">♾️</span> Forever
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Repeat 10 workspace */}
          {selectedBlock === 'repeat10' && (
            <motion.div key="r10" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">🔁 Repeat 10 — ব্লকটি ১০ বার executes করে</h3>

                {/* C-shaped block */}
                <div className="flex justify-center">
                  <div className="relative border-4 border-orange-400 rounded-2xl p-8 pt-12 bg-orange-50 dark:bg-orange-900/20 min-w-[200px]">
                    <div className="absolute top-2 left-4 text-orange-600 font-bold">Repeat 10</div>

                    {/* Inner block - Jump */}
                    <motion.div
                      className="bg-blue-400 text-white font-bold py-3 px-6 rounded-lg shadow-md"
                      animate={repeatCount > 0 ? {
                        scale: [1, 1.1, 1],
                        y: [0, -10, 0],
                      } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      🐱 Jump
                    </motion.div>

                    {/* Counter */}
                    <div className="absolute bottom-2 right-4 text-orange-600 text-sm font-bold">
                      {repeatCount > 0 ? `${repeatCount}/10` : 'Ready'}
                    </div>
                  </div>
                </div>

                {/* Step indicator */}
                {repeatCount > 0 && (
                  <div className="flex justify-center gap-1 mt-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-4 h-4 rounded-full ${i < repeatCount ? 'bg-orange-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={handleRunRepeat} variant="primary" size="lg" disabled={repeatCount > 0 && repeatCount < 10}>
                  ▶ চালাও
                </Button>
                <Button onClick={() => handleSelect(null)} variant="ghost">পেছনে</Button>
              </div>
            </motion.div>
          )}

          {/* Forever workspace */}
          {selectedBlock === 'forever' && (
            <motion.div key="fv" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">♾️ Forever — ব্লকটি অনবরত চলতেই থাকে</h3>

                {/* C-shaped block */}
                <div className="flex justify-center">
                  <div className="relative border-4 border-purple-400 rounded-2xl p-8 pt-12 bg-purple-50 dark:bg-purple-900/20 min-w-[200px]">
                    <div className="absolute top-2 left-4 text-purple-600 font-bold">Forever</div>

                    {/* Inner block */}
                    <motion.div
                      className="bg-blue-400 text-white font-bold py-3 px-6 rounded-lg shadow-md"
                      animate={foreverRunning ? { x: [0, 20, 0], rotate: [0, 3, -3, 0] } : {}}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      🐱 Move
                    </motion.div>

                    {/* Counter */}
                    <div className="absolute bottom-2 right-4 text-purple-600 text-sm font-bold">
                      {foreverCount > 0 ? `${foreverCount}x` : 'Ready'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                {!foreverRunning ? (
                  <Button onClick={handleRunForever} variant="primary" size="lg">▶ চালাও</Button>
                ) : (
                  <Button onClick={handleStopForever} variant="danger" size="lg">⏹ Stop</Button>
                )}
                {!foreverRunning && (
                  <Button onClick={() => handleSelect(null)} variant="ghost">পেছনে</Button>
                )}
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </section>
  );
}


