import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface Situation {
  id: number;
  light: 'red' | 'green';
  correctAction: 'stop' | 'go';
}

const situations: Situation[] = [
  { id: 1, light: 'red', correctAction: 'stop' },
  { id: 2, light: 'green', correctAction: 'go' },
  { id: 3, light: 'red', correctAction: 'stop' },
  { id: 4, light: 'green', correctAction: 'go' },
];

export function LogicArchitectGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'success' | 'failure'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [roundAttempts, setRoundAttempts] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const situation = situations[currentIndex];

  const startGame = useCallback(() => {
    setGameStarted(true);
    setStatus('playing');
    setCurrentIndex(0);
    setXp(0);
    setAttempts(0);
    setCompletedCount(0);
  }, []);

  const handleAction = useCallback(
    (action: 'stop' | 'go') => {
      if (status !== 'playing') return;

      const newRoundAttempts = roundAttempts + 1;
      setRoundAttempts(newRoundAttempts);

      if (action === situation.correctAction) {
        const earnedXp = newRoundAttempts === 1 ? 200 : newRoundAttempts === 2 ? 150 : 100;
        setXp((prev) => prev + earnedXp);
        setCompletedCount((prev) => prev + 1);
        setAttempts((prev) => prev + 1);

        if (currentIndex < situations.length - 1) {
          setStatus('success');
          setTimeout(() => {
            setCurrentIndex((prev) => prev + 1);
            setStatus('playing');
            setRoundAttempts(0);
          }, 1500);
        } else {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
          setStatus('success');
        }
      } else {
        setStatus('failure');
      }
    },
    [situation, status, roundAttempts, currentIndex]
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setStatus('playing');
    setRoundAttempts(0);
    setXp(0);
    setCompletedCount(0);
    setAttempts(0);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameStarted(false);
    setStatus('idle');
    setCurrentIndex(0);
    setXp(0);
    setCompletedCount(0);
    setAttempts(0);
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 relative">
      <Confetti active={showConfetti} />
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">গ্যামিফিকেশন</span>
        </motion.h2>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🎮 Logic Architect</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Level 4 : Logic Architect</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-emerald-500">✨ {xp} XP</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Round {completedCount}/{situations.length}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / situations.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'idle' && !gameStarted && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="text-6xl mb-4">🚦</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Logic Architect</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">ট্রাফিক সিগন্যালের সঠিক লজিক তৈরি করো!</p>
                <Button onClick={startGame} size="lg" variant="primary">শুরু করো</Button>
              </motion.div>
            )}

            {status === 'playing' && situation && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Traffic light */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-4 flex flex-col items-center gap-3 w-24 shadow-xl">
                    <motion.div
                      className={`w-14 h-14 rounded-full shadow-lg ${situation.light === 'red' ? 'bg-red-500' : 'bg-gray-600'}`}
                      animate={situation.light === 'red' ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className={`w-14 h-14 rounded-full shadow-lg ${situation.light === 'green' ? 'bg-green-500' : 'bg-gray-600'}`}
                      animate={situation.light === 'green' ? { opacity: [1, 0.3, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </div>

                <p className="text-center text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">
                  বাতি {situation.light === 'red' ? '🔴 লাল' : '🟢 সবুজ'} — কী করবে?
                </p>

                {/* Action buttons */}
                <div className="flex justify-center gap-6 mb-4">
                  <motion.button
                    onClick={() => handleAction('stop')}
                    className="px-10 py-5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg text-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚗 গাড়ি থামাও
                  </motion.button>
                  <motion.button
                    onClick={() => handleAction('go')}
                    className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg text-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚗 গাড়ি চালাও
                  </motion.button>
                </div>
              </motion.div>
            )}

            {status === 'success' && currentIndex < situations.length - 1 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                <motion.div className="text-5xl mb-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>✅</motion.div>
                <p className="text-xl font-bold text-green-500">সঠিক লজিক!</p>
              </motion.div>
            )}

            {status === 'failure' && (
              <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
                <motion.div className="text-5xl mb-2" animate={{ rotate: [0, -5, 5, -5, 0] }}>💥</motion.div>
                <p className="text-2xl font-bold text-red-500 mb-2">❌ Game Over</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {situation.light === 'red' ? 'লাল বাতিতে গাড়ি চালানো বিপজ্জনক!' : 'সবুজ বাতিতে গাড়ি থামানো ঠিক নয়!'}
                </p>
                <Button onClick={handleRestart} variant="danger" size="lg">Restart</Button>
              </motion.div>
            )}

            {status === 'success' && currentIndex >= situations.length - 1 && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🏆</motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">সব লজিক সঠিক!</h4>
                <p className="text-lg text-gray-800 dark:text-gray-100 mb-4">মোট {xp} XP অর্জিত!</p>
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-2 border-yellow-400 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-100">🏆 Logic Architect Badge আনলক হয়েছে!</p>
                </div>
                <div className="flex justify-center gap-4">
                  <Button onClick={handlePlayAgain} variant="ghost">আবার খেলো</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}
