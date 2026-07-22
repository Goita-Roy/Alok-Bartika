import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export function IfElseBlockExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [expanded, setExpanded] = useState(false);
  const [revealTrue, setRevealTrue] = useState(false);
  const [revealElse, setRevealElse] = useState(false);

  const toggleBlock = useCallback(() => {
    if (expanded) {
      setExpanded(false);
      setRevealTrue(false);
      setRevealElse(false);
    } else {
      setExpanded(true);
    }
  }, [expanded]);

  return (
    <section ref={ref} className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-slate-900">
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <span className="gradient-text">If-Else Block Explorer</span>
        </motion.h2>
        <motion.p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-lg" initial={{ opacity: 0 }} animate={isVisible ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>
          Scratch-স্টাইল If-Else ব্লক ঘুরিয়ে দেখো
        </motion.p>

        <div className="flex justify-center">
          <motion.div
            className="w-full max-w-md cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
          >
            {/* If-Else Block */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden"
              onClick={toggleBlock}
              whileHover={{ scale: 1.01 }}
              layout
            >
              {/* If header */}
              <motion.div
                className="flex items-center gap-3 p-5 bg-green-100 dark:bg-green-900/30 border-b-2 border-green-300 dark:border-green-700"
                layout
              >
                <motion.div
                  className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm"
                  animate={{ rotate: expanded ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▶
                </motion.div>
                <span className="text-xl font-bold text-green-700 dark:text-green-300">if &lt;শর্ত&gt; then</span>
              </motion.div>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden"
                  >
                    {/* True Area */}
                    <motion.div
                      className="mx-4 mt-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setRevealTrue(!revealTrue); }}
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="font-bold text-blue-600 dark:text-blue-300">True Area ✅</span>
                        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{revealTrue ? '▲' : '▼'} ক্লিক করো</span>
                      </div>
                      <AnimatePresence>
                        {revealTrue && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-green-300 dark:border-green-600 mt-2">
                              <p className="text-lg font-bold text-green-600 dark:text-green-300 text-center">
                                শর্ত সত্যি — "A+" গ্রেড পাবে!
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Else Area */}
                    <motion.div
                      className="mx-4 mt-3 mb-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); setRevealElse(!revealElse); }}
                      whileHover={{ scale: 1.02 }}
                      layout
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-4 h-4 rounded-full bg-orange-500" />
                        <span className="font-bold text-orange-600 dark:text-orange-300">Else Area ❌</span>
                        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{revealElse ? '▲' : '▼'} ক্লিক করো</span>
                      </div>
                      <AnimatePresence>
                        {revealElse && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white dark:bg-gray-700 rounded-xl border-2 border-orange-300 dark:border-orange-600 mt-2">
                              <p className="text-lg font-bold text-orange-600 dark:text-orange-300 text-center">
                                শর্ত মিথ্যা — সাধারণ গ্রেড
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              {!expanded && (
                <motion.div className="p-4 text-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
                    🔽 ব্লকটি খুলতে ক্লিক করো
                  </span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


