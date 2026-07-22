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
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DraggableCard } from './ui/DraggableCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase = 'phase1' | 'phase1-sprite' | 'phase1-hat' | 'phase1-block' | 'phase1-connect' | 'phase1-flag' | 'phase2' | 'phase2-submit' | 'done';

export function ScratchScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('phase1');
  const [spriteMoved, setSpriteMoved] = useState(false);
  const [items, setItems] = useState<string[]>([
    'move 10 steps',
    'When Green Flag Clicked',
  ]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handlePhase1Next = useCallback(() => {
    const flow: Phase[] = ['phase1', 'phase1-sprite', 'phase1-hat', 'phase1-block', 'phase1-connect', 'phase1-flag'];
    const idx = flow.indexOf(phase);
    if (idx < flow.length - 1) {
      setPhase(flow[idx + 1]);
    } else {
      setPhase('phase2');
    }
  }, [phase]);

  const handleFlagClick = useCallback(() => {
    setSpriteMoved(true);
    setTimeout(() => {
      handlePhase1Next();
    }, 2000);
  }, [handlePhase1Next]);

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
    const correct = items[0] === 'When Green Flag Clicked' && items[1] === 'move 10 steps';
    setIsCorrect(correct);
    setSubmitted(true);
  }, [items]);

  const handleRetry = useCallback(() => {
    setItems(['move 10 steps', 'When Green Flag Clicked']);
    setSubmitted(false);
    setIsCorrect(false);
  }, []);

  const handleComplete = useCallback(() => {
    setPhase('done');
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {/* Phase 1: Step by step guide */}
          {phase === 'phase1' && (
            <motion.div key="p1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">Watch & Learn</h3>
                <div className="space-y-4">
                  <motion.div className="p-6 bg-primary/10 border-2 border-primary rounded-xl">
                    <p className="text-lg font-bold text-text dark:text-text-dark">আমরা দেখবো কিভাবে Scratch-এ Event Block ব্যবহার করতে হয়</p>
                  </motion.div>
                </div>
                <div className="mt-6">
                  <Button onClick={handlePhase1Next} size="lg">শুরু করি →</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-sprite' && (
            <motion.div key="p1s" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">Step 1</h3>
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-4">
                  <motion.div className="text-7xl" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    🐱
                  </motion.div>
                  <p className="text-sm text-muted dark:text-muted-dark mt-2">Scratch Sprite</p>
                </div>
                <Button onClick={handlePhase1Next} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-hat' && (
            <motion.div key="p1h" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">Step 2</h3>
                <div className="flex justify-center mb-4">
                  <motion.div
                    className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md text-center inline-block"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-xs text-gray-600 mb-1">Event</div>
                    When Green Flag Clicked 🚩
                  </motion.div>
                </div>
                <p className="text-center text-sm text-muted dark:text-muted-dark mb-4">Hat Block — ইভেন্ট ব্লকটি টেনে আনো</p>
                <div className="text-center">
                  <Button onClick={handlePhase1Next} size="lg">টেনে আনলাম →</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-block' && (
            <motion.div key="p1b" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">Step 3</h3>
                <div className="flex flex-col items-center gap-2 mb-4">
                  <motion.div className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md text-center">
                    When Green Flag Clicked 🚩
                  </motion.div>
                  <motion.div className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    move 10 steps ➡️
                  </motion.div>
                </div>
                <p className="text-center text-sm text-muted dark:text-muted-dark mb-4">Motion Block — নিচে যোগ করো</p>
                <div className="text-center">
                  <Button onClick={handlePhase1Next} size="lg">যোগ করলাম →</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-connect' && (
            <motion.div key="p1c" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">Step 4</h3>
                <div className="flex flex-col items-center gap-0 mb-4">
                  <motion.div className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md text-center">
                    When Green Flag Clicked 🚩
                  </motion.div>
                  <motion.div className="h-4 w-0.5 bg-yellow-500" initial={{ height: 0 }} animate={{ height: 8 }} />
                  <motion.div className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md text-center">
                    move 10 steps ➡️
                  </motion.div>
                </div>
                <p className="text-center text-sm text-green-600 font-bold mb-4">✓ ব্লক দুটি অটোমেটিক কানেক্ট হলো!</p>
                <div className="text-center">
                  <Button onClick={handlePhase1Next} size="lg">চলো দেখি →</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-flag' && (
            <motion.div key="p1f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4">Step 5</h3>
                <div className="bg-gradient-to-b from-blue-200 to-blue-100 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 mb-4 relative overflow-hidden">
                  <motion.div
                    className="text-7xl"
                    animate={spriteMoved ? { x: 80 } : { x: 0 }}
                    transition={{ duration: 1, type: 'spring' }}
                  >
                    🐱
                  </motion.div>
                  {!spriteMoved && (
                    <motion.button
                      className="absolute top-2 right-4 text-3xl"
                      onClick={handleFlagClick}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🚩
                    </motion.button>
                  )}
                  {spriteMoved && (
                    <motion.div className="mt-4 text-green-600 font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      ✓ Sprite 10 steps সরেছে!
                    </motion.div>
                  )}
                </div>
                {!spriteMoved && <p className="text-sm text-muted dark:text-muted-dark mb-4">Green Flag 🚩 এ ক্লিক করো</p>}
                {spriteMoved && (
                  <Button onClick={handlePhase1Next} size="lg">নিজে করো →</Button>
                )}
              </Card>
            </motion.div>
          )}

          {/* Phase 2: Try Yourself */}
          {phase === 'phase2' && (
            <motion.div key="p2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Card>
                <h3 className="text-xl font-bold text-text dark:text-text-dark mb-4 text-center">তুমি নিজে করো (Try Yourself)</h3>

                {/* Workspace */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6 min-h-[160px]">
                  <div className="text-xs text-muted dark:text-muted-dark font-bold mb-4">Workspace</div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                      <div className="space-y-0">
                        {items.map((item, i) => (
                          <div key={item} className="flex flex-col items-center">
                            {i === 0 ? (
                              <div className="flex items-center gap-2 w-full max-w-sm">
                                <DraggableCard id={item} text={item} index={i} />
                              </div>
                            ) : (
                              <>
                                <motion.div className="h-3 w-0.5 bg-gray-400" />
                                <div className="flex items-center gap-2 w-full max-w-sm">
                                  <DraggableCard id={item} text={item} index={i} />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                  <Button variant="ghost" onClick={handleRetry}>পুনরায় সাজাও</Button>
                  <Button onClick={handleSubmit} variant="primary">জমা দাও</Button>
                </div>

                {submitted && (
                  <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {isCorrect ? (
                      <div>
                        <p className="text-success font-bold text-lg mb-4">✓ সঠিক! ব্লক দুটি সঠিকভাবে সংযুক্ত!</p>
                        <div className="flex flex-col items-center gap-0 mb-4">
                          <div className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-t-2xl rounded-b-lg shadow-md">When Green Flag Clicked 🚩</div>
                          <div className="h-3 w-0.5 bg-yellow-500" />
                          <div className="px-6 py-3 bg-blue-400 text-white font-bold rounded-lg shadow-md">move 10 steps ➡️</div>
                        </div>
                        <Button onClick={handleComplete} variant="primary">পরবর্তী →</Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-danger font-bold text-lg mb-4">✗ ক্রমটি সঠিক নয়। Hat Block উপরে রাখো।</p>
                        <Button onClick={handleRetry} variant="danger">আবার চেষ্টা করো</Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-text dark:text-text-dark">তুমি ইভেন্ট ব্লক ব্যবহার করতে শিখেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
