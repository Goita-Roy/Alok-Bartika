import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase = 'card1' | 'card1-score' | 'card2' | 'card2-anim' | 'card3' | 'card4' | 'done';

export function ScoreboardStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [score, setScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const animateScore = useCallback(() => {
    setScore(0);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setScore(i);
      if (i >= 3) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 600);
  }, []);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card1-score');
    else if (phase === 'card1-score') setPhase('card2');
    else if (phase === 'card2') {
      setPhase('card2-anim');
      animateScore();
    } else if (phase === 'card2-anim' && !timerRef.current) setPhase('card3');
    else if (phase === 'card3') setPhase('card4');
    else if (phase === 'card4') setPhase('done');
  }, [phase, animateScore]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'card1' && (
            <motion.div key="c1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>🏏</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-8">ক্রিকেট খেলা দেখার সময় স্ক্রিনের এক কোণায় আমরা স্কোর দেখতে পাই।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card1-score' && (
            <motion.div key="c1s" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">Scoreboard</h3>
                <div className="flex justify-center mb-6">
                  <motion.div
                    className="w-48 h-32 bg-gray-900 rounded-2xl shadow-2xl border-4 border-gray-600 flex flex-col items-center justify-center"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  >
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Score</div>
                    <motion.div
                      className="text-5xl font-extrabold text-green-400 font-mono"
                      key={score}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      {score}
                    </motion.div>
                  </motion.div>
                </div>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2' && (
            <motion.div key="c2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-6" animate={{ rotate: [0, -3, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>📊</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-6">প্রতি বলে রান নেওয়ার সাথে সাথে সেই স্কোরবোর্ডের সংখ্যাটি বদলে যায়।</p>
                <Button onClick={handleNext} size="lg">দেখাও →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card2-anim' && (
            <motion.div key="c2a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">স্কোর বদলাচ্ছে...</h3>
                <div className="flex justify-center mb-6">
                  <motion.div className="w-48 h-36 bg-gray-900 rounded-2xl shadow-2xl border-4 border-gray-600 flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Score</div>
                    <motion.div
                      className="text-6xl font-extrabold text-green-400 font-mono"
                      key={score}
                      initial={{ scale: 1.5, opacity: 0, y: -10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ type: 'spring' }}
                    >
                      {score}
                    </motion.div>
                  </motion.div>
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {[0, 1, 2, 3].map((n) => (
                    <motion.div
                      key={n}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        n <= score ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: n * 0.15 }}
                    >
                      {n}
                    </motion.div>
                  ))}
                </div>
                {!timerRef.current && score >= 3 && (
                  <div className="text-center">
                    <Button onClick={handleNext} size="lg">Next →</Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {phase === 'card3' && (
            <motion.div key="c3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>📦</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-8">এই যে রান বা কয়েন রাখার জন্য একটি জায়গা, যা বারবার বদলাতে পারে, একেই বলে ভেরিয়েবল।</p>
                <Button onClick={handleNext} size="lg">Next →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'card4' && (
            <motion.div key="c4" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">Variable = Label দেওয়া বাক্স</h3>
                <div className="flex justify-center mb-6">
                  <motion.div className="relative w-48 h-36 bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-400 rounded-2xl shadow-lg flex flex-col items-center justify-center">
                    <div className="absolute -top-4 px-4 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">Score</div>
                    <motion.div
                      className="text-5xl font-extrabold text-orange-600"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🏷️
                    </motion.div>
                  </motion.div>
                </div>
                <p className="text-lg text-muted dark:text-muted-dark mb-6">লেবেলটি (Score) একই থাকে, ভিতরের মান বদলায়</p>
                <Button onClick={handleNext} size="lg">শেষ ✓</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-text dark:text-text-dark">দারুণ! তুমি ভেরিয়েবল বুঝতে পেরেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
