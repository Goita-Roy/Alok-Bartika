import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface FlowchartStep {
  id: string;
  text: string;
  correctSymbol: string;
}

const symbols = [
  { id: 'oval', label: 'Oval', color: 'bg-green-500', shape: 'rounded-full' },
  { id: 'rectangle', label: 'Rectangle', color: 'bg-orange-500', shape: 'rounded-lg' },
  { id: 'parallelogram', label: 'Parallelogram', color: 'bg-blue-500', shape: 'rounded-lg skew-x-[-12deg]' },
  { id: 'arrow', label: 'Arrow', color: 'bg-purple-500', shape: 'rounded-md' },
];

const gameSteps: FlowchartStep[] = [
  { id: 'gs1', text: 'Start', correctSymbol: 'oval' },
  { id: 'gs2', text: 'Input A, B', correctSymbol: 'parallelogram' },
  { id: 'gs3', text: 'Sum = A + B', correctSymbol: 'rectangle' },
  { id: 'gs4', text: 'Print Sum', correctSymbol: 'parallelogram' },
  { id: 'gs5', text: 'End', correctSymbol: 'oval' },
];

export function FlowchartGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [lives, setLives] = useState(3);
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'playing' | 'success' | 'failure'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [stepSymbols, setStepSymbols] = useState<Record<string, string>>({});
  const [incorrectSteps, setIncorrectSteps] = useState<Set<string>>(new Set());
  const [draggedSymbol, setDraggedSymbol] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);


  const handleSymbolDrag = useCallback((symbolId: string) => {
    setDraggedSymbol(symbolId);
  }, []);

  const handleStepDrop = useCallback(
    (stepId: string) => {
      if (!draggedSymbol || status !== 'playing') return;
      setStepSymbols((prev) => ({ ...prev, [stepId]: draggedSymbol }));
      setIncorrectSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
      setDraggedSymbol(null);
    },
    [draggedSymbol, status]
  );

  const handleSubmit = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const wrongSteps = new Set<string>();
    gameSteps.forEach((s) => {
      if (stepSymbols[s.id] !== s.correctSymbol) {
        wrongSteps.add(s.id);
      }
    });

    if (wrongSteps.size === 0 && gameSteps.every((s) => stepSymbols[s.id])) {
      setStatus('success');
      setShowConfetti(true);
      const earnedXp = newAttempts === 1 ? 100 : newAttempts === 2 ? 75 : 50;
      setXp((prev) => prev + earnedXp);
      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setIncorrectSteps(wrongSteps);
      setStatus('failure');
      setLives((prev) => Math.max(0, prev - 1));
    }
  }, [stepSymbols, attempts]);

  const handleRetry = useCallback(() => {
    setStepSymbols({});
    setIncorrectSteps(new Set());
    setStatus('playing');
  }, []);

  const handleReset = useCallback(() => {
    setStepSymbols({});
    setIncorrectSteps(new Set());
    setStatus('playing');
    setLives(3);
    setXp(0);
    setAttempts(0);
  }, []);

  const getSymbolLabel = (symId: string) => symbols.find((s) => s.id === symId)?.label || symId;
  const getSymbolColor = (symId: string) => symbols.find((s) => s.id === symId)?.color || 'bg-gray-400';

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 relative">
      <Confetti active={showConfetti} />
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">গ্যামিফিকেশন</span>
        </motion.h2>

        <Card className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                🎮 Flowchart Builder
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Level 2 : Shape Detective</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                ❤️ {lives}
              </span>
              <span className="text-lg font-bold text-emerald-500">✨ {xp} XP</span>
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-6">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((xp / 100) * 100, 100)}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-6">প্রতিটি ধাপের জন্য সঠিক ফ্লোচার্ট সিম্বল নির্বাচন করো:</p>

                {/* Flowchart steps */}
                <div className="flex flex-col items-center gap-3 mb-8">
                  {gameSteps.map((step, i) => {
                    const selected = stepSymbols[step.id];
                    const isWrong = incorrectSteps.has(step.id);
                    const isCorrect = selected === step.correctSymbol;
                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-full min-w-[280px] p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all duration-300 ${
                            isWrong
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 animate-shake'
                              : isCorrect
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : selected
                              ? 'border-emerald-500 bg-emerald-500/5'
                              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                          onClick={() => handleStepDrop(step.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-100 flex-1">{step.text}</span>
                          <span className={`px-4 py-1.5 rounded-lg text-white text-sm font-bold ${selected ? getSymbolColor(selected) : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                            {selected ? getSymbolLabel(selected) : '?'}
                          </span>
                          {isCorrect && <span className="text-green-500 text-lg">✓</span>}
                          {isWrong && <span className="text-red-500 text-lg">✗</span>}
                        </motion.div>
                        {i < gameSteps.length - 1 && (
                          <svg className="w-5 h-5 text-gray-500 my-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Symbol Toolbox */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">সিম্বল বক্স (একটি সিম্বল ক্লিক করে তারপর ধাপে ক্লিক করো):</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {symbols.map((sym) => (
                      <motion.button
                        key={sym.id}
                        onClick={() => handleSymbolDrag(sym.id)}
                        className={`px-5 py-2.5 ${sym.color} text-white font-bold rounded-xl shadow-lg cursor-pointer`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        animate={draggedSymbol === sym.id ? { scale: 1.15, y: -4 } : {}}
                      >
                        {sym.label}
                      </motion.button>
                    ))}
                  </div>
                  {draggedSymbol && (
                    <p className="text-sm text-emerald-500 mt-2 font-semibold">
                      নির্বাচিত: {getSymbolLabel(draggedSymbol)} — এখন একটি ধাপে ক্লিক করো
                    </p>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="ghost" onClick={handleRetry}>পুনরায় সেট করো</Button>
                  <Button onClick={handleSubmit} variant="primary" disabled={Object.keys(stepSymbols).length < gameSteps.length}>
                    জমা দাও
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">সঠিক!</h4>
                <p className="text-lg text-gray-800 dark:text-gray-100 mb-2">🏆 Shape Detective Badge আনলক হয়েছে!</p>
                <p className="text-emerald-500 font-bold mb-6">{attempts === 1 ? '★★★ 100 XP' : attempts === 2 ? '★★ 75 XP' : '★ 50 XP'}</p>

                {/* Animated flowchart */}
                <div className="flex flex-col items-center gap-1 mb-6">
                  {gameSteps.map((step, i) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <motion.div
                        className={`px-5 py-2 ${getSymbolColor(step.correctSymbol)} text-white rounded-lg font-bold`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                      >
                        {step.text}
                      </motion.div>
                      {i < gameSteps.length - 1 && (
                        <motion.div className="h-6 w-0.5 bg-success" initial={{ height: 0 }} animate={{ height: 24 }} transition={{ delay: i * 0.15 + 0.1 }} />
                      )}
                    </div>
                  ))}
                </div>

                <Button onClick={handleReset} variant="success" size="lg">🏆 আবার খেলো</Button>
              </motion.div>
            )}

            {status === 'failure' && (
              <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                <motion.div className="text-6xl mb-4" animate={{ rotate: [0, -5, 5, -5, 0] }}>😅</motion.div>
                <h4 className="text-2xl font-bold text-red-500 mb-2">❌ ফ্লোচার্টের রাস্তা বন্ধ হয়ে গেছে!</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-2">-1 Life</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">শুধু ভুল সিম্বলগুলো হাইলাইট করা আছে। আবার চেষ্টা করো!</p>
                <Button onClick={handleRetry} variant="danger" size="lg">আবার চেষ্টা করো</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}

