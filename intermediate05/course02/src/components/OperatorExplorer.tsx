import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const categories = [
  {
    id: 'math',
    title: 'Mathematical Operators',
    icon: '➕',
    color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
    operators: [
      { op: '+', name: 'যোগ' },
      { op: '-', name: 'বিয়োগ' },
      { op: '*', name: 'গুণ' },
      { op: '/', name: 'ভাগ' }
    ]
  },
  {
    id: 'comp',
    title: 'Comparison Operators',
    icon: '⚖️',
    color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
    operators: [
      { op: '>', name: 'বড়' },
      { op: '<', name: 'ছোট' },
      { op: '=', name: 'সমান' }
    ]
  },
  {
    id: 'logic',
    title: 'Logical Operators',
    icon: '🧠',
    color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
    borderColor: 'border-purple-300 dark:border-purple-700',
    operators: [
      { op: 'and', name: 'এবং' },
      { op: 'or', name: 'অথবা' },
      { op: 'not', name: 'না' }
    ]
  }
];

export function OperatorExplorer() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: -20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}}>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            <span className="gradient-text">ভিজ্যুয়াল লার্নিং</span>
          </h2>
          <p className="text-xl text-muted dark:text-muted-dark">
            Operator Explorer - ক্লিক করে দেখো কোন ক্যাটাগরিতে কী কী অপারেটর আছে
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 20 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ delay: index * 0.1 }}>
              <div 
                className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 ${cat.borderColor} ${activeCategory === cat.id ? 'ring-4 ring-primary/30 scale-105' : 'hover:scale-105 hover:shadow-lg'} bg-white dark:bg-card-dark`}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-5xl mb-4">{cat.icon}</div>
                  <h3 className="text-xl font-bold text-text dark:text-text-dark">{cat.title}</h3>
                </div>
              </div>

              <AnimatePresence>
                {activeCategory === cat.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className={`p-6 rounded-2xl border-2 ${cat.borderColor} ${cat.color} flex flex-wrap justify-center gap-4`}>
                      {cat.operators.map((op, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ delay: i * 0.1 }}
                          className={`
                            px-6 py-3 rounded-full font-mono text-2xl font-bold shadow-sm 
                            flex items-center gap-3 bg-white/90 dark:bg-black/50 border ${cat.borderColor}
                          `}
                        >
                          <span>{op.op}</span>
                          <span className="text-sm opacity-70 tracking-wide font-sans">{op.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
