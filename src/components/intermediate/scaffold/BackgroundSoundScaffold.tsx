import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

const CORRECT_ORDER = [
  'switch backdrop to Space',
  'play sound Space Music forever',
  'switch backdrop to Game Over Scene',
  'stop all sounds',
];

const BLOCK_STYLES: Record<string, string> = {
  'switch backdrop to Space': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300',
  'play sound Space Music forever': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
  'switch backdrop to Game Over Scene': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300',
  'stop all sounds': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300',
};

const WATCH_STEPS = [
  {
    code: 'switch backdrop to\n🚀 Space',
    scene: { bg: 'from-slate-900 to-indigo-950', emoji: ['🌟', '🪐', '🚀', '⭐', '✨'], label: 'Space Scene' },
    desc: 'ব্যাকগ্রাউন্ড Space-এ পরিবর্তিত হলো।',
  },
  {
    code: 'play sound\n🎵 Space Music forever',
    scene: null,
    desc: 'Space মিউজিক বাজতে শুরু করল।',
    soundAnim: true,
  },
  {
    code: 'switch backdrop to\n💀 Game Over Scene\nstop all sounds',
    scene: { bg: 'from-red-900 to-gray-950', emoji: ['💀', '🔴', '⚠️'], label: 'Game Over!' },
    desc: 'ব্যাকগ্রাউন্ড বদলে গেল এবং সব শব্দ থেমে গেল।',
    soundStop: true,
  },
];

export function BackgroundSoundScaffold() {
  const { ref, isVisible } = useScrollAnimation();
  const [phase, setPhase] = useState<1 | 2>(1);
  const [watchStep, setWatchStep] = useState(0);

  const allBlocks = [...CORRECT_ORDER];
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'none' | 'success' | 'error'>('none');

  const handleNextWatch = useCallback(() => {
    if (watchStep < WATCH_STEPS.length - 1) {
      setWatchStep(s => s + 1);
    } else {
      setPhase(2);
      setWatchStep(0);
    }
  }, [watchStep]);

  const handleDragStart = (e: React.DragEvent, block: string) => {
    e.dataTransfer.setData('text/plain', block);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const block = e.dataTransfer.getData('text/plain');
    if (placed.includes(block) || slots[idx] !== null) return;
    const newSlots = [...slots];
    newSlots[idx] = block;
    setSlots(newSlots);
    const newPlaced = [...placed, block];
    setPlaced(newPlaced);
    if (newSlots.filter(Boolean).length === 4) {
      const correct = newSlots.every((s, i) => s === CORRECT_ORDER[i]);
      setFeedback(correct ? 'success' : 'error');
    }
  };
  const resetPhase2 = () => {
    setSlots([null, null, null, null]);
    setPlaced([]);
    setFeedback('none');
  };

  const step = WATCH_STEPS[watchStep];

  return (
    <section ref={ref} className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">স্ক্যাফোল্ড লার্নিং</span>
          </h2>
          <div className="flex justify-center gap-4 mt-6">
            <Button variant={phase === 1 ? 'primary' : 'ghost'} onClick={() => { setPhase(1); setWatchStep(0); }}>Phase 1: Watch & Learn</Button>
            <Button variant={phase === 2 ? 'primary' : 'ghost'} onClick={() => setPhase(2)}>Phase 2: Try Yourself</Button>
          </div>
        </motion.div>

        {phase === 1 && (
          <Card className="p-8 bg-white dark:bg-gray-800 border-2 border-emerald-500/20">
            <h3 className="text-2xl font-bold mb-8 text-center text-emerald-500">Watch & Learn</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm text-green-300 whitespace-pre-line leading-relaxed">
                <AnimatePresence mode="wait">
                  <motion.div key={watchStep} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                    {step.code}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 min-h-[160px] flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {step.scene ? (
                    <motion.div
                      key={`scene-${watchStep}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 bg-gradient-to-b ${step.scene.bg} flex flex-col items-end justify-end p-3`}
                    >
                      <span className="absolute top-3 left-3 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded-full">
                        {step.scene.label}
                      </span>
                      <div className="flex gap-2">
                        {step.scene.emoji.map((e, i) => (
                          <motion.span key={i} className="text-3xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 + 0.3 }}>
                            {e}
                          </motion.span>
                        ))}
                      </div>
                      {step.soundStop && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                        >
                          🔇 Sound Stopped
                        </motion.div>
                      )}
                    </motion.div>
                  ) : step.soundAnim ? (
                    <motion.div key={`sound-${watchStep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 p-6">
                      <div className="flex gap-1 items-end">
                        {[...Array(8)].map((_, i) => (
                          <motion.div key={i} className="w-2 bg-purple-400 rounded-full" animate={{ height: [4, 28, 8, 22, 4] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.09 }} />
                        ))}
                      </div>
                      <span className="text-sm text-purple-500 font-bold">🎵 Space Music Playing…</span>
                    </motion.div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">Start to see the scene</p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 italic">{step.desc}</p>

            <div className="flex justify-center">
              <Button onClick={handleNextWatch} variant="primary">
                {watchStep < WATCH_STEPS.length - 1 ? 'Next Step' : 'Try Yourself →'}
              </Button>
            </div>
          </Card>
        )}

        {phase === 2 && (
          <Card className={`p-8 bg-white dark:bg-gray-800 border-4 transition-colors duration-300 ${feedback === 'success' ? 'border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.35)]' : feedback === 'error' ? 'border-red-500' : 'border-emerald-500/20'}`}>
            <h3 className="text-2xl font-bold mb-4 text-center text-emerald-500">Try Yourself</h3>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">ব্লকগুলো সঠিক ক্রমে সাজাও।</p>

            <div className="flex justify-center flex-wrap gap-3 mb-10 min-h-[56px]">
              {allBlocks.map(block => !placed.includes(block) && (
                <div
                  key={block}
                  draggable
                  onDragStart={e => handleDragStart(e, block)}
                  className={`cursor-grab active:cursor-grabbing px-4 py-2 rounded-lg border-2 font-mono text-sm font-bold select-none hover:scale-105 transition-transform ${BLOCK_STYLES[block]}`}
                >
                  {block}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 max-w-lg mx-auto">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  onDrop={e => handleDrop(e, idx)}
                  onDragOver={handleDragOver}
                  className={`h-14 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${slots[idx] ? 'border-transparent' : 'border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-emerald-500'}`}
                >
                  {slots[idx] && (
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      className={`w-full h-full flex items-center justify-center px-4 rounded-xl border-2 font-mono text-sm font-bold ${BLOCK_STYLES[slots[idx]!]}`}
                    >
                      {slots[idx]}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {feedback === 'error' && <p className="text-center text-red-500 font-bold mt-6">ক্রম ঠিক নেই। আবার চেষ্টা করো!</p>}
            {feedback === 'success' && <p className="text-center text-green-500 font-bold mt-6">দারুণ! তুমি সঠিক সিকোয়েন্স তৈরি করেছ!</p>}

            <div className="flex justify-center mt-8">
              <Button onClick={resetPhase2} variant="ghost">Reset</Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
