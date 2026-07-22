import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

type GameState = 'intro' | 'playing' | 'access-granted' | 'access-denied';

const dragBlocks = [
  { id: 'if', label: 'If', color: 'bg-green-500' },
  { id: 'password-check', label: 'Password = "1234"', color: 'bg-blue-500' },
  { id: 'welcome', label: '✅ Welcome', color: 'bg-emerald-500' },
  { id: 'else', label: 'Else', color: 'bg-orange-500' },
  { id: 'wrong', label: '❌ Wrong Password', color: 'bg-red-500' },
];

const dropzones = [
  { id: 'dz-if', expected: 'if', label: 'If' },
  { id: 'dz-cond', expected: 'password-check', label: 'Password = "1234"' },
  { id: 'dz-true', expected: 'welcome', label: 'True: ✅ Welcome' },
  { id: 'dz-else', expected: 'else', label: 'Else' },
  { id: 'dz-false', expected: 'wrong', label: 'False: ❌ Wrong Password' },
];

export function PasswordDefenderGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [gameState, setGameState] = useState<GameState>('intro');
  const [attempts, setAttempts] = useState(0);
  const [dropped, setDropped] = useState<string[]>([]);
  const [dropErrors, setDropErrors] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [xp, setXp] = useState(0);

  const startGame = useCallback(() => {
    setGameState('playing');
    setAttempts(0);
    setDropped([]);
    setDropErrors([]);
    setSelectedIdx(-1);
  }, []);

  const handleDrop = useCallback((expected: string) => {
    if (selectedIdx < 0) return;
    const block = dragBlocks[selectedIdx];
    if (block.id === expected) {
      setDropped((prev) => [...prev, expected]);
      setDropErrors((prev) => prev.filter((e) => e !== expected));
    } else {
      setDropErrors((prev) => (prev.includes(expected) ? prev : [...prev, expected]));
    }
    setSelectedIdx(-1);
  }, [selectedIdx]);

  const handleSubmit = useCallback(() => {
    const correct = ['if', 'password-check', 'welcome', 'else', 'wrong'];
    const isCorrect = dropped.length >= correct.length && dropped.every((d, i) => d === correct[i]);
    setAttempts((a) => a + 1);
    if (isCorrect) {
      setGameState('access-granted');
      setXp(350);
    } else {
      setGameState('access-denied');
    }
  }, [dropped]);

  const handleRetry = useCallback(() => {
    setGameState('playing');
    setDropped([]);
    setDropErrors([]);
    setSelectedIdx(-1);
  }, []);

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-2" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">🎮 Password Defender</span>
        </motion.h2>
        <motion.p className="text-center text-lg text-gray-400 mb-8" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          Level 7: Decision Maker
        </motion.p>

        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center">
              <Card className="bg-gray-800 border-gray-700">
                <div className="text-7xl mb-6">🛡️</div>
                <p className="text-xl font-bold text-white mb-4">Password Security System</p>
                <p className="text-gray-400 mb-4">If-Else লজিক ব্যবহার করে পাসওয়ার্ড চেকিং সিস্টেম তৈরি করো।</p>
                <div className="flex justify-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm font-bold border border-green-500/30">If → Check Password</span>
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm font-bold border border-blue-500/30">✅ Welcome</span>
                  <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm font-bold border border-red-500/30">Else → ❌ Wrong</span>
                </div>
                <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-green-500 to-cyan-500">🚀 গেম শুরু করো</Button>
              </Card>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* XP Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>🌟 XP</span>
                  <span>{xp} / 350</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" style={{ width: `${Math.min((xp / 350) * 100, 100)}%` }} layout />
                </div>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.div className="text-5xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>🔐</motion.div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">Password Required</p>
                    <p className="text-sm text-gray-400">Attempts: {attempts}</p>
                  </div>
                </div>

                {/* Blocks palette */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {dragBlocks.map((block, idx) => (
                    <motion.button
                      key={block.id}
                      className={`px-4 py-3 rounded-xl font-mono font-bold text-white text-sm shadow-md ${
                        selectedIdx === idx ? 'ring-4 ring-yellow-400 scale-110' : ''
                      } ${dropped.includes(block.id) ? 'opacity-40' : ''} ${block.color}`}
                      whileHover={{ scale: dropped.includes(block.id) ? 1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { if (!dropped.includes(block.id)) setSelectedIdx(idx); }}
                    >
                      {block.label}
                    </motion.button>
                  ))}
                </div>

                {/* Drop zones */}
                <div className="space-y-3 mb-6">
                  {dropzones.map((dz) => {
                    const isDone = dropped.includes(dz.expected);
                    const isError = dropErrors.includes(dz.expected);
                    return (
                      <motion.div
                        key={dz.id}
                        className={`p-4 rounded-xl border-2 border-dashed transition-all ${
                          isDone
                            ? 'border-green-500 bg-green-900/20'
                            : isError
                            ? 'border-red-500 bg-red-900/20'
                            : 'border-gray-600 bg-gray-700/50 hover:border-blue-500'
                        }`}
                        onClick={() => handleDrop(dz.expected)}
                        whileHover={{ scale: isDone ? 1 : 1.02 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            isDone ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
                          }`}>
                            {dropzones.indexOf(dz) + 1}
                          </div>
                          <span className="text-lg font-semibold text-white">{dz.label}</span>
                          {isDone && <span className="ml-auto text-green-400 text-xl">✓</span>}
                          {isError && <span className="ml-auto text-red-400 text-sm font-bold">✘ ভুল</span>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={dropped.length < dropzones.length}
                    className={dropped.length >= dropzones.length ? 'bg-gradient-to-r from-green-500 to-cyan-500' : ''}
                  >
                    {dropped.length < dropzones.length ? 'সব ব্লক বসাও' : '🔓 আনলক করো'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {gameState === 'access-granted' && (
            <motion.div key="granted" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card className="bg-gray-800 border-green-500/30">
                <motion.div
                  className="text-8xl mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' }}
                >
                  ✅
                </motion.div>
                <motion.h3
                  className="text-4xl font-extrabold text-green-400 mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Access Granted
                </motion.h3>
                <motion.p
                  className="text-2xl font-bold text-cyan-400 mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  ✅ স্বাগতম!
                </motion.p>

                {/* Badge */}
                <motion.div
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-xl mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                >
                  <span className="text-3xl">🏆</span>
                  <span className="text-white font-bold text-lg">Security Guard Badge</span>
                </motion.div>

                {/* XP */}
                <motion.div
                  className="text-lg text-yellow-400 font-bold mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  +{xp} XP
                </motion.div>

                {/* Celebration */}
                <div className="flex justify-center gap-2 mb-6">
                  {['🎉', '✨', '🎊', '🌟', '💫'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl"
                      initial={{ y: 0, opacity: 1 }}
                      animate={{ y: -40, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </div>

                <Button onClick={startGame} size="lg" className="bg-gradient-to-r from-green-500 to-cyan-500">🔄 আবার খেলো</Button>
              </Card>
            </motion.div>
          )}

          {gameState === 'access-denied' && (
            <motion.div key="denied" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <Card className="bg-gray-800 border-red-500/30">
                <motion.div
                  className="text-8xl mb-4"
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring' }}
                >
                  ❌
                </motion.div>
                <motion.h3
                  className="text-4xl font-extrabold text-red-400 mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Access Denied
                </motion.h3>
                <motion.p
                  className="text-xl font-bold text-gray-400 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  ❌ ভুল পাসওয়ার্ড!
                </motion.p>
                <Button onClick={handleRetry} size="lg" className="bg-gradient-to-r from-red-500 to-orange-500">
                  🔄 পুনরায় চেষ্টা করো
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

