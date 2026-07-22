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

interface StoryStep {
  id: number;
  text: string;
  icon?: string;
}

interface StorySectionProps {
  storySteps: StoryStep[];
  storyQuestion: string;
  correctOrder: string[];
  badOrderMessage: string;
  goodOrderMessage: string;
  title?: string;
  usePictureCards?: boolean;
}

export function StorySection({
  storySteps,
  storyQuestion,
  correctOrder,
  badOrderMessage,
  goodOrderMessage,
  title = 'বাস্তব উদাহরণ',
  usePictureCards = false,
}: StorySectionProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<'story' | 'question' | 'result'>('story');
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<string[]>(() =>
    [...correctOrder].sort(() => Math.random() - 0.5)
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleNext = useCallback(() => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setPhase('question');
    }
  }, [currentStep, storySteps.length]);

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
    setIsCorrect(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const correct = items.every((item, i) => item === correctOrder[i]);
    setIsCorrect(correct);
    setPhase('result');
  }, [items, correctOrder]);

  const handleRetry = useCallback(() => {
    setItems([...correctOrder].sort(() => Math.random() - 0.5));
    setIsCorrect(null);
    setPhase('question');
  }, [correctOrder]);

  const step = storySteps[currentStep];

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">{title}</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <Card className="mb-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">{step.icon || '📖'}</div>
                <p className="text-2xl font-bold text-text dark:text-text-dark">
                  {step.text}
                </p>
                <p className="text-muted dark:text-muted-dark mt-2 text-sm">
                  ধাপ {currentStep + 1} / {storySteps.length}
                </p>
              </Card>

              {currentStep > 0 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {storySteps.slice(0, currentStep + 1).map((s, i) => (
                    <motion.div
                      key={s.id}
                      className="w-3 h-3 rounded-full bg-primary"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}

              <Button onClick={handleNext} size="lg">
                {currentStep < storySteps.length - 1
                  ? 'পরবর্তী →'
                  : 'এখন ভেবে দেখো →'}
              </Button>
            </motion.div>
          )}

          {phase === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="mb-8">
                <p className="text-lg font-semibold text-text dark:text-text-dark mb-6 text-center">
                  {storyQuestion}
                </p>
                <p className="text-sm text-muted dark:text-muted-dark mb-4 text-center">
                  {usePictureCards ? 'ছবিগুলো সঠিক ক্রমে সাজাও:' : 'নিচের কার্ডগুলো সঠিক ক্রমে সাজাও:'}
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
                          isCorrect={
                            isCorrect !== null
                              ? item === correctOrder[i]
                              : null
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="ghost" onClick={handleRetry}>
                    এলোমেলো করো
                  </Button>
                  <Button onClick={handleSubmit} variant="primary">
                    জমা দাও
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <Card
                highlighted={isCorrect === true}
                className={`max-w-lg mx-auto ${
                  isCorrect === false ? 'border-danger' : ''
                }`}
              >
                {isCorrect ? (
                  <div className="text-center">
                    <motion.div
                      className="text-6xl mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                      transition={{ type: 'spring' }}
                    >
                      ✅
                    </motion.div>
                    <p className="text-xl font-bold text-success">
                      {goodOrderMessage}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <motion.div
                      className="text-6xl mb-4"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      ❌
                    </motion.div>
                    <p className="text-xl font-bold text-danger">
                      {badOrderMessage}
                    </p>
                    <div className="mt-6">
                      <Button onClick={handleRetry} variant="danger">
                        আবার চেষ্টা করো
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
