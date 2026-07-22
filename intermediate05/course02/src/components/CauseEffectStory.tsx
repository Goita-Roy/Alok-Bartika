import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface StoryStep {
  id: number;
  text: string;
  icon?: string;
}

interface CauseEffectStoryProps {
  storySteps: StoryStep[];
}

type Phase = 'story' | 'interact' | 'result-power' | 'result-switch';

export function CauseEffectStory({ storySteps }: CauseEffectStoryProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('story');
  const [currentStep, setCurrentStep] = useState(0);
  const [tvOn, setTvOn] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [showPowerDone, setShowPowerDone] = useState(false);
  const [showSwitchDone, setShowSwitchDone] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setPhase('interact');
    }
  }, [currentStep, storySteps.length]);

  const step = storySteps[currentStep];

  const handlePowerButton = useCallback(() => {
    setTvOn((prev) => !prev);
    setPhase('result-power');
    setShowPowerDone(true);
  }, []);

  const handleLightSwitch = useCallback(() => {
    setLightOn((prev) => !prev);
    setPhase('result-switch');
    setShowSwitchDone(true);
  }, []);

  const handleBack = useCallback(() => {
    setPhase('interact');
  }, []);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {phase === 'story' && (
            <motion.div key="story" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
              <Card className="mb-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">{step.icon || '📖'}</div>
                <p className="text-2xl font-bold text-text dark:text-text-dark">{step.text}</p>
                <p className="text-muted dark:text-muted-dark mt-2 text-sm">ধাপ {currentStep + 1} / {storySteps.length}</p>
              </Card>
              {currentStep > 0 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  {storySteps.slice(0, currentStep + 1).map((s, i) => (
                    <motion.div key={s.id} className="w-3 h-3 rounded-full bg-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
                  ))}
                </div>
              )}
              <Button onClick={handleNext} size="lg">
                {currentStep < 1 ? 'বাটন চাপো →' : currentStep < storySteps.length - 1 ? 'পরবর্তী →' : 'এখন করো →'}
              </Button>
            </motion.div>
          )}

          {phase === 'interact' && (
            <motion.div key="interact" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className="text-center">
                <p className="text-lg font-semibold text-text dark:text-text-dark mb-8">
                  নিচের বাটনগুলো ক্লিক করে দেখো কী হয়:
                </p>
                <div className="flex flex-wrap justify-center gap-8 mb-8">
                  {/* Power Button */}
                  <motion.button
                    onClick={handlePowerButton}
                    className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-card dark:bg-card-dark hover:border-primary transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-red-500 shadow-lg flex items-center justify-center text-white text-3xl"
                      animate={{ boxShadow: showPowerDone ? ['0 0 20px rgba(239,68,68,0.8)', '0 0 5px rgba(239,68,68,0.3)'] : '0 0 5px rgba(239,68,68,0.3)' }}
                      transition={{ duration: 0.5 }}
                    >
                      ⏻
                    </motion.div>
                    <span className="font-bold text-text dark:text-text-dark">Power Button</span>
                    <span className="text-sm text-muted dark:text-muted-dark">(ক্লিক করো)</span>
                  </motion.button>

                  {/* Light Switch */}
                  <motion.button
                    onClick={handleLightSwitch}
                    className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-card dark:bg-card-dark hover:border-primary transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-yellow-400 shadow-lg flex items-center justify-center text-3xl"
                      animate={{ rotate: lightOn ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      🔛
                    </motion.div>
                    <span className="font-bold text-text dark:text-text-dark">Light Switch</span>
                    <span className="text-sm text-muted dark:text-muted-dark">(ক্লিক করো)</span>
                  </motion.button>
                </div>

                {/* TV / Light display */}
                <div className="flex flex-wrap justify-center gap-8 mb-6">
                  <motion.div
                    className="w-32 h-24 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-lg"
                    animate={{
                      boxShadow: tvOn ? '0 0 30px rgba(14,165,233,0.6)' : '0 0 0 transparent',
                    }}
                  >
                    <span className="text-4xl" style={{ filter: tvOn ? 'none' : 'grayscale(100%)' }}>
                      📺
                    </span>
                  </motion.div>
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    animate={{
                      boxShadow: lightOn
                        ? '0 0 40px rgba(255,200,0,0.8), 0 0 80px rgba(255,200,0,0.3)'
                        : '0 0 0 transparent',
                    }}
                  >
                    <span className="text-4xl" style={{ filter: lightOn ? 'none' : 'grayscale(100%)' }}>
                      💡
                    </span>
                  </motion.div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="ghost" onClick={handleBack}>পিছনে</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {(phase === 'result-power' || phase === 'result-switch') && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card className="max-w-lg mx-auto">
                {phase === 'result-power' ? (
                  <>
                    <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      {tvOn ? '📺✨' : '📺'}
                    </motion.div>
                    <motion.h3 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
                      {tvOn ? 'টিভি অন হলো!' : 'টিভি অফ হলো!'}
                    </motion.h3>
                    <p className="text-text dark:text-text-dark mb-6">
                      পাওয়ার বাটন চাপা = Event → টিভি অন/অফ = Action
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={handlePowerButton} variant="primary">
                        {tvOn ? 'আবার অফ করো' : 'আবার অন করো'}
                      </Button>
                      <Button variant="ghost" onClick={handleBack}>পিছনে</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      {lightOn ? '💡✨' : '💡'}
                    </motion.div>
                    <motion.h3 className="text-2xl font-bold text-text dark:text-text-dark mb-2">
                      {lightOn ? 'লাইট জ্বলে গেল!' : 'লাইট নিভে গেল!'}
                    </motion.h3>
                    <p className="text-text dark:text-text-dark mb-6">
                      সুইচ চাপা = Event → লাইট জ্বলা/নিভে যাওয়া = Action
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={handleLightSwitch} variant="primary">
                        {lightOn ? 'আবার নিভাও' : 'আবার জ্বালাও'}
                      </Button>
                      <Button variant="ghost" onClick={handleBack}>পিছনে</Button>
                    </div>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
