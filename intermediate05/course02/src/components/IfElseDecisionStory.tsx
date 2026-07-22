import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase = 'card1' | 'card2' | 'card2-score' | 'card2-result-pass' | 'card2-result-fail' | 'card3' | 'card4' | 'done';

export function IfElseDecisionStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [score, setScore] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card2');
    else if (phase === 'card2') setPhase('card2-score');
    else if (phase === 'card2-result-pass' || phase === 'card2-result-fail') setPhase('card3');
    else if (phase === 'card3') setPhase('card4');
    else if (phase === 'card4') setPhase('done');
  }, [phase]);

  const handleScoreSubmit = useCallback(() => {
    if (score === null) return;
    setPhase(score >= 80 ? 'card2-result-pass' : 'card2-result-fail');
  }, [score]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'card1' && (
            <motion.div key="c1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>📝</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-8">তুমি স্কুলের পরীক্ষার খাতা হাতে পেয়েছ।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2' && (
            <motion.div key="c2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-6" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>🎯</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-6">যদি তুমি ৮০ বা তার বেশি পাও, তবে তুমি "A+" গ্রেড পাবে।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-score' && (
            <motion.div key="c2s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-4" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎯</motion.div>
                <p className="text-xl font-bold text-text dark:text-text-dark mb-6">তোমার স্কোর কত?</p>
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  {[70, 75, 80, 85, 90, 95].map((n) => (
                    <motion.button
                      key={n}
                      className={`w-16 h-16 rounded-2xl font-extrabold text-lg shadow-md transition-all ${
                        score === n
                          ? 'bg-primary text-white ring-4 ring-primary/40 scale-110'
                          : 'bg-white dark:bg-gray-800 text-text dark:text-text-dark border-2 border-gray-200 dark:border-gray-600 hover:border-primary'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScore(n)}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
                <Button onClick={handleScoreSubmit} size="lg" disabled={score === null}>
                  {score === null ? 'একটি স্কোর নির্বাচন করো' : 'ফলাফল দেখো →'}
                </Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-result-pass' && (
            <motion.div key="cr1" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card highlighted>
                <div className="bg-gradient-to-b from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/10 rounded-2xl p-8 mb-6">
                  <motion.div
                    className="text-8xl mb-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                  >
                    ✅
                  </motion.div>
                  <motion.div
                    className="text-5xl font-extrabold text-green-500 font-mono mb-2"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    {score} ≥ 80
                  </motion.div>
                  <motion.div
                    className="text-3xl font-extrabold text-green-600"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    A+ 🏆
                  </motion.div>
                </div>
                <p className="text-xl font-bold text-text dark:text-text-dark mb-4">শর্ত সত্যি! তুমি A+ পেয়েছ!</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-result-fail' && (
            <motion.div key="cr2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card>
                <div className="bg-gradient-to-b from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/10 rounded-2xl p-8 mb-6">
                  <motion.div
                    className="text-8xl mb-4"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring' }}
                  >
                    📄
                  </motion.div>
                  <motion.div
                    className="text-5xl font-extrabold text-orange-500 font-mono mb-2"
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                  >
                    {score} {'<'} 80
                  </motion.div>
                  <motion.div
                    className="text-3xl font-extrabold text-orange-600"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    সাধারণ গ্রেড 📄
                  </motion.div>
                </div>
                <p className="text-xl font-bold text-text dark:text-text-dark mb-4">শর্ত মিথ্যা। তুমি সাধারণ গ্রেড পেয়েছ।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card3' && (
            <motion.div key="c3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>📄</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-8">অন্যথায় (৮০ এর কম পেলে) তুমি সাধারণ গ্রেড পাবে।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card4' && (
            <motion.div key="c4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>⚖️</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-8">এখানে দুটি মাত্র পথ আছে—হয় শর্ত সত্যি হবে, না হয় মিথ্যা হবে।</p>
                <Button onClick={handleNext} size="lg">শেষ ✓</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-text dark:text-text-dark">দারুণ! তুমি If-Else বুঝতে পেরেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
