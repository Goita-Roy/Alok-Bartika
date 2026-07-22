"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, Database, Wifi, AlertTriangle, ArrowRight, RotateCcw, Zap, CheckCircle, FileWarning } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const triadSteps = [
  { id: "confidentiality", label: "Confidentiality", icon: "🔒", color: "#38bdf8", bangla: "গোপনীয়তা", desc: "ডেটা যেন এনক্রিপ্টেড (লক) থাকে, কেউ যেন দেখতে না পারে।" },
  { id: "integrity", label: "Integrity", icon: "🔗", color: "#34d399", bangla: "অখণ্ডতা", desc: "ডেটা যেন মাঝপথে কেউ বদলে দিতে না পারে।" },
  { id: "availability", label: "Availability", icon: "🌐", color: "#fbbf24", bangla: "সহজলভ্যতা", desc: "আসল ইউজার যেন সবসময় তার অ্যাকাউন্ট অ্যাক্সেস করতে পারে।" },
];

export default function Section4_HowItWorks_10() {
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const startFlow = useCallback(() => {
    setIsPlaying(true);
    setActiveStep(-1);
    triadSteps.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i === triadSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), 1500);
        }
      }, i * 1500);
    });
  }, []);

  const resetFlow = useCallback(() => {
    setIsPlaying(false);
    setActiveStep(-1);
  }, []);

  return (
    <SectionWrapper
      id="security-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<Shield className="w-5 h-5" />}
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
            সাইবার নিরাপত্তা মূলত কাজ করে{" "}
            <span className="text-cyan-300 font-semibold">তিনটি স্তরে (CIA Triad)</span>
          </p>
        </motion.div>

        {/* CIA Triad Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {triadSteps.map((step, i) => (
            <motion.div
              key={step.id}
              animate={{
                scale: activeStep === i ? 1.05 : 1,
                borderColor: activeStep >= i ? step.color : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.3 }}
              className={`glass rounded-xl p-5 md:p-6 text-center border-2 transition-all ${
                activeStep >= i ? "bg-white/5" : ""
              }`}
            >
              <motion.div
                animate={activeStep === i ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 0.6, repeat: activeStep === i ? Infinity : 0 }}
                className="text-3xl mb-3"
              >
                {step.icon}
              </motion.div>
              <h4 className="text-sm font-bold mb-1" style={{ color: step.color }}>
                {step.bangla}
              </h4>
              <p className="text-[10px] text-slate-500 mb-2">{step.label}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              {activeStep === i && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2"
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto"
                    style={{ backgroundColor: step.color, boxShadow: `0 0 6px ${step.color}` }}
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Firewall & Antivirus Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h4 className="text-lg md:text-xl font-bold text-center mb-6 text-gradient">
              সুরক্ষার প্রহরী
            </h4>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass rounded-xl p-5 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  🧱
                </motion.div>
                <h5 className="text-base font-bold text-blue-300 mb-2">ফায়ারওয়াল (Firewall)</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ফায়ারওয়াল নেটওয়ার্কের প্রবেশপথে পাহারাদার হিসেবে কাজ করে। এটি ভালো ট্রাফিককে ভেতরে যেতে দেয় এবং খারাপ ট্রাফিককে ব্লক করে।
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass rounded-xl p-5 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  🛡️
                </motion.div>
                <h5 className="text-base font-bold text-green-300 mb-2">অ্যান্টিভাইরাস</h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  অ্যান্টিভাইরাস প্রতিনিয়ত ক্ষতিকারক ম্যালওয়্যার স্ক্যান করে সিস্টেম নিরাপদ রাখে।
                </p>
              </motion.div>
            </div>

            <AnimatePresence>
              {activeStep >= 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass rounded-xl p-4 mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">CIA Triad সক্রিয়</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-full max-w-xs glass rounded-lg py-2 px-4 text-center bg-blue-500/10 border border-blue-500/30"
                    >
                      <span className="text-xs text-blue-300">🔒 {triadSteps[0].bangla} - ডেটা এনক্রিপ্টেড</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-sm glass rounded-lg py-2 px-4 text-center bg-green-500/10 border border-green-500/30"
                    >
                      <span className="text-xs text-green-300">🔗 {triadSteps[1].bangla} - ডেটা অপরিবর্তিত</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full max-w-[90%] glass rounded-lg py-2 px-4 text-center bg-amber-500/10 border border-amber-500/30"
                    >
                      <span className="text-xs text-amber-300">🌐 {triadSteps[2].bangla} - অ্যাক্সেস সক্রিয়</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 justify-center flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startFlow}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                  isPlaying
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>{isPlaying ? "চলছে..." : "CIA Triad চালু করো"}</span>
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
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
