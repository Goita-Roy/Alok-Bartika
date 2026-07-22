import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const blocks = [
  {
    id: 'backdrop',
    label: 'switch backdrop to [Desert]',
    color: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700',
    icon: '🏜️',
    description: 'ব্যাকগ্রাউন্ড পরিবর্তন হচ্ছে',
    animScene: {
      bg: 'from-amber-200 to-orange-300 dark:from-amber-800 dark:to-orange-900',
      label: 'Desert Backdrop',
      emoji: '🌵',
    },
  },
  {
    id: 'sound',
    label: 'play sound [Meow] until done',
    color: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    icon: '🔊',
    description: 'শব্দ বাজছে...',
    animScene: null,
  },
];

export function BackdropSoundExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const active = blocks.find(b => b.id === activeBlock);

  const handleClick = (id: string) => {
    if (activeBlock === id) {
      setReplayKey(k => k + 1); // replay
    } else {
      setActiveBlock(id);
      setReplayKey(0);
    }
  };

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Backdrop & Sound Explorer — ব্লকে ক্লিক করে দেখো কী হয়
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Block palette */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            className="flex flex-col gap-5"
          >
            {blocks.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12 }}
              >
                <button
                  onClick={() => handleClick(b.id)}
                  className={`w-full text-left cursor-pointer rounded-2xl border-2 px-6 py-4 font-mono text-lg font-bold transition-all duration-300 select-none ${b.color} ${
                    activeBlock === b.id
                      ? 'ring-4 ring-emerald-500/40 scale-105 shadow-lg'
                      : 'hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <span className="mr-3">{b.icon}</span>
                  {b.label}
                </button>
                {activeBlock === b.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-center"
                  >
                    <button
                      onClick={() => setReplayKey(k => k + 1)}
                      className="text-sm text-emerald-500 font-bold underline underline-offset-2"
                    >
                      🔄 Replay
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Preview pane */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-500/20 overflow-hidden shadow-lg min-h-[260px] flex flex-col"
          >
            {/* Stage area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {!active && (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-gray-500 dark:text-gray-400 text-center px-6"
                  >
                    একটি ব্লক সিলেক্ট করো
                  </motion.p>
                )}

                {active?.id === 'backdrop' && (
                  <motion.div
                    key={`backdrop-${replayKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 bg-gradient-to-b ${active.animScene!.bg} flex flex-col items-center justify-end pb-4`}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full font-mono"
                    >
                      🏜️ Desert Backdrop Active
                    </motion.div>
                    {['🌵', '☀️', '🌵', '🐍'].map((e, i) => (
                      <motion.span
                        key={i}
                        className="text-4xl absolute bottom-2"
                        style={{ left: `${i * 28 + 4}%` }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                      >
                        {e}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {active?.id === 'sound' && (
                  <motion.div
                    key={`sound-${replayKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-6 p-8"
                  >
                    {/* Animated cat */}
                    <motion.div
                      className="text-7xl"
                      animate={{ scale: [1, 1.12, 1], rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 1.4, repeat: 2 }}
                    >
                      🐱
                    </motion.div>
                    {/* Sound bubble */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white dark:bg-gray-800 border-2 border-green-400 rounded-2xl px-5 py-3 font-bold text-green-700 dark:text-green-300 shadow-md relative"
                    >
                      Meow! 🎵
                      <span className="absolute -bottom-2 left-6 text-green-400 text-lg">▼</span>
                    </motion.div>
                    {/* Sound wave bars */}
                    <div className="flex gap-1 items-end">
                      {[...Array(7)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 bg-green-400 rounded-full"
                          animate={{ height: [6, 24, 8, 20, 6] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status bar */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400 font-mono">
              {active ? active.description : 'No block selected'}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



