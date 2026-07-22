"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Thermometer, Zap, ChevronRight
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface Task {
  id: string;
  label: string;
  emoji: string;
  correctTarget: "alu" | "registers";
  wrongTarget: "alu" | "registers";
}

const allTasks: Task[] = [
  { id: "t1", label: "গান বাজাও", emoji: "🎵", correctTarget: "alu", wrongTarget: "registers" },
  { id: "t2", label: "ছবি লোড করো", emoji: "🖼️", correctTarget: "registers", wrongTarget: "alu" },
  { id: "t3", label: "গেমের হিসাব করো", emoji: "🎮", correctTarget: "alu", wrongTarget: "registers" },
  { id: "t4", label: "টেক্সট সংরক্ষণ করো", emoji: "📝", correctTarget: "registers", wrongTarget: "alu" },
  { id: "t5", label: "দুই সংখ্যা যোগ করো", emoji: "➕", correctTarget: "alu", wrongTarget: "registers" },
  { id: "t6", label: "মাউসের ক্লিক ধরে রাখো", emoji: "🖱️", correctTarget: "registers", wrongTarget: "alu" },
];

type GameState = "intro" | "playing" | "gameOver" | "victory";

export default function Section6_Game_02() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [heat, setHeat] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);
  const taskCount = 10;

  const startGame = useCallback(() => {
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
    const selected: Task[] = [];
    for (let i = 0; i < taskCount; i++) {
      selected.push(shuffled[i % shuffled.length]);
    }
    setTasks(selected);
    setCurrentTaskIndex(0);
    setHeat(0);
    setScore(0);
    setStars(0);
    setBadge(false);
    setDraggedTask(null);
    setFeedback(null);
    setCombo(0);
    setGameState("playing");
  }, []);

  const currentTask = tasks[currentTaskIndex];

  const handleDrop = useCallback((target: "alu" | "registers") => {
    if (!currentTask || gameState !== "playing") return;

    if (target === currentTask.correctTarget) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboBonus = Math.floor(newCombo / 3);
      const points = 10 + comboBonus * 5;
      setScore((prev) => prev + points);
      if (newCombo % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }
      setFeedback("correct");
      setTimeout(() => {
        setFeedback(null);
        if (currentTaskIndex >= taskCount - 1) {
          setBadge(true);
          setGameState("victory");
        } else {
          setCurrentTaskIndex((prev) => prev + 1);
        }
      }, 600);
    } else {
      setCombo(0);
      const newHeat = heat + 20;
      setHeat(newHeat);
      setFeedback("wrong");
      if (newHeat >= 100) {
        setTimeout(() => {
          setGameState("gameOver");
        }, 800);
      } else {
        setTimeout(() => {
          setFeedback(null);
          if (currentTaskIndex >= taskCount - 1) {
            setBadge(true);
            setGameState("victory");
          } else {
            setCurrentTaskIndex((prev) => prev + 1);
          }
        }, 800);
      }
    }
  }, [currentTask, currentTaskIndex, combo, heat, gameState]);

  return (
    <SectionWrapper
      id="cpu-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-bold text-amber-400">{score}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                />
              ))}
            </div>
          </div>

          {/* Heat Meter */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span>CPU Heat</span>
              </div>
              <span className={heat > 60 ? "text-red-400" : heat > 30 ? "text-amber-400" : "text-green-400"}>
                {heat}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: `${heat}%`,
                  background: heat > 60
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : heat > 30
                    ? "linear-gradient(90deg, #fbbf24, #ef4444)"
                    : "linear-gradient(90deg, #34d399, #fbbf24)",
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Combo indicator */}
          {combo >= 3 && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-2"
            >
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                🔥 {combo} কম্বো! +{10 + Math.floor(combo / 3) * 5} পয়েন্ট
              </span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* INTRO */}
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  🧠
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;The Silicon Boss&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  User নিজেই Control Unit হবে। উপরে থেকে বিভিন্ন Task নেমে আসবে। যেমন &quot;গান বাজাও&quot; &quot;ছবি লোড করো&quot; &quot;গেমের হিসাব করো&quot; User Drag &amp; Drop করে ঠিক Unit-এ পাঠাবে। ALU Registers ভুল জায়গায় ফেললে CPU Heat Meter বাড়বে। Heat 100% হলে Game Over ঠিকমতো খেললে XP Stars Badge Unlock হবে।
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>বস হতে চাই!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING */}
            {gameState === "playing" && currentTask && (
              <motion.div
                key={`playing-${currentTaskIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Task counter */}
                <p className="text-xs text-slate-500 mb-4">
                  টাস্ক {currentTaskIndex + 1} / {taskCount}
                </p>

                {/* Falling Task */}
                <motion.div
                  key={currentTask.id}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="glass rounded-2xl p-6 md:p-8 mb-6 inline-block"
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl block mb-3"
                  >
                    {currentTask.emoji}
                  </motion.span>
                  <p className="text-lg md:text-xl font-bold text-slate-100">
                    {currentTask.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">কোথায় পাঠাবে?</p>
                </motion.div>

                {/* Drop Targets */}
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  {/* ALU Target */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDrop("alu")}
                    className={`glass rounded-xl p-5 cursor-pointer border-2 transition-all ${
                      feedback === "correct" && currentTask.correctTarget === "alu"
                        ? "border-green-500 bg-green-500/10"
                        : feedback === "wrong" && currentTask.correctTarget !== "alu"
                        ? "border-red-500 bg-red-500/10"
                        : "border-white/10 hover:border-purple-400/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Zap className="w-8 h-8 text-blue-400" />
                      <span className="text-sm font-bold text-blue-400">ALU</span>
                      <span className="text-[10px] text-slate-500">গাণিতিক ও যৌক্তিক</span>
                    </div>
                  </motion.div>

                  {/* Registers Target */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDrop("registers")}
                    className={`glass rounded-xl p-5 cursor-pointer border-2 transition-all ${
                      feedback === "correct" && currentTask.correctTarget === "registers"
                        ? "border-green-500 bg-green-500/10"
                        : feedback === "wrong" && currentTask.correctTarget !== "registers"
                        ? "border-red-500 bg-red-500/10"
                        : "border-white/10 hover:border-green-400/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="6" rx="1" />
                        <rect x="2" y="15" width="20" height="6" rx="1" />
                      </svg>
                      <span className="text-sm font-bold text-green-400">Registers</span>
                      <span className="text-[10px] text-slate-500">দ্রুত ডেটা ধরে রাখা</span>
                    </div>
                  </motion.div>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback === "correct" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="mt-4 text-green-400 font-bold"
                    >
                      ✅ ঠিক আছে! +{10 + Math.floor(combo / 3) * 5} পয়েন্ট
                    </motion.div>
                  )}
                  {feedback === "wrong" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="mt-4 text-red-400 font-bold"
                    >
                      ❌ ভুল! হিট বেড়ে গেল!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* GAME OVER */}
            {gameState === "gameOver" && (
              <motion.div
                key="gameOver"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                  transition={{ type: "spring", stiffness: 150 }}
                  className="text-7xl mb-4"
                >
                  🔥
                </motion.div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">CPU Overheated!</h3>
                <p className="text-slate-300 mb-2">Heat 100% — গেম ওভার!</p>
                <div className="glass bg-red-500/10 border-red-500/20 rounded-xl p-4 inline-block mb-6">
                  <p className="text-sm text-slate-400">স্কোর: {score}</p>
                  <p className="text-sm text-slate-400">স্টার: {stars}/5</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold flex items-center gap-2 mx-auto shadow-lg shadow-red-500/25"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>আবার চেষ্টা করো</span>
                </motion.button>
              </motion.div>
            )}

            {/* VICTORY */}
            {gameState === "victory" && (
              <motion.div
                key="victory"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 150 }}
                  className="text-7xl mb-4"
                >
                  🏆
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                  তুমি সত্যিকারের Silicon Boss!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব টাস্ক সফলভাবে সম্পন্ন করেছ!
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-amber-400 mb-4"
                >
                  {score} পয়েন্ট
                </motion.div>

                {/* Stars */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-2 mb-4"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          i < stars ? "text-amber-400 fill-amber-400" : "text-slate-600"
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="glass bg-amber-500/10 border-amber-500/30 rounded-xl p-6 inline-block mb-6"
                >
                  <Award className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                  <p className="text-lg font-bold text-amber-300">Silicon Boss 🏅</p>
                  <p className="text-sm text-slate-400">ব্যাজ আনলক করা হয়েছে!</p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl glass-hover flex items-center gap-2 mx-auto text-slate-300 border border-white/10"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>আবার খেলুন</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Celebration Particles */}
          <AnimatePresence>
            {gameState === "victory" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${10 + Math.random() * 80}%`,
                      background: ["#c084fc", "#818cf8", "#38bdf8", "#34d399", "#f472b6", "#fbbf24"][Math.floor(Math.random() * 6)],
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.05,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
