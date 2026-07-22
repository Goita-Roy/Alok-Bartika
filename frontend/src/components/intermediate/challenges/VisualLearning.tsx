import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';
import { lessonData as defaultLessonData } from '../../../data/intermediateLessonData';

interface VisualLearningProps {
  visualSteps?: { id: number; label: string; icon: string }[];
  recipeComparison?: { text: string };
}

export function VisualLearning({ visualSteps, recipeComparison }: VisualLearningProps = {}) {
  const { ref, isVisible } = useScrollAnimation();
  const steps = visualSteps || defaultLessonData.visualSteps;
  const recipe = recipeComparison || defaultLessonData.recipeComparison;
  const [clickedSteps, setClickedSteps] = useState<Set<number>>(new Set());
  const [showRecipe, setShowRecipe] = useState(false);

  const handleStepClick = useCallback(
    (id: number) => {
      setClickedSteps((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      if (clickedSteps.size === steps.length - 1) {
        setTimeout(() => setShowRecipe(true), 500);
      }
    },
    [clickedSteps.size, steps.length]
  );

  const allClicked = clickedSteps.size === steps.length;

  return (
    <section
      ref={ref}
      className="py-20 px-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="max-w-4xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
        </motion.h2>

        {/* Connected blocks */}
        <div className="flex flex-col items-center gap-0 mb-12">
          {steps.map((step, i) => {
            const isClicked = clickedSteps.has(step.id) || allClicked;
            const isLast = i === steps.length - 1;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.button
                  onClick={() => !isClicked && handleStepClick(step.id)}
                  className={`
                    w-40 h-16 rounded-xl font-bold text-lg
                    flex items-center justify-center gap-3
                    transition-all duration-500
                    ${
                      isClicked
                        ? step.id === 1 || step.id === 5
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                          : step.id === 2
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/30 scale-110'
                          : step.id === 3
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                          : 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 scale-110'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-600 hover:border-emerald-500 cursor-pointer'
                    }
                  `}
                  initial={{ opacity: 0, x: -50 }}
                  animate={
                    isVisible
                      ? {
                          opacity: 1,
                          x: 0,
                          scale: isClicked ? 1.1 : 1,
                        }
                      : {}
                  }
                  transition={{ delay: i * 0.15, type: 'spring' }}
                  whileHover={!isClicked ? { scale: 1.05 } : {}}
                  whileTap={!isClicked ? { scale: 0.95 } : {}}
                >
                  <span>{step.icon}</span>
                  <span>{step.label}</span>
                </motion.button>

                {!isLast && (
                  <motion.div
                    className="h-8 w-0.5 bg-gray-300 dark:bg-gray-600 my-1"
                    initial={{ height: 0 }}
                    animate={
                      isVisible && allClicked
                        ? { height: 32 }
                        : isVisible
                        ? { height: 32 }
                        : {}
                    }
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                  >
                    <motion.div
                      className="w-full h-full bg-gradient-to-b from-emerald-500 to-sky-500"
                      initial={{ scaleY: 0 }}
                      animate={allClicked ? { scaleY: 1 } : {}}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                      style={{ transformOrigin: 'top' }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {showRecipe && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6 }}
            >
              <Card highlighted className="max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0">🍰</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      রান্নার রেসিপির মতো অ্যালগরিদম
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                      {recipe.text}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}




