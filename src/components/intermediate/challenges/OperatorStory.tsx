import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

type Phase = 'card1' | 'card2' | 'card2-anim' | 'card3' | 'card3-anim' | 'card4' | 'card4-interactive' | 'card4-anim' | 'card5' | 'card5-interactive' | 'card5-anim' | 'card6' | 'done';

export function OperatorStory() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<Phase>('card1');
  const [myMoney, setMyMoney] = useState(0);
  const [friendMoney, setFriendMoney] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const animateMyMoney = useCallback(() => {
    setPhase('card2-anim');
    setMyMoney(50);
  }, []);

  const animateFriendMoney = useCallback(() => {
    setPhase('card3-anim');
    setFriendMoney(70);
  }, []);

  const handleAdd = useCallback(() => {
    setPhase('card4-anim');
    setTotal(50 + 70);
  }, []);

  const handleCompare = useCallback((symbol: string) => {
    setPhase('card5-anim');
    if (symbol === '<') {
      setComparisonResult('সঠিক! 50 < 70');
    } else {
      setComparisonResult('ভুল! 50 ছোট, 70 বড়। (50 < 70)');
    }
  }, []);

  const handleNext = useCallback(() => {
    if (phase === 'card1') setPhase('card2');
    else if (phase === 'card2') animateMyMoney();
    else if (phase === 'card2-anim') setPhase('card3');
    else if (phase === 'card3') animateFriendMoney();
    else if (phase === 'card3-anim') setPhase('card4');
    else if (phase === 'card4') setPhase('card4-interactive');
    else if (phase === 'card4-anim') setPhase('card5');
    else if (phase === 'card5') setPhase('card5-interactive');
    else if (phase === 'card5-anim') setPhase('card6');
    else if (phase === 'card6') setPhase('done');
  }, [phase, animateMyMoney, animateFriendMoney]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">বাস্তব উদাহরণ</span>
        </motion.h2>

        <div className="relative min-h-[400px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 'card1' && (
              <motion.div key="c1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">🎡</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">তুমি এবং তোমার বন্ধু মেলায় গিয়েছ।</h3>
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {(phase === 'card2' || phase === 'card2-anim') && (
              <motion.div key="c2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">🧑</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">তোমার কাছে আছে ৫০ টাকা।</h3>
                  
                  {phase === 'card2-anim' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6 mb-6">
                      <div className="inline-block bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-6 py-3 rounded-full text-2xl font-mono font-bold shadow-sm">
                        Money = {myMoney}
                      </div>
                    </motion.div>
                  )}
                  
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {(phase === 'card3' || phase === 'card3-anim') && (
              <motion.div key="c3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">🧑‍🤝‍🧑</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">তোমার বন্ধুর কাছে আছে ৭০ টাকা।</h3>
                  
                  {phase === 'card3-anim' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-6 mb-6">
                      <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-2xl font-mono font-bold shadow-sm">
                        Friend = {friendMoney}
                      </div>
                    </motion.div>
                  )}
                  
                  <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                </Card>
              </motion.div>
            )}

            {(phase === 'card4' || phase === 'card4-interactive' || phase === 'card4-anim') && (
              <motion.div key="c4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">💰</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">তোমরা দেখতে চাও দুজনের মোট কত টাকা আছে (যোগ)।</h3>
                  
                  {phase === 'card4-interactive' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-4 mt-8 mb-6">
                       <div className="text-2xl font-mono">50</div>
                       <button onClick={handleAdd} className="w-16 h-16 rounded-full bg-emerald-500 text-white text-3xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">+</button>
                       <div className="text-2xl font-mono">70</div>
                    </motion.div>
                  )}

                  {phase === 'card4-anim' && (
                    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center items-center gap-4 mt-8 mb-6">
                       <div className="text-3xl font-mono text-gray-500">50 + 70</div>
                       <div className="text-3xl font-mono">=</div>
                       <div className="text-4xl font-mono font-bold text-emerald-500">{total}</div>
                    </motion.div>
                  )}
                  
                  {(phase === 'card4' || phase === 'card4-anim') && (
                    <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                  )}
                </Card>
              </motion.div>
            )}

            {(phase === 'card5' || phase === 'card5-interactive' || phase === 'card5-anim') && (
              <motion.div key="c5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">⚖️</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">আবার দেখতে চাও কার কাছে বেশি টাকা আছে (তুলনা)।</h3>
                  
                  {phase === 'card5-interactive' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center gap-6 mt-8 mb-6">
                       <div className="text-3xl font-mono">50</div>
                       <div className="flex gap-2">
                         <button onClick={() => handleCompare('>')} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-2xl hover:bg-emerald-500 hover:text-white transition-colors">&gt;</button>
                         <button onClick={() => handleCompare('<')} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-2xl hover:bg-emerald-500 hover:text-white transition-colors">&lt;</button>
                       </div>
                       <div className="text-3xl font-mono">70</div>
                    </motion.div>
                  )}

                  {phase === 'card5-anim' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-6">
                       <div className="text-4xl font-mono font-bold mb-4">50 &lt; 70</div>
                       <div className={`text-xl ${comparisonResult?.includes('সঠিক') ? 'text-green-500' : 'text-red-500'}`}>
                         {comparisonResult}
                       </div>
                    </motion.div>
                  )}
                  
                  {(phase === 'card5' || phase === 'card5-anim') && (
                    <Button onClick={handleNext} variant="primary" className="mt-4">Next</Button>
                  )}
                </Card>
              </motion.div>
            )}

            {phase === 'card6' && (
              <motion.div key="c6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full">
                <Card className="p-8 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-500/20">
                  <div className="text-6xl mb-6">✨</div>
                  <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100">এই যে যোগ করা বা তুলনা করা—এসবের জন্য গণিতে আমরা কিছু চিহ্ন ব্যবহার করি।</h3>
                  
                  <div className="flex justify-center gap-4 flex-wrap mb-8">
                    {['+', '-', '>', '<', '='].map((sym, i) => (
                      <motion.div key={sym} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-700">
                        {sym}
                      </motion.div>
                    ))}
                  </div>

                  <Button onClick={handleNext} variant="primary">আমি বুঝেছি</Button>
                </Card>
              </motion.div>
            )}

            {phase === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                <Card className="p-8 text-center bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">চমৎকার! তুমি অপারেটরের ধারণা বুঝে গেছো।</h3>
                  <Button onClick={() => setPhase('card1')} variant="outline" className="mt-6">আবার দেখুন</Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}




