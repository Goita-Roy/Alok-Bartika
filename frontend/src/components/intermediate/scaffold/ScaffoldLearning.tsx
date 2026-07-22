import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface Phase1Step {
  id: number;
  text: string;
}

type Phase2Step =
  | { id: number; text: string; visible: true }
  | { id: number; text: string; answer: string };

interface Phase2Activity2 {
  title: string;
  missing1: string;
  missing2: string;
}

interface ScaffoldLearningProps {
  phase1Title: string;
  phase1Steps: Phase1Step[];
  phase2Title: string;
  phase2Steps: Phase2Step[];
  phase2Activity2: Phase2Activity2;
}

type Phase = 'phase1' | 'phase2' | 'phase2-submit' | 'activity2' | 'activity2-submit';

export function ScaffoldLearning({
  phase1Title,
  phase1Steps,
  phase2Title,
  phase2Steps,
  phase2Activity2,
}: ScaffoldLearningProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('phase1');
  const [phase1Step, setPhase1Step] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [_activity2Answer, setActivity2Answer] = useState('');
  const [activity2Submitted, setActivity2Submitted] = useState(false);

  const handlePhase1Next = useCallback(() => {
    if (phase1Step < phase1Steps.length - 1) {
      setPhase1Step((s) => s + 1);
    } else {
      setPhase('phase2');
    }
  }, [phase1Step, phase1Steps.length]);

  const handlePhase2Submit = useCallback(() => {
    setSubmitted(true);
  }, []);

  const handleNext = useCallback(() => {
    setPhase('activity2');
  }, []);

  const handleActivity2Submit = useCallback(() => {
    setActivity2Submitted(true);
  }, []);

  const handleReset = useCallback(() => {
    setPhase('phase1');
    setPhase1Step(0);
    setAnswers({});
    setSubmitted(false);
    setActivity2Answer('');
    setActivity2Submitted(false);
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'phase1' && (
            <motion.div key="phase1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
              <Card className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{phase1Title}</h3>
                <div className="space-y-3">
                  {phase1Steps.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={i <= phase1Step ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -10 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 ${i <= phase1Step ? 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-500/20' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i <= phase1Step ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                        {step.id}
                      </span>
                      <span className={`font-medium ${i <= phase1Step ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {step.text}
                      </span>
                      {i <= phase1Step && (
                        <motion.svg className="w-5 h-5 text-emerald-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button onClick={handlePhase1Next} size="lg">
                    {phase1Step < phase1Steps.length - 1 ? 'পরবর্তী ধাপ →' : 'নিজে করো →'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase2' && (
            <motion.div key="phase2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">{phase2Title}</h3>
                <div className="space-y-3">
                  {phase2Steps.map((step, i) => {
                    const isVis = 'visible' in step ? (step as { visible: boolean }).visible : false;
                    const hasAnswer = 'answer' in step;
                    const userAnswer = answers[step.id] || '';
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${
                          isVis
                            ? 'bg-emerald-500/10 border-emerald-500 dark:bg-emerald-500/20'
                            : submitted && hasAnswer
                            ? userAnswer === (step as { answer: string }).answer
                              ? 'bg-green-50 border-emerald-500 dark:bg-green-900/20'
                              : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isVis || (submitted && hasAnswer) ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                          {step.id}
                        </span>
                        {isVis ? (
                          <>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{step.text}</span>
                            <svg className="w-5 h-5 text-emerald-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </>
                        ) : hasAnswer ? (
                          !submitted ? (
                            <input
                              type="text"
                              placeholder={step.text}
                              value={userAnswer}
                              onChange={(e) => setAnswers((prev) => ({ ...prev, [step.id]: e.target.value }))}
                              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:border-emerald-500 focus:outline-none font-medium"
                            />
                          ) : (
                            <div className="flex-1 flex items-center gap-3">
                              <span className="font-medium text-gray-800 dark:text-gray-100">{step.text}</span>
                              {userAnswer.toLowerCase() === (step as { answer: string }).answer.toLowerCase() ? (
                                <span className="text-emerald-500 font-bold ml-auto">✓ {userAnswer}</span>
                              ) : (
                                <span className="text-red-500 font-bold ml-auto">✗ {userAnswer} (উত্তর: {(step as { answer: string }).answer})</span>
                              )}
                            </div>
                          )
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  {!submitted ? (
                    <Button onClick={handlePhase2Submit} variant="primary">জমা দাও</Button>
                  ) : (
                    <Button onClick={handleNext} variant="primary">পরবর্তী →</Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {(phase === 'activity2' || phase === 'activity2-submit') && (
            <motion.div key="activity2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">{phase2Activity2.title}</h3>
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-3 w-full max-w-sm">
                    <motion.div className="w-full p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl text-center font-bold text-gray-800 dark:text-gray-100">
                      Oval — Start
                    </motion.div>
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <motion.div className="w-full p-4 bg-sky-500/10 border-2 border-sky-500 rounded-xl text-center font-bold text-gray-800 dark:text-gray-100">
                      {!activity2Submitted ? (
                        <span>{phase2Activity2.missing1} — Input B</span>
                      ) : (
                        <span className="text-emerald-500">{phase2Activity2.missing1} — Input B ✓</span>
                      )}
                    </motion.div>
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <motion.div className="w-full p-4 bg-amber-500/10 border-2 border-amber-500 rounded-xl text-center font-bold text-gray-800 dark:text-gray-100">
                      {!activity2Submitted ? (
                        <span>{phase2Activity2.missing2} — Sum = A+B</span>
                      ) : (
                        <span className="text-emerald-500">{phase2Activity2.missing2} — Sum = A+B ✓</span>
                      )}
                    </motion.div>
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <motion.div className="w-full p-4 bg-purple-500/10 border-2 border-purple-500 rounded-xl text-center font-bold text-gray-800 dark:text-gray-100">
                      Oval — End
                    </motion.div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  {!activity2Submitted ? (
                    <Button onClick={handleActivity2Submit} variant="primary">জমা দাও</Button>
                  ) : (
                    <Button onClick={handleReset} variant="ghost">পুনরায় চেষ্টা করো</Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
