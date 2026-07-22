import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Confetti } from '../ui/Confetti';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface Level {
  id: number;
  question: string;
  backdrop: string;
  correctSound: string;
  scene: { bg: string; emoji: string[]; label: string };
}

const LEVELS: Level[] = [
  {
    id: 1,
    question: 'Space game শুরু হলে কোন sound মানায়?',
    backdrop: 'Space',
    correctSound: 'Space Music',
    scene: { bg: 'from-slate-900 to-indigo-950', emoji: ['🌟', '🪐', '🚀', '⭐'], label: '🚀 Space' },
  },
  {
    id: 2,
    question: 'জঙ্গলের দৃশ্যে কোন sound মানায়?',
    backdrop: 'Forest',
    correctSound: 'Bird Chirping',
    scene: { bg: 'from-green-800 to-green-950', emoji: ['🌲', '🐦', '🌿', '🌳'], label: '🌲 Forest' },
  },
  {
    id: 3,
    question: 'Game Over হলে কোন sound উচিত?',
    backdrop: 'Game Over',
    correctSound: 'Game Over Sound',
    scene: { bg: 'from-red-900 to-gray-950', emoji: ['💀', '🔴', '⚠️', '🎮'], label: '💀 Game Over' },
  },
];

const ALL_SOUNDS = ['Space Music', 'Bird Chirping', 'Traffic Horn', 'Game Over Sound', 'Meow', 'Raindrops'];

const SOUND_STYLE: Record<string, string> = {
  'Space Music': 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/50 dark:text-indigo-300',
  'Bird Chirping': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
  'Traffic Horn': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
  'Game Over Sound': 'bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-900/50 dark:text-gray-300',
  'Meow': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300',
  'Raindrops': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300',
};

export function SceneDirectorGame() {
  const { ref, isVisible } = useScrollAnimation();
  const [levelIdx, setLevelIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [status, setStatus] = useState<'playing' | 'success' | 'failure' | 'completed'>('playing');
  const [showConfetti, setShowConfetti] = useState(false);
  const [chosenSound, setChosenSound] = useState<string | null>(null);

  const currentLevel = LEVELS[levelIdx];

  const handleDragStart = (e: React.DragEvent, sound: string) => {
    e.dataTransfer.setData('text/plain', sound);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (status !== 'playing') return;
    const sound = e.dataTransfer.getData('text/plain');
    setChosenSound(sound);

    if (sound === currentLevel.correctSound) {
      setXp(p => p + Math.round(500 / LEVELS.length));
      setStatus('success');
      const isLast = levelIdx === LEVELS.length - 1;
      setTimeout(() => {
        if (isLast) {
          setStatus('completed');
          setShowConfetti(true);
        } else {
          setLevelIdx(i => i + 1);
          setChosenSound(null);
          setStatus('playing');
        }
      }, 2000);
    } else {
      setStatus('failure');
      setXp(p => Math.max(0, p - 50));
    }
  };

  const handleRetry = () => { setChosenSound(null); setStatus('playing'); };
  const handleRestart = () => { setLevelIdx(0); setXp(0); setChosenSound(null); setStatus('playing'); setShowConfetti(false); };

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <Confetti active={showConfetti} />

        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
            <span className="gradient-text">Scene Director</span>
          </h2>
          <p className="text-xl font-bold text-emerald-500 mb-6">Level 10 : Audio-Visual Director</p>

          <div className="flex justify-center items-center gap-4 flex-wrap">
            <div className="bg-white dark:bg-gray-800 px-6 py-2 rounded-full border-2 border-emerald-500/20 shadow-sm">
              <span className="text-gray-500 dark:text-gray-400 mr-2">XP:</span>
              <span className="font-bold text-emerald-500">{xp}</span>
            </div>
            {/* Progress dots */}
            <div className="flex gap-2 items-center">
              {LEVELS.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < levelIdx ? 'bg-green-500' : i === levelIdx && status !== 'completed' ? 'bg-emerald-500' : i < levelIdx + 1 && status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
            {status === 'completed' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 px-5 py-2 rounded-full font-bold border-2 border-yellow-400 flex items-center gap-2">
                🏆 Multimedia Master Badge!
              </motion.div>
            )}
          </div>
        </motion.div>

        {status === 'completed' ? (
          <Card className="p-10 text-center bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
            <div className="text-6xl mb-6">🎬</div>
            <h3 className="text-3xl font-bold mb-4 text-green-600 dark:text-green-400">অসাধারণ! তুমি একজন Audio-Visual Director!</h3>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8">তুমি 🏆 Multimedia Master ব্যাজ এবং {xp} XP পেয়েছ!</p>
            <Button onClick={handleRestart} variant="primary">Play Again</Button>
          </Card>
        ) : (
          <Card className={`p-8 bg-white dark:bg-gray-800 border-4 transition-colors duration-300 ${status === 'success' ? 'border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.3)]' : status === 'failure' ? 'border-red-500' : 'border-emerald-500/20'}`}>

            {/* Level header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Scene {levelIdx + 1} of {LEVELS.length}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">Backdrop: {currentLevel.backdrop}</span>
            </div>

            {/* Scene preview */}
            <div className={`relative h-44 rounded-2xl bg-gradient-to-b ${currentLevel.scene.bg} overflow-hidden mb-8 border-2 border-gray-700`}>
              <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded-full z-10">
                {currentLevel.scene.label}
              </span>
              <div className="absolute bottom-3 left-0 right-0 flex justify-around px-6">
                {currentLevel.scene.emoji.map((e, i) => (
                  <motion.span key={i} className="text-3xl md:text-4xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                    {e}
                  </motion.span>
                ))}
              </div>
              {/* Sound slot drop zone inside scene */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`absolute bottom-3 right-3 w-40 h-10 rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${chosenSound ? 'border-transparent' : 'border-white/40 bg-white/10 hover:bg-white/20'}`}
              >
                {chosenSound ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-full h-full rounded-xl border-2 flex items-center justify-center text-xs font-bold font-mono px-2 ${SOUND_STYLE[chosenSound]}`}>
                    🔊 {chosenSound}
                  </motion.div>
                ) : (
                  <span className="text-white/70 text-xs text-center leading-tight px-1">Drop sound here</span>
                )}
              </div>
            </div>

            {/* Question */}
            <p className="text-center font-bold text-lg text-gray-800 dark:text-gray-100 mb-8">{currentLevel.question}</p>

            {/* Sound palette */}
            <div className="flex justify-center flex-wrap gap-3 mb-6">
              {ALL_SOUNDS.map(sound => (
                <div
                  key={sound}
                  draggable={status === 'playing'}
                  onDragStart={e => handleDragStart(e, sound)}
                  className={`px-4 py-2 rounded-full font-mono text-sm font-bold border-2 select-none transition-transform ${status === 'playing' ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-not-allowed opacity-40'} ${SOUND_STYLE[sound]}`}
                >
                  🎵 {sound}
                </div>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {status === 'failure' && (
                <motion.div key="fail" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mt-4">
                  <p className="text-red-500 font-bold text-xl mb-3">❌ Scene Sync Failed</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">এই দৃশ্যে এই শব্দ মানায় না!</p>
                  <Button onClick={handleRetry} variant="ghost">আবার চেষ্টা করো</Button>
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center mt-4">
                  <p className="text-green-500 font-bold text-xl">✅ Perfect Scene Sync!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}
      </div>
    </section>
  );
}
