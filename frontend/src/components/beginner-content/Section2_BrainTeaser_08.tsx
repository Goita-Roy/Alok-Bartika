"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, RefreshCw, MessageCircle } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

export default function Section2_BrainTeaser_08() {
  const [state, setState] = useState<"question" | "answer">("question");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleReveal = useCallback(() => {
    setState("answer");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const handleReset = useCallback(() => {
    setState("question");
    setShowConfetti(false);
  }, []);

  return (
    <SectionWrapper
      id="os-brain-teaser"
      title="একটি মজার প্রশ্ন"
      icon={<Brain className="w-5 h-5" />}
    >
      <div className="relative">
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
            >
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-5%",
                    background: [
                      "#c084fc", "#818cf8", "#38bdf8", "#34d399",
                      "#f472b6", "#fbbf24", "#fb923c",
                    ][Math.floor(Math.random() * 7)],
                  }}
                  animate={{
                    y: ["0vh", "100vh"],
                    x: [0, (Math.random() - 0.5) * 200],
                    rotate: [0, 720],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {state === "question" && (
                <motion.div
                  key="question"
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center mb-6"
                  >
                    <MessageCircle className="w-16 h-16 text-amber-400" />
                  </motion.div>

                  <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-amber-300">
                    🤔 প্রশ্ন:
                  </h3>

                  <p className="text-lg md:text-xl leading-relaxed text-center text-slate-200 mb-6 max-w-2xl mx-auto">
                    লিনাক্স (Linux) নামক শক্তিশালী ও ফ্রি অপারেটিং সিস্টেমের লোগো কেন একটি পেঙ্গুইন পাখি হলো?
                  </p>

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReveal}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-amber-500/25"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>উত্তর দেখুন</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {state === "answer" && (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="mb-6"
                  >
                    <MessageCircle className="w-16 h-16 mx-auto text-green-400" />
                  </motion.div>

                  <h3 className="text-xl md:text-2xl font-bold mb-6 text-green-400">
                    ✅ উত্তর:
                  </h3>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass bg-green-500/5 border-green-500/20 rounded-xl p-6 md:p-8 mb-6 text-left"
                  >
                    <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                      লিনাক্সের জনক লিনুস তরভালদস একবার এক চিড়িয়াখানায় গিয়ে একটি পেঙ্গুইনের কামড় খেয়েছিলেন! এরপর থেকে পেঙ্গুইনের প্রতি তাঁর এক অদ্ভুত ভালোবাসা জন্মে যায় এবং তিনি লিনাক্সের অফিশিয়াল লোগো হিসেবে &#39;টাক্স&#39; (Tux) নামের এই পেঙ্গুইনটিকে বেছে নেন।
                    </p>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 mx-auto text-slate-300 border border-white/10"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>আবার চেষ্টা করুন</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-xl p-4 md:p-5 mt-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-slate-400">মজার তথ্য</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="glass rounded-lg p-3">
              <p className="text-cyan-400 font-bold mb-1">🐧 লিনাক্সের জন্ম</p>
              <p className="text-slate-500">১৯৯১ সালে লিনুস তরভালদস তৈরি করেন</p>
            </div>
            <div className="glass rounded-lg p-3">
              <p className="text-purple-400 font-bold mb-1">🌍 সবচেয়ে জনপ্রিয় OS</p>
              <p className="text-slate-500">Android — ৩ বিলিয়নের বেশি ডিভাইসে</p>
            </div>
            <div className="glass rounded-lg p-3">
              <p className="text-green-400 font-bold mb-1">🆓 ফ্রি ও ওপেন সোর্স</p>
              <p className="text-slate-500">লিনাক্স সম্পূর্ণ ফ্রি এবং উন্মুক্ত</p>
            </div>
            <div className="glass rounded-lg p-3">
              <p className="text-pink-400 font-bold mb-1">🎯 সুপারকম্পিউটারে রাজত্ব</p>
              <p className="text-slate-500">বিশ্বের ৯৬% সুপারকম্পিউটারে Linux</p>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
