"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, MemoryStick, Files, Monitor, Zap, ArrowRight, RotateCcw, Server, AppWindow } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const osDuties = [
  { id: "processor", label: "Processor Management", icon: "⚡", color: "#38bdf8", desc: "কোন অ্যাপ কতক্ষণ প্রসেসর ব্যবহার করবে তা ঠিক করে" },
  { id: "memory", label: "Memory Management", icon: "🧠", color: "#c084fc", desc: "RAM-এর জায়গা বরাদ্দ করে" },
  { id: "file", label: "File Management", icon: "📁", color: "#f472b6", desc: "স্টোরেজে ফাইল সাজিয়ে রাখে" },
  { id: "ui", label: "User Interface (UI)", icon: "🖥️", color: "#34d399", desc: "আমাদের স্ক্রিনে গ্রাফিক্স বা আইকন দেখায় যাতে আমরা সহজে ক্লিক করতে পারি" },
];

export default function Section4_HowItWorks_08() {
  const [activePhase, setActivePhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slowMo, setSlowMo] = useState(false);

  const startFlow = useCallback(() => {
    setIsPlaying(true);
    setActivePhase(-1);
    const delay = slowMo ? 2000 : 1000;
    osDuties.forEach((_, i) => {
      setTimeout(() => {
        setActivePhase(i);
        if (i === osDuties.length - 1) {
          setTimeout(() => setIsPlaying(false), delay);
        }
      }, i * delay);
    });
  }, [slowMo]);

  const resetFlow = useCallback(() => {
    setIsPlaying(false);
    setActivePhase(-1);
  }, []);

  const dutyPhrases = [
    { text: "কোন অ্যাপ কতক্ষণ প্রসেসর ব্যবহার করবে তা ঠিক করে।", detail: "OS প্রতিটি অ্যাপকে CPU-র একটি নির্দিষ্ট সময়slice দেয়, যাতে সব অ্যাপ সমানভাবে কাজ করতে পারে।" },
    { text: "RAM-এর জায়গা বরাদ্দ করে।", detail: "OS প্রতিটি রানিং অ্যাপের জন্য RAM-এর নির্দিষ্ট অংশ বরাদ্দ করে এবং প্রয়োজনমতো বাড়ায়-কমায়।" },
    { text: "স্টোরেজে ফাইল সাজিয়ে রাখে।", detail: "OS ফাইল সিস্টেম ব্যবহার করে ডেটাকে ফোল্ডার ও ফাইল আকারে সংগঠিত রাখে — নাম, সাইজ, টাইপ অনুযায়ী।" },
    { text: "আমাদের স্ক্রিনে গ্রাফিক্স বা আইকন দেখায় যাতে আমরা সহজে ক্লিক করতে পারি।", detail: "GUI (Graphical User Interface) ব্যবহারকারীদের ক্লিক, ড্র্যাগ এবং টাইপের মাধ্যমে কম্পিউটার চালাতে সাহায্য করে।" },
  ];

  return (
    <SectionWrapper
      id="os-how-it-works"
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
            OS প্রধানত ৪টি বড় দায়িত্ব পালন করে:
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center mb-6">
          {osDuties.map((duty, i) => (
            <div key={duty.id} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <motion.div
                animate={{
                  scale: activePhase === i ? 1.08 : 1,
                  borderColor: activePhase >= i ? duty.color : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.3 }}
                className={`glass rounded-xl px-4 py-3 text-center w-full md:w-40 border-2 transition-all ${
                  activePhase >= i ? "bg-white/5" : ""
                }`}
              >
                <motion.div
                  animate={activePhase === i ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 0.6, repeat: activePhase === i ? Infinity : 0 }}
                  className="text-2xl mb-1"
                >
                  {duty.icon}
                </motion.div>
                <span
                  className="text-[10px] font-semibold block"
                  style={{ color: activePhase >= i ? duty.color : "#64748b" }}
                >
                  {duty.label}
                </span>
                {activePhase === i && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-1"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mx-auto"
                      style={{ backgroundColor: duty.color, boxShadow: `0 0 6px ${duty.color}` }}
                    />
                  </motion.div>
                )}
              </motion.div>
              {i < osDuties.length - 1 && (
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
              OS-এর প্রধান দায়িত্বসমূহ
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
                    <Server className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-slate-400">OS রিসোর্স ম্যানেজমেন্ট</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl font-mono font-bold tracking-widest"
                    style={{ color: "#f472b6" }}
                  >
                    🖥️ OS → CPU / RAM / Storage
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
                    <span className="text-xs text-slate-400">রিসোর্স অ্যালোকেশন ভিউ</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-full max-w-xs glass rounded-lg py-2 px-4 text-center bg-blue-500/10 border border-blue-500/30"
                    >
                      <span className="text-xs text-blue-300">⚡ Processor Management</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-sm glass rounded-lg py-2 px-4 text-center bg-purple-500/10 border border-purple-500/30"
                    >
                      <span className="text-xs text-purple-300">🧠 Memory Management</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full max-w-[90%] glass rounded-lg py-2 px-4 text-center bg-green-500/10 border border-green-500/30"
                    >
                      <span className="text-xs text-green-300">📁 File Management</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 mb-6">
              {dutyPhrases.map((phrase, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: activePhase >= i ? 1 : 0.3,
                    x: activePhase === i ? 5 : 0,
                  }}
                  className="flex items-start gap-2"
                >
                  <motion.div
                    animate={activePhase === i ? { scale: [1, 1.3, 1] } : {}}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: osDuties[i].color }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-300">{phrase.text}</span>
                    {activePhase === i && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] text-slate-500 mt-1"
                      >
                        {phrase.detail}
                      </motion.p>
                    )}
                  </div>
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
