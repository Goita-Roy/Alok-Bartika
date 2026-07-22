import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { variablesData } from '../data/lessonData';

type Phase = 'phase1' | 'phase2' | 'phase2-2' | 'done';
const data = variablesData.scaffoldPhases;

export function VariablesScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('phase1');
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const [dragPhase2Idx, setDragPhase2Idx] = useState(-1);

  const handlePhase2Check = useCallback(() => {
    const correct1 = answer1.trim().toLowerCase() === 'make a variable';
    const correct2 = answer2.trim().toLowerCase() === 'set score to 0';
    const correct3 = answer3.trim().toLowerCase() === 'change score by 1';
    if (correct1 && correct2 && correct3) setPhase('phase2-2');
    else setShowHints(true);
  }, [answer1, answer2, answer3]);

  const handlePhase2Activity2Check = useCallback(() => {
    setCompleted(Array.from({ length: 4 }, (_, i) => `s2-${i}`));
    setPhase('done');
  }, []);

  const dragBlocks = [
    { id: 'repeat 10', text: 'repeat 10' },
    { id: 'Make a Variable', text: 'Make a Variable' },
    { id: 'set Score to 0', text: '← ' + data.phase2Activity2.missing1 },
    { id: 'change Score by 1', text: '← ' + data.phase2Activity2.missing2 },
  ];
  const dropzones = [
    { id: 'dz-1', expected: 'Make a Variable', label: 'Step 1: ভেরিয়েবল তৈরি করো' },
    { id: 'dz-2', expected: 'set Score to 0', label: 'Step 2: শুরুতে মান = 0 সেট করো' },
    { id: 'dz-3', expected: 'change Score by 1', label: 'Step 3: 1 করে বাড়াও' },
  ];

  const [dropped, setDropped] = useState<string[]>([]);
  const [dropErrors, setDropErrors] = useState<string[]>([]);

  const handleDrop = useCallback((expected: string) => {
    if (dragPhase2Idx < 0) return;
    const block = dragBlocks[dragPhase2Idx];
    if (block.id === expected) {
      setDropped((prev) => [...prev, expected]);
      setDropErrors((prev) => prev.filter((e) => e !== expected));
    } else {
      setDropErrors((prev) => (prev.includes(expected) ? prev : [...prev, expected]));
    }
    setDragPhase2Idx(-1);
  }, [dragPhase2Idx, dragBlocks]);

  if (phase === 'phase1') {
    return (
      <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
            <span className="gradient-text">{data.phase1.title}</span>
          </motion.h2>
          <Card>
            <div className="space-y-6">
              {data.phase1.steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  initial={{ opacity: 0, x: -30 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: idx * 0.3 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-sm"
                    initial={{ scale: 0 }}
                    animate={isVisible ? { scale: 1 } : {}}
                    transition={{ delay: idx * 0.3 + 0.2, type: 'spring' }}
                  >
                    {idx + 1}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-text dark:text-text-dark">{step.text}</p>
                  </div>
                  <motion.div
                    className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={isVisible ? { opacity: 1 } : {}}
                    transition={{ delay: idx * 0.3 + 0.4 }}
                  >
                    <span className="text-green-500">✓</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button onClick={() => setPhase('phase2')} size="lg">আমি বুঝেছি, এখন করবো →</Button>
            </div>
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
            <span className="gradient-text">{data.phase2.title}</span>
          </motion.h2>
          <Card>
            <div className="space-y-6">
              {data.phase2.steps.slice(1).map((step, idx) => (
                <div key={step.id || idx} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted dark:text-muted-dark">Block {idx + 2}:</span>
                  {idx === 0 && (
                    <input
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-text dark:text-text-dark text-center font-mono text-lg focus:border-blue-500 outline-none transition-colors"
                      placeholder=" উত্তর লিখো..."
                      value={answer1}
                      onChange={(e) => { setAnswer1(e.target.value); setShowHints(false); }}
                    />
                  )}
                  {idx === 1 && (
                    <input
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-text dark:text-text-dark text-center font-mono text-lg focus:border-blue-500 outline-none transition-colors"
                      placeholder=" উত্তর লিখো..."
                      value={answer2}
                      onChange={(e) => { setAnswer2(e.target.value); setShowHints(false); }}
                    />
                  )}
                  {idx === 2 && (
                    <input
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 text-text dark:text-text-dark text-center font-mono text-lg focus:border-blue-500 outline-none transition-colors"
                      placeholder=" উত্তর লিখো..."
                      value={answer3}
                      onChange={(e) => { setAnswer3(e.target.value); setShowHints(false); }}
                    />
                  )}
                </div>
              ))}
              {showHints && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-red-500 text-sm font-semibold">💡 ইশারা: "Make a Variable" → "set Score to 0" → "change Score by 1"</p>
                </motion.div>
              )}
            </div>
            <div className="flex justify-center mt-8">
              <Button onClick={handlePhase2Check} size="lg">চেক করো</Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (phase === 'phase2-2') {
    const dzCompleted = dropped.length >= dropzones.length;
    return (
      <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
            <span className="gradient-text">{data.phase2Activity2.title}</span>
          </motion.h2>
          <p className="text-center text-muted dark:text-muted-dark mb-8 text-lg">ঠিক ব্লকটি টেনে সঠিক জায়গায় ফেলো</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {dragBlocks.map((block, idx) => (
              <motion.button
                key={block.id}
                className={`px-4 py-3 rounded-xl font-mono font-bold text-sm cursor-grab active:cursor-grabbing shadow-md transition-all ${
                  dropped.includes(block.id)
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 line-through opacity-50'
                    : 'bg-white dark:bg-gray-800 text-text dark:text-text-dark border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDragPhase2Idx(idx)}
              >
                {block.text}
              </motion.button>
            ))}
          </div>
          <div className="space-y-4">
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
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
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
          {dzCompleted && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-8">
              <Button onClick={handlePhase2Activity2Check} size="lg">সবকিছু ঠিক আছে ✓</Button>
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
          <p className="text-2xl font-bold text-text dark:text-text-dark mb-2">ভেরিয়েবল তৈরি করতে পারো!</p>
          <p className="text-muted dark:text-muted-dark">তুমি এখন Make a Variable → set → change পদ্ধতি জানো</p>
        </Card>
      </div>
    </section>
  );
}
