import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DraggableCard } from '../ui/DraggableCard';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface ChallengeStep {
  id: string;
  text: string;
}

interface ChallengeProps {
  title: string;
  task: string;
  steps: ChallengeStep[];
  isFlowchart?: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Challenge({ title, task, steps, isFlowchart = false }: ChallengeProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [items, setItems] = useState<string[]>(() =>
    shuffleArray(steps.map((s) => s.text))
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const newItems = [...prev];
      [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
      return newItems;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const correctOrder = steps.map((s) => s.text);
    const correct = items.every((item, i) => item === correctOrder[i]);
    setIsCorrect(correct);
    setSubmitted(true);
    setAttempts((prev) => prev + 1);
  }, [items, steps]);

  const handleRetry = useCallback(() => {
    setItems(shuffleArray(steps.map((s) => s.text)));
    setSubmitted(false);
    setIsCorrect(false);
  }, [steps]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">চ্যালেঞ্জ</span>
        </motion.h2>

        <Card className="border-2 border-accent shadow-2xl shadow-emerald-500/10">
          <div className="text-center mb-8">
            <motion.div
              className="inline-block px-6 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-full text-sm mb-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: 'spring' }}
            >
              🎯 মিশন
            </motion.div>
            <motion.h3
              className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-lg text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              {task}
            </motion.p>
          </div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
                  {isFlowchart ? 'ফ্লোচার্টের ধাপগুলো সঠিক ক্রমে সাজাও:' : 'নিচের কার্ডগুলো সঠিক ক্রমে সাজাও:'}
                </p>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {items.map((item, i) => (
                        <DraggableCard key={item} id={item} text={item} index={i} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="ghost" onClick={handleRetry}>এলোমেলো করো</Button>
                  <Button onClick={handleSubmit} variant="primary" size="lg">জমা দাও</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
                {isCorrect ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-2xl font-bold text-green-500 mb-2">Completed!</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {attempts === 1 ? '★★★ প্রথম চেষ্টায় সঠিক!' : attempts === 2 ? '★★ দ্বিতীয় চেষ্টায় সঠিক!' : '★ সঠিক!'}
                    </p>
                    <Button onClick={handleRetry} variant="ghost">আবার চেষ্টা করো</Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <div className="text-6xl mb-4">💪</div>
                    <h4 className="text-2xl font-bold text-red-500 mb-2">Try Again</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">ক্রমটি সঠিক নয়। আবার চেষ্টা করো।</p>
                    <Button onClick={handleRetry} variant="danger" size="lg">আবার চেষ্টা করো</Button>
                  </motion.div>
                )}

                <div className="mt-6 space-y-2">
                  {items.map((item, i) => {
                    const correct = item === steps[i].text;
                    return (
                      <div key={item} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${correct ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${correct ? 'bg-success text-white' : 'bg-danger text-white'}`}>{i + 1}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{item}</span>
                        {correct ? <span className="text-green-500 ml-auto">✓</span> : <span className="text-red-500 ml-auto">✗</span>}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}



