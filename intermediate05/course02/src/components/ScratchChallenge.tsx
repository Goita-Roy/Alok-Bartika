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
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DraggableCard } from './ui/DraggableCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type ChallengeStep = 'intro' | 'playing' | 'success' | 'failure';

const blocks = [
  'When Up Arrow Pressed ⬆️',
  'Move Up',
  'When Down Arrow Pressed ⬇️',
  'Move Down',
];

interface BlockPair {
  hat: string;
  motion: string;
}

const correctPairs: BlockPair[] = [
  { hat: 'When Up Arrow Pressed ⬆️', motion: 'Move Up' },
  { hat: 'When Down Arrow Pressed ⬇️', motion: 'Move Down' },
];

export function ScratchChallenge() {
  const { ref, isVisible } = useScrollAnimation();
  const [step, setStep] = useState<ChallengeStep>('intro');
  const [items, setItems] = useState<string[]>([...blocks]);
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

  const validate = useCallback(() => {
    // Check pairs: items[0] with items[1], items[2] with items[3]
    const pair1: BlockPair = { hat: items[0], motion: items[1] };
    const pair2: BlockPair = { hat: items[2], motion: items[3] };

    const isCorrect = correctPairs.some(
      (cp) => cp.hat === pair1.hat && cp.motion === pair1.motion
    ) && correctPairs.some(
      (cp) => cp.hat === pair2.hat && cp.motion === pair2.motion
    );

    setAttempts((prev) => prev + 1);
    if (isCorrect) {
      setStep('success');
    } else {
      setStep('failure');
    }
  }, [items]);

  const handleReset = useCallback(() => {
    setItems([...blocks]);
    setStep('playing');
  }, []);

  const handleUndo = useCallback(() => {
    setItems((prev) => [...prev]);
  }, []);

  const handleStart = useCallback(() => {
    setStep('playing');
  }, []);

  const handleRetry = useCallback(() => {
    setItems([...blocks]);
    setAttempts(0);
    setStep('intro');
  }, []);

  // Compute DraggableCard items with block colors
  const blockItems = useMemo(
    () =>
      items.map((text) => ({
        id: text,
        text,
        isHat: text.startsWith('When'),
        isMotion: text.startsWith('Move'),
      })),
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
                <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-4">চূড়ান্ত চ্যালেঞ্জ</h3>
                <div className="space-y-4 text-left mb-6">
                  <div className="bg-primary/10 border-2 border-primary rounded-xl p-4">
                    <p className="font-bold text-text dark:text-text-dark mb-2">📋 Task:</p>
                    <ul className="list-disc pl-5 space-y-2 text-muted dark:text-muted-dark">
                      <li>Up Arrow চাপলে Sprite উপরে উঠবে (Move Up)</li>
                      <li>Down Arrow চাপলে Sprite নিচে নামবে (Move Down)</li>
                      <li>৪টি ব্লককে সঠিক ক্রমে সাজাও</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl p-4">
                    <p className="font-bold text-text dark:text-text-dark">💡 ইঙ্গিত:</p>
                    <p className="text-muted dark:text-muted-dark">Hat Block (When...) সবসময় উপরে থাকে</p>
                  </div>
                </div>
                <Button onClick={handleStart} size="lg" variant="primary">চ্যালেঞ্জ শুরু করো →</Button>
              </Card>
            </motion.div>
          )}

          {step === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">ব্লকগুলো সঠিক ক্রমে সাজাও</h3>

                {/* Workspace */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-4 min-h-[220px]">
                  <div className="text-xs text-muted dark:text-muted-dark font-bold mb-4">Workspace</div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={blockItems.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0">
                        {blockItems.map((block, i) => (
                          <div key={block.id} className="flex flex-col items-center w-full">
                            {i > 0 && <motion.div className="h-2 w-0.5 bg-gray-400" />}
                            <DraggableCard id={block.id} text={block.text} index={i} />
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
                  <Button variant="primary" onClick={validate} size="lg">জমা দাও</Button>
                </div>
                <p className="text-center text-xs text-muted dark:text-muted-dark mt-4">প্রচেষ্টা: {attempts}</p>
              </Card>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card highlighted>
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }} transition={{ type: 'spring' }}>🏆🎉</motion.div>
                <h3 className="text-3xl font-bold text-success mb-4">অভিনন্দন!</h3>
                <p className="text-lg text-text dark:text-text-dark mb-6">তুমি {attempts} প্রচেষ্টায় চ্যালেঞ্জটি সম্পন্ন করেছ!</p>
                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg text-sm">When Up Arrow Pressed ⬆️</div>
                    <div className="px-4 py-2 bg-blue-400 text-white font-bold rounded-lg text-sm">Move Up</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg text-sm">When Down Arrow Pressed ⬇️</div>
                    <div className="px-4 py-2 bg-blue-400 text-white font-bold rounded-lg text-sm">Move Down</div>
                  </div>
                </div>
                <Button onClick={handleRetry} variant="ghost">আবার খেলো</Button>
              </Card>
            </motion.div>
          )}

          {step === 'failure' && (
            <motion.div key="failure" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <motion.div className="text-6xl mb-4" animate={{ rotate: [0, 5, -5, 5, 0] }}>🤔</motion.div>
                <h3 className="text-2xl font-bold text-danger mb-4">সম্পূর্ণ সঠিক নয়</h3>
                <p className="text-muted dark:text-muted-dark mb-2">প্রতিটি Hat Block-এর নিচে সঠিক Motion Block বসাও।</p>
                <p className="text-sm text-muted dark:text-muted-dark mb-6">প্রচেষ্টা: {attempts}</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={handleReset} variant="ghost">পুনরায় সাজাও</Button>
                  <Button onClick={validate} variant="primary">আবার জমা দাও</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
