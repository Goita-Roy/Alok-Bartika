"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, MemoryStick, Cpu, ArrowRight, Play, RotateCcw, ChevronRight, HardDrive
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const flowSteps = [
  { id: "storage", label: "স্টোরেজ", icon: "💾", color: "#38bdf8", desc: "HDD/SSD থেকে ডেটা পড়া" },
  { id: "ram", label: "RAM", icon: "🧩", color: "#c084fc", desc: "RAM-এ ডেটা লোড করা" },
  { id: "cpu", label: "CPU", icon: "⚡", color: "#34d399", desc: "CPU প্রসেসিং" },
];

export default function Section4_HowItWorks_03() {
  const [activePhase, setActivePhase] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const startFlow = useCallback(() => {
    setIsPlaying(true);
    setActivePhase(-1);
    flowSteps.forEach((_, i) => {
      setTimeout(() => {
        setActivePhase(i);
        if (i === flowSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), 800);
        }
      }, i * 1200);
    });
  }, []);

  const resetFlow = useCallback(() => {
    setIsPlaying(false);
    setActivePhase(-1);
  }, []);

  return (
    <SectionWrapper
      id="ram-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<MemoryStick className="w-5 h-5" />}
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
            ডেটা স্থায়ী স্টোরেজ থেকে RAM-এ আসে, তারপর CPU প্রক্রিয়া করে:
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 justify-center mb-8">
          {flowSteps.map((step, i) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <motion.div
                animate={{
                  scale: activePhase === i ? 1.1 : 1,
                  borderColor: activePhase >= i ? step.color : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.3 }}
                className={`glass rounded-xl px-6 py-5 text-center w-full md:w-48 border-2 transition-all ${
                  activePhase >= i ? "bg-white/5" : ""
                }`}
              >
                <motion.div
                  animate={activePhase === i ? { y: [0, -5, 0] } : {}}
                  transition={{ duration: 0.6, repeat: activePhase === i ? Infinity : 0 }}
                  className="text-3xl mb-2"
                >
                  {step.icon}
                </motion.div>
                <span
                  className="text-sm font-semibold block"
                  style={{ color: activePhase >= i ? step.color : "#64748b" }}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500">{step.desc}</span>
                {activePhase === i && (
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

              {i < flowSteps.length - 1 && (
                <motion.div
                  animate={activePhase > i ? { x: [0, 5, 0] } : {}}
                  transition={{ duration: 0.8, repeat: activePhase > i ? Infinity : 0 }}
                >
                  <ChevronRight className="w-6 h-6 text-slate-600 hidden md:block" />
                  <ArrowRight className="w-6 h-6 text-slate-600 md:hidden rotate-90" />
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
              ডেটা ফ্লো সিমুলেশন
            </h4>

            <div className="relative w-full h-48 md:h-56 glass rounded-2xl overflow-hidden mb-8">
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.3) 1px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }} />
              </div>

              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />

              {[
                { icon: "💾", label: "Storage", x: "15%", color: "#38bdf8" },
                { icon: "🧩", label: "RAM", x: "50%", color: "#c084fc" },
                { icon: "⚡", label: "CPU", x: "85%", color: "#34d399" },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: activePhase > i ? [1, 1.15, 1] : 1,
                    opacity: activePhase > i ? 1 : 0.4,
                  }}
                  className="absolute top-4 text-center"
                  style={{ left: p.x, transform: "translateX(-50%)" }}
                >
                  <div className="text-3xl mb-1">{p.icon}</div>
                  <div className="text-[10px] font-medium" style={{ color: p.color }}>{p.label}</div>
                </motion.div>
              ))}

              <AnimatePresence>
                {activePhase >= 0 && (
                  <motion.div
                    initial={{ left: "8%", opacity: 0 }}
                    animate={{
                      left: activePhase >= 2 ? "80%" : activePhase >= 1 ? "45%" : "15%",
                      opacity: 1,
                      scale: activePhase === 2 ? [1, 1.3, 1] : 1,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full -ml-2"
                    style={{
                      backgroundColor: "#c084fc",
                      boxShadow: "0 0 12px #c084fc80",
                    }}
                  />
                )}
              </AnimatePresence>

              <div className="absolute bottom-3 left-4 right-4 flex gap-2">
                {["Storage → RAM", "RAM → CPU", "Processing"].map((label, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: activePhase > i ? 1 : 0.3 }}
                    className="flex-1 text-center"
                  >
                    <div
                      className="h-1 rounded-full mb-1 transition-all"
                      style={{
                        backgroundColor: ["#38bdf8", "#c084fc", "#34d399"][i],
                        opacity: activePhase > i ? 1 : 0.2,
                      }}
                    />
                    <span className="text-[8px] text-slate-500">{label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
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
                <Play className="w-5 h-5" />
                <span>ফ্লো শুরু করো</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetFlow}
                className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
              >
                <RotateCcw className="w-5 h-5" />
                <span>রিসেট</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
