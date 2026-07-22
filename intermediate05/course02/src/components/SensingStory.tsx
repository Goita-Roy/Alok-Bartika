import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase = 'card1' | 'card1-anim' | 'card2' | 'card3' | 'card3-interactive' | 'card3-anim' | 'card4' | 'done';

export function SensingStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [touchDetected, setTouchDetected] = useState(false);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card1-anim');
    else if (phase === 'card1-anim') setPhase('card2');
    else if (phase === 'card2') setPhase('card3');
    else if (phase === 'card3') setPhase('card3-interactive');
    else if (phase === 'card3-anim') setPhase('card4');
    else if (phase === 'card4') setPhase('done');
  }, [phase]);

  const handleSpriteHover = () => {
    if (phase === 'card3-interactive') {
      setTouchDetected(true);
      setTimeout(() => {
        setPhase('card3-anim');
      }, 1000);
    }
  };

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {(phase === 'card1' || phase === 'card1-anim') && (
              <motion.div key="c1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm border-2 border-primary/20">
                  <h3 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">আমরা চোখ দিয়ে দেখি, কান দিয়ে শুনি, আর ত্বক দিয়ে স্পর্শ অনুভব করি।</h3>
                  
                  {phase === 'card1-anim' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center gap-8 mb-8">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="text-6xl">👁️</motion.div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="text-6xl">👂</motion.div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="text-6xl">✋</motion.div>
                    </motion.div>
                  )}
                  
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {phase === 'card2' && (
              <motion.div key="c2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm border-2 border-primary/20">
                  <div className="text-6xl mb-6">🌍</div>
                  <h3 className="text-2xl font-bold mb-4 text-text dark:text-text-dark">আমাদের এই ইন্দ্রিয়গুলো না থাকলে আমরা বুঝতে পারতাম না আমাদের চারপাশে কী ঘটছে।</h3>
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {(phase === 'card3' || phase === 'card3-interactive' || phase === 'card3-anim') && (
              <motion.div key="c3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm border-2 border-primary/20">
                  <h3 className="text-2xl font-bold mb-6 text-text dark:text-text-dark">একইভাবে, একটি গেমের ভেতর বিড়ালটি যদি কোনো দেয়াল বা শত্রুকে স্পর্শ করে, তবে তাকেও সেটা অনুভব করতে পারতে হবে।</h3>
                  
                  {phase === 'card3-interactive' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 mt-8 mb-6">
                       <p className="text-muted dark:text-muted-dark mb-4">মাউস দিয়ে স্প্রাইটটিকে ছুঁয়ে দাও!</p>
                       <div 
                         className={`w-32 h-32 flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${touchDetected ? 'bg-yellow-100 border-4 border-yellow-400 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'bg-gray-100 border-2 border-dashed border-gray-400 dark:bg-gray-800'}`}
                         onMouseEnter={handleSpriteHover}
                       >
                         <span className="text-6xl transition-transform hover:scale-110">🐱</span>
                       </div>
                    </motion.div>
                  )}

                  {phase === 'card3-anim' && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center items-center gap-4 mt-8 mb-6">
                       <div className="text-3xl font-bold text-green-500">Touch Detected! ✨</div>
                    </motion.div>
                  )}
                  
                  {(phase === 'card3' || phase === 'card3-anim') && (
                    <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                  )}
                </Card>
              </motion.div>
            )}

            {phase === 'card4' && (
              <motion.div key="c4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm border-2 border-primary/20">
                  <div className="text-6xl mb-6">⚡</div>
                  <h3 className="text-2xl font-bold mb-8 text-text dark:text-text-dark">স্পর্শ অনুভব হলেই প্রোগ্রাম কাজ করতে পারে।</h3>
                  <Button onClick={handleNext} variant="primary">আমি বুঝেছি</Button>
                </Card>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                <Card className="p-8 text-center bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">চমৎকার! তুমি সেন্সিং এর ধারণা বুঝে গেছো।</h3>
                  <Button onClick={() => { setPhase('card1'); setTouchDetected(false); }} variant="outline" className="mt-6">আবার দেখুন</Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
