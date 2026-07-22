"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Clock, Zap, Monitor, Cpu,
  MemoryStick, HardDrive, Skull, AlertTriangle
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "deadlock" | "crash" | "victory";

interface AppRequest {
  name: string;
  icon: string;
  cpu: { min: number; max: number };
  ram: { min: number; max: number };
  storage: { min: number; max: number };
}

const APP_REQUESTS: AppRequest[] = [
  { name: "Game", icon: "🎮", cpu: { min: 70, max: 100 }, ram: { min: 60, max: 90 }, storage: { min: 40, max: 70 } },
  { name: "Chrome", icon: "🌐", cpu: { min: 30, max: 60 }, ram: { min: 50, max: 80 }, storage: { min: 20, max: 50 } },
  { name: "YouTube", icon: "▶️", cpu: { min: 40, max: 70 }, ram: { min: 40, max: 70 }, storage: { min: 30, max: 60 } },
];

interface ResourceAllocation {
  cpu: number;
  ram: number;
  storage: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isCorrectAllocation(app: AppRequest, alloc: ResourceAllocation): boolean {
  return (
    alloc.cpu >= app.cpu.min && alloc.cpu <= app.cpu.max &&
    alloc.ram >= app.ram.min && alloc.ram <= app.ram.max &&
    alloc.storage >= app.storage.min && alloc.storage <= app.storage.max
  );
}

export default function Section6_Game_08() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentApp, setCurrentApp] = useState<AppRequest | null>(null);
  const [queue, setQueue] = useState<AppRequest[]>([]);
  const [allocation, setAllocation] = useState<ResourceAllocation>({ cpu: 50, ram: 50, storage: 50 });
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(6);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [deadlockTimer, setDeadlockTimer] = useState(3);
  const deadlockIntervalRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const shuffled = shuffleArray([...APP_REQUESTS, ...APP_REQUESTS]).slice(0, 6);
    setQueue(shuffled.slice(1));
    setCurrentApp(shuffled[0]);
    setAllocation({ cpu: 50, ram: 50, storage: 50 });
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setCombo(0);
    setRound(0);
    setTotalRounds(shuffled.length);
    setFeedback(null);
    setRoundStartTime(Date.now());
    setGameState("playing");
  }, []);

  const nextRound = useCallback(() => {
    if (queue.length === 0) {
      setBadge(true);
      setTimeout(() => setGameState("victory"), 500);
      return;
    }
    const [nextItem, ...rest] = queue;
    setCurrentApp(nextItem);
    setQueue(rest);
    setAllocation({ cpu: 50, ram: 50, storage: 50 });
    setRound((prev) => prev + 1);
    setFeedback(null);
    setRoundStartTime(Date.now());
  }, [queue]);

  const adjustResource = useCallback((resource: keyof ResourceAllocation, delta: number) => {
    setAllocation((prev) => ({
      ...prev,
      [resource]: Math.max(0, Math.min(100, prev[resource] + delta)),
    }));
  }, []);

  const submitAllocation = useCallback(() => {
    if (!currentApp || feedback) return;
    const correct = isCorrectAllocation(currentApp, allocation);
    const timeBonus = Math.max(0, Math.floor((8000 - (Date.now() - roundStartTime)) / 200));
    const basePoints = correct ? 15 : 0;
    const comboBonus = correct ? Math.floor(combo / 2) * 5 : 0;
    const totalPoints = basePoints + comboBonus + (correct ? timeBonus : 0);

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((prev) => prev + totalPoints);
      setXp((prev) => Math.min(prev + Math.floor(totalPoints * 1.5), 100));
      if (newCombo > 0 && newCombo % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }
      setFeedback({
        message: `✅ "${currentApp.name}" সফল! +${totalPoints} পয়েন্ট${combo >= 1 ? ` 🔥 ${newCombo} কম্বো!` : ""}`,
        type: "correct",
      });
      setTimeout(() => nextRound(), 1200);
    } else {
      setCombo(0);
      setGameState("deadlock");
      setDeadlockTimer(3);
      setFeedback({
        message: `⚠️ ডেডলক! "${currentApp.name}" রিসোর্স পায়নি!`,
        type: "wrong",
      });
      const interval = setInterval(() => {
        setDeadlockTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState("crash");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      deadlockIntervalRef.current = interval;
    }
  }, [currentApp, allocation, feedback, combo, nextRound, roundStartTime]);

  const retry = useCallback(() => {
    if (deadlockIntervalRef.current) clearInterval(deadlockIntervalRef.current);
    setGameState("playing");
    setFeedback(null);
    setAllocation({ cpu: 50, ram: 50, storage: 50 });
    setRoundStartTime(Date.now());
  }, []);

  const restartGame = useCallback(() => {
    if (deadlockIntervalRef.current) clearInterval(deadlockIntervalRef.current);
    setGameState("intro");
  }, []);

  useEffect(() => {
    return () => {
      if (deadlockIntervalRef.current) clearInterval(deadlockIntervalRef.current);
    };
  }, []);

  const getAppEfficiency = (app: AppRequest) => {
    const cpuEff = allocation.cpu >= app.cpu.min && allocation.cpu <= app.cpu.max;
    const ramEff = allocation.ram >= app.ram.min && allocation.ram <= app.ram.max;
    const storageEff = allocation.storage >= app.storage.min && allocation.storage <= app.storage.max;
    return { cpuEff, ramEff, storageEff };
  };

  return (
    <SectionWrapper
      id="os-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Score and Stats Bar */}
          {gameState === "playing" && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400">{Math.max(0, Math.floor((8000 - (Date.now() - roundStartTime)) / 1000))}s</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Monitor className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">{round}/{totalRounds}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* XP Bar */}
          {gameState === "playing" && (
            <div className="mb-4">
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  animate={{ width: `${xp}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Combo Display */}
          {combo >= 2 && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-2"
            >
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                🔥 {combo} কম্বো! +{Math.floor(combo / 2) * 5} বোনাস
              </span>
            </motion.div>
          )}

          {/* Running processes panel */}
          {gameState === "playing" && currentApp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4"
            >
              <div className="glass rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentApp.icon}</span>
                  <div>
                    <span className="text-xs text-slate-400">চলমান প্রক্রিয়া</span>
                    <p className="text-sm text-slate-200 font-semibold">{currentApp.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-green-400" />
                  <span className="text-[10px] text-green-400">রিকোয়েস্ট এসেছে</span>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* INTRO STATE */}
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
                  🖥️
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;OS Simulator - Deadlock Expert&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  তুমি এখন <span className="text-cyan-300 font-semibold">অপারেটিং সিস্টেম</span>! Three heavy applications—Game, Chrome, YouTube—constantly request system resources. তুমি সঠিকভাবে CPU, RAM ও Storage বরাদ্দ করো। ভুল করলেই <span className="text-red-400 font-semibold">ডেডলক</span> আর <span className="text-red-400 font-semibold">সিস্টেম ক্র্যাশ</span>!
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">প্রতিটি অ্যাপের রিসোর্স চাহিদা:</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-blue-400">🎮 Game: CPU ৭০-১০০% | RAM ৬০-৯০% | Storage ৪০-৭০%</p>
                    <p className="text-purple-400">🌐 Chrome: CPU ৩০-৬০% | RAM ৫০-৮০% | Storage ২০-৫০%</p>
                    <p className="text-pink-400">▶️ YouTube: CPU ৪০-৭০% | RAM ৪০-৭০% | Storage ৩০-৬০%</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>OS-এর ভূমিকা নাও!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING STATE */}
            {gameState === "playing" && currentApp && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* App request display */}
                <div className="text-center mb-6">
                  <span className="text-xs text-slate-500 mb-2 block">এই অ্যাপের জন্য রিসোর্স বরাদ্দ করো:</span>
                  <motion.div
                    key={currentApp.name}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl md:text-7xl mb-3"
                    >
                      {currentApp.icon}
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-200">
                      {currentApp.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      CPU: {currentApp.cpu.min}-{currentApp.cpu.max}% | RAM: {currentApp.ram.min}-{currentApp.ram.max}% | Storage: {currentApp.storage.min}-{currentApp.storage.max}%
                    </p>
                  </motion.div>
                </div>

                {/* Resource allocation controls */}
                <div className="space-y-4 mb-6">
                  {([
                    { key: "cpu" as const, label: "CPU", icon: "⚡", color: "#38bdf8", app: currentApp },
                    { key: "ram" as const, label: "RAM", icon: "🧠", color: "#c084fc", app: currentApp },
                    { key: "storage" as const, label: "Storage", icon: "💾", color: "#34d399", app: currentApp },
                  ]).map((res) => {
                    const appReq = res.app;
                    const targetMin = appReq[res.key].min;
                    const targetMax = appReq[res.key].max;
                    const currentVal = allocation[res.key];
                    const inRange = currentVal >= targetMin && currentVal <= targetMax;
                    return (
                      <div key={res.key} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{res.icon}</span>
                            <span className="text-xs font-medium text-slate-400">{res.label}</span>
                          </div>
                          <motion.span
                            className="text-sm font-bold"
                            style={{ color: inRange ? res.color : "#ef4444" }}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.3 }}
                          >
                            {currentVal}%
                          </motion.span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden mb-2">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: inRange ? res.color : "#ef4444" }}
                            animate={{ width: `${currentVal}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-600">
                            লক্ষ্য: {targetMin}-{targetMax}%
                          </span>
                          <div className="flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => adjustResource(res.key, -5)}
                              disabled={!!feedback}
                              className="w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-300 border border-white/10 text-sm font-bold disabled:opacity-30"
                            >
                              −
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => adjustResource(res.key, 5)}
                              disabled={!!feedback}
                              className="w-8 h-8 rounded-lg glass-hover flex items-center justify-center text-slate-300 border border-white/10 text-sm font-bold disabled:opacity-30"
                            >
                              +
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submit button */}
                <div className="flex justify-center mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitAllocation}
                    disabled={!!feedback}
                    className={`px-8 py-4 rounded-xl flex items-center gap-3 font-bold text-lg ${
                      feedback
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                    }`}
                  >
                    <Zap className="w-6 h-6" />
                    <span>রিসোর্স বরাদ্দ করো</span>
                  </motion.button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`text-center py-3 px-4 rounded-xl glass ${
                        feedback.type === "correct" ? "border-green-500/30" : "border-red-500/30"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${
                        feedback.type === "correct" ? "text-green-400" : "text-red-400"
                      }`}>
                        {feedback.message}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* DEADLOCK STATE */}
            {gameState === "deadlock" && (
              <motion.div
                key="deadlock"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  ⚠️
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-red-400 mb-2">
                  ডেডলক ডিটেক্টেড!
                </h3>
                <p className="text-slate-300 mb-4">
                  &quot;{currentApp?.name}&quot; সঠিক রিসোর্স পায়নি! সিস্টেম হ্যাং হয়ে গেছে!
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl font-bold text-red-500 mb-6"
                >
                  {deadlockTimer}
                </motion.div>
                <p className="text-xs text-slate-500 mb-4">
                  সিস্টেম ক্র্যাশ হতে চলেছে...
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retry}
                  className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 mx-auto text-slate-300 border border-white/10"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>আবার চেষ্টা করো</span>
                </motion.button>
              </motion.div>
            )}

            {/* CRASH STATE */}
            {gameState === "crash" && (
              <motion.div
                key="crash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="text-7xl mb-4"
                >
                  💥
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="glass bg-red-500/10 border-red-500/30 rounded-xl p-6 inline-block mb-4"
                >
                  <Skull className="w-12 h-12 mx-auto text-red-400 mb-2" />
                  <h3 className="text-xl font-bold text-red-400">সিস্টেম ক্র্যাশ!</h3>
                  <p className="text-sm text-slate-400">OS ব্যর্থ! ডেডলক রিকভার করা সম্ভব হয়নি।</p>
                </motion.div>
                <motion.div className="flex gap-3 justify-center flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>নতুন গেম শুরু করো</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={restartGame}
                    className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
                  >
                    <Monitor className="w-5 h-5" />
                    <span>শুরুতে ফিরে যাও</span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* VICTORY STATE */}
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
                  তুমি সত্যিকারের OS এক্সপার্ট!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব অ্যাপ সঠিকভাবে রিসোর্স পেয়েছে! কোনো ডেডলক হয়নি!
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
                  <p className="text-lg font-bold text-amber-300">Deadlock Expert 🏅</p>
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

          {/* Victory confetti */}
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

          {/* Crash screen shake overlay */}
          <AnimatePresence>
            {gameState === "crash" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20 bg-red-500"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
