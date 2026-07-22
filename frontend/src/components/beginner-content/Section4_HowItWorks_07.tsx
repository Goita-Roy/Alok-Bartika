"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Binary, Zap, ArrowRight, RotateCcw, AppWindow, Layers } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const flowSteps = [
  { id: "input", label: "ব্যবহারকারী input", icon: "⌨️", color: "#38bdf8", desc: "কী-প্রেস/ক্লিক" },
  { id: "app", label: "অ্যাপ্লিকেশন SW", icon: "📱", color: "#c084fc", desc: "প্রসেস অনুরোধ" },
  { id: "os", label: "অপারেটিং সিস্টেম", icon: "🖥️", color: "#f472b6", desc: "হার্ডওয়্যার ব্যবস্থাপনা" },
  { id: "hw", label: "হার্ডওয়্যার", icon: "⚙️", color: "#34d399", desc: "CPU/RAM/Storage" },
  { id: "output", label: "আউটপুট", icon: "📺", color: "#fbbf24", desc: "ফলাফল প্রদর্শন" },
];

export default function Section4_HowItWorks_07() {
  const [activePhase, setActivePhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slowMo, setSlowMo] = useState(false);

  const startFlow = useCallback(() => {
    setIsPlaying(true);
    setActivePhase(-1);
    const delay = slowMo ? 2000 : 1000;
    flowSteps.forEach((_, i) => {
      setTimeout(() => {
        setActivePhase(i);
        if (i === flowSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), delay);
        }
      }, i * delay);
    });
  }, [slowMo]);

  const resetFlow = useCallback(() => {
    setIsPlaying(false);
    setActivePhase(-1);
  }, []);

  const keyPhrases = [
    { text: "ব্যবহারকারী যখন কীবোর্ডে টাইপ করে (input), অ্যাপ্লিকেশন সফটওয়্যার সেই তথ্য গ্রহণ করে।" },
    { text: "অ্যাপ্লিকেশন অপারেটিং সিস্টেমকে বলে — 'এই ডেটা প্রসেস করো!'" },
    { text: "অপারেটিং সিস্টেম হার্ডওয়্যারকে নির্দেশ দেয় — CPU প্রসেস করে, RAM-এ সংরক্ষণ করে।" },
    { text: "হার্ডওয়্যার কাজ শেষ করে অপারেটিং সিস্টেমকে ফলাফল ফেরত পাঠায়।" },
    { text: "অবশেষে আউটপুট ডিভাইস (মনিটর/স্পিকার) ফলাফল দেখায়।" },
  ];

  return (
    <SectionWrapper
      id="software-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<Cpu className="w-5 h-5" />}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8 text-center"
        >
          <p className="text-base md:text-lg text-slate-300">
            সফটওয়্যার একটি সেতুর মতো কাজ করে — ব্যবহারকারী ও হার্ডওয়্যারের মধ্যে যোগাযোগ স্থাপন করে।
            ব্যবহারকারীর কমান্ডকে সফটওয়্যার প্রসেস করে, অপারেটিং সিস্টেমের মাধ্যমে হার্ডওয়্যারকে নির্দেশ দেয় এবং ফলাফল আউটপুটে দেখায়।
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center mb-6">
          {flowSteps.map((step, i) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <motion.div
                animate={{
                  scale: activePhase === i ? 1.08 : 1,
                  borderColor: activePhase >= i ? step.color : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.3 }}
                className={`glass rounded-xl px-4 py-3 text-center w-full md:w-36 border-2 transition-all ${
                  activePhase >= i ? "bg-white/5" : ""
                }`}
              >
                <motion.div
                  animate={activePhase === i ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 0.6, repeat: activePhase === i ? Infinity : 0 }}
                  className="text-2xl mb-1"
                >
                  {step.icon}
                </motion.div>
                <span
                  className="text-[11px] font-semibold block"
                  style={{ color: activePhase >= i ? step.color : "#64748b" }}
                >
                  {step.label}
                </span>
                <span className="text-[8px] text-slate-500">{step.desc}</span>
                {activePhase === i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mx-auto"
                      style={{ backgroundColor: step.color, boxShadow: `0 0 6px ${step.color}` }}
                    />
                  </motion.div>
                )}
              </motion.div>
              {i < flowSteps.length - 1 && (
                <motion.div
                  animate={activePhase > i ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 0.8, repeat: activePhase > i ? Infinity : 0 }}
                >
                  <ArrowRight className="w-5 h-5 text-slate-600 hidden md:block" />
                  <ArrowRight className="w-5 h-5 text-slate-600 md:hidden rotate-90" />
                </motion.div>
              )}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h4 className="text-lg md:text-xl font-bold text-center mb-6 text-gradient">
              সফটওয়্যার লেয়ার — ইউজার থেকে হার্ডওয়্যার
            </h4>

            <div className="flex justify-center mb-6">
              <motion.div
                animate={activePhase >= 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: activePhase >= 0 ? 3 : 0 }}
                className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center text-3xl md:text-4xl border border-white/20"
              >
                🖥️
              </motion.div>
            </div>

            <AnimatePresence>
              {activePhase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass rounded-xl p-4 mb-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Binary className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-slate-400">সফটওয়্যার প্রসেসিং</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl font-mono font-bold tracking-widest"
                    style={{ color: "#f472b6" }}
                  >
                    Input → Process → Output
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {activePhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-xl p-4 mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AppWindow className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">সফটওয়্যার লেয়ার</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-full max-w-xs glass rounded-lg py-2 px-4 text-center bg-blue-500/10 border border-blue-500/30"
                    >
                      <span className="text-xs text-blue-300">📱 অ্যাপ্লিকেশন লেয়ার</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-sm glass rounded-lg py-2 px-4 text-center bg-purple-500/10 border border-purple-500/30"
                    >
                      <span className="text-xs text-purple-300">🖥️ অপারেটিং সিস্টেম লেয়ার</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full max-w-[90%] glass rounded-lg py-2 px-4 text-center bg-green-500/10 border border-green-500/30"
                    >
                      <span className="text-xs text-green-300">⚙️ হার্ডওয়্যার লেয়ার</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3 mb-6">
              {keyPhrases.map((phrase, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: activePhase >= i ? 1 : 0.3,
                    x: activePhase === i ? 5 : 0,
                  }}
                  className="flex items-start gap-2 text-sm"
                >
                  <motion.div
                    animate={activePhase === i ? { scale: [1, 1.3, 1] } : {}}
                    className="mt-0.5"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: flowSteps[i].color }}
                    />
                  </motion.div>
                  <span className="text-slate-300">{phrase.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startFlow}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                  isPlaying
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>{isPlaying ? "চলছে..." : "প্রক্রিয়া শুরু করো"}</span>
              </motion.button>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSlowMo(!slowMo)}
                  className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                    slowMo
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "glass-hover border-white/10 text-slate-400"
                  }`}
                >
                  🐢 {slowMo ? "Slow-Mo চালু" : "Slow-Mo"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetFlow}
                  className="px-4 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
