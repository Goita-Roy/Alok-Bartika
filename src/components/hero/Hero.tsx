import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../intermediate/ui/Button';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export default function Hero() {
  const { ref } = useScrollAnimation();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-slate-900"
    >
      {/* Animated background grid */}
      <motion.div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ y: bgY }}
      >
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(#58cc02 1px, transparent 1px), linear-gradient(90deg, #58cc02 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-amber-500/5 blur-3xl"
        animate={{ scale: [1, 1.4, 1], y: [0, -30, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-12"
        style={{ opacity, scale }}
      >
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.span
              className="inline-block px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-semibold tracking-wide mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              🚀 Intermediate Course 05
            </motion.span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">
                Algorithm & Flowchart
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-100">
                ভিজ্যুয়াল লার্নিং
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              অ্যালগরিদম ও ফ্লোচার্টের মজার জগতে স্বাগতম! ইন্টারঅ্যাকটিভ উদাহরণ, ড্র্যাগ-এন্ড-ড্রপ
              আর ভিজ্যুয়াল স্টোরির মাধ্যমে শিখবে অ্যালগরিদমের বেসিক কনসেপ্ট।
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button variant="primary" size="lg" className="shadow-lg shadow-emerald-500/30">
                🎯 শুরু করি
              </Button>
              <Button variant="outline" size="lg">
                📚 কোর্স ওভারভিউ
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {[
                { value: '৫টি', label: 'মডিউল' },
                { value: '১২টি', label: 'লেসন' },
                { value: 'ইন্টার‍্যাক্টিভ', label: 'লার্নিং' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Right - Algorithm Visual */}
        <motion.div
          className="flex-1 w-full max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AlgorithmIllustration />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-sm font-medium">Scroll Down</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}

function AlgorithmIllustration() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: 'ইনপুট', icon: '📥', color: 'bg-emerald-500' },
    { label: 'প্রসেস', icon: '⚙️', color: 'bg-sky-500' },
    { label: 'ডিসিশন', icon: '🔀', color: 'bg-amber-500' },
    { label: 'আউটপুট', icon: '📤', color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="text-center mb-6">
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">🔍 অ্যালগরিদম ফ্লো</div>
        <div className="text-lg font-bold text-gray-800 dark:text-gray-100">Problem → Solution</div>
      </div>

      {/* Flowchart visualization */}
      <div className="flex flex-col items-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <motion.div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-500 ${
                activeStep === i
                  ? `${step.color} text-white shadow-lg scale-110`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
              onClick={() => setActiveStep(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {step.icon}
            </motion.div>
            <span className={`text-xs font-semibold mt-1 ${
              activeStep === i ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
            }`}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className="h-6 w-0.5 bg-gray-200 dark:bg-gray-600">
                <motion.div
                  className="w-full h-full bg-gradient-to-b from-emerald-500 to-sky-500"
                  initial={{ height: '0%' }}
                  animate={{ height: activeStep > i ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{steps[activeStep].icon}</span>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-100">{steps[activeStep].label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {['তথ্য ইনপুট করা', 'প্রসেসিং স্টেপ', 'সিদ্ধান্ত গ্রহণ', 'ফলাফল দেখানো'][activeStep]}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-amber-500/5 p-3 rounded-lg">
            💡 কনসেপ্ট: {[
              'অ্যালগরিদম শুরু হয় ইনপুট দিয়ে',
              'প্রসেসিং স্টেপে ডাটা প্রসেস হয়',
              'শর্ত চেক করে সিদ্ধান্ত নেয়া হয়',
              'ফলাফল আউটপুট হিসেবে দেখানো হয়',
            ][activeStep]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
