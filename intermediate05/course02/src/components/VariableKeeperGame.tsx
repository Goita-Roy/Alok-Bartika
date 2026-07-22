import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

type GameState = 'intro' | 'playing' | 'gameover' | 'win';

export function VariableKeeperGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [life, setLife] = useState(3);
  const [round, setRound] = useState(0);
  const [hits, setHits] = useState(0);

  const startGame = useCallback(() => {
    setLife(3);
    setRound(0);
    setHits(0);
    setGameState('playing');
  }, []);

  const handleHit = useCallback(() => {
    if (gameState !== 'playing') return;
    const newLife = life - 1;
    setLife(newLife);
    setHits((h) => h + 1);
    if (newLife <= 0) setGameState('gameover');
    else setRound((r) => r + 1);
  }, [gameState, life]);

  const handleHeal = useCallback(() => {
    if (gameState !== 'playing' || life >= 5) return;
    setLife((l) => Math.min(l + 1, 5));
    setRound((r) => r + 1);
  }, [gameState, life]);

  const handleWin = useCallback(() => {
    if (gameState !== 'playing') return;
    setGameState('win');
  }, [gameState]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">🎮 ডাটা কিপার</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <div className="text-7xl mb-6">💖</div>
                <p className="text-xl font-bold text-text dark:text-text-dark mb-4">"ডাটা কিপার" গেমে তুমি একটি Life ভেরিয়েবল নিয়ন্ত্রণ করবে।</p>
                <p className="text-muted dark:text-muted-dark mb-4">শত্রুর আঘাতে Life কমে, শক্তি সংগ্রহে Life বাড়ে।</p>
                <div className="flex justify-center gap-4 mb-6">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full text-sm font-bold">Life = 3</span>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-sm font-bold">Hit → Life - 1</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full text-sm font-bold">Heal → Life + 1</span>
                </div>
                <Button onClick={startGame} size="lg">🚀 গেম শুরু করো</Button>
              </Card>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="mb-6">
                <h3 className="text-xl font-bold text-center text-text dark:text-text-dark mb-6">Variable: Life</h3>

                {/* Life Display */}
                <div className="flex justify-center items-center gap-2 mb-8">
                  <span className="text-lg font-bold text-muted dark:text-muted-dark">Life =</span>
                  <AnimatePresence mode="popLayout">
                    {Array.from({ length: life }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="text-4xl"
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 20 }}
                        transition={{ type: 'spring', delay: i * 0.05 }}
                      >
                        💖
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  <motion.span
                    className="text-3xl font-mono font-extrabold text-text dark:text-text-dark ml-2"
                    key={life}
                    initial={{ scale: 1.5, color: '#ef4444' }}
                    animate={{ scale: 1, color: '#1f2937' }}
                    transition={{ type: 'spring' }}
                  >
                    {life}
                  </motion.span>
                </div>

                {/* Variable visualization */}
                <div className="flex justify-center mb-6">
                  <motion.div className="w-64 h-24 bg-gray-900 dark:bg-gray-800 rounded-2xl border-4 border-gray-600 shadow-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Life</div>
                      <motion.div
                        className="text-5xl font-extrabold text-red-400 font-mono"
                        key={life}
                        initial={{ scale: 1.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring' }}
                      >
                        {life}
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-6 mb-6">
                  <div className="text-center">
                    <span className="text-sm text-muted dark:text-muted-dark">Round</span>
                    <p className="text-2xl font-bold text-text dark:text-text-dark">{round}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-muted dark:text-muted-dark">Hits Taken</span>
                    <p className="text-2xl font-bold text-red-500">{hits}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                  <motion.button
                    className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHit}
                  >
                    ⚔️ Hit (Life - 1)
                  </motion.button>
                  <motion.button
                    className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHeal}
                  >
                    💚 Heal (Life + 1)
                  </motion.button>
                </div>

                <div className="flex justify-center mt-6">
                  <Button variant="ghost" onClick={handleWin} size="sm">জিতেছি (বস শেষ)</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div key="gameover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card>
                <motion.div className="text-7xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>💀</motion.div>
                <p className="text-2xl font-bold text-red-500 mb-2">গেম ওভার!</p>
                <p className="text-muted dark:text-muted-dark mb-2">Life = 0 → Game Over</p>
                <p className="text-muted dark:text-muted-dark mb-6">Life ভেরিয়েবলের মান ০ হয়ে গেছে।</p>
                <Button onClick={startGame} size="lg">🔄 আবার খেলো</Button>
              </Card>
            </motion.div>
          )}

          {gameState === 'win' && (
            <motion.div key="win" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card highlighted>
                <motion.div className="text-7xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🏆</motion.div>
                <p className="text-2xl font-bold text-text dark:text-text-dark mb-2">ভেরিয়েবল পরিবর্তন করা শিখেছ!</p>
                <p className="text-muted dark:text-muted-dark mb-6">তুমি প্রমাণ করেছ যে Life ভেরিয়েবলের মান কমাতে ও বাড়াতে পারো!</p>
                <Button onClick={startGame} size="lg">🔄 আবার খেলো</Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
