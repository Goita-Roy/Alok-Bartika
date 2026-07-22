import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

type Phase = 'p1-sprite' | 'p1-blocks' | 'p1-loop' | 'p1-insert' | 'p1-anim' | 'p2' | 'p2-workspace' | 'done';

export function LoopsScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('p1-sprite');
  const [jumpCount, setJumpCount] = useState(0);
  const [placedRepeat, setPlacedRepeat] = useState(false);
  const [placedJump, setPlacedJump] = useState(false);
  const [submitResult, setSubmitResult] = useState<'correct' | 'wrong' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleNext = useCallback(() => {
    const flow: Phase[] = ['p1-sprite', 'p1-blocks', 'p1-loop', 'p1-insert', 'p1-anim', 'p2'];
    const idx = flow.indexOf(phase);
    if (idx < flow.length - 1) {
      setPhase(flow[idx + 1]);
    }
  }, [phase]);

  const handleRunAnim = useCallback(() => {
    setJumpCount(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setJumpCount(i);
      if (i >= 10) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 400);
  }, []);

  const handleDragRepeat = useCallback(() => {
    setPlacedRepeat(true);
  }, []);

  const handleDragJump = useCallback(() => {
    setPlacedJump(true);
  }, []);

  const handleSubmit = useCallback(() => {
    if (placedRepeat && placedJump) {
      setSubmitResult('correct');
      setTimeout(() => setPhase('done'), 1500);
    } else {
      setSubmitResult('wrong');
      setTimeout(() => setSubmitResult(null), 1500);
    }
  }, [placedRepeat, placedJump]);

  const handleReset = useCallback(() => {
    setPlacedRepeat(false);
    setPlacedJump(false);
    setSubmitResult(null);
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'p1-sprite' && (
            <motion.div key="p1s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-4">
                  <motion.div className="text-7xl" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>🐱</motion.div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Scratch Sprite</p>
                </div>
                <Button onClick={handleNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'p1-blocks' && (
            <motion.div key="p1b" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="flex flex-col items-center gap-2 mb-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="px-6 py-2 bg-blue-400 text-white font-bold rounded-lg shadow-md text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      🐱 Jump #{i + 1}
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">১০টি আলাদা Jump ব্লক — অনেক জায়গা নেয়!</p>
                <Button onClick={handleNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'p1-loop' && (
            <motion.div key="p1l" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="flex justify-center mb-4">
                  <motion.div
                    className="relative border-4 border-orange-400 rounded-2xl p-8 pt-12 bg-orange-50 dark:bg-orange-900/20 min-w-[180px]"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <div className="absolute top-2 left-4 text-orange-600 font-bold text-sm">Repeat 10</div>
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                      🐱 Jump
                    </div>
                  </motion.div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">একটি মাত্র Repeat 10 ব্লক — সব জায়গা বাঁচল!</p>
                <Button onClick={handleNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'p1-insert' && (
            <motion.div key="p1i" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="flex justify-center mb-4">
                  <div className="relative border-4 border-orange-400 rounded-2xl p-8 pt-12 bg-orange-50 dark:bg-orange-900/20 min-w-[180px]">
                    <div className="absolute top-2 left-4 text-orange-600 font-bold text-sm">Repeat 10</div>
                    <motion.div
                      className="bg-blue-400 text-white font-bold py-2 px-4 rounded-lg shadow-md text-sm"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', delay: 0.5 }}
                    >
                      🐱 Jump
                    </motion.div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Jump ব্লকটি লুপের ভিতরে বসানো হলো</p>
                <Button onClick={handleNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'p1-anim' && (
            <motion.div key="p1a" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-4 relative overflow-hidden">
                  <motion.div
                    className="text-7xl"
                    animate={jumpCount > 0 ? { y: [0, -30, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    🐱
                  </motion.div>
                  {jumpCount === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">চালাতে ক্লিক করো</p>
                  )}
                  {jumpCount > 0 && (
                    <motion.p className="text-sm text-emerald-500 font-bold mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      Jump #{jumpCount}
                    </motion.p>
                  )}
                </div>

                {jumpCount === 0 && (
                  <Button onClick={handleRunAnim} variant="primary" size="lg">▶ চালাও</Button>
                )}
                {jumpCount > 0 && jumpCount < 10 && (
                  <p className="text-emerald-500 font-bold">লাফাচ্ছে... {jumpCount}/10</p>
                )}
                {jumpCount >= 10 && (
                  <Button onClick={handleNext} variant="primary" size="lg">নিজে করো →</Button>
                )}
              </Card>
            </motion.div>
          )}

          {phase === 'p2' && (
            <motion.div key="p2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">তুমি নিজে করো (Try Yourself)</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">খালি জায়গায় ব্লকগুলো বসাও</p>
                <Button onClick={() => setPhase('p2-workspace')} size="lg">শুরু করি →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'p2-workspace' && (
            <motion.div key="p2w" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">ব্লকগুলো বসাও</h3>

                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6 min-h-[200px]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">Workspace</div>

                  <div className="flex flex-col items-center mb-2">
                    {!placedRepeat ? (
                      <motion.button
                        onClick={handleDragRepeat}
                        className="px-8 py-4 bg-orange-400 text-white font-bold rounded-2xl shadow-lg text-lg border-2 border-dashed border-orange-600"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📥 বসাও → Repeat 10
                      </motion.button>
                    ) : (
                      <motion.div
                        className="relative border-4 border-orange-400 rounded-2xl p-6 pt-10 bg-orange-50 dark:bg-orange-900/20 min-w-[160px]"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        <div className="absolute top-1 left-3 text-orange-600 font-bold text-sm">Repeat 10</div>

                        {!placedJump ? (
                          <motion.button
                            onClick={handleDragJump}
                            className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md text-sm border-2 border-dashed border-blue-600"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            📥 বসাও → Jump
                          </motion.button>
                        ) : (
                          <motion.div
                            className="bg-blue-400 text-white font-bold py-2 px-4 rounded-lg shadow-md text-sm"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          >
                            🐱 Jump
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="ghost" onClick={handleReset}>⟲ Reset</Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    size="lg"
                    disabled={!placedRepeat || !placedJump}
                  >
                    জমা দাও
                  </Button>
                </div>

                <AnimatePresence>
                  {submitResult === 'wrong' && (
                    <motion.p className="text-center text-red-500 font-bold mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      ❌ পুরোপুরি হয়নি। আবার চেষ্টা করো।
                    </motion.p>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">দারুণ! তুমি লুপ শিখেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
