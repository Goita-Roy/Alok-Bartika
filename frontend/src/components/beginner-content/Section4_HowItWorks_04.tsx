"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HardDrive, Zap, Disc3, Cpu, ArrowRight, RotateCcw, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

export default function Section4_HowItWorks_04() {
  const [activeTab, setActiveTab] = useState<"hdd" | "ssd">("hdd");
  const [hddPhase, setHddPhase] = useState(-1);
  const [ssdPhase, setSsdPhase] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const hddSteps = [
    { label: "Platter Spins", desc: "৫৪০০/৭২০০ RPM", icon: "💿" },
    { label: "Header Moves", desc: "চৌম্বকীয় চাকতি", icon: "🔍" },
    { label: "Data Read", desc: "সুই দিয়ে পড়া", icon: "📖" },
  ];

  const ssdSteps = [
    { label: "Flash Memory", desc: "Microchips", icon: "⚡" },
    { label: "Electron Speed", desc: "নড়াচড়া করার পার্টস নেই", icon: "🚀" },
    { label: "Instant Read", desc: "১০-২০ গুণ দ্রুত", icon: "✅" },
  ];

  const startAnimation = () => {
    setIsPlaying(true);
    setHddPhase(-1);
    setSsdPhase(-1);

    hddSteps.forEach((_, i) => {
      setTimeout(() => setHddPhase(i), i * 1000);
    });

    ssdSteps.forEach((_, i) => {
      setTimeout(() => setSsdPhase(i), i * 400);
    });

    setTimeout(() => setIsPlaying(false), 3500);
  };

  const resetAnimation = () => {
    setIsPlaying(false);
    setHddPhase(-1);
    setSsdPhase(-1);
  };

  return (
    <SectionWrapper
      id="storage-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<HardDrive className="w-5 h-5" />}
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
            স্টোরেজ দুই ধরনের — HDD (পুরনো, ধীর) এবং SSD (আধুনিক, দ্রুত)
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* HDD Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`glass rounded-2xl p-6 md:p-8 relative overflow-hidden border-2 transition-all ${
              activeTab === "hdd" ? "border-blue-500/40" : "border-white/5"
            }`}
            onClick={() => setActiveTab("hdd")}
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <HardDrive className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-blue-400">HDD</h4>
              </div>

              <p className="text-base leading-relaxed text-slate-200">
                এটি একটি গ্রামোফোন রেকর্ডের মতো।
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                ভেতরে একটা চৌম্বকীয় চাকতি (Platter) থাকে
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                যা প্রতি মিনিটে ৫৪০০ বা ৭২০০ বার ঘোরে,
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                আর একটা সুই (Header)
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                সেই চাকতি থেকে ডেটা পড়ে।
              </p>

              {/* HDD Visual */}
              <div className="mt-6 relative w-full h-28 glass rounded-xl overflow-hidden">
                <motion.div
                  animate={hddPhase >= 0 ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: hddPhase >= 0 ? Infinity : 0, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-blue-400/50"
                >
                  <div className="absolute inset-2 rounded-full bg-blue-500/20" />
                </motion.div>

                <motion.div
                  animate={hddPhase >= 1 ? { x: ["-30%", "30%", "-30%"] } : {}}
                  transition={{ duration: 3, repeat: hddPhase >= 1 ? Infinity : 0 }}
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400/80 rounded-full"
                  style={{ left: "50%" }}
                />

                {hddPhase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-1 right-2 text-[10px] text-green-400"
                  >
                    ✅ ডেটা পড়া হচ্ছে...
                  </motion.div>
                )}
              </div>

              {/* HDD Steps */}
              <div className="mt-4 space-y-1">
                {hddSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: hddPhase >= i ? 1 : 0.3, x: hddPhase === i ? 5 : 0 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span>{step.icon}</span>
                    <span style={{ color: hddPhase >= i ? "#38bdf8" : "#64748b" }}>{step.label}</span>
                    <span className="text-slate-600">— {step.desc}</span>
                    {hddPhase >= i && <span className="text-green-400">✅</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* SSD Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`glass rounded-2xl p-6 md:p-8 relative overflow-hidden border-2 transition-all ${
              activeTab === "ssd" ? "border-green-500/40" : "border-white/5"
            }`}
            onClick={() => setActiveTab("ssd")}
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-bold text-green-400">SSD</h4>
              </div>

              <p className="text-base leading-relaxed text-slate-200">
                এতে কোনো নড়াচড়া করার পার্টস নেই।
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                এটি ঠিক পেনড্রাইভের মতো
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                ফ্ল্যাশ মেমোরি (Microchips) দিয়ে তৈরি।
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                ইলেকট্রনের গতিতে
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                ডেটা Read ও Write হয়,
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                তাই SSD,
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                HDD-এর তুলনায়
              </p>
              <p className="text-base leading-relaxed text-slate-200 mt-2">
                ১০–২০ গুণ দ্রুত কাজ করে।
              </p>

              {/* SSD Visual */}
              <div className="mt-6 relative w-full h-28 glass rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 gap-1 p-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={ssdPhase >= 0 ? { opacity: [0.3, 1, 0.3] } : {}}
                      transition={{ duration: 0.5, delay: i * 0.1, repeat: ssdPhase >= 0 ? Infinity : 0 }}
                      className="h-6 rounded bg-green-500/20 border border-green-500/10"
                    />
                  ))}
                </div>

                {ssdPhase >= 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-2xl"
                    >
                      ⚡
                    </motion.div>
                  </motion.div>
                )}

                {ssdPhase >= 2 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-1 right-2 text-[10px] text-green-400"
                  >
                    ✅ তাত্ক্ষণিক পড়া!
                  </motion.div>
                )}
              </div>

              {/* SSD Steps */}
              <div className="mt-4 space-y-1">
                {ssdSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: ssdPhase >= i ? 1 : 0.3, x: ssdPhase === i ? 5 : 0 }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span>{step.icon}</span>
                    <span style={{ color: ssdPhase >= i ? "#34d399" : "#64748b" }}>{step.label}</span>
                    <span className="text-slate-600">— {step.desc}</span>
                    {ssdPhase >= i && <span className="text-green-400">✅</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startAnimation}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
              isPlaying
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>কাজ করা শুরু করো</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetAnimation}
            className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
          >
            <RotateCcw className="w-5 h-5" />
            <span>রিসেট</span>
          </motion.button>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
