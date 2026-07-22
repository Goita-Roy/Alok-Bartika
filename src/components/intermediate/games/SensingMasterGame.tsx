import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const availableBlocks = [
  'touching color [কালো]?',
  'touching [Mouse-pointer]?',
  'key [space] pressed?',
];

export function SensingMasterGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'playing' | 'success' | 'failure' | 'completed'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  const CORRECT_BLOCK = 'touching color [কালো]?';

  const handleDragStart = (e: React.DragEvent, op: string) => {
    e.dataTransfer.setData('text/plain', op);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (status !== 'playing') return;
    const op = e.dataTransfer.getData('text/plain');
    setSlot(op);

    if (op === CORRECT_BLOCK) {
      setXp(prev => prev + 400);
      setStatus('success');
      setTimeout(() => {
        setStatus('completed');
        setShowConfetti(true);
      }, 2000);
    } else {
      setStatus('failure');
      setXp(prev => Math.max(0, prev - 100));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRetry = () => {
    setSlot(null);
    setStatus('playing');
  };

  const handleRestart = () => {
    setSlot(null);
    setXp(0);
    setStatus('playing');
    setShowConfetti(false);
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <Confetti active={showConfetti} />

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="gradient-text">Sensor Challenge</span>
          </h2>
          <p className="text-xl font-bold text-emerald-500 mb-4">Level 9 : Sensor Expert</p>

          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white dark:bg-gray-800 px-6 py-2 rounded-full border-2 border-emerald-500/20 shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">XP:</span>
              <span className="font-bold text-emerald-500">{xp}</span>
            </div>
            {status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-6 py-2 rounded-full font-bold border-2 border-yellow-400 flex items-center gap-2"
              >
                <span>🏆</span> Sensor Expert Badge Earned!
              </motion.div>
            )}
          </div>
        </motion.div>

        {status === 'completed' ? (
          <Card className="p-8 text-center bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">
              অসাধারণ! তুমি গেমটি সম্পন্ন করেছ!
            </h3>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">
              তুমি 🏆 Sensor Expert ব্যাজ এবং 400 XP পেয়েছ!
            </p>
            <Button onClick={handleRestart} variant="primary">Play Again</Button>
          </Card>
        ) : (
          <Card
            className={`p-8 bg-white dark:bg-gray-800 border-4 transition-colors duration-300 ${
              status === 'success'
                ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                : status === 'failure'
                ? 'border-red-500'
                : 'border-emerald-500/20'
            }`}
          >
            <p className="text-center mb-8 font-bold text-lg text-gray-800 dark:text-gray-100">
              দেয়ালে ধাক্কা খেলে স্প্রাইটকে আটকাতে কোন সেন্সিং ব্লকটি ব্যবহার করবে?
            </p>

            {/* Sensing Block Palette */}
            <div className="flex justify-center flex-wrap gap-3 mb-10">
              {availableBlocks.map(op => (
                <div
                  key={op}
                  draggable={status === 'playing'}
                  onDragStart={e => handleDragStart(e, op)}
                  className={`px-4 py-3 rounded-full font-mono text-sm md:text-base font-bold border-2 shadow-sm select-none transition-transform ${
                    status === 'playing'
                      ? 'cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95'
                      : 'cursor-not-allowed opacity-40'
                  } bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300`}
                >
                  {op}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Code Block Builder */}
              <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-6 rounded-xl">
                <div className="w-full bg-orange-400 text-white rounded-xl font-mono font-bold border-2 border-orange-500 overflow-hidden shadow-md">
                  {/* If header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">If</span>
                    {/* Drop zone */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className={`flex-1 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
                        slot
                          ? 'border-transparent'
                          : 'border-white/60 bg-white/20 hover:bg-white/30 hover:border-white'
                      }`}
                    >
                      {slot ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full bg-blue-300 text-blue-900 rounded-full font-mono text-xs md:text-sm font-bold flex items-center justify-center px-2 border-2 border-blue-400"
                        >
                          {slot}
                        </motion.div>
                      ) : (
                        <span className="text-white/70 text-xs text-center px-2">
                          drag block here
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Body */}
                  <div className="bg-orange-300 px-4 pb-3 pt-1">
                    <div className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-mono font-bold inline-block border-2 border-blue-600 shadow-sm">
                      move -10 steps
                    </div>
                  </div>
                </div>
              </div>

              {/* Maze Animation */}
              <div className="bg-gray-100 dark:bg-gray-900 border-4 border-gray-700 dark:border-gray-600 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[180px] shadow-inner">
                {/* Left wall */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-black" />
                {/* Right wall */}
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-black" />
                {/* Top wall */}
                <div className="absolute top-0 left-6 right-6 h-6 bg-black" />
                {/* Bottom wall */}
                <div className="absolute bottom-0 left-6 right-6 h-6 bg-black" />

                {/* Sprite */}
                <motion.div
                  animate={
                    status === 'success'
                      ? { x: [0, 60, -10, 0] }
                      : status === 'failure'
                      ? { x: [0, 80], opacity: [1, 0.5] }
                      : { x: 0 }
                  }
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl z-10 shadow-lg"
                >
                  😎
                </motion.div>

                {/* BUMP label on failure */}
                {status === 'failure' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-8 top-1/3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg z-20"
                  >
                    BUMP! 💥
                  </motion.div>
                )}

                {/* Bounced back label on success */}
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20"
                  >
                    Bounce back! ✅
                  </motion.div>
                )}
              </div>
            </div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {status === 'failure' && (
                <motion.div
                  key="fail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-8"
                >
                  <p className="text-red-500 font-bold text-xl mb-4">❌ Bug Detected</p>
                  <Button onClick={handleRetry} variant="outline">আবার চেষ্টা করো</Button>
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-8"
                >
                  <p className="text-green-500 font-bold text-xl">✅ সঠিক সেন্সর ব্যবহার করেছ!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}
      </div>
    </section>
  );
}
