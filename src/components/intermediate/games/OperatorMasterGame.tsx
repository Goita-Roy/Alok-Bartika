import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface Expression {
  id: string;
  left: string;
  right: string;
  correctOp: string;
  result?: string;
}

const expressions: Expression[] = [
  { id: 'e1', left: '50', right: '20', correctOp: '+', result: '= 70' },
  { id: 'e2', left: '100', right: '50', correctOp: '>', result: '' },
  { id: 'e3', left: '8', right: '4', correctOp: '*', result: '= 32' },
  { id: 'e4', left: '[Age > 11]', right: '[Age < 16]', correctOp: 'and', result: '' },
];

const availableOperators = ['+', '-', '*', '/', '>', '<', '=', 'and', 'or', 'not'];

function getBlockStyle(op: string) {
  if (['and', 'or', 'not'].includes(op)) return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300';
  if (['>', '<', '='].includes(op)) return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300';
  return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300';
}

export function OperatorMasterGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [currentExpIndex, setCurrentExpIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'playing' | 'success' | 'failure' | 'completed'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  const currentExp = expressions[currentExpIndex];

  const handleDragStart = (e: React.DragEvent, op: string) => {
    e.dataTransfer.setData('text/plain', op);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (status !== 'playing') return;
    const op = e.dataTransfer.getData('text/plain');
    setSlot(op);

    if (op === currentExp.correctOp) {
      setXp(prev => prev + 100);
      if (currentExpIndex === expressions.length - 1) {
        setStatus('success');
        setTimeout(() => {
          setStatus('completed');
          setShowConfetti(true);
        }, 1500);
      } else {
        setStatus('success');
        setTimeout(() => {
          setCurrentExpIndex(prev => prev + 1);
          setSlot(null);
          setStatus('playing');
        }, 1500);
      }
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
    setCurrentExpIndex(0);
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
            <span className="gradient-text">Operator Master</span>
          </h2>
          <p className="text-xl font-bold text-emerald-500 mb-4">Level 8 : Math Wizard</p>

          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white dark:bg-gray-800 px-6 py-2 rounded-full border-2 border-emerald-500/20 shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">XP:</span>
              <span className="font-bold text-emerald-500">{xp}</span>
            </div>
            {status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-6 py-2 rounded-full font-bold border-2 border-yellow-400"
              >
                🏆 Math Wizard Badge Earned!
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
              তুমি 🏆 Math Wizard ব্যাজ এবং {xp} XP পেয়েছ!
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
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Expression {currentExpIndex + 1} of {expressions.length}
              </h3>
              <div className="flex gap-1">
                {expressions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < currentExpIndex
                        ? 'bg-green-500'
                        : i === currentExpIndex
                        ? 'bg-emerald-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Operator Palette */}
            <div className="flex justify-center flex-wrap gap-3 mb-10">
              {availableOperators.map(op => (
                <div
                  key={op}
                  draggable={status === 'playing'}
                  onDragStart={e => handleDragStart(e, op)}
                  className={`px-4 py-2 rounded-lg font-mono text-xl font-bold border-2 shadow-sm select-none transition-transform ${
                    status === 'playing'
                      ? 'cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95'
                      : 'cursor-not-allowed opacity-40'
                  } ${getBlockStyle(op)}`}
                >
                  {op}
                </div>
              ))}
            </div>

            {/* Expression Workspace */}
            <div className="flex justify-center items-center gap-4 bg-gray-100 dark:bg-gray-900 p-8 rounded-xl min-h-[160px] flex-wrap">
              {/* Left operand */}
              <div className="px-5 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-mono text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentExp.left}
              </div>

              {/* Drop slot */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`w-28 h-16 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
                  slot
                    ? 'border-transparent'
                    : 'border-gray-400 dark:border-gray-500 bg-white/50 dark:bg-gray-800 hover:border-emerald-500 hover:bg-emerald-500/5'
                }`}
              >
                {slot ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-full h-full flex items-center justify-center rounded-xl font-mono text-xl font-bold border-2 shadow-sm ${getBlockStyle(slot)}`}
                  >
                    {slot}
                  </motion.div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 text-sm text-center leading-tight px-2">
                    Drop operator here
                  </span>
                )}
              </div>

              {/* Right operand */}
              <div className="px-5 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-mono text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentExp.right}
              </div>

              {/* Result (shown on success) */}
              {currentExp.result && status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-5 py-3 bg-accent/10 border-2 border-accent rounded-lg font-mono text-2xl font-bold text-emerald-500"
                >
                  {currentExp.result}
                </motion.div>
              )}
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
                  <p className="text-red-500 font-bold text-xl mb-4">❌ হিসাব ভুল হয়েছে</p>
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
                  <p className="text-green-500 font-bold text-xl">✅ সঠিক উত্তর!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}
      </div>
    </section>
  );
}
