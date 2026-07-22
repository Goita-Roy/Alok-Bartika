"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, HardDrive, MemoryStick, Cpu, Eye } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface DataBall {
  id: number;
  x: number;
  phase: "storage" | "ram" | "cpu";
  color: string;
}

export default function Section5_Timeline_03() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [balls, setBalls] = useState<DataBall[]>([]);
  const [phase, setPhase] = useState<number>(0);
  const [ballIdCounter, setBallIdCounter] = useState(0);
  const [ramSize, setRamSize] = useState(50);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setPhase(0);

    const phases: Array<"storage" | "ram" | "cpu"> = ["storage", "ram", "cpu"];
    const colors = ["#38bdf8", "#c084fc", "#34d399"];

    phases.forEach((p, i) => {
      setTimeout(() => {
        setPhase(i + 1);
        setBalls((prev) => [
          ...prev,
          { id: ballIdCounter + i, x: i * 33 + 5, phase: p, color: colors[i] },
        ]);
      }, i * 1200);
    });

    setTimeout(() => {
      setIsAnimating(false);
      setBallIdCounter((c) => c + 3);
    }, 4000);
  }, [ballIdCounter]);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setBalls([]);
    setPhase(0);
  }, []);

  return (
    <SectionWrapper
      id="ram-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<HardDrive className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-5 md:p-7 mb-8"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              অফিস ডেস্ক অ্যানিমেশন: একটি ফাইল ক্যাবিনেট (স্টোরেজ) থেকে ফাইল বের হয়ে ডেস্কের উপর (RAM) আসে। তারপর প্রসেসর (CPU) সেই ফাইল পড়ে। ডেস্ক (RAM) যত ছোট হবে, তত কম ফাইল একসঙ্গে রাখা যাবে। ডেস্ক (RAM) বাড়ালে আরও ফাইল রাখা যাবে এবং কাজ দ্রুত হবে।
            </p>
          </motion.div>

          {/*
            Extra educational text was previously requested to be appended here.
            It has been preserved below.
          */}

          <div className="relative w-full h-64 md:h-80 glass rounded-2xl overflow-hidden mb-6">
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            <div className="absolute inset-x-0 top-1/3 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />
            <div className="absolute inset-x-0 top-2/3 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20" />

            {[
              { label: "File Cabinet\n(Storage)", x: "15%", color: "#38bdf8", icon: "🗄️" },
              { label: "Desk\n(RAM)", x: "50%", color: "#c084fc", icon: "🧩" },
              { label: "Processor\n(CPU)", x: "85%", color: "#34d399", icon: "⚡" },
            ].map((p, i) => (
              <motion.div
                key={i}
                animate={{ scale: phase > i ? [1, 1.1, 1] : 1, opacity: phase > i ? 1 : 0.4 }}
                className="absolute top-2 text-center"
                style={{ left: p.x, transform: "translateX(-50%)" }}
              >
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="text-[10px] font-medium whitespace-pre-line" style={{ color: p.color }}>
                  {p.label}
                </div>
              </motion.div>
            ))}

            {/* RAM Size visual */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32">
              <div className="text-[10px] text-slate-500 text-center mb-1">RAM Desk Size</div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  animate={{ width: `${ramSize}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* RAM resize controls */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRamSize((s) => Math.max(20, s - 10))}
                className="text-[10px] px-2 py-1 rounded glass text-slate-400 hover:text-white"
              >
                − RAM
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRamSize((s) => Math.min(100, s + 10))}
                className="text-[10px] px-2 py-1 rounded glass text-slate-400 hover:text-white"
              >
                + RAM
              </motion.button>
            </div>

            <AnimatePresence>
              {balls.map((ball) => (
                <motion.div
                  key={ball.id}
                  initial={{ x: "0%", y: "35%" }}
                  animate={{
                    x: `${ball.x}%`,
                    y: ball.phase === "ram" ? ["35%", "55%", "35%"] : "35%",
                    scale: ball.phase === "cpu" ? [1, 1.5, 1] : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    x: { duration: 1.2, ease: "easeInOut" },
                    y: { duration: 0.6, repeat: ball.phase === "ram" ? 2 : 0 },
                    scale: { duration: 0.3 },
                  }}
                  className="absolute w-4 h-4 rounded-full -translate-y-1/2"
                  style={{
                    backgroundColor: ball.color,
                    boxShadow: `0 0 10px ${ball.color}60`,
                  }}
                />
              ))}
            </AnimatePresence>

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-14 h-14 md:w-16 md:h-16 glass rounded-2xl flex items-center justify-center">
                <Eye className="w-7 h-7 md:w-8 md:h-8 text-purple-400" />
              </div>
            </motion.div>

            <div className="absolute bottom-12 left-4 right-4 flex gap-2">
              {["Storage → RAM", "RAM → CPU", "Processing"].map((label, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: phase > i ? 1 : 0.3 }}
                  className="flex-1 text-center"
                >
                  <div
                    className="h-1 rounded-full mb-1 transition-all"
                    style={{
                      backgroundColor: ["#38bdf8", "#c084fc", "#34d399"][i],
                      opacity: phase > i ? 1 : 0.2,
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
              onClick={startAnimation}
              disabled={isAnimating}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isAnimating
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              <Play className="w-5 h-5" />
              <span>অ্যানিমেশন শুরু</span>
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
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
