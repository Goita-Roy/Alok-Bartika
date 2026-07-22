"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Palette, Clock, Zap, Droplets,
  Lightbulb
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "victory";

interface TargetColor {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

const TARGET_COLORS: TargetColor[] = [
  { name: "পার্পল", hex: "#800080", r: 128, g: 0, b: 128 },
  { name: "গোল্ড", hex: "#FFD700", r: 255, g: 215, b: 0 },
  { name: "অরেঞ্জ", hex: "#FFA500", r: 255, g: 165, b: 0 },
  { name: "স্কাই ব্লু", hex: "#87CEEB", r: 135, g: 206, b: 235 },
  { name: "পিঙ্ক", hex: "#FFC0CB", r: 255, g: 192, b: 203 },
  { name: "লাইম", hex: "#32CD32", r: 50, g: 205, b: 50 },
  { name: "টিল", hex: "#008080", r: 0, g: 128, b: 128 },
  { name: "ক্রিমসন", hex: "#DC143C", r: 220, g: 20, b: 60 },
  { name: "ইন্ডিগো", hex: "#4B0082", r: 75, g: 0, b: 130 },
  { name: "টমেটো", hex: "#FF6347", r: 255, g: 99, b: 71 },
];

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function colorSimilarity(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const diff = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
  const maxDist = Math.sqrt(3 * 255 ** 2);
  return Math.max(0, Math.round((1 - diff / maxDist) * 100));
}

export default function Section6_Game_06() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [targetColor, setTargetColor] = useState<TargetColor>(TARGET_COLORS[0]);
  const [red, setRed] = useState(128);
  const [green, setGreen] = useState(128);
  const [blue, setBlue] = useState(128);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [round, setRound] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const timerRef = useRef<number | null>(null);
  const totalRounds = 8;

  // Timer
  useEffect(() => {
    if (!isTimerRunning || gameState !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, gameState]);

  // Calculate accuracy in real time
  useEffect(() => {
    const sim = colorSimilarity(red, green, blue, targetColor.r, targetColor.g, targetColor.b);
    setAccuracy(sim);
  }, [red, green, blue, targetColor]);

  const startGame = useCallback(() => {
    const idx = Math.floor(Math.random() * TARGET_COLORS.length);
    setTargetColor(TARGET_COLORS[idx]);
    setRed(128);
    setGreen(128);
    setBlue(128);
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setCombo(0);
    setFeedback(null);
    setAccuracy(0);
    setTimeLeft(30);
    setRound(0);
    setHintUsed(false);
    setIsTimerRunning(false);
    setGameState("playing");
  }, []);

  const submitColor = useCallback(() => {
    const sim = colorSimilarity(red, green, blue, targetColor.r, targetColor.g, targetColor.b);
    const basePoints = Math.floor(sim * 2);
    const comboBonus = Math.floor(combo / 3) * 5;
    const totalPoints = basePoints + comboBonus;
    const newCombo = sim >= 70 ? combo + 1 : 0;

    setCombo(newCombo);
    setScore((prev) => prev + totalPoints);
    setXp((prev) => Math.min(prev + totalPoints, 100));

    if (newCombo > 0 && newCombo % 3 === 0) {
      setStars((prev) => Math.min(prev + 1, 5));
    }

    if (sim >= 90) {
      setFeedback({ message: `🎉 নিখুঁত! ${sim}% মিল — +${totalPoints} পয়েন্ট`, type: "perfect" });
    } else if (sim >= 70) {
      setFeedback({ message: `👍 ভালো! ${sim}% মিল — +${totalPoints} পয়েন্ট`, type: "good" });
    } else if (sim >= 50) {
      setFeedback({ message: `😐 মোটামুটি! ${sim}% মিল — +${totalPoints} পয়েন্ট`, type: "ok" });
    } else {
      setFeedback({ message: `😅 কম মিল! ${sim}% — চেষ্টা চালিয়ে যাও`, type: "low" });
    }

    const newRound = round + 1;
    setRound(newRound);

    if (newRound >= totalRounds) {
      setBadge(true);
      setTimeout(() => setGameState("victory"), 800);
      return;
    }

    setTimeout(() => {
      const idx = Math.floor(Math.random() * TARGET_COLORS.length);
      setTargetColor(TARGET_COLORS[idx]);
      setRed(128);
      setGreen(128);
      setBlue(128);
      setHintUsed(false);
      setTimeLeft(30);
      setIsTimerRunning(true);
      setFeedback(null);
    }, 2000);
  }, [red, green, blue, targetColor, combo, round]);

  const startRound = useCallback(() => {
    setIsTimerRunning(true);
    setRound(1);
  }, []);

  const useHint = useCallback(() => {
    setHintUsed(true);
    setRed((prev) => Math.round((prev + targetColor.r) / 2));
    setGreen((prev) => Math.round((prev + targetColor.g) / 2));
    setBlue((prev) => Math.round((prev + targetColor.b) / 2));
  }, [targetColor]);

  const sliderTrack = (value: number, color: string) => {
    return {
      background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, rgba(255,255,255,0.1) ${value}%)`,
    };
  };

  return (
    <SectionWrapper
      id="output-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Game Header */}
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
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className={`text-sm font-bold ${timeLeft <= 5 ? "text-red-400" : "text-slate-300"}`}>
                    {timeLeft}s
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-slate-400" />
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

          {/* Combo */}
          {combo >= 3 && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-2"
            >
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                🔥 {combo} কম্বো! +{Math.floor(combo / 3) * 5} বোনাস
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
                  🎨
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;RGB Color Mixer&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  একটি টার্গেট রঙ দেখানো হবে। নিচের তিনটি স্লাইডার — লাল (Red), সবুজ (Green) ও নীল (Blue) — সামঞ্জস্য করে টার্গেট রঙটি তৈরি করো! যথার্থতা যত বেশি, পয়েন্ট তত বেশি।
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">উদাহরণ:</p>
                  <div className="space-y-1">
                    <p className="text-sm text-red-400">🔴 R: 255, G: 0, B: 0 = লাল</p>
                    <p className="text-sm text-green-400">🟢 R: 0, G: 255, B: 0 = সবুজ</p>
                    <p className="text-sm text-blue-400">🔵 R: 0, G: 0, B: 255 = নীল</p>
                    <p className="text-sm text-purple-400">🟣 R: 128, G: 0, B: 128 = পার্পল</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>কালার মিক্সার শুরু করি!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING */}
            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Timer warning */}
                {timeLeft <= 5 && timeLeft > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center mb-2"
                  >
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                      ⏰ সময় ফুরাচ্ছে!
                    </span>
                  </motion.div>
                )}

                {timeLeft === 0 && round > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center mb-2"
                  >
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                      ⏰ সময় শেষ! পরবর্তী রঙে যাচ্ছি...
                    </span>
                  </motion.div>
                )}

                {/* Target Color Display */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Target Color */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-5 text-center"
                  >
                    <h4 className="text-sm text-slate-400 mb-3">টার্গেট কালার</h4>
                    <motion.div
                      key={targetColor.hex}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl mx-auto mb-3 border-2 border-white/20 shadow-xl"
                      style={{ backgroundColor: targetColor.hex }}
                    />
                    <p className="text-lg font-bold text-slate-200">{targetColor.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      R:{targetColor.r} G:{targetColor.g} B:{targetColor.b}
                    </p>
                  </motion.div>

                  {/* Your Color */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass rounded-2xl p-5 text-center"
                  >
                    <h4 className="text-sm text-slate-400 mb-3">তোমার মিশ্রণ</h4>
                    <motion.div
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl mx-auto mb-3 border-2 border-white/20 shadow-xl"
                      style={{ backgroundColor: `rgb(${red},${green},${blue})` }}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-sm text-slate-400 font-mono">
                      RGB({red}, {green}, {blue})
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      #{red.toString(16).padStart(2, "0")}{green.toString(16).padStart(2, "0")}{blue.toString(16).padStart(2, "0")}
                    </p>
                  </motion.div>
                </div>

                {/* Accuracy Meter */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 mb-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">যথার্থতা (Accuracy)</span>
                    <motion.span
                      key={accuracy}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className={`text-sm font-bold ${
                        accuracy >= 90 ? "text-green-400" :
                        accuracy >= 70 ? "text-amber-400" :
                        accuracy >= 50 ? "text-orange-400" : "text-red-400"
                      }`}
                    >
                      {accuracy}%
                    </motion.span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <motion.div
                      animate={{ width: `${accuracy}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${
                        accuracy >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                        accuracy >= 70 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                        accuracy >= 50 ? "bg-gradient-to-r from-orange-500 to-amber-400" :
                        "bg-gradient-to-r from-red-500 to-rose-400"
                      }`}
                    />
                  </div>
                </motion.div>

                {/* RGB Sliders */}
                <div className="space-y-4 mb-6">
                  {/* Red Slider */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400 font-semibold">লাল (Red)</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{red}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={red}
                      onChange={(e) => setRed(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                      }}
                    />
                    <style>{`
                      input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #ef4444;
                        cursor: pointer;
                        border: 2px solid rgba(255,255,255,0.3);
                        box-shadow: 0 0 10px rgba(239,68,68,0.5);
                      }
                      input[type=range]::-moz-range-thumb {
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        background: #ef4444;
                        cursor: pointer;
                        border: 2px solid rgba(255,255,255,0.3);
                      }
                    `}</style>
                  </motion.div>

                  {/* Green Slider */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400 font-semibold">সবুজ (Green)</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{green}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={green}
                      onChange={(e) => setGreen(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    />
                  </motion.div>

                  {/* Blue Slider */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-400 font-semibold">নীল (Blue)</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{blue}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={blue}
                      onChange={(e) => setBlue(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                    />
                  </motion.div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {round === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRound}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-green-500/25"
                    >
                      <Clock className="w-5 h-5" />
                      <span>সময় শুরু করো</span>
                    </motion.button>
                  )}

                  {round > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={submitColor}
                      disabled={timeLeft === 0}
                      className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                        timeLeft === 0
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>সাবমিট</span>
                    </motion.button>
                  )}

                  {round > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={useHint}
                      disabled={hintUsed || timeLeft === 0}
                      className={`px-5 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                        hintUsed || timeLeft === 0
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed border-slate-700"
                          : "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      }`}
                    >
                      <Lightbulb className="w-4 h-4" />
                      <span>{hintUsed ? "হিন্ট ব্যবহৃত" : "হিন্ট"}</span>
                    </motion.button>
                  )}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`mt-4 text-center py-3 px-4 rounded-xl glass ${
                        feedback.type === "perfect" ? "border-green-500/30" :
                        feedback.type === "good" ? "border-blue-500/30" :
                        feedback.type === "ok" ? "border-amber-500/30" : "border-red-500/30"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${
                        feedback.type === "perfect" ? "text-green-400" :
                        feedback.type === "good" ? "text-blue-400" :
                        feedback.type === "ok" ? "text-amber-400" : "text-red-400"
                      }`}>
                        {feedback.message}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  তুমি সত্যিকারের Color Mixer!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব টার্গেট রঙ সফলভাবে মিশিয়েছ!
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
                  <p className="text-lg font-bold text-amber-300">RGB Master 🏅</p>
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
