import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type Phase = 'card1' | 'card2' | 'card2-anim' | 'card3' | 'card3-fast' | 'card4' | 'repeat' | 'done';

export function RepeatActionStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [visibleNumbers, setVisibleNumbers] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [repeatAnimating, setRepeatAnimating] = useState(false);

  const startCounting = useCallback((fast: boolean) => {
    setVisibleNumbers([]);
    const delay = fast ? 30 : 80;
    let i = 1;
    timerRef.current = setInterval(() => {
      if (i <= 100) {
        setVisibleNumbers((prev) => [...prev, i]);
        i++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        if (fast) {
          setPhase('card4');
        } else {
          setPhase('card3');
        }
      }
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card2');
    else if (phase === 'card2') {
      setPhase('card2-anim');
      startCounting(false);
    } else if (phase === 'card3') {
      setPhase('card3-fast');
      startCounting(true);
    } else if (phase === 'card4') setPhase('repeat');
    else if (phase === 'repeat') setPhase('done');
  }, [phase, startCounting]);

  const handleRepeat = useCallback(() => {
    if (repeatAnimating) return;
    setRepeatAnimating(true);
    setVisibleNumbers([]);
    let i = 1;
    const delay = 20;
    timerRef.current = setInterval(() => {
      if (i <= 100) {
        setVisibleNumbers((prev) => [...prev, i]);
        i++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setRepeatAnimating(false);
      }
    }, delay);
  }, [repeatAnimating]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'card1' && (
            <motion.div key="c1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>📝</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">তোমাকে যদি কাগজের পাতায় ১ থেকে ১০০ পর্যন্ত সংখ্যাগুলো লিখতে বলা হয়।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2' && (
            <motion.div key="c2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-6" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>✍️</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">তুমি একই কলম দিয়ে বারবার ১, ২, ৩ এভাবে একই পদ্ধতিতে লিখে যাবে।</p>
                <Button onClick={handleNext} size="lg">দেখাও →</Button>
              </Card>
            </motion.div>
          )}

          {(phase === 'card2-anim' || phase === 'card3' || phase === 'card3-fast') && (
            <motion.div key="c2a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">লেখা হচ্ছে...</h3>
                <div className="bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 min-h-[200px] max-h-[300px] overflow-y-auto border-2 border-amber-200 dark:border-amber-700">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {visibleNumbers.map((n) => (
                      <motion.span
                        key={n}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm text-sm font-bold text-gray-800 dark:text-gray-100"
                      >
                        {n}
                      </motion.span>
                    ))}
                  </div>
                </div>
                {phase === 'card3' && (
                  <div className="text-center mt-6">
                    <Button onClick={handleNext} size="lg">Next →</Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {phase === 'card4' && (
            <motion.div key="c4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>🔄</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">এই যে একই কাজ বারবার করা, একেই বলে লুপ।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'repeat' && (
            <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">আবার দেখো — Repeat 🔁</h3>
                <div className="bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 min-h-[200px] max-h-[300px] overflow-y-auto border-2 border-amber-200 dark:border-amber-700 mb-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {visibleNumbers.map((n) => (
                      <motion.span
                        key={n}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm text-sm font-bold text-gray-800 dark:text-gray-100"
                      >
                        {n}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <Button onClick={handleRepeat} variant="primary" size="lg" disabled={repeatAnimating}>
                    🔁 Repeat
                  </Button>
                  {!repeatAnimating && visibleNumbers.length > 0 && (
                    <div className="mt-4">
                      <Button onClick={handleNext} variant="ghost">শেষ ✓</Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">দারুণ! তুমি লুপ বুঝতে পেরেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}


