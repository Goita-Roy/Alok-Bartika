"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, Server, ArrowRight, RotateCcw, Zap, Cable, Package, Monitor } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const netSteps = [
  { id: "request", label: "Request", icon: "📤", color: "#38bdf8", desc: "তোমার ডিভাইস থেকে একটি Request পাঠায়" },
  { id: "cable", label: "Submarine Cable", icon: "🌊", color: "#c084fc", desc: "সাবমেরিন কেবল হয়ে ডেটা চলে যায়" },
  { id: "server", label: "Data Center (Server)", icon: "🏢", color: "#f472b6", desc: "Google-এর Data Center-এ পৌঁছায়" },
  { id: "packet", label: "Data Packet", icon: "📦", color: "#34d399", desc: "Server Website-এর File-গুলো Data Packet আকারে পাঠায়" },
  { id: "browser", label: "Browser", icon: "🌐", color: "#fbbf24", desc: "Browser সেগুলো জোড়া লাগিয়ে Website দেখায়" },
];

export default function Section4_HowItWorks_09() {
  const [activePhase, setActivePhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slowMo, setSlowMo] = useState(false);

  const startFlow = useCallback(() => {
    setIsPlaying(true);
    setActivePhase(-1);
    const delay = slowMo ? 2000 : 1000;
    netSteps.forEach((_, i) => {
      setTimeout(() => {
        setActivePhase(i);
        if (i === netSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), delay);
        }
      }, i * delay);
    });
  }, [slowMo]);

  const resetFlow = useCallback(() => {
    setIsPlaying(false);
    setActivePhase(-1);
  }, []);

  const stepPhrases = [
    { text: "তোমার ডিভাইস থেকে একটি Request পাঠায়।", detail: "ব্রাউজারে URL লিখলেই তোমার ডিভাইস DNS-এর মাধ্যমে সার্ভারের IP ঠিকানা খুঁজে বের করে এবং Request পাঠানো শুরু করে।" },
    { text: "Submarine Cable হয়ে Google-এর Data Center (Server)-এ চলে যায়।", detail: "সমুদ্রের তলদেশ দিয়ে রাখা ফাইবার অপটিক কেবলের মাধ্যমে ডেটা আলোর গতিতে মহাদেশ পাড়ি দেয়।" },
    { text: "Server তখন Website-এর File-গুলোকে ছোট ছোট Data Packet আকারে তোমার ডিভাইসে পাঠিয়ে দেয়।", detail: "বড় ফাইলগুলোকে ছোট ছোট প্যাকেটে ভাগ করা হয়, প্রতিটি প্যাকেট আলাদা পথে যেতে পারে এবং গন্তব্যে এসে জোড়া লাগে।" },
    { text: "Browser সেগুলো আবার জোড়া লাগিয়ে Website দেখায়।", detail: "TCP/IP প্রোটোকল নিশ্চিত করে যে সব প্যাকেট সঠিকভাবে পৌঁছেছে, তারপর Browser HTML, CSS, JS ফাইলগুলো রেন্ডার করে ওয়েবসাইট দেখায়।" },
  ];

  return (
    <SectionWrapper
      id="internet-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<Globe className="w-5 h-5" />}
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
            যখন তুমি ব্রাউজারে <span className="text-cyan-300 font-semibold">www.google.com</span> লিখে সার্চ করো, তখন কী হয়?
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-center mb-6">
          {netSteps.map((step, i) => (
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
                  className="text-[9px] font-semibold block"
                  style={{ color: activePhase >= i ? step.color : "#64748b" }}
                >
                  {step.label}
                </span>
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
              {i < netSteps.length - 1 && (
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
              ইন্টারনেট ডেটা ফ্লো
            </h4>

            <div className="flex justify-center mb-6">
              <motion.div
                animate={activePhase >= 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5, repeat: activePhase >= 0 ? 3 : 0 }}
                className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center text-3xl md:text-4xl border border-white/20"
              >
                🌐
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
                    <Cable className="w-4 h-4 text-pink-400" />
                    <span className="text-xs text-slate-400">ডেটা ট্রান্সফার পাথ</span>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg md:text-xl font-mono font-bold tracking-widest"
                    style={{ color: "#f472b6" }}
                  >
                    📱 → 🌊 → 🏢 → 📦 → 🌐
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
                    <Package className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">ডেটা প্যাকেট ভিউ</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="w-full max-w-xs glass rounded-lg py-2 px-4 text-center bg-blue-500/10 border border-blue-500/30"
                    >
                      <span className="text-xs text-blue-300">📤 Request পাঠানো</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full max-w-sm glass rounded-lg py-2 px-4 text-center bg-purple-500/10 border border-purple-500/30"
                    >
                      <span className="text-xs text-purple-300">🌊 সাবমেরিন কেবল</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4 }}
                      className="w-full max-w-[90%] glass rounded-lg py-2 px-4 text-center bg-pink-500/10 border border-pink-500/30"
                    >
                      <span className="text-xs text-pink-300">🏢 ডেটা সেন্টার প্রসেসিং</span>
                    </motion.div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.6 }}
                      className="w-full max-w-[80%] glass rounded-lg py-2 px-4 text-center bg-green-500/10 border border-green-500/30"
                    >
                      <span className="text-xs text-green-300">📦 Data Packet রিটার্ন</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 mb-6">
              {stepPhrases.map((phrase, i) => (
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
                      style={{ backgroundColor: netSteps[i].color }}
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
