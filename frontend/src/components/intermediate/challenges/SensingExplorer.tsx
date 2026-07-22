import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export function SensingExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const simulateHover = activeBlock === 'mouse';
  const simulateSpace = activeBlock === 'space';

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400">
            Sensing Block Explorer - ব্লকে ক্লিক করে দেখো কীভাবে কাজ করে
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={isVisible ? { opacity: 1, x: 0 } : {}} className="flex flex-col gap-6">
            <div 
              className={`cursor-pointer rounded-full border-2 p-6 transition-all duration-300 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 flex items-center justify-center font-mono text-xl md:text-2xl font-bold shadow-sm ${activeBlock === 'mouse' ? 'ring-4 ring-blue-500 scale-105 shadow-blue-500/50' : 'hover:scale-105'}`}
              onClick={() => setActiveBlock(activeBlock === 'mouse' ? null : 'mouse')}
            >
              touching [Mouse-pointer]?
            </div>
            
            <div 
              className={`cursor-pointer rounded-full border-2 p-6 transition-all duration-300 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 flex items-center justify-center font-mono text-xl md:text-2xl font-bold shadow-sm ${activeBlock === 'space' ? 'ring-4 ring-blue-500 scale-105 shadow-blue-500/50' : 'hover:scale-105'}`}
              onClick={() => setActiveBlock(activeBlock === 'space' ? null : 'space')}
            >
              key [space] pressed?
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={isVisible ? { opacity: 1, x: 0 } : {}} className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-emerald-500/20 p-8 flex items-center justify-center min-h-[300px] relative overflow-hidden shadow-lg">
            {!activeBlock && (
              <p className="text-gray-500 dark:text-gray-400 text-lg text-center">যেকোনো একটি ব্লক নির্বাচন করো</p>
            )}

            <AnimatePresence mode="wait">
              {simulateHover && (
                <motion.div key="sim-mouse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center relative">
                  <div className="w-24 h-24 bg-yellow-200 border-4 border-yellow-400 rounded-2xl flex items-center justify-center text-4xl shadow-md z-10">
                    🐱
                  </div>
                  <motion.div 
                    initial={{ x: -150, y: -150, opacity: 0 }} 
                    animate={{ x: [ -150, 0, -50 ], y: [ -150, 0, -50 ], opacity: 1 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute text-5xl z-20 pointer-events-none drop-shadow-xl"
                  >
                    👆
                  </motion.div>
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
                    className="absolute w-32 h-32 bg-blue-400/30 rounded-full z-0 pointer-events-none"
                  />
                  <div className="absolute bottom-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono">
                    Output: True
                  </div>
                </motion.div>
              )}

              {simulateSpace && (
                <motion.div key="sim-space" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col items-center justify-center relative">
                  <motion.div 
                    animate={{ y: [0, -40, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-24 h-24 bg-green-200 border-4 border-green-400 rounded-2xl flex items-center justify-center text-4xl shadow-md z-10 mb-8"
                  >
                    🐱
                  </motion.div>
                  
                  <motion.div 
                    animate={{ scale: [1, 0.95, 1], backgroundColor: ['#f3f4f6', '#d1d5db', '#f3f4f6'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-48 h-12 border-2 border-gray-400 rounded-lg flex items-center justify-center font-mono font-bold text-gray-500 shadow-inner"
                  >
                    SPACE
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    className="absolute text-3xl z-20 pointer-events-none drop-shadow-xl"
                    style={{ bottom: '20px' }}
                  >
                    👇
                  </motion.div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-mono">
                    Output: True
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



