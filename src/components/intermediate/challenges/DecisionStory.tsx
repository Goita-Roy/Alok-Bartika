import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type Phase = 'card1' | 'card2' | 'card2-choice' | 'card2-result-umbrella' | 'card2-result-rain' | 'card3' | 'card4' | 'done';

export function DecisionStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card2');
    else if (phase === 'card2') setPhase('card2-choice');
    else if (phase === 'card2-result-umbrella' || phase === 'card2-result-rain') setPhase('card3');
    else if (phase === 'card3') setPhase('card4');
    else if (phase === 'card4') setPhase('done');
  }, [phase]);

  const handleUmbrella = useCallback(() => {
    setPhase('card2-result-umbrella');
  }, []);

  const handleNoUmbrella = useCallback(() => {
    setPhase('card2-result-rain');
  }, []);

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
                <motion.div className="text-7xl mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>🌧️</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">বাইরে বৃষ্টি হচ্ছে।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2' && (
            <motion.div key="c2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-6" animate={{ y: [0, -5, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>☂️</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">তুমি যদি ছাতা নিয়ে বাইরে যাও, তবে তুমি ভিজবে না।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-choice' && (
            <motion.div key="c2c" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-6" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>🤔</motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-8">তুমি কী করবে?</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.button
                    onClick={handleUmbrella}
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg text-lg flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ☂️ ছাতা নাও
                  </motion.button>
                  <motion.button
                    onClick={handleNoUmbrella}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg text-lg flex items-center gap-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🌧️ ছাতা নিও না
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-result-umbrella' && (
            <motion.div key="cr1" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card highlighted>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 p-8 mb-6">
                  <motion.div className="text-7xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    🧑
                  </motion.div>
                  <motion.div
                    className="absolute top-2 left-1/2 -translate-x-1/2 text-5xl"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    ☂️
                  </motion.div>
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-blue-400 text-lg"
                        initial={{ y: -20, x: Math.random() * 200 }}
                        animate={{ y: 250, opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      >
                        💧
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <p className="text-2xl font-bold text-green-500 mb-4">✅ তুমি ভিজবে না।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-result-rain' && (
            <motion.div key="cr2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card>
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-gray-300 to-gray-200 dark:from-slate-700 dark:to-slate-800 p-8 mb-6">
                  <motion.div className="text-7xl relative z-10" animate={{ y: [0, 3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                    🧑
                  </motion.div>
                  <div className="absolute inset-0 overflow-hidden">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-blue-400 text-2xl"
                        initial={{ y: -30, x: 20 + Math.random() * 160 }}
                        animate={{ y: 260, opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                      >
                        💧
                      </motion.span>
                    ))}
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-500 mb-4">❌ তুমি ভিজে যাবে।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card3' && (
            <motion.div key="c3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>🧠</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">এখানে একটি লজিক বা যুক্তি কাজ করছে।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card4' && (
            <motion.div key="c4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>⚖️</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">আমাদের জীবনের প্রায় প্রতিটি সিদ্ধান্তই এমন যুক্তির ওপর নির্ভর করে।</p>
                <Button onClick={handleNext} size="lg">শেষ ✓</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">দারুণ! তুমি Decision Story বুঝতে পেরেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}


