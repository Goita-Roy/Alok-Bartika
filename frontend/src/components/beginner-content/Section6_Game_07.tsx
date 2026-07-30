"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Sparkles, RefreshCw, Repeat, Infinity,
  Flag, Lightbulb
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "animating" | "result";
type LoopType = "repeat10" | "forever";

interface StepResult {
  success: boolean;
  message: string;
  detail: string;
}

const TOTAL_STEPS = 10;
const START_X = 6;
const END_X = 86;
const STEP_PCT = (END_X - START_X) / TOTAL_STEPS;

const REPEAT_10_SUCCESS: StepResult = {
  success: true,
  message: "✅ মিশন সফল!",
  detail: "তুমি 'Repeat 10' লুপ ব্যবহার করে ঠিক ১০ বার পুনরাবৃত্তি করেছ। প্রতিটি পুনরাবৃত্তি একবার করে এক্সিকিউট হয় — তাই স্প্রাইট ঠিক ১০ ধাপ পরে শেষ পতাকায় পৌঁছেছে। লুপ শেষ হওয়ার সাথে সাথে প্রোগ্রাম থেমে যায়।"
};

const REPEAT_10_FAIL: StepResult = {
  success: false,
  message: "❌ মিশন ব্যর্থ!",
  detail: "'Repeat 10' লুপ ঠিক ১০ বার চলে। কিন্তু দেখো — স্প্রাইট এখনও শেষ পতাকায় পৌঁছাতে পারেনি! লুপের পুনরাবৃত্তি সংখ্যা এবং স্প্রাইটের প্রয়োজনীয় ধাপ সংখ্যা মিলিয়ে দেখো।"
};

const FOREVER_RESULT: StepResult = {
  success: false,
  message: "🔄 Forever Loop চলতেই থাকবে!",
  detail: "'Forever' লুপ কখনো শেষ হয় না। এটি অনন্তকাল ধরে চলতে থাকে। দেখো — স্প্রাইট শেষ পতাকা অতিক্রম করেও হাঁটতেই থাকে! প্রকৃত প্রোগ্রামিংয়ে, Forever লুপ ব্যবহার করা হয় যখন কোনো কাজ বারবার করতে হয়, যেমন গেমের মূল লুপ বা সেন্সর ডেটা পড়া।"
};

const bgIcons = [
  { icon: "🔄", x: 5, y: 10, float: [0, -8, 0], duration: 6, delay: 0, size: "text-lg" },
  { icon: "🔁", x: 88, y: 15, float: [0, 6, 0], duration: 7, delay: 0.5, size: "text-xl" },
  { icon: "♾️", x: 12, y: 78, float: [0, -6, 0], duration: 8, delay: 1, size: "text-base" },
  { icon: "⚙️", x: 82, y: 75, float: [0, 8, 0], duration: 6.5, delay: 0.3, size: "text-base" },
  { icon: "🤖", x: 50, y: 8, float: [0, -5, 0], duration: 9, delay: 0.7, size: "text-lg" },
  { icon: "🏗️", x: 70, y: 5, float: [0, -4, 0], duration: 10, delay: 0.2, size: "text-xl" },
  { icon: "🧩", x: 25, y: 85, float: [0, 5, 0], duration: 7.5, delay: 1.5, size: "text-sm" },
  { icon: "📦", x: 92, y: 60, float: [0, -7, 0], duration: 8.5, delay: 0.8, size: "text-sm" },
  { icon: "📟", x: 3, y: 50, float: [0, 6, 0], duration: 9.5, delay: 2, size: "text-sm" },
  { icon: "🔧", x: 75, y: 88, float: [0, -5, 0], duration: 7, delay: 0.6, size: "text-sm" },
];

const particles = Array.from({ length: 15 }, (_, i) => ({
  x: 3 + Math.random() * 94,
  y: 3 + Math.random() * 94,
  size: 1.5 + Math.random() * 2.5,
  duration: 4 + Math.random() * 6,
  delay: Math.random() * 4,
  color: ["rgba(192,132,252,0.3)", "rgba(129,140,248,0.3)", "rgba(56,189,248,0.3)", "rgba(52,211,153,0.3)", "rgba(251,191,36,0.3)"][Math.floor(Math.random() * 5)],
}));

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 400 400">
        <defs>
          <pattern id="loop-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6366f1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#loop-grid)" />
      </svg>

      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"
      />

      {bgIcons.map((item, i) => (
        <motion.div
          key={`icon-${i}`}
          className={`absolute ${item.size} select-none`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.15,
            y: item.float,
            rotate: [0, -3, 3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            opacity: { duration: 0.8, delay: item.delay },
            y: { duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            rotate: { duration: item.duration * 0.7, repeat: Infinity, ease: "easeInOut", delay: item.delay },
            scale: { duration: item.duration * 0.5, repeat: Infinity, ease: "easeInOut", delay: item.delay },
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {particles.map((p, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -10 - Math.random() * 15, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function Sprite({ x, legPhase, bounce }: { x: number; legPhase: number; bounce: number }) {
  const leftAngle = legPhase % 2 === 0 ? 18 : -18;
  const rightAngle = legPhase % 2 === 0 ? -18 : 18;

  return (
    <motion.div
      className="absolute z-20"
      style={{ left: `${x}%`, bottom: "48px" }}
      animate={{ y: bounce }}
      transition={{ duration: 0.15 }}
    >
      <div className="relative flex flex-col items-center">
        {/* Head */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-b from-cyan-300 to-blue-400 shadow-lg border-2 border-cyan-200/30 flex items-center justify-center">
          <div className="flex gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          </div>
        </div>
        {/* Body */}
        <div className="w-8 h-9 rounded-lg bg-gradient-to-b from-cyan-500 to-blue-600 shadow-md -mt-0.5 border border-cyan-300/20 flex items-center justify-center">
          <div className="w-4 h-2 rounded bg-cyan-300/20" />
        </div>
        {/* Left leg */}
        <motion.div
          className="w-1.5 h-5 rounded-full bg-blue-700 origin-top absolute -bottom-4 left-1/2 -ml-2.5 shadow-sm"
          animate={{ rotate: leftAngle }}
          transition={{ duration: 0.2 }}
        />
        {/* Right leg */}
        <motion.div
          className="w-1.5 h-5 rounded-full bg-blue-700 origin-top absolute -bottom-4 left-1/2 ml-1 shadow-sm"
          animate={{ rotate: rightAngle }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </motion.div>
  );
}

function StartFlag() {
  return (
    <div className="absolute z-10" style={{ left: `${START_X - 1.5}%`, bottom: "68px" }}>
      <Flag className="w-5 h-5 text-emerald-400 drop-shadow-lg" />
      <span className="text-[6px] font-bold text-emerald-400/80 block -mt-0.5 text-center">শুরু</span>
    </div>
  );
}

function EndFlag() {
  return (
    <div className="absolute z-10" style={{ left: `${END_X - 1.5}%`, bottom: "68px" }}>
      <Flag className="w-5 h-5 text-rose-400 drop-shadow-lg" />
      <span className="text-[6px] font-bold text-rose-400/80 block -mt-0.5 text-center">শেষ</span>
    </div>
  );
}

function GroundTile({ index }: { index: number }) {
  const isLight = index % 2 === 0;
  return (
    <div
      className={`h-full ${isLight ? "bg-emerald-800/40" : "bg-emerald-900/40"} border-r border-emerald-700/20 first:rounded-l-md last:rounded-r-md`}
      style={{ width: `${100 / 12}%` }}
    />
  );
}

function Decoration({ position, emoji, delay = 0 }: { position: number; emoji: string; delay?: number }) {
  return (
    <motion.div
      className="absolute z-5 select-none"
      style={{ left: `${position}%`, bottom: "64px" }}
      animate={{ y: [0, -3, 0], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <span className="text-[10px]">{emoji}</span>
    </motion.div>
  );
}

export default function Section6_Game_07() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [selectedLoop, setSelectedLoop] = useState<LoopType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [counter, setCounter] = useState<string | null>(null);
  const [result, setResult] = useState<StepResult | null>(null);
  const [legPhase, setLegPhase] = useState(0);
  const [bounce, setBounce] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<number | null>(null);
  const stepIntervalRef = useRef<number | null>(null);

  const cleanupTimers = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (stepIntervalRef.current !== null) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (gameState === "result" && selectedLoop === "repeat10") {
      setShowConfetti(true);
      const t = window.setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(t);
    }
  }, [gameState, selectedLoop]);

  useEffect(() => {
    return cleanupTimers;
  }, [cleanupTimers]);

  const startGame = useCallback(() => {
    setCurrentStep(0);
    setSelectedLoop(null);
    setResult(null);
    setCounter(null);
    setLegPhase(0);
    setBounce(0);
    setShowConfetti(false);
    cleanupTimers();
    setGameState("playing");
  }, [cleanupTimers]);

  const executeRepeat10 = useCallback(() => {
    setGameState("animating");
    setSelectedLoop("repeat10");
    let step = 0;

    stepIntervalRef.current = window.setInterval(() => {
      step++;
      setCurrentStep(step);
      setCounter(`${step}/${TOTAL_STEPS}`);
      setLegPhase((p) => p + 1);
      setBounce((p) => (p === 0 ? -3 : 0));

      if (step >= TOTAL_STEPS) {
        if (stepIntervalRef.current !== null) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        timerRef.current = window.setTimeout(() => {
          setResult(REPEAT_10_SUCCESS);
          setGameState("result");
        }, 400);
      }
    }, 650);
  }, []);

  const executeForever = useCallback(() => {
    setGameState("animating");
    setSelectedLoop("forever");
    let step = 0;
    const maxSteps = 14;

    stepIntervalRef.current = window.setInterval(() => {
      step++;
      setCurrentStep(step);
      setCounter(`∞ ${step}`);
      setLegPhase((p) => p + 1);
      setBounce((p) => (p === 0 ? -3 : 0));

      if (step >= maxSteps) {
        if (stepIntervalRef.current !== null) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        timerRef.current = window.setTimeout(() => {
          setResult(FOREVER_RESULT);
          setGameState("result");
        }, 400);
      }
    }, 650);
  }, []);

  const resetGame = useCallback(() => {
    cleanupTimers();
    setCurrentStep(0);
    setSelectedLoop(null);
    setResult(null);
    setCounter(null);
    setLegPhase(0);
    setBounce(0);
    setShowConfetti(false);
    setGameState("intro");
  }, [cleanupTimers]);

  const playAgain = useCallback(() => {
    cleanupTimers();
    setCurrentStep(0);
    setSelectedLoop(null);
    setResult(null);
    setCounter(null);
    setLegPhase(0);
    setBounce(0);
    setShowConfetti(false);
    setGameState("playing");
  }, [cleanupTimers]);

  const spriteX = Math.min(START_X + currentStep * STEP_PCT, 94);
  const isAnimating = gameState === "animating";
  const isResult = gameState === "result";

  return (
    <SectionWrapper
      id="loop-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-3 md:p-6 relative overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🔄
                </motion.div>
                <h3 className="text-xl md:text-2xl font-bold text-gradient mb-3">
                  লুপ অ্যাডভেঞ্চার
                </h3>
                <p className="text-slate-300 mb-5 max-w-lg mx-auto text-sm">
                  লুপ হলো প্রোগ্রামিংয়ের একটি শক্তিশালী টুল যা একটি কাজ বারবার করতে পারে।
                  নিচের স্টেজে একটি স্প্রাইট আছে। তুমি ঠিক করো — এটি কতবার চলবে?
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>শুরু করো</span>
                </motion.button>
              </motion.div>
            )}

            {(gameState === "playing" || isAnimating || isResult) && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* HUD */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      ⚙️ লুপ: {selectedLoop === null ? "—" : selectedLoop === "repeat10" ? "Repeat 10" : "Forever"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {counter && (
                      <motion.span
                        key={counter}
                        initial={{ scale: 1.3, color: "#38bdf8" }}
                        animate={{ scale: 1, color: "#94a3b8" }}
                        className="text-xs font-bold font-mono text-slate-400"
                      >
                        {counter}
                      </motion.span>
                    )}
                    <span className="text-[10px] text-slate-600">ধাপ</span>
                  </div>
                </div>

                {/* Stage */}
                <div className="relative rounded-xl overflow-hidden mb-4 select-none">
                  {/* Sky background */}
                  <div className="h-[220px] bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-900/60">
                    {/* Stars */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`star-${i}`}
                        className="absolute w-0.5 h-0.5 rounded-full bg-white"
                        style={{ left: `${5 + Math.random() * 90}%`, top: `${5 + Math.random() * 30}%` }}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                      />
                    ))}

                    {/* Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-[60px]">
                      {/* Ground top edge highlight */}
                      <div className="h-[2px] bg-gradient-to-r from-emerald-400/20 via-emerald-400/40 to-emerald-400/20" />
                      {/* Tiles */}
                      <div className="flex h-full">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <GroundTile key={i} index={i} />
                        ))}
                      </div>
                    </div>

                    {/* Decorations */}
                    <Decoration position={18} emoji="🌵" delay={0} />
                    <Decoration position={35} emoji="🪨" delay={0.5} />
                    <Decoration position={52} emoji="🌿" delay={1} />
                    <Decoration position={68} emoji="🌵" delay={0.3} />
                    <Decoration position={82} emoji="🪨" delay={0.7} />

                    {/* Path line */}
                    <div className="absolute bottom-[60px] left-[3%] right-[3%] h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-400/30 to-emerald-500/10" />

                    {/* Flags */}
                    <StartFlag />
                    <EndFlag />

                    {/* Sprite */}
                    <Sprite x={spriteX} legPhase={legPhase} bounce={bounce} />
                  </div>
                </div>

                {/* Loop selector */}
                {gameState === "playing" && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-wrap gap-3 justify-center mb-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={executeRepeat10}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 border border-cyan-400/20"
                    >
                      <Repeat className="w-4 h-4" />
                      <div className="text-left">
                        <span className="block">Repeat 10</span>
                        <span className="text-[9px] font-normal opacity-70">ঠিক ১০ বার পুনরাবৃত্তি</span>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={executeForever}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 border border-purple-400/20"
                    >
                      <Infinity className="w-4 h-4" />
                      <div className="text-left">
                        <span className="block">Forever</span>
                        <span className="text-[9px] font-normal opacity-70">অবিরাম চলতে থাকবে</span>
                      </div>
                    </motion.button>
                  </motion.div>
                )}

                {/* Result screen */}
                {isResult && result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`relative rounded-xl p-4 mb-3 border ${
                      result.success
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                    }`}
                  >
                    {/* Confetti */}
                    {showConfetti && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1.5 h-1.5 rounded-full"
                            style={{
                              left: `${10 + Math.random() * 80}%`,
                              top: `${10 + Math.random() * 80}%`,
                              background: ["#c084fc", "#818cf8", "#38bdf8", "#34d399", "#f472b6", "#fbbf24"][Math.floor(Math.random() * 6)],
                            }}
                            animate={{
                              scale: [0, 1.5, 0],
                              opacity: [1, 1, 0],
                              y: [0, -20 - Math.random() * 20, -40 - Math.random() * 30],
                              x: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60],
                            }}
                            transition={{
                              duration: 1.5 + Math.random(),
                              delay: i * 0.04,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="text-center mb-3">
                      <span className={`text-lg font-bold ${result.success ? "text-emerald-300" : "text-amber-300"}`}>
                        {result.message}
                      </span>
                    </div>

                    {/* Detailed explanation */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="text-xs text-slate-400 leading-relaxed mb-3 px-2">
                        <Lightbulb className="w-3 h-3 inline text-amber-400 mr-1" />
                        {result.detail}
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={playAgain}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>আবার চেষ্টা করো</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetGame}
                          className="px-5 py-2 rounded-xl glass-hover text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-white/10"
                        >
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>হোম</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
