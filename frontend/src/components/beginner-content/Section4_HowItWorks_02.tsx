"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, TrafficCone, Database, 
  ArrowRight, Play, RotateCcw, ChevronRight, ArrowDown, Cpu
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface CpuUnit {
  id: string;
  title: string;
  icon: typeof Calculator;
  color: string;
  gradient: string;
  description: string;
  details: string[];
}

const units: CpuUnit[] = [
  {
    id: "alu",
    title: "ALU (Arithmetic Logic Unit)",
    icon: Calculator,
    color: "#38bdf8",
    gradient: "from-blue-500/20 to-blue-600/10",
    description: "সব গাণিতিক (+,-,×,÷) ও যৌক্তিক (>,<,=) সিদ্ধান্ত নেয়।",
    details: ["গাণিতিক অপারেশন", "যৌক্তিক তুলনা"],
  },
  {
    id: "cu",
    title: "CU (Control Unit)",
    icon: TrafficCone,
    color: "#c084fc",
    gradient: "from-purple-500/20 to-purple-600/10",
    description: "ট্রাফিক পুলিশের মতো ডেটার আসা-যাওয়া নিয়ন্ত্রণ করে।",
    details: ["ডেটা রাউটিং", "নির্দেশনা ব্যাখ্যা"],
  },
  {
    id: "registers",
    title: "Registers",
    icon: Database,
    color: "#34d399",
    gradient: "from-green-500/20 to-green-600/10",
    description: "সাময়িকভাবে খুব দ্রুত ডেটা ধরে রাখে।",
    details: ["ক্ষণস্থায়ী মেমোরি", "দ্রুত অ্যাক্সেস"],
  },
];

const cycleSteps = ["Fetch", "Decode", "Execute"];

export default function Section4_HowItWorks_02() {
  const [activeUnit, setActiveUnit] = useState<string | null>(null);
  const [cyclePhase, setCyclePhase] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const startCycle = useCallback(() => {
    setIsPlaying(true);
    setCyclePhase(-1);
    cycleSteps.forEach((_, i) => {
      setTimeout(() => {
        setCyclePhase(i);
        if (i === cycleSteps.length - 1) {
          setTimeout(() => setIsPlaying(false), 800);
        }
      }, i * 1200);
    });
  }, []);

  const resetAll = useCallback(() => {
    setIsPlaying(false);
    setActiveUnit(null);
    setCyclePhase(-1);
  }, []);

  return (
    <SectionWrapper
      id="cpu-how-it-works"
      title="যেভাবে কাজ করে"
      icon={<Cpu className="w-5 h-5" />}
    >
      <div className="space-y-6">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8 text-center"
        >
          <p className="text-base md:text-lg text-slate-300">
            CPU প্রধানত তিনটি অংশে কাজ করে:
          </p>
        </motion.div>

        {/* CPU Units Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {units.map((unit) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => setActiveUnit(activeUnit === unit.id ? null : unit.id)}
              className={`glass rounded-xl p-5 md:p-6 cursor-pointer border transition-all ${
                activeUnit === unit.id ? "border-white/30 bg-white/5" : "border-white/5 hover:border-white/20"
              }`}
            >
              <motion.div
                animate={activeUnit === unit.id ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.8 }}
                className="flex justify-center mb-3"
              >
                <unit.icon className="w-8 h-8 md:w-10 md:h-10" style={{ color: unit.color }} />
              </motion.div>

              <h4 className="text-sm md:text-base font-bold text-center mb-2" style={{ color: unit.color }}>
                {unit.title}
              </h4>

              <p className="text-xs md:text-sm text-slate-400 text-center leading-relaxed">
                {unit.description}
              </p>

              <AnimatePresence>
                {activeUnit === unit.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="border-t border-white/10 pt-3 space-y-1">
                      {unit.details.map((detail, j) => (
                        <p key={j} className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: unit.color }} />
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Fetch-Decode-Execute Cycle */}
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
              Fetch-Decode-Execute Cycle
            </h4>

            <p className="text-sm md:text-base text-slate-400 text-center mb-8">
              CPU প্রথমে মেমোরি থেকে নির্দেশ এনে (Fetch), সেটা কী কাজ তা বুঝে (Decode), তারপর কাজটি সম্পন্ন করে (Execute)।
            </p>

            {/* Cycle Flow */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center mb-8">
              {cycleSteps.map((step, i) => (
                <div key={step} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                  <motion.div
                    animate={{
                      scale: cyclePhase === i ? 1.08 : 1,
                      borderColor: cyclePhase >= i ? "#c084fc" : "rgba(255,255,255,0.1)",
                    }}
                    transition={{ duration: 0.3 }}
                    className={`glass rounded-xl px-6 py-4 text-center w-full md:w-40 border transition-all ${
                      cyclePhase >= i ? "bg-white/5" : ""
                    }`}
                  >
                    <motion.span
                      animate={cyclePhase === i ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 0.6, repeat: cyclePhase === i ? Infinity : 0 }}
                      className="text-2xl block mb-1"
                    >
                      {i === 0 ? "📥" : i === 1 ? "🧠" : "⚡"}
                    </motion.span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: cyclePhase >= i ? "#c084fc" : "#64748b" }}
                    >
                      {i + 1}. {step}
                    </span>
                    {cyclePhase === i && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-1"
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full mx-auto"
                          style={{ backgroundColor: "#c084fc" }}
                        />
                      </motion.div>
                    )}
                  </motion.div>

                  {i < cycleSteps.length - 1 && (
                    <motion.div
                      animate={cyclePhase > i ? { x: [0, 5, 0] } : {}}
                      transition={{ duration: 1, repeat: cyclePhase > i ? Infinity : 0 }}
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                      <ArrowDown className="w-5 h-5 text-slate-600 md:hidden" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCycle}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                  isPlaying
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                }`}
              >
                <Play className="w-5 h-5" />
                <span>সাইকেল চালু করো</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAll}
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
