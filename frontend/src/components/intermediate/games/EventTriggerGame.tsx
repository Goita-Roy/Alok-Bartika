import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface Mission {
  id: number;
  title: string;
  correctTrigger: string;
  action: string;
  emoji: string;
}

const missions: Mission[] = [
  { id: 1, title: 'বিড়ালটিকে ১০ ধাপ সরাও', correctTrigger: 'green-flag', action: 'move 10 steps', emoji: '🐱' },
  { id: 2, title: 'বিড়ালটিকে লাফ দিতে বলো', correctTrigger: 'space', action: 'jump', emoji: '🐱' },
  { id: 3, title: 'বিড়ালটিকে উপরে উঠাও', correctTrigger: 'up-arrow', action: 'move up', emoji: '🐱' },
  { id: 4, title: 'বিড়ালটিকে নিচে নামাও', correctTrigger: 'down-arrow', action: 'move down', emoji: '🐱' },
];

const triggers = [
  { id: 'green-flag', label: '🚩 Green Flag', color: 'bg-green-500 hover:bg-green-600' },
  { id: 'space', label: '⌨️ Space Key', color: 'bg-blue-500 hover:bg-blue-600' },
  { id: 'up-arrow', label: '⬆️ Up Arrow', color: 'bg-purple-500 hover:bg-purple-600' },
  { id: 'down-arrow', label: '⬇️ Down Arrow', color: 'bg-orange-500 hover:bg-orange-600' },
];

export function EventTriggerGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMission, setCurrentMission] = useState(0);
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing' | 'success' | 'failure'>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [spriteAnim, setSpriteAnim] = useState<'idle' | 'move' | 'jump' | 'up' | 'down'>('idle');
  const [roundAttempts, setRoundAttempts] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());

  const mission = missions[currentMission];

  const startGame = useCallback(() => {
    setGameStarted(true);
    setStatus('playing');
    setCurrentMission(0);
    setXp(0);
    setCompletedMissions(new Set());
  }, []);

  const handleTrigger = useCallback(
    (triggerId: string) => {
      if (status !== 'playing') return;

      const newRoundAttempts = roundAttempts + 1;
      setRoundAttempts(newRoundAttempts);

      if (triggerId === mission.correctTrigger) {
        // Correct!
        setStatus('success');
        setShowConfetti(true);
        setCompletedMissions((prev) => new Set(prev).add(currentMission));

        const earnedXp = newRoundAttempts === 1 ? 150 : newRoundAttempts === 2 ? 100 : 50;
        setXp((prev) => prev + earnedXp);
        // Animate sprite
        if (mission.correctTrigger === 'green-flag') setSpriteAnim('move');
        else if (mission.correctTrigger === 'space') setSpriteAnim('jump');
        else if (mission.correctTrigger === 'up-arrow') setSpriteAnim('up');
        else if (mission.correctTrigger === 'down-arrow') setSpriteAnim('down');

        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        // Wrong
        setStatus('failure');
        setSpriteAnim('idle');
      }
    },
    [mission, status, roundAttempts, currentMission]
  );

  const handleNextMission = useCallback(() => {
    if (currentMission < missions.length - 1) {
      setCurrentMission((prev) => prev + 1);
      setStatus('playing');
      setRoundAttempts(0);
      setSpriteAnim('idle');
    } else {
      setStatus('idle');
      setGameStarted(false);
    }
  }, [currentMission]);

  const handleRetry = useCallback(() => {
    setStatus('playing');
    setSpriteAnim('idle');
  }, []);

  // Space key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && status === 'playing') {
        e.preventDefault();
        handleTrigger('space');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [status, handleTrigger]);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 relative">
      <Confetti active={showConfetti} />
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">গ্যামিফিকেশন</span>
        </motion.h2>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🎮 Event Trigger Challenge</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Level 3 : Event Triggerer</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-emerald-500">✨ {xp} XP</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Mission {completedMissions.size}/{missions.length}
              </span>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-6">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedMissions.size / missions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'idle' && !gameStarted && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Event Trigger Challenge</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">সঠিক Event Block নির্বাচন করে Sprite-কে কাজ করাও!</p>
                <Button onClick={startGame} size="lg" variant="primary">শুরু করো</Button>
              </motion.div>
            )}

            {status === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Scratch Stage */}
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-6 relative overflow-hidden min-h-[200px]">
                  <div className="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-bold">Stage</div>

                  {/* Mission title */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-md font-bold text-sm">
                    🎯 {mission.title}
                  </div>

                  {/* Sprite */}
                  <motion.div
                    className="absolute bottom-4 left-8 text-6xl"
                    animate={
                      spriteAnim === 'move'
                        ? { x: [0, 100, 100] }
                        : spriteAnim === 'jump'
                        ? { y: [0, -60, 0] }
                        : spriteAnim === 'up'
                        ? { y: [0, -60] }
                        : spriteAnim === 'down'
                        ? { y: [0, 60] }
                        : {}
                    }
                    transition={{ duration: 0.8, type: 'spring' }}
                  >
                    🐱
                  </motion.div>
                </div>

                {/* Trigger buttons */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">সঠিক Event Block নির্বাচন করো:</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {triggers.map((t) => (
                    <motion.button
                      key={t.id}
                      onClick={() => handleTrigger(t.id)}
                      className={`${t.color} text-white font-bold py-4 px-4 rounded-xl shadow-md text-sm`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">সঠিক!</h4>
                <p className="text-lg text-gray-800 dark:text-gray-100 mb-2">{mission.emoji} {mission.action}</p>
                <p className="text-emerald-500 font-bold mb-6">🏆 Controller Master আনলক হয়েছে! +{roundAttempts === 1 ? 150 : roundAttempts === 2 ? 100 : 50} XP</p>

                {/* Animated result */}
                <motion.div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 mb-6 relative overflow-hidden min-h-[120px]">
                  <motion.div
                    className="absolute bottom-4 left-8 text-5xl"
                    animate={
                      spriteAnim === 'move'
                        ? { x: [0, 80] }
                        : spriteAnim === 'jump'
                        ? { y: [0, -40, 0] }
                        : spriteAnim === 'up'
                        ? { y: [0, -40] }
                        : spriteAnim === 'down'
                        ? { y: [0, 40] }
                        : {}
                    }
                    transition={{ duration: 0.5 }}
                  >
                    🐱
                  </motion.div>
                </motion.div>

                {currentMission < missions.length - 1 ? (
                  <Button onClick={handleNextMission} variant="primary" size="lg">পরবর্তী Mission →</Button>
                ) : (
                  <Button onClick={handleNextMission} variant="success" size="lg">🏆 সব সম্পন্ন!</Button>
                )}
              </motion.div>
            )}

            {status === 'failure' && (
              <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <motion.div className="text-6xl mb-4" animate={{ rotate: [0, -5, 5, -5, 0] }}>😅</motion.div>
                <h4 className="text-2xl font-bold text-red-500 mb-2">❌ প্রোগ্রামটি রেসপন্স করছে না</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">ভুল Event Block নির্বাচন করেছ। আবার চেষ্টা করো!</p>
                <Button onClick={handleRetry} variant="danger" size="lg">আবার চেষ্টা করো</Button>
              </motion.div>
            )}

            {status === 'idle' && gameStarted && completedMissions.size === missions.length && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🏆</motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">সব Mission সম্পন্ন!</h4>
                <p className="text-gray-800 dark:text-gray-100 mb-4">মোট {xp} XP অর্জিত!</p>
                <Button onClick={startGame} variant="primary">আবার খেলো</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}

