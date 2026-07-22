import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Card } from '../intermediate/ui/Card';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface Shape {
  id: number;
  symbol: string;
  label: string;
  description: string;
  color: string;
}

const shapes: Shape[] = [
  {
    id: 1,
    symbol: '⬭',
    label: 'ওভাল',
    description: 'অ্যালগরিদমের শুরু ও শেষ বোঝায়',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 2,
    symbol: '▱',
    label: 'প্যারালেলোগ্রাম',
    description: 'ইনপুট ও আউটপুট বোঝায়',
    color: 'from-sky-500 to-sky-600',
  },
  {
    id: 3,
    symbol: '▭',
    label: 'রেক্ট্যাঙ্গেল',
    description: 'প্রসেসিং স্টেপ বোঝায়',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 4,
    symbol: '◇',
    label: 'ডায়মন্ড',
    description: 'সিদ্ধান্ত নেয়ার স্টেপ বোঝায়',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function ShapeDiscovery() {
  const { ref, isVisible } = useScrollAnimation();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  const handleFlip = useCallback((id: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      next.add(id);
      if (next.size === shapes.length) {
        setTimeout(() => setShowComplete(true), 600);
      }
      return next;
    });
  }, []);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">ফ্লোচার্ট সিম্বল</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shapes.map((shape, i) => {
            const isFlipped = flipped.has(shape.id);
            return (
              <motion.div
                key={shape.id}
                className="perspective-1000 h-64 cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                onClick={() => !isFlipped && handleFlip(shape.id)}
              >
                <motion.div
                  className="relative w-full h-full preserve-3d transition-transform duration-700"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-col items-center justify-center gap-4"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <motion.div
                      className={`text-7xl bg-gradient-to-br ${shape.color} w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg`}
                      animate={isFlipped ? { scale: 0.8 } : { scale: 1 }}
                    >
                      <span className="text-white">{shape.symbol}</span>
                    </motion.div>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{shape.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ক্লিক করে দেখো</p>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-sky-500/5 dark:from-emerald-500/10 dark:to-sky-500/10 flex flex-col items-center justify-center gap-3 p-6"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <motion.div
                      className={`text-4xl bg-gradient-to-br ${shape.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}
                      initial={{ scale: 0 }}
                      animate={isFlipped ? { scale: 1 } : {}}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      <span className="text-white">{shape.symbol}</span>
                    </motion.div>
                    <p className="text-2xl font-extrabold text-emerald-500">{shape.label}</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center">{shape.description}</p>
                    <motion.div
                      className="text-2xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={isFlipped ? { scale: 1, rotate: 0 } : {}}
                      transition={{ delay: 0.5, type: 'spring' }}
                    >
                      ✅
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {showComplete && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="mt-12"
            >
              <Card highlighted className="max-w-xl mx-auto text-center">
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ type: 'spring' }}
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  সব সিম্বল আবিষ্কৃত!
                </h3>
                <p className="text-gray-800 dark:text-gray-100">
                  ফ্লোচার্টের প্রতিটি সিম্বলের অর্থ তুমি এখন জানো!
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </section>
  );
}
