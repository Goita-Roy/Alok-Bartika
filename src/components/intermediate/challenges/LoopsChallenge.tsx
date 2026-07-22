import { useState, useCallback, useMemo } from 'react';
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

const defaultItems = ['Forever', 'Move'];

const correctOrder = ['Forever', 'Move'];

type Step = 'intro' | 'playing' | 'success' | 'failure';

export function LoopsChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const [step, setStep] = useState<Step>('intro');
  const [items, setItems] = useState<string[]>([...defaultItems]);
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
      if (oldIndex === -1 || newIndex === -1) return prev;
      const newItems = [...prev];
      [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
      return newItems;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setAttempts((prev) => prev + 1);
    const isCorrect = items.every((item, i) => item === correctOrder[i]);
    setStep(isCorrect ? 'success' : 'failure');
  }, [items]);

  const handleReset = useCallback(() => {
    setItems([...defaultItems]);
    setStep('playing');
  }, []);

  const handleUndo = useCallback(() => {
    setItems((prev) => [...prev]);
  }, []);

  const handleStart = useCallback(() => {
    setStep('playing');
    setItems([...defaultItems]);
    setAttempts(0);
  }, []);

  const handleRetry = useCallback(() => {
    setItems([...defaultItems]);
    setAttempts(0);
    setStep('intro');
  }, []);

  const blockItems = useMemo(
    () => items.map((text, i) => ({ id: text, text, index: i })),
    [items]
  );

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">চ্যালেঞ্জ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🏆</motion.div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">চ্যালেঞ্জ</h3>
                <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4 mb-6">
                  <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">📋 Task:</p>
                  <p className="text-gray-500 dark:text-gray-400">একটি স্প্রাইটকে স্ক্রিনের বাম থেকে ডানে আজীবন বা চিরকাল হাঁটাতে হবে।</p>
                </div>
                <div className="text-left mb-6 space-y-2 text-gray-500 dark:text-gray-400">
                  <p>📦 উপলব্ধ ব্লক:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Forever ♾️</li>
                    <li>Move 🐱</li>
                  </ul>
                </div>
                <Button onClick={handleStart} size="lg" variant="primary">চ্যালেঞ্জ শুরু করো →</Button>
              </Card>
            </motion.div>
          )}

          {(step === 'playing' || step === 'failure') && (
            <motion.div key="playing" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">ব্লকগুলো সঠিক ক্রমে সাজাও</h3>

                {/* Forever block visual */}
                <div className="flex justify-center mb-6">
                  <div className="border-4 border-purple-400 rounded-2xl p-6 pt-10 bg-purple-50 dark:bg-purple-900/20 min-w-[140px]">
                    <div className="absolute -mt-8 ml-1 text-purple-600 font-bold text-sm">Forever ♾️</div>
                    <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
                      🐱 Move
                    </div>
                  </div>
                </div>

                {/* Workspace */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4 min-h-[140px]">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-4">Workspace</div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blockItems.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0">
                        {blockItems.map((block, i) => (
                          <div key={block.id} className="flex flex-col items-center w-full">
                            {i > 0 && <motion.div className="h-3 w-0.5 bg-gray-400" />}
                            <motion.div
                              initial={step === 'failure' ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                              animate={step === 'failure' ? { x: 0 } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <DraggableCard id={block.id} text={block.text} index={block.index} />
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 flex-wrap">
                  <Button variant="ghost" onClick={handleUndo}>↩ Undo</Button>
                  <Button variant="ghost" onClick={handleReset}>⟲ Reset</Button>
                  <Button variant="primary" onClick={handleSubmit} size="lg">জমা দাও</Button>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">প্রচেষ্টা: {attempts}</p>

                {step === 'failure' && (
                  <motion.div className="mt-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <p className="text-red-500 font-bold">❌ সঠিক নয়। আবার চেষ্টা করো।</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card highlighted>
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }} transition={{ type: 'spring' }}>🏆🎉</motion.div>
                <h3 className="text-3xl font-bold text-green-500 mb-4">অভিনন্দন!</h3>
                <p className="text-lg text-gray-800 dark:text-gray-100 mb-6">তুমি {attempts} প্রচেষ্টায় চ্যালেঞ্জটি সম্পন্ন করেছ!</p>
                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="px-6 py-3 bg-purple-500 text-white font-bold rounded-t-2xl rounded-b-lg shadow-md">Forever ♾️</div>
                  <div className="h-3 w-0.5 bg-purple-400" />
                  <div className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md">Move 🐱</div>
                </div>
                <Button onClick={handleRetry} variant="ghost">আবার খেলো</Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}



