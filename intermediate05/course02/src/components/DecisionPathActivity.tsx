import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Path = 'none' | 'left' | 'right';

export function DecisionPathActivity() {
  const { ref, isVisible } = useScrollAnimation();
  const [path, setPath] = useState<Path>('none');
  const [showResult, setShowResult] = useState(false);

  const handlePath = useCallback((p: Path) => {
    setPath(p);
    setShowResult(false);
    setTimeout(() => setShowResult(true), 800);
  }, []);

  const handleReset = useCallback(() => {
    setPath('none');
    setShowResult(false);
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
        </motion.h2>

        <Card>
          {/* Intersection / Road visualization */}
          <div className="relative bg-gradient-to-b from-green-100 to-green-50 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-6 min-h-[280px] overflow-hidden">
            {/* Road */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 bg-gray-600" />
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-24 h-24 bg-gray-700 rounded-full border-8 border-gray-500 z-10" />

            {/* Center condition */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border-4 border-primary rounded-xl px-4 py-3 shadow-lg text-center"
              initial={{ scale: 0 }}
              animate={isVisible ? { scale: 1 } : {}}
              transition={{ type: 'spring', delay: 0.3 }}
            >
              <p className="font-bold text-sm text-primary">রাস্তা যদি ভেজা থাকে</p>
            </motion.div>

            {/* Left path (no umbrella) */}
            <motion.button
              onClick={() => path === 'none' && handlePath('left')}
              disabled={path !== 'none'}
              className={`absolute top-8 left-4 z-20 px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                path === 'none'
                  ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-600 cursor-pointer hover:bg-red-200'
                  : path === 'left'
                  ? 'bg-red-500 text-white border-2 border-red-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
              }`}
              whileHover={path === 'none' ? { scale: 1.05 } : {}}
              whileTap={path === 'none' ? { scale: 0.95 } : {}}
            >
              ⬅ বামে যাও (ছাতা ছাড়া যাও)
            </motion.button>

            {/* Right path (umbrella) */}
            <motion.button
              onClick={() => path === 'none' && handlePath('right')}
              disabled={path !== 'none'}
              className={`absolute top-8 right-4 z-20 px-4 py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${
                path === 'none'
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-400 text-green-600 cursor-pointer hover:bg-green-200'
                  : path === 'right'
                  ? 'bg-green-500 text-white border-2 border-green-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
              }`}
              whileHover={path === 'none' ? { scale: 1.05 } : {}}
              whileTap={path === 'none' ? { scale: 0.95 } : {}}
            >
              ➡ ডানে যাও (ছাতা নাও)
            </motion.button>

            {/* Animated character */}
            {path !== 'none' && (
              <motion.div
                className="absolute bottom-4 text-5xl z-10"
                initial={{ x: 0, y: 0 }}
                animate={
                  path === 'left'
                    ? { x: [-60, -120], opacity: [1, 0.5] }
                    : { x: [60, 120], opacity: [1, 0.5] }
                }
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {path === 'left' ? '🧑' : '🧑'}
                {path === 'right' && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl">☂️</span>
                )}
              </motion.div>
            )}
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && path === 'left' && (
              <motion.div key="left" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-6">
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-300">
                  <p className="text-xl font-bold text-danger">ছাতা ছাড়া যাও → তুমি ভিজে যাবে ❌</p>
                </Card>
              </motion.div>
            )}
            {showResult && path === 'right' && (
              <motion.div key="right" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mb-6">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-300">
                  <p className="text-xl font-bold text-success">ছাতা নাও → তুমি ভিজবে না ✅</p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {path !== 'none' && (
            <div className="text-center">
              <Button onClick={handleReset} variant="ghost">পুনরায় চেষ্টা করো</Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
