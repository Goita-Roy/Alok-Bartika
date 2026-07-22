import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

type Phase = 'phase1-step1' | 'phase1-step2' | 'phase1-step3' | 'phase1-step3-true' | 'phase1-step4' | 'phase1-step4-false' | 'phase2' | 'phase2-quiz' | 'phase2-result' | 'done';

interface QuizItem {
  score: number;
  expectedResult: 'true' | 'false';
  expectedMessage: 'You Win!' | 'Try Again!';
}

const quizItems: QuizItem[] = [
  { score: 55, expectedResult: 'true', expectedMessage: 'You Win!' },
  { score: 45, expectedResult: 'false', expectedMessage: 'Try Again!' },
  { score: 70, expectedResult: 'true', expectedMessage: 'You Win!' },
  { score: 30, expectedResult: 'false', expectedMessage: 'Try Again!' },
];

export function LogicScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('phase1-step1');
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedResult, setSelectedResult] = useState<'true' | 'false' | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<'You Win!' | 'Try Again!' | null>(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handlePhaseNext = useCallback(() => {
    const flow: Phase[] = ['phase1-step1', 'phase1-step2', 'phase1-step3', 'phase1-step3-true', 'phase1-step4', 'phase1-step4-false', 'phase2'];
    const idx = flow.indexOf(phase);
    if (idx < flow.length - 1) {
      setPhase(flow[idx + 1]);
    }
  }, [phase]);

  const handlePhase2Start = useCallback(() => {
    setPhase('phase2-quiz');
    setQuizIndex(0);
    setCorrectCount(0);
    setSelectedResult(null);
    setSelectedMessage(null);
    setQuizFeedback(null);
    setQuizAttempts(0);
  }, []);

  const handleResultSelect = useCallback((result: 'true' | 'false') => {
    setSelectedResult(result);
    setQuizFeedback(null);
  }, []);

  const handleMessageSelect = useCallback((msg: 'You Win!' | 'Try Again!') => {
    setSelectedMessage(msg);
  }, []);

  const handleQuizSubmit = useCallback(() => {
    if (!selectedResult || !selectedMessage) return;

    const item = quizItems[quizIndex];
    const resultCorrect = selectedResult === item.expectedResult;
    const msgCorrect = selectedMessage === item.expectedMessage;

    if (resultCorrect && msgCorrect) {
      setQuizFeedback('correct');
      setCorrectCount((prev) => prev + 1);
    } else {
      setQuizFeedback('wrong');
    }
    setQuizAttempts((prev) => prev + 1);
  }, [selectedResult, selectedMessage, quizIndex]);

  const handleQuizNext = useCallback(() => {
    if (quizIndex < quizItems.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedResult(null);
      setSelectedMessage(null);
      setQuizFeedback(null);
    } else {
      setPhase('phase2-result');
    }
  }, [quizIndex]);

  const handleQuizRetry = useCallback(() => {
    setSelectedResult(null);
    setSelectedMessage(null);
    setQuizFeedback(null);
  }, []);

  const handleDone = useCallback(() => {
    setPhase('done');
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'phase1-step1' && (
            <motion.div key="p1s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <motion.div className="p-6 bg-emerald-500/10 border-2 border-emerald-500 rounded-xl text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <p className="text-2xl font-mono font-bold text-emerald-500">If Score &gt; 50</p>
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">একটি শর্ত (Condition) দেখা যাক</p>
                <div className="mt-6">
                  <Button onClick={handlePhaseNext} size="lg">পরবর্তী →</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-step2' && (
            <motion.div key="p1s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.div className="px-6 py-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl border-2 border-blue-400">
                    <p className="font-mono font-bold text-blue-600">If Score &gt; 50</p>
                  </motion.div>
                  <motion.div
                    className="text-2xl text-gray-500"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ➡️
                  </motion.div>
                  <motion.div className="px-6 py-4 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-gray-400">
                    <p className="font-bold text-gray-800 dark:text-gray-100">🔍 চেক করছে...</p>
                  </motion.div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Computer শর্তটি পরীক্ষা করে</p>
                <Button onClick={handlePhaseNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-step3' && (
            <motion.div key="p1s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="mb-6">
                  <motion.div
                    className="inline-block px-8 py-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-yellow-400 mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-2xl font-bold">Score = <span className="text-green-600">55</span></p>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center gap-2 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="font-mono">55 &gt; 50</span>
                    <motion.span
                      className="text-green-600 font-bold text-2xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                    >
                      ✅ True
                    </motion.span>
                  </motion.div>
                </div>
                <Button onClick={handlePhaseNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-step3-true' && (
            <motion.div key="p1s3t" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card highlighted>
                <motion.div
                  className="inline-block px-10 py-6 bg-green-500 text-white rounded-2xl shadow-lg mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <p className="text-3xl font-bold">🎉 You Win!</p>
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Score 55 → True → "You Win!"</p>
                <Button onClick={handlePhaseNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-step4' && (
            <motion.div key="p1s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Watch & Learn</h3>
                <div className="mb-6">
                  <motion.div
                    className="inline-block px-8 py-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-yellow-400 mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-2xl font-bold">Score = <span className="text-red-600">45</span></p>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center gap-2 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <span className="font-mono">45 &gt; 50</span>
                    <motion.span
                      className="text-red-600 font-bold text-2xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: 'spring' }}
                    >
                      ❌ False
                    </motion.span>
                  </motion.div>
                </div>
                <Button onClick={handlePhaseNext} size="lg">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase1-step4-false' && (
            <motion.div key="p1s4f" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card>
                <motion.div
                  className="inline-block px-10 py-6 bg-red-500 text-white rounded-2xl shadow-lg mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <p className="text-3xl font-bold">😅 Try Again!</p>
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Score 45 → False → "Try Again!"</p>
                <Button onClick={handlePhaseNext} size="lg">নিজে করো →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase2' && (
            <motion.div key="p2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">তুমি নিজে করো (Try Yourself)</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Score দেখে সিদ্ধান্ত নাও — True নাকি False? আর কী বার্তা দেখাবে?</p>
                <Button onClick={handlePhase2Start} size="lg">শুরু করি →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'phase2-quiz' && (
            <motion.div key="p2q" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">প্রশ্ন {quizIndex + 1} / {quizItems.length}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">সঠিক: {correctCount}</span>
                </div>

                <div className="text-center mb-6">
                  <motion.div
                    className="inline-block px-8 py-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-yellow-400"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-2xl font-bold">
                      Score = <span className={quizItems[quizIndex].score > 50 ? 'text-green-600' : 'text-red-600'}>{quizItems[quizIndex].score}</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">শর্ত: Score &gt; 50</p>
                  </motion.div>
                </div>

                <div className="mb-4">
                  <p className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-center">রেজাল্ট কী হবে?</p>
                  <div className="flex justify-center gap-4">
                    <motion.button
                      onClick={() => handleResultSelect('true')}
                      className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg ${
                        selectedResult === 'true'
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 border-2 border-green-300 hover:bg-green-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✅ True
                    </motion.button>
                    <motion.button
                      onClick={() => handleResultSelect('false')}
                      className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg ${
                        selectedResult === 'false'
                          ? 'bg-red-500 text-white border-2 border-red-600'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 border-2 border-red-300 hover:bg-red-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ❌ False
                    </motion.button>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-center">কী বার্তা দেখাবে?</p>
                  <div className="flex justify-center gap-4">
                    <motion.button
                      onClick={() => handleMessageSelect('You Win!')}
                      className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg ${
                        selectedMessage === 'You Win!'
                          ? 'bg-green-500 text-white border-2 border-green-600'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 border-2 border-green-300 hover:bg-green-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎉 You Win!
                    </motion.button>
                    <motion.button
                      onClick={() => handleMessageSelect('Try Again!')}
                      className={`px-6 py-4 rounded-xl font-bold text-lg shadow-lg ${
                        selectedMessage === 'Try Again!'
                          ? 'bg-red-500 text-white border-2 border-red-600'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 border-2 border-red-300 hover:bg-red-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      😅 Try Again!
                    </motion.button>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleQuizSubmit}
                    variant="primary"
                    size="lg"
                    disabled={!selectedResult || !selectedMessage}
                  >
                    জমা দাও
                  </Button>
                </div>

                <AnimatePresence>
                  {quizFeedback === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 text-center"
                    >
                      <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-400 rounded-xl p-4">
                        <p className="text-xl font-bold text-emerald-500">✅ সঠিক!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Score {quizItems[quizIndex].score} → {quizItems[quizIndex].score > 50 ? 'True' : 'False'} → "{quizItems[quizIndex].expectedMessage}"
                        </p>
                      </div>
                      <div className="mt-4">
                        <Button onClick={handleQuizNext} variant="primary">
                          {quizIndex < quizItems.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'দেখি ফলাফল →'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  {quizFeedback === 'wrong' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6 text-center"
                    >
                      <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 rounded-xl p-4">
                        <p className="text-xl font-bold text-red-500">❌ সম্পূর্ণ সঠিক নয়</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">আবার চেষ্টা করো</p>
                      </div>
                      <div className="mt-4">
                        <Button onClick={handleQuizRetry} variant="danger">আবার চেষ্টা করো</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          )}

          {phase === 'phase2-result' && (
            <motion.div key="p2r" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card highlighted>
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>🏆</motion.div>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">তুমি শিখেছ!</p>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">{correctCount} / {quizItems.length} সঠিক</p>
                <Button onClick={handleDone} variant="primary">পরবর্তী →</Button>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Card highlighted className="max-w-md mx-auto">
                <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-gray-800 dark:text-gray-100">দারুণ! তুমি প্রোগ্রামিং লজিক বুঝতে পেরেছ!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
