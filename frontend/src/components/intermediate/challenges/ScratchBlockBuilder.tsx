import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export function ScratchBlockBuilder() {
  const { ref, isVisible } = useScrollAnimation();
  const [hatDropped, setHatDropped] = useState(false);
  const [blockDropped, setBlockDropped] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [spriteX, setSpriteX] = useState(0);
  const [spaceKeyPressed, setSpaceKeyPressed] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [activityPhase, setActivityPhase] = useState<'hat' | 'block' | 'run' | 'space' | 'done'>('hat');

  const handleHatDrop = useCallback(() => {
    setHatDropped(true);
    setActivityPhase('block');
  }, []);

  const handleBlockDrop = useCallback(() => {
    setBlockDropped(true);
    setActivityPhase('run');
    setTimeout(() => setShowAnimation(true), 500);
  }, []);

  const handleGreenFlagClick = useCallback(() => {
    if (activityPhase === 'run') {
      setSpriteX(0);
      const interval = setInterval(() => {
        setSpriteX((prev) => {
          if (prev >= 10) { clearInterval(interval); return 10; }
          return prev + 1;
        });
      }, 300);
      setTimeout(() => {
        clearInterval(interval);
        setSpriteX(10);
        setActivityPhase('space');
      }, 3500);
    }
  }, [activityPhase]);



  // Space key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && activityPhase === 'space') {
        e.preventDefault();
      setSpaceKeyPressed(true);
        setTimeout(() => {
          setShowComplete(true);
          setActivityPhase('done');
        }, 1500);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activityPhase]);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">স্ক্র্যাচ ব্লক বিল্ডার</span>
        </motion.h2>

        <Card className="overflow-hidden">
          {/* Scratch Stage */}
          <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-6 mb-6 min-h-[200px] relative overflow-hidden">
            {/* Stage label */}
            <div className="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400 font-bold">Stage</div>

            {/* Sprite */}
            <motion.div
              className="absolute bottom-4 left-8 text-5xl cursor-pointer"
              animate={{ x: spriteX * 15 }}
              transition={{ type: 'spring', stiffness: 50 }}
            >
              🐱
            </motion.div>

            {/* Green Flag */}
            {(activityPhase === 'run' || activityPhase === 'space') && (
              <motion.button
                className="absolute top-2 right-12 text-3xl"
                onClick={handleGreenFlagClick}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={activityPhase === 'run' ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                🚩
              </motion.button>
            )}

            {/* Space key hint */}
            {activityPhase === 'space' && !spaceKeyPressed && (
              <motion.div
                className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg font-bold text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
              >
                ⌨️ Space বাটন চাপো!
              </motion.div>
            )}

            {spaceKeyPressed && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.5, 1] }}
                transition={{ duration: 0.5 }}
              >
                ⚡
              </motion.div>
            )}
          </div>

          {/* Blocks workspace */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 min-h-[200px]">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">Blocks</div>

            {/* Hat Block - When Green Flag Clicked */}
            {activityPhase === 'hat' && (
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md cursor-pointer text-center"
                  onClick={handleHatDrop}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="text-xs text-gray-600 mb-1">Event</div>
                  When Green Flag Clicked 🚩
                </motion.div>
                <p className="text-sm text-gray-500 dark:text-gray-400">এটিতে ক্লিক করে নিচে বসাও</p>
              </div>
            )}

            {hatDropped && (
              <div className="flex flex-col items-center">
                {/* Hat block placed */}
                <motion.div
                  className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-xs text-gray-600 mb-1">Event</div>
                  When Green Flag Clicked 🚩
                </motion.div>

                {/* Connection indicator */}
                {blockDropped && (
                  <motion.div
                    className="w-1 h-4 bg-yellow-500 my-1"
                    initial={{ height: 0 }}
                    animate={{ height: 8 }}
                  />
                )}

                {/* Move block - empty slot when not dropped */}
                {activityPhase === 'block' && (
                  <motion.div
                    className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md cursor-pointer text-center border-2 border-dashed border-blue-200"
                    onClick={handleBlockDrop}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    + move 10 steps (এখানে রাখো)
                  </motion.div>
                )}

                {blockDropped && (
                  <>
                    <motion.div
                      className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md text-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-xs text-blue-200 mb-1">Motion</div>
                      move 10 steps ➡️
                    </motion.div>

                    {showAnimation && (
                      <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100">
                          <span className="text-green-500">🚩 Green Flag</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-blue-500">Code Executes</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-purple-500">Sprite Moves 🐱</span>
                        </div>
                        <motion.p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          এখন Stage-এর Green Flag 🚩 এ ক্লিক করো!
                        </motion.p>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Space key activity */}
            {activityPhase === 'space' && spaceKeyPressed && (
              <motion.div
                className="mt-6 px-6 py-3 bg-purple-400 text-white font-bold rounded-2xl shadow-md text-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-xs text-purple-200 mb-1">Event</div>
                When Space Key Pressed ⌨️ ⚡
              </motion.div>
            )}
          </div>
        </Card>

        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mt-6"
            >
              <Card highlighted className="text-center">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">দারুণ!</h3>
                <p className="text-gray-800 dark:text-gray-100">তুমি ইভেন্ট ব্লক ব্যবহার করে প্রোগ্রাম তৈরি করেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}


