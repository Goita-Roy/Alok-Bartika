import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase = 'phase1' | 'phase1-anim' | 'phase2' | 'phase2-drop' | 'done';

const dragBlocks = [
  { id: 'if', label: 'If', color: 'bg-green-500' },
  { id: 'condition', label: 'Score >= 50', color: 'bg-blue-500' },
  { id: 'say-pass', label: 'say "পাস!"', color: 'bg-primary' },
  { id: 'else', label: 'Else', color: 'bg-orange-500' },
  { id: 'say-fail', label: 'say "ফেল!"', color: 'bg-red-500' },
];

const dropzones = [
  { id: 'dz-if', expected: 'if', label: 'If' },
  { id: 'dz-condition', expected: 'condition', label: 'শর্ত (Condition)' },
  { id: 'dz-true', expected: 'say-pass', label: 'True Block (Then)' },
  { id: 'dz-else', expected: 'else', label: 'Else' },
  { id: 'dz-false', expected: 'say-fail', label: 'False Block (Else)' },
];

export function IfElseScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('phase1');
  const [step, setStep] = useState(0);
  const [scoreValue, setScoreValue] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [dropped, setDropped] = useState<string[]>([]);
  const [dropErrors, setDropErrors] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const handlePhase1Next = useCallback(() => {
    if (step < 3) setStep((s) => s + 1);
    else setPhase('phase1-anim');
  }, [step]);

  const handleScoreCheck = useCallback(() => {
    if (scoreValue === null) return;
    setShowCheck(true);
  }, [scoreValue]);

  const handleDoneAnim = useCallback(() => {
    setPhase('phase2');
    setStep(0);
    setShowCheck(false);
    setScoreValue(null);
  }, []);

  const handleDrop = useCallback((expected: string) => {
    if (selectedIdx < 0) return;
    const block = dragBlocks[selectedIdx];
    if (block.id === expected) {
      setDropped((prev) => [...prev, expected]);
      setDropErrors((prev) => prev.filter((e) => e !== expected));
    } else {
      setDropErrors((prev) => (prev.includes(expected) ? prev : [...prev, expected]));
    }
    setSelectedIdx(-1);
  }, [selectedIdx]);

  const handlePhase2Done = useCallback(() => {
    setPhase('done');
  }, []);

  const ph1Steps = [
    { text: 'Score >= 50', emoji: '🔢' },
    { text: 'Insert into If Condition', emoji: '📥' },
    { text: 'Place say "পাস!" inside Then', emoji: '✅' },
    { text: 'Place say "ফেল!" inside Else', emoji: '❌' },
  ];

  if (phase === 'phase1') {
    return (
      <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
            <span className="gradient-text">Watch & Learn</span>
          </motion.h2>
          <Card>
            <div className="space-y-6">
              {ph1Steps.map((s, idx) => (
                <motion.div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    idx <= step ? 'bg-gray-50 dark:bg-gray-800' : 'opacity-40'
                  }`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isVisible && idx <= step ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.2 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-sm"
                    animate={idx === step ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.5, repeat: idx === step ? Infinity : 0, repeatDelay: 1 }}
                  >
                    {idx + 1}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-text dark:text-text-dark">
                      <span className="mr-2">{s.emoji}</span>
                      {s.text}
                    </p>
                  </div>
                  {idx < step && (
                    <motion.div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <span className="text-green-500">✓</span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button onClick={handlePhase1Next} size="lg">{step < 3 ? 'Next →' : 'প্রোগ্রাম চালাও ▶'}</Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (phase === 'phase1-anim') {
    return (
      <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
            <span className="gradient-text">প্রোগ্রাম চলছে...</span>
          </motion.h2>
          <Card>
            {!showCheck ? (
              <div className="text-center">
                <motion.div className="text-6xl mb-6" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>🤖</motion.div>
                <p className="text-xl font-bold text-text dark:text-text-dark mb-4">কম্পিউটার স্কোর পরীক্ষা করছে...</p>
                <p className="text-muted dark:text-muted-dark mb-6">একটি স্কোর নির্বাচন করো:</p>
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  {[30, 50, 70, 90].map((n) => (
                    <motion.button
                      key={n}
                      className={`w-20 h-16 rounded-2xl font-extrabold text-lg shadow-md ${
                        scoreValue === n
                          ? 'bg-primary text-white ring-4 ring-primary/40 scale-110'
                          : 'bg-white dark:bg-gray-800 text-text dark:text-text-dark border-2 border-gray-200 dark:border-gray-600 hover:border-primary'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setScoreValue(n)}
                    >
                      {n}
                    </motion.button>
                  ))}
                </div>
                <Button onClick={handleScoreCheck} disabled={scoreValue === null} size="lg">
                  {scoreValue === null ? 'স্কোর বাছাই করো' : 'পরীক্ষা করো'}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xl font-bold text-text dark:text-text-dark mb-2">Score = {scoreValue}</p>
                {scoreValue !== null && scoreValue >= 50 ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-400">
                    <motion.div className="text-5xl mb-2" animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity }}>✅</motion.div>
                    <p className="text-2xl font-bold text-green-600">say "পাস!"</p>
                    <p className="text-muted dark:text-muted-dark mt-2">শর্ত সত্যি → True Block চলেছে</p>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-6 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border-2 border-orange-400">
                    <motion.div className="text-5xl mb-2" animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity }}>❌</motion.div>
                    <p className="text-2xl font-bold text-orange-600">say "ফেল!"</p>
                    <p className="text-muted dark:text-muted-dark mt-2">শর্ত মিথ্যা → Else Block চলেছে</p>
                  </motion.div>
                )}
                <div className="flex justify-center mt-6">
                  <Button onClick={handleDoneAnim} size="lg">এখন নিজে করো →</Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>
    );
  }

  if (phase === 'phase2') {
    return (
      <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
            <span className="gradient-text">তুমি নিজে করো (Try Yourself)</span>
          </motion.h2>
          <p className="text-center text-muted dark:text-muted-dark mb-8 text-lg">ঠিক ব্লকটি বাছাই করে সঠিক জায়গায় ফেলো</p>

          {/* Available blocks */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {dragBlocks.map((block, idx) => (
              <motion.button
                key={block.id}
                className={`px-4 py-3 rounded-xl font-mono font-bold text-white text-sm shadow-md ${
                  selectedIdx === idx ? 'ring-4 ring-yellow-400 scale-110' : ''
                } ${dropped.includes(block.id) ? 'opacity-40' : ''} ${block.color}`}
                whileHover={{ scale: dropped.includes(block.id) ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { if (!dropped.includes(block.id)) setSelectedIdx(idx); }}
              >
                {block.label}
              </motion.button>
            ))}
          </div>

          {/* Drop zones */}
          <div className="space-y-3">
            {dropzones.map((dz) => {
              const isDone = dropped.includes(dz.expected);
              const isError = dropErrors.includes(dz.expected);
              return (
                <motion.div
                  key={dz.id}
                  className={`p-4 rounded-xl border-2 border-dashed transition-all ${
                    isDone
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                      : isError
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400'
                  }`}
                  onClick={() => handleDrop(dz.expected)}
                  whileHover={{ scale: isDone ? 1 : 1.02 }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDone ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                    }`}>
                      {dropzones.indexOf(dz) + 1}
                    </div>
                    <span className="text-lg font-semibold text-text dark:text-text-dark">{dz.label}</span>
                    {isDone && <span className="ml-auto text-green-500 text-xl">✓</span>}
                    {isError && <span className="ml-auto text-red-400 text-sm font-bold">✘ ভুল ব্লক</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {dropped.length >= dropzones.length && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-8">
              <Button onClick={handlePhase2Done} size="lg">সবকিছু ঠিক আছে ✓</Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full text-center">
        <Card highlighted className="max-w-md mx-auto">
          <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🏆</motion.div>
          <p className="text-2xl font-bold text-text dark:text-text-dark mb-2">If-Else তৈরি করতে পারো!</p>
          <p className="text-muted dark:text-muted-dark">তুমি এখন If → Condition → Then → Else → False Block সাজাতে জানো</p>
        </Card>
      </div>
    </section>
  );
}
