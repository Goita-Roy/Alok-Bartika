import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export interface StoryStep {
  id: number;
  text: string;
  icon?: string;
}

interface ReadingStoryProps {
  storySteps: StoryStep[];
  storyQuestion: string;
}

/**
 * Prop-driven story renderer. IntermediateCoursePage passes `storySteps` /
 * `storyQuestion`; the number of steps comes from the lesson data.
 */
export function ReadingStory({ storySteps, storyQuestion }: ReadingStoryProps) {
  const { ref, isVisible } = useScrollAnimation();
  const steps = storySteps && storySteps.length > 0 ? storySteps : [];
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  // Reset navigation when the resolved step count changes (e.g. on lesson
  // switch), otherwise currentStep can fall out of bounds and render an
  // empty/undefined step.
  useEffect(() => {
    setCurrentStep(0);
    setDone(false);
  }, [steps.length]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setDone(true);
    }
  }, [currentStep, steps.length]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setDone(false);
  }, []);

  const step = steps[currentStep];

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <Card className="mb-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">{step?.icon || '📖'}</div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {step?.text}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  ধাপ {currentStep + 1} / {steps.length}
                </p>
              </Card>

              {currentStep > 0 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {steps.slice(0, currentStep + 1).map((s, i) => (
                    <motion.div
                      key={s.id}
                      className="w-3 h-3 rounded-full bg-emerald-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
              )}

              <Button onClick={handleNext} size="lg">
                {currentStep < steps.length - 1 ? 'পরবর্তী →' : 'এখন ভেবে দেখো →'}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <Card highlighted className="max-w-lg mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, -10, 10, 0] }} transition={{ type: 'spring' }}>
                  🤔
                </motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  {storyQuestion}
                </p>
                <Button onClick={handleReset} variant="ghost">
                  আবার দেখুন
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
