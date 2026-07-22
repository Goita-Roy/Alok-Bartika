"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Cpu, Monitor, Zap, ArrowRight, RotateCcw, Binary, CircuitBoard, Eye, Radio } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type ZoomStage = "full_keyboard" | "circuit" | "signal" | "processor" | "binary" | "cpu_receive" | "screen";

const stageData: Record<ZoomStage, { label: string; description: string; icon: string; color: string }> = {
  full_keyboard: { label: "কিবোর্ড", description: "যেকোনো কী প্রেস করো", icon: "⌨️", color: "#38bdf8" },
  circuit: { label: "সার্কিট অ্যাক্টিভেশন", description: "বৈদ্যুতিক সংযোগ তৈরি", icon: "🔌", color: "#c084fc" },
  signal: { label: "কারেন্ট ফ্লো", description: "কিবোর্ড ম্যাট্রিক্সের মাধ্যমে", icon: "⚡", color: "#f472b6" },
  processor: { label: "কিবোর্ড প্রসেসর", description: "সিগন্যাল প্রসেসরে পৌঁছায়", icon: "🧠", color: "#34d399" },
  binary: { label: "বাইনারি কনভার্সন", description: "01000001 রূপান্তর", icon: "🔢", color: "#fbbf24" },
  cpu_receive: { label: "CPU রিসিভ", description: "সিপিইউ সিগন্যাল পায়", icon: "⚡", color: "#fb923c" },
  screen: { label: "স্ক্রিনে প্রদর্শন", description: "'A' ফুটে ওঠে", icon: "🖥️", color: "#34d399" },
};

const stages: ZoomStage[] = ["full_keyboard", "circuit", "signal", "processor", "binary", "cpu_receive", "screen"];

export default function Section5_Timeline_05() {
  const [currentStage, setCurrentStage] = useState<ZoomStage>("full_keyboard");
  const [isAnimating, setIsAnimating] = useState(false);
  const [pressedKey, setPressedKey] = useState("");
  const [slowMo, setSlowMo] = useState(false);
  const [keyTriggered, setKeyTriggered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    if (key.length === 1 && /[A-Z0-9]/.test(key)) {
      setPressedKey(key);
      setKeyTriggered(true);
      startAnimation(key);
    }
  }, [slowMo]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const startAnimation = useCallback((key: string) => {
    setIsAnimating(true);
    setCurrentStage("full_keyboard");
    const delay = slowMo ? 1200 : 600;

    stages.forEach((stage, i) => {
      setTimeout(() => {
        setCurrentStage(stage);
        if (i === stages.length - 1) {
          setTimeout(() => {
            setIsAnimating(false);
            setKeyTriggered(false);
          }, delay);
        }
      }, i * delay);
    });
  }, [slowMo]);

  const resetAnimation = useCallback(() => {
    setIsAnimating(false);
    setCurrentStage("full_keyboard");
    setPressedKey("");
    setKeyTriggered(false);
  }, []);

  const manualTrigger = useCallback(() => {
    const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3"];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setPressedKey(randomKey);
    setKeyTriggered(true);
    startAnimation(randomKey);
  }, [startAnimation]);

  const stageIndex = stages.indexOf(currentStage);
  const currentData = stageData[currentStage];

  return (
    <SectionWrapper
      id="input-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Keyboard className="w-5 h-5" />}
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
              ইন্টারঅ্যাকটিভ কিবোর্ড এক্স-রে — একটি কী প্রেস করলেই ভেতরে কী ঘটে তা জুম করে দেখো।
            </p>
          </motion.div>

          {/* Hidden input for keyboard capture */}
          <input
            ref={inputRef}
            type="text"
            className="sr-only"
          />
          <div
            onClick={() => inputRef.current?.focus()}
            className="relative w-full h-72 md:h-80 glass rounded-2xl overflow-hidden mb-6 cursor-pointer"
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            {/* Keyboard Layout */}
            {currentStage === "full_keyboard" && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                  <div className="glass rounded-xl p-3">
                    <div className="grid grid-cols-10 gap-1 mb-1">
                      {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((k) => (
                        <motion.div
                          key={k}
                          animate={pressedKey === k ? { scale: 1.2, backgroundColor: "rgba(56,189,248,0.3)" } : {}}
                          className="glass rounded text-[10px] md:text-xs text-center py-2 text-slate-300"
                        >
                          {k}
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-9 gap-1 mb-1 ml-4">
                      {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((k) => (
                        <motion.div
                          key={k}
                          animate={pressedKey === k ? { scale: 1.2, backgroundColor: "rgba(56,189,248,0.3)" } : {}}
                          className="glass rounded text-[10px] md:text-xs text-center py-2 text-slate-300"
                        >
                          {k}
                        </motion.div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 ml-8">
                      {["Z", "X", "C", "V", "B", "N", "M"].map((k) => (
                        <motion.div
                          key={k}
                          animate={pressedKey === k ? { scale: 1.2, backgroundColor: "rgba(56,189,248,0.3)" } : {}}
                          className="glass rounded text-[10px] md:text-xs text-center py-2 text-slate-300"
                        >
                          {k}
                        </motion.div>
                      ))}
                    </div>
                    <motion.div className="mt-2 text-center">
                      <span className="text-[10px] text-slate-500">কিবোর্ডের যেকোনো কী প্রেস করো</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            )}

            {/* Circuit / Signal / Binary stages */}
            {(currentStage === "circuit" || currentStage === "signal") && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <CircuitBoard className="w-24 h-24 md:w-32 md:h-32 text-cyan-400/60" />
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      {currentStage === "circuit" ? (
                        <Zap className="w-10 h-10 text-amber-400" />
                      ) : (
                        <Radio className="w-10 h-10 text-pink-400" />
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            )}

            {currentStage === "processor" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center"
                >
                  <Cpu className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
                </motion.div>
              </div>
            )}

            {currentStage === "binary" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Binary className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                  <motion.div
                    className="text-2xl md:text-3xl font-mono font-bold tracking-widest text-amber-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {pressedKey ? pressedKey.charCodeAt(0).toString(2).padStart(8, "0") : "01000001"}
                  </motion.div>
                </motion.div>
              </div>
            )}

            {currentStage === "cpu_receive" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 md:w-24 md:h-24 glass rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Cpu className="w-10 h-10 md:w-12 md:h-12 text-green-400" />
                  </motion.div>
                  <motion.p
                    animate={{ y: [0, -5, 0] }}
                    className="text-green-400 text-sm font-semibold"
                  >
                    ✅ সিগন্যাল রিসিভ!
                  </motion.p>
                </motion.div>
              </div>
            )}

            {currentStage === "screen" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center"
                >
                  <Monitor className="w-16 h-16 md:w-20 md:h-20 text-green-400/80 mx-auto mb-4" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-6xl md:text-8xl font-bold text-gradient"
                  >
                    {pressedKey || "A"}
                  </motion.div>
                  <motion.p className="text-xs text-slate-400 mt-2">
                    স্ক্রিনে প্রদর্শিত হচ্ছে
                  </motion.p>
                </motion.div>
              </div>
            )}

            {/* Stage indicator */}
            <div className="absolute bottom-3 left-4 right-4">
              <div className="flex gap-1">
                {stages.map((stage, i) => (
                  <motion.div
                    key={stage}
                    animate={{ opacity: stageIndex >= i ? 1 : 0.2 }}
                    className="flex-1 text-center"
                  >
                    <div
                      className="h-1 rounded-full mb-0.5 transition-all"
                      style={{
                        backgroundColor: stageData[stage].color,
                        opacity: stageIndex >= i ? 1 : 0.2,
                      }}
                    />
                    <span className="text-[6px] text-slate-600 hidden md:inline">
                      {stageData[stage].label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Center label */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-full px-4 py-1"
              >
                <span className="text-[10px] font-medium" style={{ color: currentData.color }}>
                  {currentStage !== "full_keyboard" && `${currentData.icon} `}
                  {currentData.label}
                </span>
              </motion.div>
            </div>

            {/* Pressed key display */}
            {pressedKey && (
              <div className="absolute top-3 right-3 glass rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400">কী: </span>
                <span className="text-sm font-bold text-cyan-300">{pressedKey}</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={manualTrigger}
              disabled={isAnimating}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isAnimating
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>কী-প্রেস সিমুলেট</span>
            </motion.button>

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
              🐢 Slow-Mo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAnimation}
              className="px-4 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
            >
              <RotateCcw className="w-4 h-4" />
              <span>রিসেট</span>
            </motion.button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
