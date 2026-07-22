"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, MemoryStick, Zap, AlertTriangle
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface App {
  id: string;
  name: string;
  emoji: string;
  ramGB: number;
  opened: boolean;
}

const allApps: App[] = [
  { id: "chrome", name: "Chrome", emoji: "🌐", ramGB: 3, opened: true },
  { id: "game", name: "GTA V", emoji: "🎮", ramGB: 4, opened: true },
  { id: "photoshop", name: "Photoshop", emoji: "🎨", ramGB: 2, opened: true },
  { id: "discord", name: "Discord", emoji: "💬", ramGB: 1, opened: true },
  { id: "spotify", name: "Spotify", emoji: "🎵", ramGB: 0.5, opened: true },
  { id: "vscode", name: "VS Code", emoji: "💻", ramGB: 1.5, opened: true },
  { id: "zoom", name: "Zoom", emoji: "📹", ramGB: 1.5, opened: true },
  { id: "telegram", name: "Telegram", emoji: "✈️", ramGB: 0.5, opened: true },
];

type GameState = "intro" | "playing" | "gameOver" | "victory";

const MAX_RAM = 8;

export default function Section6_Game_03() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [apps, setApps] = useState<App[]>([]);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);
  const [overload, setOverload] = useState(false);
  const totalTasks = 12;
  const [taskIndex, setTaskIndex] = useState(0);
  const ramUsed = apps.filter((a) => a.opened).reduce((sum, a) => sum + a.ramGB, 0);

  const startGame = useCallback(() => {
    const shuffled = [...allApps].sort(() => Math.random() - 0.5);
    setApps(shuffled.map((a) => ({ ...a, opened: true })));
    setScore(0);
    setStars(0);
    setBadge(false);
    setFeedback(null);
    setCombo(0);
    setOverload(false);
    setTaskIndex(0);
    setGameState("playing");
  }, []);

  const currentApp = apps[taskIndex % apps.length];

  const closeApp = useCallback((appId: string) => {
    if (gameState !== "playing") return;

    const app = apps.find((a) => a.id === appId);
    if (!app || !app.opened) return;

    setApps((prev) => prev.map((a) => a.id === appId ? { ...a, opened: false } : a));

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
      if (taskIndex >= totalTasks - 1) {
        setBadge(true);
        setGameState("victory");
      } else {
        setTaskIndex((prev) => prev + 1);
      }
    }, 500);
  }, [apps, combo, taskIndex, gameState]);

  const handleOverflow = useCallback(() => {
    if (gameState !== "playing") return;
    setOverload(true);
    setCombo(0);
    setFeedback("wrong");
    setTimeout(() => {
      setOverload(false);
      setFeedback(null);
      setGameState("gameOver");
    }, 1500);
  }, [gameState]);

  const ramPercent = (ramUsed / MAX_RAM) * 100;

  return (
    <SectionWrapper
      id="ram-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

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

          {/* RAM Usage Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <div className="flex items-center gap-1">
                <MemoryStick className="w-3 h-3 text-cyan-400" />
                <span>RAM: {ramUsed.toFixed(1)}GB / {MAX_RAM}GB</span>
              </div>
              <span className={ramPercent > 90 ? "text-red-400 font-bold" : ramPercent > 70 ? "text-amber-400" : "text-green-400"}>
                {Math.round(ramPercent)}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-700 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: `${Math.min(ramPercent, 100)}%`,
                  background: ramPercent > 90
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : ramPercent > 70
                    ? "linear-gradient(90deg, #fbbf24, #ef4444)"
                    : "linear-gradient(90deg, #38bdf8, #c084fc)",
                }}
                transition={{ duration: 0.4 }}
              />
              {ramPercent > 90 && (
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                />
              )}
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
                  🧩
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;RAM Management Tycoon&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  তোমার কম্পিউটারে মাত্র ৮GB RAM! বিভিন্ন অ্যাপ খোলা আছে — Chrome, GTA V, Photoshop, Discord ইত্যাদি। RAM যাতে ওভারলোড না হয়, সেজন্য অপ্রয়োজনীয় অ্যাপ বন্ধ করে RAM ম্যানেজ করো। বেশি দেরি করলে RAM পূর্ণ হয়ে যাবে এবং সিস্টেম ক্র্যাশ করবে! দ্রুত এবং বুদ্ধিমানের মতো সিদ্ধান্ত নাও।
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>RAM ম্যানেজার হতে চাই!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING */}
            {gameState === "playing" && (
              <motion.div
                key={`playing-${taskIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <p className="text-xs text-slate-500 mb-4">
                  টাস্ক {taskIndex + 1} / {totalTasks}
                </p>

                {currentApp && currentApp.opened && (
                  <motion.div
                    key={currentApp.id}
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
                      {currentApp.emoji}
                    </motion.span>
                    <p className="text-lg md:text-xl font-bold text-slate-100">
                      {currentApp.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      RAM: {currentApp.ramGB}GB | খোলা আছে
                    </p>
                    <p className="text-xs text-slate-500 mt-2">এটি বন্ধ করবে?</p>
                  </motion.div>
                )}

                {/* Open Apps Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto mb-4">
                  {apps.filter((a) => a.opened).map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => closeApp(app.id)}
                      className="glass rounded-xl p-3 cursor-pointer border border-white/10 hover:border-red-400/50 transition-all"
                    >
                      <div className="text-2xl mb-1">{app.emoji}</div>
                      <p className="text-xs font-medium text-slate-300">{app.name}</p>
                      <p className="text-[10px] text-slate-500">{app.ramGB}GB</p>
                    </motion.div>
                  ))}
                </div>

                {/* Closed Apps Display */}
                {apps.filter((a) => !a.opened).length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-600 mb-2">✅ বন্ধ করা অ্যাপ:</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {apps.filter((a) => !a.opened).map((app) => (
                        <span key={app.id} className="text-xs text-slate-600 line-through">
                          {app.emoji} {app.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overflow Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOverflow}
                  className="px-5 py-2 rounded-xl glass-hover border border-red-500/30 text-xs text-red-400 flex items-center gap-2 mx-auto"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>RAM পূর্ণ! ক্র্যাশ করো!</span>
                </motion.button>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback === "correct" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="mt-3 text-green-400 font-bold text-sm"
                    >
                      ✅ ঠিক আছে! RAM খালি! +{10 + Math.floor(combo / 3) * 5} পয়েন্ট
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* GAME OVER - Crash */}
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
                  💥
                </motion.div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">RAM Overflow!</h3>
                <p className="text-slate-300 mb-2">RAM পূর্ণ! সিস্টেম ক্র্যাশ!</p>
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
                  তুমি সত্যিকারের RAM ম্যানেজার!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব RAM সফলভাবে ম্যানেজ করেছ!
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-amber-400 mb-4"
                >
                  {score} পয়েন্ট
                </motion.div>

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

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="glass bg-amber-500/10 border-amber-500/30 rounded-xl p-6 inline-block mb-6"
                >
                  <Award className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                  <p className="text-lg font-bold text-amber-300">RAM Tycoon 🏅</p>
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

          {/* Overload Shake */}
          <AnimatePresence>
            {overload && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20 bg-red-500/5"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [1, 0],
                      scale: [1, 1.5],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.05,
                      repeat: Infinity,
                    }}
                  >
                    💥
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Victory Particles */}
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
