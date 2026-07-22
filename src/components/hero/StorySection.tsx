import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../intermediate/ui/Card';
import { Button } from '../intermediate/ui/Button';
import { DraggableCard } from '../intermediate/ui/DraggableCard';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface StoryStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  correctOrder: number;
}

const storySteps: StoryStep[] = [
  {
    id: 'step1',
    icon: '📝',
    title: 'টাস্ক বুঝা',
    description: 'প্রথমে বুঝতে হবে কী করতে হবে',
    correctOrder: 1,
  },
  {
    id: 'step2',
    icon: '📥',
    title: 'ইনপুট নেয়া',
    description: 'প্রয়োজনীয় ডাটা সংগ্রহ করা',
    correctOrder: 2,
  },
  {
    id: 'step3',
    icon: '⚙️',
    title: 'স্টেপ বাই স্টেপ নির্দেশনা',
    description: 'ধাপে ধাপে সমাধানের পথ নির্ধারণ',
    correctOrder: 3,
  },
  {
    id: 'step4',
    icon: '🔀',
    title: 'ডিসিশন ও শর্ত',
    description: 'প্রয়োজনে সিদ্ধান্ত নেয়া',
    correctOrder: 4,
  },
  {
    id: 'step5',
    icon: '📤',
    title: 'আউটপুট',
    description: 'ফলাফল উপস্থাপন',
    correctOrder: 5,
  },
];

const correctOrder = ['step1', 'step2', 'step3', 'step4', 'step5'];

const storyQuestions = [
  {
    question: 'অ্যালগরিদম কী?',
    options: ['একটি এলোমেলো প্রক্রিয়া', 'ধাপে ধাপে সমাধানের পদ্ধতি', 'শুধু কোডিং', 'হার্ডওয়্যার'],
    correct: 1,
  },
  {
    question: 'ফ্লোচার্টে ডিম্বাকৃতি (oval) কী বোঝায়?',
    options: ['প্রসেস', 'ডিসিশন', 'স্টার্ট/এন্ড', 'ইনপুট/আউটপুট'],
    correct: 2,
  },
  {
    question: 'ফ্লোচার্ট ব্যবহার করা হয় কেন?',
    options: ['প্রোগ্রাম দ্রুত করার জন্য', 'ভিজ্যুয়ালি বোঝার জন্য', 'স্টোরেজ বাড়ানোর জন্য', 'নেটওয়ার্কের জন্য'],
    correct: 1,
  },
];

type QuizCardProps = {
  question: { question: string; options: string[]; correct: number };
  questionIndex: number;
  answered: number | null;
  onAnswer: (index: number) => void;
};

function QuizCard({ question, questionIndex, answered, onAnswer }: QuizCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
      <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">
        প্রশ্ন {questionIndex + 1}: {question.question}
      </h4>
      <div className="space-y-3">
        {question.options.map((option, optIndex) => {
          const isCorrect = optIndex === question.correct;
          const isSelected = answered === optIndex;
          const showResult = answered !== null;

          let borderColor = 'border-gray-200 dark:border-gray-600';
          let bgColor = 'bg-white dark:bg-gray-800';
          let textColor = 'text-gray-800 dark:text-gray-100';
          if (showResult && isCorrect) {
            borderColor = 'border-emerald-500';
            bgColor = 'bg-emerald-50 dark:bg-emerald-500/10';
            textColor = 'text-emerald-500';
          } else if (showResult && isSelected && !isCorrect) {
            borderColor = 'border-red-500';
            bgColor = 'bg-red-50 dark:bg-red-500/10';
            textColor = 'text-red-500';
          }

          return (
            <motion.button
              key={optIndex}
              onClick={() => answered === null && onAnswer(optIndex)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${borderColor} ${bgColor} ${textColor}`}
              whileHover={answered === null ? { scale: 1.02, x: 4 } : {}}
              whileTap={answered === null ? { scale: 0.98 } : {}}
              disabled={answered !== null}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  showResult && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : showResult && isSelected && !isCorrect
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + optIndex)}
                </span>
                <span className="font-semibold">{option}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SortableStepCard({ step }: { step: StoryStep }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? 'opacity-50 shadow-lg scale-105' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <span className="text-2xl">{step.icon}</span>
      <div>
        <div className="font-bold text-gray-800 dark:text-gray-100">{step.title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{step.description}</div>
      </div>
    </div>
  );
}

export default function StorySection() {
  const [items, setItems] = useState<string[]>(() => {
    const shuffled = [...correctOrder];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState<(number | null)[]>(storyQuestions.map(() => null));
  const [quizComplete, setQuizComplete] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev as string[], oldIndex, newIndex);
      });
      setIsCorrect(null);
    }
  };

  const checkOrder = () => {
    const isMatch = items.every((id, index) => id === correctOrder[index]);
    setIsCorrect(isMatch);
    if (isMatch) {
      setCurrentQuestion(0);
    }
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);

    if (newAnswers.every((a) => a !== null)) {
      setTimeout(() => setQuizComplete(true), 1000);
    } else {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 1500);
    }
  };

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="max-w-4xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">রিয়েল লাইফ স্টোরি</span>
        </motion.h2>
        <motion.p
          className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
        >
          সকালে ঘুম থেকে ওঠা থেকে স্কুলে যাওয়া — প্রতিদিনের কাজগুলোও আসলে ছোট ছোট অ্যালগরিদম!
          নিচের স্টেপগুলো সঠিক ক্রমে সাজাও।
        </motion.p>

        {/* Drag-and-Drop Story */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            🎯 সঠিক ক্রমে সাজাও
          </h3>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((id) => (
                  <SortableStepCard key={id} step={storySteps.find((s) => s.id === id)!} />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex items-center justify-between mt-6">
            <Button onClick={checkOrder} variant="primary">
              ✅ চেক করো
            </Button>
            {isCorrect !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`font-bold text-lg flex items-center gap-2 ${
                  isCorrect ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {isCorrect ? (
                  <>🎉 ঠিক আছে! এখন কুইজ খেলো!</>
                ) : (
                  <>❌ ভুল ক্রম! আবার চেষ্টা করো</>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quiz Section */}
        <AnimatePresence mode="wait">
          {currentQuestion >= 0 && !quizComplete && (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                📝 কুইজ টাইম!
              </h3>
              <QuizCard
                question={storyQuestions[currentQuestion]}
                questionIndex={currentQuestion}
                answered={answers[currentQuestion]}
                onAnswer={(optIndex) => handleAnswer(currentQuestion, optIndex)}
              />
              <div className="flex justify-center gap-2 mt-4">
                {storyQuestions.map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      answers[i] !== null
                        ? answers[i] === storyQuestions[i].correct
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                        : i === currentQuestion
                        ? 'bg-emerald-500 scale-125'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Message */}
        <AnimatePresence>
          {quizComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Card highlighted className="text-center">
                <motion.div
                  className="text-6xl mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  🏆
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  অসাধারণ! তুমি সব প্রশ্নের উত্তর দিয়েছ!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  তুমি অ্যালগরিদম ও ফ্লোচার্টের বেসিক কনসেপ্টগুলো ভালোভাবে বুঝতে পেরেছ!
                </p>
                <Button variant="primary">
                  ➡️ পরবর্তী লেসনে যাও
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
