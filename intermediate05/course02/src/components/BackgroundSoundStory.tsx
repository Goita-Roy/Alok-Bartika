import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type Phase =
  | 'card1'
  | 'card2' | 'card2-anim'
  | 'card3' | 'card3-anim'
  | 'card4' | 'card4-interactive'
  | 'card5'
  | 'done';

const SCENES = {
  forest: {
    bg: 'from-green-800 to-green-950',
    label: 'জঙ্গল',
    emoji: '🌳',
    soundLabel: 'Forest Sound',
    soundIcon: '🐦',
    soundDesc: 'ঝিঁঝিঁ পোকা ও পাখির ডাক',
    soundColor: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
};

export function BackgroundSoundStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [activeSoundBtn, setActiveSoundBtn] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card2');
    else if (phase === 'card2') setPhase('card2-anim');
    else if (phase === 'card2-anim') setPhase('card3');
    else if (phase === 'card3') setPhase('card3-anim');
    else if (phase === 'card3-anim') setPhase('card4');
    else if (phase === 'card4') { setPhase('card4-interactive'); setActiveSoundBtn(null); }
    else if (phase === 'card4-interactive') setPhase('card5');
    else if (phase === 'card5') setPhase('done');
  }, [phase]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <div className="relative min-h-[420px] flex items-center justify-center">
          <AnimatePresence mode="wait">

            {/* Card 1 */}
            {phase === 'card1' && (
              <motion.div key="c1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/90 dark:bg-card-dark/90 border-2 border-primary/20">
                  <div className="text-7xl mb-6">🎬</div>
                  <h3 className="text-2xl font-bold mb-4 text-text dark:text-text-dark">তুমি একটি সিনেমা দেখছ।</h3>
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {/* Card 2 — forest backdrop */}
            {(phase === 'card2' || phase === 'card2-anim') && (
              <motion.div key="c2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="overflow-hidden border-2 border-green-300 dark:border-green-700">
                  {/* Forest backdrop */}
                  <motion.div
                    className={`bg-gradient-to-b ${SCENES.forest.bg} flex flex-col items-center justify-center relative overflow-hidden`}
                    initial={{ height: phase === 'card2' ? 0 : 200 }}
                    animate={{ height: 200 }}
                    transition={{ duration: 0.8 }}
                  >
                    {/* Trees */}
                    {[...Array(7)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="absolute bottom-0 text-4xl md:text-5xl"
                        style={{ left: `${(i * 15) + 2}%` }}
                      >
                        🌲
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={phase === 'card2-anim' ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                      className="absolute top-4 right-4 bg-black/60 text-green-300 text-sm font-mono px-3 py-1 rounded-full"
                    >
                      🎵 Forest Ambience…
                    </motion.div>
                    {/* Animated sound waves */}
                    {phase === 'card2-anim' && (
                      <div className="absolute top-4 left-4 flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-green-300 rounded-full"
                            animate={{ height: [6, 18, 6] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                  <div className="p-6 text-center bg-white dark:bg-card-dark">
                    <h3 className="text-xl font-bold mb-4 text-text dark:text-text-dark">সিনেমার দৃশ্যটি একটি ঘন জঙ্গলের।</h3>
                    <Button onClick={handleNext} variant="primary">Next</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Card 3 — sound icons */}
            {(phase === 'card3' || phase === 'card3-anim') && (
              <motion.div key="c3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/90 dark:bg-card-dark/90 border-2 border-emerald-300 dark:border-emerald-700">
                  <h3 className="text-xl font-bold mb-6 text-text dark:text-text-dark">
                    ব্যাকগ্রাউন্ডে বাঘের ডাক এবং ঝিঁঝিঁ পোকার শব্দ শোনা যাচ্ছে।
                  </h3>
                  <div className="flex justify-center gap-8 my-8">
                    {['🐯', '🦟', '🐦'].map((icon, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={phase === 'card3-anim' ? { scale: [1, 1.2, 1], opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ delay: i * 0.3, repeat: phase === 'card3-anim' ? Infinity : 0, duration: 1.2 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <span className="text-5xl">{icon}</span>
                        <div className="flex gap-0.5">
                          {[...Array(3)].map((_, j) => (
                            <motion.div
                              key={j}
                              className="w-1 bg-emerald-500 rounded-full"
                              animate={phase === 'card3-anim' ? { height: [4, 14, 4] } : { height: 4 }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: j * 0.1 + i * 0.2 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <Button onClick={handleNext} variant="primary">Next</Button>
                </Card>
              </motion.div>
            )}

            {/* Card 4 — interactive sound comparison */}
            {(phase === 'card4' || phase === 'card4-interactive') && (
              <motion.div key="c4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/90 dark:bg-card-dark/90 border-2 border-primary/20">
                  {/* Forest scene header */}
                  <div className="bg-gradient-to-b from-green-700 to-green-900 rounded-xl h-24 flex items-end justify-center pb-2 mb-6 relative overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-3xl absolute bottom-0" style={{ left: `${i * 22 + 4}%` }}>🌲</span>
                    ))}
                    {activeSoundBtn && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-2 right-3 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-full z-10"
                      >
                        {activeSoundBtn === 'forest' ? '🎵 Forest Ambience' : '📢 Traffic Horn!'}
                      </motion.div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-6 text-text dark:text-text-dark">
                    জঙ্গলের দৃশ্যে যদি ট্রাফিকের ভেঁপু শোনানো হয়, তবে কেমন লাগবে?
                  </h3>

                  <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <button
                      onClick={() => setActiveSoundBtn('forest')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all ${activeSoundBtn === 'forest' ? 'bg-green-500 border-green-600 text-white scale-105 shadow-lg' : 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:scale-105'}`}
                    >
                      <span className="text-xl">🌿</span> Forest Sound
                    </button>
                    <button
                      onClick={() => setActiveSoundBtn('traffic')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border-2 transition-all ${activeSoundBtn === 'traffic' ? 'bg-red-500 border-red-600 text-white scale-105 shadow-lg' : 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:scale-105'}`}
                    >
                      <span className="text-xl">🚗</span> Traffic Horn
                    </button>
                  </div>

                  {activeSoundBtn === 'forest' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 dark:text-green-400 font-bold mb-4">
                      ✅ দারুণ মানিয়েছে! প্রকৃতির শব্দ জঙ্গলে মানায়।
                    </motion.p>
                  )}
                  {activeSoundBtn === 'traffic' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-bold mb-4">
                      😵 একদমই মানায় না!
                    </motion.p>
                  )}

                  <Button onClick={handleNext} variant="primary" className="mt-2">Next</Button>
                </Card>
              </motion.div>
            )}

            {/* Card 5 */}
            {phase === 'card5' && (
              <motion.div key="c5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/90 dark:bg-card-dark/90 border-2 border-red-200 dark:border-red-800">
                  <div className="text-7xl mb-6">🙅</div>
                  <h3 className="text-2xl font-bold mb-6 text-text dark:text-text-dark">একদমই মানাবে না।</h3>
                  <p className="text-muted dark:text-muted-dark mb-6">তাই Scratch-এ সঠিক Backdrop ও Sound মিলিয়ে ব্যবহার করতে হয়।</p>
                  <Button onClick={handleNext} variant="primary">আমি বুঝেছি</Button>
                </Card>
              </motion.div>
            )}

            {/* Done */}
            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                <Card className="p-8 text-center bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">চমৎকার! তুমি ধারণাটি বুঝে গেছো।</h3>
                  <Button onClick={() => setPhase('card1')} variant="ghost" className="mt-6">আবার দেখুন</Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
