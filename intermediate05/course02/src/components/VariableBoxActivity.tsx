import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const BOXES = ['📦', '🏷️', '🔢'];
const LABELS = ['Variable', 'Name', 'Value'];

export function VariableBoxActivity() {
  const { ref, isVisible } = useScrollAnimation();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const checkAnswer = useCallback((idx: number) => {
    setSelected(idx);
    if (idx === 0) {
      setRevealed(true);
      setScore((s) => s + 1);
    }
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">কোড আনপ্যাক করো</span>
        </motion.h2>
        <motion.p className="text-center text-muted dark:text-muted-dark mb-10 text-lg" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          ভেরিয়েবলের মূল ধারণাগুলো খুঁজে বের করো
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BOXES.map((emoji, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.15 }}
            >
              <Card
                className={`cursor-pointer transition-all text-center ${
                  selected === idx && idx === 0
                    ? 'ring-4 ring-green-400 shadow-xl scale-105'
                    : selected === idx
                    ? 'ring-4 ring-red-400 opacity-60'
                    : 'hover:shadow-lg hover:-translate-y-1'
                }`}
                onClick={() => checkAnswer(idx)}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                >
                  {emoji}
                </motion.div>
                <AnimatePresence mode="wait">
                  {(revealed && idx === 0) || (selected === idx && idx === 0) ? (
                    <motion.p key="correct" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-bold text-green-500">
                      ✓ {LABELS[idx]}
                    </motion.p>
                  ) : selected === idx ? (
                    <motion.p key="wrong" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg font-bold text-red-400">
                      ✘ চেষ্টা করো
                    </motion.p>
                  ) : (
                    <p className="text-lg font-bold text-muted dark:text-muted-dark">???</p>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {revealed && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-10">
            <Card highlighted className="max-w-md w-full text-center">
              <p className="text-lg font-bold text-text dark:text-text-dark">
                🎯 Variable = একটি লেবেল লাগানো বাক্স, যাতে Name ও Value আছে
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <motion.span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-sm font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>📦 Variable</motion.span>
                <motion.span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}>🏷️ Name</motion.span>
                <motion.span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-sm font-bold" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 }}>🔢 Value</motion.span>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
