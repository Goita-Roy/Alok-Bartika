"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Factory, Play, RotateCcw, CircleDot } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface DataBall {
  id: number;
  x: number;
  phase: "input" | "routing" | "processing" | "output";
  color: string;
}

export default function Section5_Timeline_02() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [balls, setBalls] = useState<DataBall[]>([]);
  const [phase, setPhase] = useState<number>(0);
  const ballId = useRef(0);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setPhase(0);

    const phases = ["input", "routing", "processing", "output"] as const;
    const colors = ["#ef4444", "#ef4444", "#c084fc", "#34d399"];

    // Launch data balls through the system
    phases.forEach((p, i) => {
      setTimeout(() => {
        setPhase(i + 1);
        const newBall: DataBall = {
          id: ballId.current++,
          x: i * 25 + 10,
          phase: p,
          color: colors[i],
        };
        setBalls((prev) => [...prev, newBall]);
      }, i * 1200);
    });

    setTimeout(() => setIsAnimating(false), 5000);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setBalls([]);
    setPhase(0);
  }, []);

  return (
    <SectionWrapper
      id="cpu-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Factory className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Original Text - preserved exactly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-5 md:p-7 mb-8"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              ফ্যাক্টরি বা ট্রাফিক কন্ট্রোল অ্যানিমেশন: স্ক্রিনে একটি 3D Processor থাকবে। Input side থেকে লাল রঙের Raw Data বল আসবে। Control Unit ট্রাফিক পুলিশের মতো Data Route করবে। Data ALU-তে Process হবে। সবুজ Output হিসেবে বের হবে। সবকিছু Smooth Animation হবে।
            </p>
          </motion.div>

          {/* Processor Animation Canvas */}
          <div className="relative w-full h-64 md:h-80 glass rounded-2xl overflow-hidden mb-8">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            {/* Traffic lanes */}
            <div className="absolute inset-x-0 top-1/3 h-0.5 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-green-500/20" />
            <div className="absolute inset-x-0 top-2/3 h-0.5 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-green-500/20" />

            {/* Phase Labels */}
            {[
              { label: "Input", x: "12%", color: "#ef4444" },
              { label: "Control Unit", x: "37%", color: "#c084fc" },
              { label: "ALU", x: "62%", color: "#818cf8" },
              { label: "Output", x: "87%", color: "#34d399" },
            ].map((p, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: phase > i ? [1, 1.1, 1] : 1,
                  opacity: phase > i ? 1 : 0.4,
                }}
                className="absolute top-2 text-xs font-medium"
                style={{ left: p.x, transform: "translateX(-50%)", color: p.color }}
              >
                {p.label}
              </motion.div>
            ))}

            {/* Data Balls */}
            <AnimatePresence>
              {balls.map((ball) => (
                <motion.div
                  key={ball.id}
                  initial={{ x: "0%", y: "35%" }}
                  animate={{
                    x: `${ball.x}%`,
                    y: ball.phase === "processing" ? ["35%", "45%", "35%"] : "35%",
                    scale: ball.phase === "output" ? [1, 1.5, 1] : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    x: { duration: 1.2, ease: "easeInOut" },
                    y: { duration: 0.6, repeat: ball.phase === "processing" ? 2 : 0 },
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

            {/* CPU Icon Center */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 glass rounded-2xl flex items-center justify-center">
                <CircleDot className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
              </div>
            </motion.div>

            {/* Stage indicators */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              {["Raw Data (Red)", "Data Route (Purple)", "Process (Blue)", "Output (Green)"].map((label, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: phase > i ? 1 : 0.3 }}
                  className="flex-1 text-center"
                >
                  <div
                    className="h-1 rounded-full mb-1 transition-all"
                    style={{
                      backgroundColor: ["#ef4444", "#c084fc", "#818cf8", "#34d399"][i],
                      opacity: phase > i ? 1 : 0.2,
                    }}
                  />
                  <span className="text-[8px] text-slate-500 hidden md:block">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Controls */}
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
