"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Speaker, Binary, Zap, ArrowRight, RotateCcw, Radio, Volume2 } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const flowSteps = [
  { id: "cpu", label: "CPU ফলাফল", icon: "⚡", color: "#38bdf8", desc: "ডিজিটাল ফর্মে (0 আর 1)" },
  { id: "digital", label: "বাইনারি সিগন্যাল", icon: "🔢", color: "#c084fc", desc: "ডিজিটাল সংকেত" },
  { id: "convert", label: "রূপান্তর", icon: "🔄", color: "#f472b6", desc: "মানুষের বোধগম্য মাধ্যমে" },
  { id: "output", label: "আউটপুট প্রদর্শন", icon: "🔊", color: "#34d399", desc: "শব্দ/ছবি/প্রিন্ট" },
];

export default function Section4_HowItWorks_06() {
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
    { text: "সিপিইউ যখন কোনো ফলাফল তৈরি করে, তখন তা থাকে ডিজিটাল ফর্মে (0 আর 1)।" },
    { text: "আউটপুট ডিভাইস সেই বাইনারি সিগন্যালকে মানুষের বোঝার উপযোগী মাধ্যমে রূপান্তর করে।" },
    { text: "যেমন স্পিকার ডিজিটাল সিগন্যালকে অ্যানালগ সাউন্ড ওয়েভে (শব্দ তরঙ্গে) রূপান্তর করে আমাদের কানে পৌঁছে দেয়।" },
  ];

  return (
    <SectionWrapper
      id="output-how-it-works"
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
            সিপিইউ যখন কোনো ফলাফল তৈরি করে, তখন তা থাকে ডিজিটাল ফর্মে (0 আর 1)।
            আউটপুট ডিভাইস সেই বাইনারি সিগন্যালকে মানুষের বোঝার উপযোগী মাধ্যমে রূপান্তর করে।
          </p>
        </motion.div>

        {/* Flow Steps */}
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

        {/* Detailed explanation card */}
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
              স্পিকার — ডিজিটাল থেকে অ্যানালগ রূপান্তর
            </h4>

            {/* Speaker Visual */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={activePhase >= 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: activePhase >= 0 ? 3 : 0 }}
                className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center text-3xl md:text-4xl border border-white/20"
              >
                🔊
              </motion.div>
            </div>

            {/* Binary Display */}
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
                    <span className="text-xs text-slate-400">ডিজিটাল সিগন্যাল</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl font-mono font-bold tracking-widest"
                    style={{ color: "#f472b6" }}
                  >
                    01001000 01100101 01101100 01101100 01101111
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wave form visual */}
            <AnimatePresence>
              {activePhase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-xl p-4 mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">অ্যানালগ সাউন্ড ওয়েভ</span>
                  </div>
                  <div className="flex items-end justify-center gap-1 h-16">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const h = Math.sin(i * 0.3 + (activePhase * 0.5)) * 25 + 25;
                      return (
                        <motion.div
                          key={i}
                          className="w-1.5 rounded-t-full"
                          style={{
                            background: `linear-gradient(to top, #34d399, #38bdf8)`,
                          }}
                          animate={{ height: [h * 0.5, h, h * 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2">শব্দ তরঙ্গ (Sound Wave)</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase description */}
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

            {/* Controls */}
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
