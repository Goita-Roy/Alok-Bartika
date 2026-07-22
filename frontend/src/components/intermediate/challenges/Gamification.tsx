import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DraggableCard } from '../ui/DraggableCard';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { lessonData } from '../../../data/intermediateLessonData';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Gamification() {
  const { ref, isVisible } = useScrollAnimation();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [items, setItems] = useState<string[]>(() => []);
  const [status, setStatus] = useState<'playing' | 'success' | 'failure'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());


  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const level = lessonData.gamification.levels[currentLevel];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Timer effect
  useEffect(() => {
    if (!gameStarted || status !== 'playing') return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, status]);

  const startLevel = useCallback(() => {
    const levelData = lessonData.gamification.levels[currentLevel];
    setItems(shuffleArray(levelData.steps.map((s) => s.text)));
    setStatus('playing');
    setAttempts(0);
    // setStartTime(Date.now());
    setTimer(0);
    setGameStarted(true);
  }, [currentLevel]);

  useEffect(() => {
    startLevel();
  }, [startLevel]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const newItems = [...prev];
        [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
        return newItems;
      });
    },
    []
  );

  const handleSubmit = useCallback(() => {
    const correctOrder = level.steps.map((s) => s.text);
    const isCorrect = items.every((item, i) => item === correctOrder[i]);

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (isCorrect) {
      const earnedStars = newAttempts === 1 ? 3 : newAttempts === 2 ? 2 : 1;
      const earnedXp = earnedStars === 3 ? 100 : earnedStars === 2 ? 75 : 50;

      setXp((prev) => prev + earnedXp);
      setStars(earnedStars);
      setStatus('success');
      setShowConfetti(true);
      setCompletedLevels((prev) => new Set(prev).add(currentLevel));

      setTimeout(() => setShowConfetti(false), 4000);
    } else {
      setStatus('failure');
      setXp((prev) => prev + 50);
    }
  }, [items, level.steps, attempts, currentLevel]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < lessonData.gamification.levels.length - 1) {
      setCurrentLevel((prev) => prev + 1);
      setStatus('playing');
      setAttempts(0);
    }
    setGameStarted(false);
  }, [currentLevel]);

  const handleRetry = useCallback(() => {
    startLevel();
  }, [startLevel]);

  const handleReset = useCallback(() => {
    setCurrentLevel(0);
    setXp(0);
    setCompletedLevels(new Set());
    setGameStarted(false);
  }, []);

  const totalLevels = lessonData.gamification.levels.length;
  const maxXp = totalLevels * 100;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <section
      ref={ref}
      className="py-20 px-4 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 relative"
    >
      <Confetti active={showConfetti} />

      <div className="max-w-3xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">গ্যামিফিকেশন</span>
        </motion.h2>

        {/* Game Header */}
        <Card className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                🎮 Algorithm Builder
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Level {currentLevel + 1} of {totalLevels}: {level.title}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
                ⏱ {formatTime(timer)}
              </span>
              <span className="text-lg font-bold text-emerald-500">
                ⭐ {stars}
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>XP: {xp}</span>
              <span>/{maxXp}</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(xp / maxXp) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Stars display */}
          <div className="flex justify-center gap-2 mb-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`text-2xl ${
                  completedLevels.has(currentLevel) && i < stars
                    ? 'text-emerald-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                animate={
                  completedLevels.has(currentLevel) && i < stars
                    ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                    : {}
                }
                transition={{ delay: i * 0.2 }}
              >
                ⭐
              </motion.div>
            ))}
          </div>

          {/* Level indicators */}
          <div className="flex justify-center gap-3 mb-4">
            {lessonData.gamification.levels.map((_, i) => (
              <motion.div
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  completedLevels.has(i)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : i === currentLevel
                    ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                {completedLevels.has(i) ? '✓' : i + 1}
              </motion.div>
            ))}
          </div>

          {/* Game Board */}
          <AnimatePresence mode="wait">
            {status === 'playing' && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                  সঠিক ক্রমে সাজাও:
                </p>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <DraggableCard
                          key={item}
                          id={item}
                          text={item}
                          index={i}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="ghost" onClick={startLevel}>
                    এলোমেলো করো
                  </Button>
                  <Button onClick={handleSubmit} variant="primary">
                    জমা দাও
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                  transition={{ type: 'spring' }}
                >
                  🎉
                </motion.div>
                <h4 className="text-2xl font-bold text-green-500 mb-2">
                  সঠিক উত্তর!
                </h4>
                <p className="text-lg text-gray-800 dark:text-gray-100 mb-4">
                  {attempts === 1 ? '★★★ 100 XP' : attempts === 2 ? '★★ 75 XP' : '★ 50 XP'}
                </p>
                <p className="text-emerald-500 font-bold mb-6">
                  🏆 Algorithm Master আনলক হয়েছে!
                </p>

                {/* Connected steps animation */}
                <div className="flex flex-col items-center gap-1 mb-6">
                  {level.steps.map((step, i) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <motion.div
                        className="px-6 py-2 bg-success text-white rounded-lg font-bold"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                      >
                        {step.text}
                      </motion.div>
                      {i < level.steps.length - 1 && (
                        <motion.div
                          className="h-6 w-0.5 bg-success"
                          initial={{ height: 0 }}
                          animate={{ height: 24 }}
                          transition={{ delay: i * 0.15 + 0.1 }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  {currentLevel < totalLevels - 1 ? (
                    <Button onClick={handleNextLevel} variant="primary" size="lg">
                      পরবর্তী Level →
                    </Button>
                  ) : (
                    <Button onClick={handleReset} variant="success" size="lg">
                      🏆 সব সম্পন্ন! আবার খেলো
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {status === 'failure' && (
              <motion.div
                key="failure"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  😅
                </motion.div>
                <h4 className="text-2xl font-bold text-red-500 mb-2">
                  ভুল ক্রম!
                </h4>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  "আবার চেষ্টা করো"
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  +50 XP (চেষ্টা করার জন্য)
                </p>

                {/* Highlight incorrect positions */}
                <div className="space-y-2 mb-6">
                  {items.map((item, i) => {
                    const correct = item === level.steps[i].text;
                    return (
                      <div
                        key={item}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                          !correct
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100">
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">
                          {item}
                        </span>
                        {!correct && (
                          <span className="text-red-500 text-sm ml-auto">✗</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-center gap-4">
                  <Button onClick={handleRetry} variant="danger">
                    আবার চেষ্টা করো
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}



