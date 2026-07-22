"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Clock, Zap, Monitor, AppWindow,
  Lightbulb, Cpu
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "victory";

interface SoftwareItem {
  name: string;
  icon: string;
  category: "system" | "application";
  description: string;
}

const SOFTWARE_ITEMS: SoftwareItem[] = [
  { name: "Windows 11", icon: "🖥️", category: "system", description: "মাইক্রোসফটের অপারেটিং সিস্টেম" },
  { name: "Google Chrome", icon: "🌐", category: "application", description: "ইন্টারনেট ব্রাউজার" },
  { name: "Linux Kernel", icon: "🐧", category: "system", description: "লিনাক্স অপারেটিং সিস্টেম কার্নেল" },
  { name: "VS Code", icon: "💻", category: "application", description: "কোড এডিটর" },
  { name: "macOS", icon: "🍎", category: "system", description: "অ্যাপলের অপারেটিং সিস্টেম" },
  { name: "Adobe Photoshop", icon: "🎨", category: "application", description: "ইমেজ এডিটিং সফটওয়্যার" },
  { name: "Android OS", icon: "📱", category: "system", description: "গুগলের মোবাইল অপারেটিং সিস্টেম" },
  { name: "Spotify", icon: "🎵", category: "application", description: "মিউজিক স্ট্রিমিং অ্যাপ" },
  { name: "Device Driver", icon: "🔌", category: "system", description: "হার্ডওয়্যার কন্ট্রোল সফটওয়্যার" },
  { name: "Microsoft Word", icon: "📝", category: "application", description: "ডকুমেন্ট প্রসেসর" },
  { name: "BIOS/UEFI", icon: "⚡", category: "system", description: "কম্পিউটার বুট সফটওয়্যার" },
  { name: "Telegram", icon: "✈️", category: "application", description: "মেসেজিং অ্যাপ" },
  { name: "Firewall", icon: "🛡️", category: "system", description: "নিরাপত্তা সিস্টেম সফটওয়্যার" },
  { name: "Minecraft", icon: "🎮", category: "application", description: "গেম সফটওয়্যার" },
  { name: "iOS", icon: "📱", category: "system", description: "অ্যাপলের মোবাইল অপারেটিং সিস্টেম" },
  { name: "Zoom", icon: "📹", category: "application", description: "ভিডিও কনফারেন্সিং অ্যাপ" },
  { name: "Compiler (GCC)", icon: "🔧", category: "system", description: "প্রোগ্রাম কম্পাইল করার টুল" },
  { name: "Excel", icon: "📊", category: "application", description: "স্প্রেডশিট অ্যাপ্লিকেশন" },
  { name: "Hypervisor", icon: "🧩", category: "system", description: "ভার্চুয়াল মেশিন ম্যানেজার" },
  { name: "Netflix", icon: "🎬", category: "application", description: "স্ট্রিমিং সার্ভিস অ্যাপ" },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Section6_Game_07() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentItem, setCurrentItem] = useState<SoftwareItem | null>(null);
  const [remaining, setRemaining] = useState<SoftwareItem[]>([]);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(12);
  const [feedback, setFeedback] = useState<{ message: string; type: string; correct: boolean } | null>(null);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [lastStreak, setLastStreak] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(SOFTWARE_ITEMS).slice(0, 12);
    setRemaining(shuffled.slice(1));
    setCurrentItem(shuffled[0]);
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setCombo(0);
    setRound(0);
    setTotalRounds(shuffled.length);
    setFeedback(null);
    setHintUsed(false);
    setShowHint(false);
    setRoundStartTime(Date.now());
    setGameState("playing");
  }, []);

  const nextRound = useCallback(() => {
    if (remaining.length === 0) {
      setBadge(true);
      setTimeout(() => setGameState("victory"), 500);
      return;
    }
    const [nextItem, ...rest] = remaining;
    setCurrentItem(nextItem);
    setRemaining(rest);
    setRound((prev) => prev + 1);
    setFeedback(null);
    setHintUsed(false);
    setShowHint(false);
    setRoundStartTime(Date.now());
  }, [remaining]);

  const categorize = useCallback((category: "system" | "application") => {
    if (!currentItem) return;
    const isCorrect = currentItem.category === category;
    const timeBonus = Math.max(0, Math.floor((5000 - (Date.now() - roundStartTime)) / 100));
    const basePoints = isCorrect ? 10 : -5;
    const comboBonus = isCorrect ? Math.floor(combo / 3) * 5 : 0;
    const totalPoints = Math.max(0, basePoints + comboBonus + (isCorrect ? timeBonus : 0));

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setScore((prev) => prev + totalPoints);
      setXp((prev) => Math.min(prev + totalPoints, 100));
      if (newCombo > 0 && newCombo % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }
      setLastStreak(true);
      setFeedback({
        message: `✅ সঠিক! "${currentItem.name}" হল ${currentItem.category === "system" ? "সিস্টেম" : "অ্যাপ্লিকেশন"} সফটওয়্যার! +${totalPoints} পয়েন্ট${combo >= 2 ? ` 🔥 ${newCombo} কম্বো!` : ""}`,
        type: "correct",
        correct: true,
      });
    } else {
      const correctCategory = currentItem.category === "system" ? "সিস্টেম সফটওয়্যার" : "অ্যাপ্লিকেশন সফটওয়্যার";
      setCombo(0);
      setLastStreak(false);
      setScore((prev) => Math.max(0, prev + totalPoints));
      setFeedback({
        message: `❌ ভুল! "${currentItem.name}" হল ${correctCategory}`,
        type: "wrong",
        correct: false,
      });
    }

    setTimeout(() => nextRound(), 1500);
  }, [currentItem, combo, nextRound, roundStartTime]);

  const useHint = useCallback(() => {
    if (!currentItem || hintUsed) return;
    setHintUsed(true);
    setShowHint(true);
  }, [currentItem, hintUsed]);

  return (
    <SectionWrapper
      id="software-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {gameState === "playing" && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{score}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <AppWindow className="w-4 h-4 text-slate-400" />
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

          {combo >= 3 && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-2"
            >
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                🔥 {combo} কম্বো! +{Math.floor(combo / 3) * 5} বোনাস প্রতি সঠিক
              </span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
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
                  🏗️
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;Software Builder&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  একটি সফটওয়্যার নাম দেখানো হবে। তুমি ঠিক করো — এটি <span className="text-blue-300 font-semibold">সিস্টেম সফটওয়্যার</span> নাকি <span className="text-purple-300 font-semibold">অ্যাপ্লিকেশন সফটওয়্যার</span>?
                  সঠিক উত্তর দিলে পয়েন্ট ও কম্বো বাড়বে!
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">উদাহরণ:</p>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-400">🖥️ Windows → সিস্টেম সফটওয়্যার</p>
                    <p className="text-sm text-purple-400">🌐 Chrome → অ্যাপ্লিকেশন সফটওয়্যার</p>
                    <p className="text-sm text-blue-400">🐧 Linux → সিস্টেম সফটওয়্যার</p>
                    <p className="text-sm text-purple-400">🎮 Minecraft → অ্যাপ্লিকেশন সফটওয়্যার</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>গেম শুরু করি!</span>
                </motion.button>
              </motion.div>
            )}

            {gameState === "playing" && currentItem && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <span className="text-xs text-slate-500 mb-2 block">এই সফটওয়্যারটি কোন ধরনের?</span>
                  <motion.div
                    key={currentItem.name}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-block"
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl md:text-7xl mb-3"
                    >
                      {currentItem.icon}
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-200">
                      {currentItem.name}
                    </h3>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-xl p-4 mb-6 text-center"
                    >
                      <p className="text-sm text-slate-400">
                        <span className="text-amber-400 font-semibold">💡 ইঙ্গিত:</span> {currentItem.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4 justify-center mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => categorize("system")}
                    disabled={!!feedback}
                    className={`px-8 py-4 rounded-xl flex items-center gap-3 font-bold text-lg ${
                      feedback
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                    }`}
                  >
                    <Monitor className="w-6 h-6" />
                    <div className="text-left">
                      <span className="block">সিস্টেম</span>
                      <span className="text-xs font-normal opacity-70">সফটওয়্যার</span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => categorize("application")}
                    disabled={!!feedback}
                    className={`px-8 py-4 rounded-xl flex items-center gap-3 font-bold text-lg ${
                      feedback
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                    }`}
                  >
                    <AppWindow className="w-6 h-6" />
                    <div className="text-left">
                      <span className="block">অ্যাপ্লিকেশন</span>
                      <span className="text-xs font-normal opacity-70">সফটওয়্যার</span>
                    </div>
                  </motion.button>
                </div>

                <div className="flex justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={useHint}
                    disabled={hintUsed || !!feedback}
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                      hintUsed || feedback
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed border-slate-700"
                        : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{hintUsed ? "ইঙ্গিত দেখা হয়েছে" : "ইঙ্গিত দেখুন"}</span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`mt-4 text-center py-3 px-4 rounded-xl glass ${
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
                  তুমি সত্যিকারের Software Builder!
                </h3>
                <p className="text-slate-300 mb-4">
                  তুমি সব সফটওয়্যার সঠিকভাবে চিহ্নিত করেছ!
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
                  <p className="text-lg font-bold text-amber-300">Software Master 🏅</p>
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
