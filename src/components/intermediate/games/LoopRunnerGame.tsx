import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type LoopChoice = 'repeat10' | 'forever' | null;

export function LoopRunnerGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [gameStarted, setGameStarted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'playing' | 'success' | 'failure'>('idle');
  const [xp, setXp] = useState(1000);
  const [showConfetti, setShowConfetti] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [spriteX, setSpriteX] = useState(0);
  const [walking, setWalking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedLoop, setSelectedLoop] = useState<LoopChoice>(null);
  const [penalty, setPenalty] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setStatus('playing');
    setXp(1000);
    setAttempts(0);
    setSpriteX(0);
    setWalking(false);
    setSelectedLoop(null);
    setPenalty(0);
  }, []);

  const animateWalk = useCallback((targetX: number, steps: number) => {
    setSpriteX(0);
    setWalking(true);
    let i = 0;
    const stepSize = targetX / steps;
    timerRef.current = setInterval(() => {
      i++;
      setSpriteX((prev) => Math.min(prev + stepSize, targetX));
      if (i >= steps) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setWalking(false);
      }
    }, 300);
  }, []);

  const handleSelectLoop = useCallback(
    (loop: LoopChoice) => {
      if (status !== 'playing' || walking) return;
      setSelectedLoop(loop);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (loop === 'forever') {
        // Correct: Forever allows continuous movement
        setStatus('success');
        setShowConfetti(true);
        const earnedXp = newAttempts === 1 ? 250 : newAttempts === 2 ? 200 : 150;
        setXp((prev) => prev + earnedXp - penalty);
        setTimeout(() => setShowConfetti(false), 4000);
        animateWalk(200, 20);
      } else {
        // Wrong: Repeat 10 stops mid-way
        setStatus('failure');
        setPenalty(50);
        animateWalk(80, 5);
        setTimeout(() => {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setWalking(false);
        }, 2000);
      }
    },
    [status, walking, attempts, penalty, animateWalk]
  );

  const handleRestart = useCallback(() => {
    setStatus('playing');
    setSpriteX(0);
    setWalking(false);
    setSelectedLoop(null);
    setXp((prev) => Math.max(0, prev - 50));
    setPenalty((prev) => prev + 50);
  }, []);

  const handlePlayAgain = useCallback(() => {
    setGameStarted(false);
    setStatus('idle');
    setSpriteX(0);
    setWalking(false);
    setXp(1000);
    setAttempts(0);
    setPenalty(0);
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
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🎮 Loop Runner</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Level 5 : Infinity Coder</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-emerald-500">✨ {xp} XP</span>
              {penalty > 0 && <span className="text-sm text-red-500">-{penalty} penalty</span>}
            </div>
          </div>

          <div className="mb-6">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (xp / 1250) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'idle' && !gameStarted && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="text-6xl mb-4">🏃</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Loop Runner</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Sprite-কে স্ক্রিন জুড়ে হাঁটাতে সঠিক লুপ বেছে নাও!</p>
                <Button onClick={startGame} size="lg" variant="primary">শুরু করো</Button>
              </motion.div>
            )}

            {status === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Scratch Stage */}
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 mb-6 relative overflow-hidden min-h-[160px]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">Stage</div>

                  {/* Sprite */}
                  <motion.div
                    className="absolute bottom-4 text-5xl"
                    style={{ left: `${20 + spriteX}px` }}
                    animate={walking ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 0.2, repeat: walking ? Infinity : 0 }}
                  >
                    🐱
                  </motion.div>

                  {/* Ground */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-500/30 rounded" />

                  {/* Distance markers */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-between px-4 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>Start</span>
                    <span>End</span>
                  </div>
                </div>

                <p className="text-center text-lg font-bold text-gray-800 dark:text-gray-100 mb-6">
                  কোন লুপ ব্যবহার করবে?
                </p>

                {/* Loop choices */}
                <div className="flex justify-center gap-6 mb-4">
                  <motion.button
                    onClick={() => handleSelectLoop('repeat10')}
                    className="px-8 py-6 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={walking}
                  >
                    🔁 Repeat 10
                  </motion.button>
                  <motion.button
                    onClick={() => handleSelectLoop('forever')}
                    className="px-8 py-6 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={walking}
                  >
                    ♾️ Forever
                  </motion.button>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🏆</motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">সঠিক লুপ!</h4>
                <p className="text-gray-800 dark:text-gray-100 mb-2">Sprite অনবরত হাঁটতে থাকবে!</p>
                <p className="text-emerald-500 font-bold mb-4">🏆 Infinity Coder Badge আনলক হয়েছে! +{attempts === 1 ? 250 : attempts === 2 ? 200 : 150} XP</p>

                {/* Animated sprite */}
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 mb-4 relative overflow-hidden min-h-[100px]">
                  <motion.div
                    className="absolute bottom-4 text-5xl"
                    animate={{ x: [0, 200, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🐱
                  </motion.div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={handlePlayAgain} variant="ghost">আবার খেলো</Button>
                </div>
              </motion.div>
            )}

            {status === 'failure' && (
              <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <motion.div className="text-6xl mb-4" animate={{ rotate: [0, -5, 5, -5, 0] }}>😰</motion.div>
                <h4 className="text-2xl font-bold text-red-500 mb-2">❌ স্প্রাইট মাঝপথে আটকে গেছে</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-2">Repeat 10 শেষ হলে স্প্রাইট থেমে যায় — চলতে থাকে না!</p>
                <p className="text-sm text-red-500 mb-6">-50 Points</p>
                <Button onClick={handleRestart} variant="danger" size="lg">Restart</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}
