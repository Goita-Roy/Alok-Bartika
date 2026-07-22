import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const blockOptions = [
  { id: 'if', label: 'If', color: 'bg-green-500' },
  { id: 'password-check', label: 'Password = "1234"', color: 'bg-blue-500' },
  { id: 'say-welcome', label: 'say "স্বাগতম!"', color: 'bg-primary' },
  { id: 'else', label: 'Else', color: 'bg-orange-500' },
  { id: 'say-wrong', label: 'say "ভুল পাসওয়ার্ড!"', color: 'bg-red-500' },
  { id: 'repeat', label: 'repeat 10', color: 'bg-gray-400' },
  { id: 'wait', label: 'wait 1 sec', color: 'bg-cyan-400' },
];

const correctOrder = ['if', 'password-check', 'say-welcome', 'else', 'say-wrong'];

export function IfElseChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const [slots, setSlots] = useState<string[]>(Array(5).fill(''));
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<number[]>([]);

  const handleSlotClick = useCallback((slotIdx: number) => {
    if (!selectedBlock || submitted) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = selectedBlock;
    setSlots(newSlots);
    setSelectedBlock(null);
    setErrors([]);
  }, [selectedBlock, slots, submitted]);

  const handleSubmit = useCallback(() => {
    const isCorrect = slots.every((s, i) => s === correctOrder[i]);
    setSubmitted(true);
    if (isCorrect) {
      setSuccess(true);
    } else {
      const errs = slots.reduce<number[]>((acc, s, i) => {
        if (s !== correctOrder[i]) acc.push(i);
        return acc;
      }, []);
      setErrors(errs);
    }
  }, [slots]);

  const handleReset = useCallback(() => {
    setSlots(Array(5).fill(''));
    setSubmitted(false);
    setSuccess(false);
    setErrors([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (submitted) return;
    const lastFilled = [...slots].reverse().findIndex((s) => s !== '');
    if (lastFilled >= 0) {
      const idx = slots.length - 1 - lastFilled;
      const newSlots = [...slots];
      newSlots[idx] = '';
      setSlots(newSlots);
      setErrors([]);
    }
  }, [slots, submitted]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">⚡ Challenge</span>
        </motion.h2>
        <motion.p className="text-center text-lg text-muted dark:text-muted-dark mb-8" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          "একটি পাসওয়ার্ড চেকিং সিস্টেমের লজিক তৈরি করো।"
        </motion.p>

        <Card className="mb-8">
          <h3 className="text-xl font-bold text-text dark:text-text-dark mb-6 text-center">নিচের ব্লকগুলো সাজাও</h3>

          {/* Block palette */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {blockOptions.map((block) => (
              <motion.button
                key={block.id}
                className={`px-4 py-3 rounded-xl font-mono font-bold text-white text-sm shadow-md ${
                  selectedBlock === block.id ? 'ring-4 ring-yellow-400 scale-110' : ''
                } ${slots.includes(block.id) ? 'opacity-40' : ''} ${block.color}`}
                whileHover={{ scale: slots.includes(block.id) ? 1 : 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { if (!slots.includes(block.id)) setSelectedBlock(block.id); }}
              >
                {block.label}
              </motion.button>
            ))}
          </div>

          {/* Drop zones */}
          <div className="space-y-4 mb-8">
            {[0, 1, 2, 3, 4].map((slotIdx) => {
              const isError = errors.includes(slotIdx);
              return (
                <motion.div
                  key={slotIdx}
                  className={`p-4 rounded-xl border-2 border-dashed flex items-center gap-4 cursor-pointer transition-all ${
                    slots[slotIdx]
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : isError
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400'
                  }`}
                  onClick={() => handleSlotClick(slotIdx)}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {slotIdx + 1}
                  </div>
                  <span className="flex-1 text-lg font-mono font-bold text-text dark:text-text-dark">
                    {slots[slotIdx]
                      ? blockOptions.find((b) => b.id === slots[slotIdx])?.label
                      : 'এখানে ক্লিক করে ব্লক বসাও'}
                  </span>
                  {slots[slotIdx] && (
                    <button
                      className="text-red-400 hover:text-red-600 text-sm font-bold"
                      onClick={(e) => { e.stopPropagation(); const ns = [...slots]; ns[slotIdx] = ''; setSlots(ns); setErrors([]); }}
                    >
                      ✕
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {submitted && !success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
              <p className="text-red-500 font-bold">🤔 সবগুলি ঠিক হয়নি, আবার চেষ্টা করো!</p>
            </motion.div>
          )}

          <div className="flex justify-center gap-4">
            <Button onClick={handleUndo} variant="ghost" size="lg">↩ Undo</Button>
            <Button onClick={handleReset} variant="ghost" size="lg">🔄 Reset</Button>
            {!success && (
              <Button onClick={handleSubmit} size="lg" disabled={slots.some((s) => !s)}>
                {slots.some((s) => !s) ? 'সব স্লট পূরণ করো' : '📤 Submit'}
              </Button>
            )}
          </div>
        </Card>

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <Card highlighted className="max-w-md mx-auto">
              <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
              <p className="text-xl font-bold text-text dark:text-text-dark">চ্যালেঞ্জ সম্পূর্ণ! তুমি If-Else দিয়ে পাসওয়ার্ড চেকিং লজিক তৈরি করতে পারো!</p>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}
