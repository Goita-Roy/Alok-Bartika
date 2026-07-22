import { motion } from 'framer-motion';
import { Card } from '../intermediate/ui/Card';
import { Button } from '../intermediate/ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const algorithmDefinition = {
  title: 'অ্যালগরিদম',
  pronunciation: 'উচ্চারণ: অ্যাল-গ-রিদ-ম',
  meaning: 'Algorithm',
  definition: 'অ্যালগরিদম হলো কোনো সমস্যা সমাধানের জন্য ধাপে ধাপে নির্দেশনার একটি সেট। এটি একটি নির্দিষ্ট ক্রমে সম্পাদিত হয় এবং একটি নির্দিষ্ট ফলাফল প্রদান করে।',
};

const flowchartDefinition = {
  title: 'ফ্লোচার্ট',
  pronunciation: 'উচ্চারণ: ফ্লো-চার্ট',
  meaning: 'Flowchart',
  definition: 'ফ্লোচার্ট হলো অ্যালগরিদমের একটি গ্রাফিক্যাল উপস্থাপনা। বিভিন্ন জ্যামিতিক আকৃতি ব্যবহার করে স্টেপগুলো দেখানো হয় এবং তীর চিহ্ন দিয়ে ফ্লো বুঝানো হয়।',
};

const keyPoints = [
  {
    icon: '🎯',
    title: 'সুনির্দিষ্ট',
    desc: 'প্রতিটি স্টেপ স্পষ্ট ও নির্দিষ্ট হতে হবে',
  },
  {
    icon: '🔄',
    title: 'সসীম',
    desc: 'নির্দিষ্ট সংখ্যক স্টেপের পর শেষ হতে হবে',
  },
  {
    icon: '📊',
    title: 'ইনপুট ও আউটপুট',
    desc: 'শুরুতে ইনপুট, শেষে আউটপুট থাকতে হবে',
  },
  {
    icon: '✅',
    title: 'কার্যকরী',
    desc: 'প্রতিটি স্টেপ বাস্তবসম্মত ও কার্যকর হতে হবে',
  },
];

const flowChartSymbols = [
  { symbol: '⬭', label: 'ওভাল', meaning: 'শুরু/শেষ', color: 'from-emerald-500 to-emerald-600' },
  { symbol: '▱', label: 'প্যারালেলোগ্রাম', meaning: 'ইনপুট/আউটপুট', color: 'from-sky-500 to-sky-600' },
  { symbol: '▭', label: 'রেক্ট্যাঙ্গেল', meaning: 'প্রসেস', color: 'from-amber-500 to-amber-600' },
  { symbol: '◇', label: 'ডায়মন্ড', meaning: 'ডিসিশন', color: 'from-purple-500 to-purple-600' },
];

type DefinitionCardProps = {
  def: typeof algorithmDefinition;
  index: number;
  isVisible: boolean;
};

function DefinitionCard({ def, index, isVisible }: DefinitionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
      animate={isVisible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      <Card className="h-full">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{index === 0 ? '💻' : '📊'}</span>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{def.title}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{def.pronunciation}</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-4">{def.meaning}</p>
        <p className="text-gray-800 dark:text-gray-100 leading-relaxed">{def.definition}</p>
      </Card>
    </motion.div>
  );
}

type SymbolCardProps = {
  symbol: { symbol: string; label: string; meaning: string; color: string };
  index: number;
  isVisible: boolean;
};

function SymbolCard({ symbol, index, isVisible }: SymbolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
    >
      <Card className="text-center h-full cursor-default">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${symbol.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {symbol.symbol}
          </div>
        </div>
        <h4 className="font-bold text-gray-800 dark:text-gray-100">{symbol.label}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{symbol.meaning}</p>
      </Card>
    </motion.div>
  );
}

export default function DefinitionSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center py-20 px-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900"
    >
      <div className="max-6xl mx-auto w-full max-w-6xl">
        <motion.h2
          className="text-3xl md:text-4xl font-extrabold text-center mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
        >
          <span className="gradient-text">ডেফিনেশন ও কনসেপ্ট</span>
        </motion.h2>
        <motion.p
          className="text-center text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
        >
          অ্যালগরিদম ও ফ্লোচার্টের বেসিক কনসেপ্টগুলো সহজ ভাষায় জেনে নাও
        </motion.p>

        {/* Definition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[algorithmDefinition, flowchartDefinition].map((def, i) => (
            <DefinitionCard key={def.title} def={def} index={i} isVisible={isVisible} />
          ))}
        </div>

        {/* Key Points */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
            অ্যালগরিদমের বৈশিষ্ট্য
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyPoints.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="h-full text-center">
                  <div className="text-3xl mb-3">{point.icon}</div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">{point.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{point.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Flowchart Symbols Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-8">
            ফ্লোচার্ট সিম্বল গাইড
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {flowChartSymbols.map((symbol, i) => (
              <SymbolCard key={symbol.label} symbol={symbol} index={i} isVisible={isVisible} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
