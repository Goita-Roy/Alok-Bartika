"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Keyboard, Zap, Heart, Skull,
  Clock, Shield, Bomb
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface BinaryTarget {
  id: string;
  binary: string;
  character: string;
  x: number;
  speed: number;
}

type GameState = "intro" | "playing" | "gameOver" | "victory";

const BINARY_CHARS: { char: string; binary: string }[] = [
  { char: "A", binary: "01000001" },
  { char: "B", binary: "01000010" },
  { char: "C", binary: "01000011" },
  { char: "D", binary: "01000100" },
  { char: "E", binary: "01000101" },
  { char: "F", binary: "01000110" },
  { char: "G", binary: "01000111" },
  { char: "H", binary: "01001000" },
  { char: "I", binary: "01001001" },
  { char: "J", binary: "01001010" },
  { char: "K", binary: "01001011" },
  { char: "L", binary: "01001100" },
  { char: "M", binary: "01001101" },
  { char: "N", binary: "01001110" },
  { char: "O", binary: "01001111" },
  { char: "P", binary: "01010000" },
  { char: "Q", binary: "01010001" },
  { char: "R", binary: "01010010" },
  { char: "S", binary: "01010011" },
  { char: "T", binary: "01010100" },
  { char: "U", binary: "01010101" },
  { char: "V", binary: "01010110" },
  { char: "W", binary: "01010111" },
  { char: "X", binary: "01011000" },
  { char: "Y", binary: "01011001" },
  { char: "Z", binary: "01011010" },
];

const MAX_HEALTH = 5;
const BASE_TARGETS = 3;
const TOTAL_ROUNDS = 20;

export default function Section6_Game_05() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [targets, setTargets] = useState<BinaryTarget[]>([]);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [explosion, setExplosion] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState("");
  const intervalRef = useRef<number | null>(null);
  const targetIdRef = useRef(0);

  const getTargetCount = useCallback(() => {
    return Math.min(BASE_TARGETS + level - 1, 8);
  }, [level]);

  const getSpawnInterval = useCallback(() => {
    return Math.max(1500 - level * 100, 600);
  }, [level]);

  const spawnTarget = useCallback(() => {
    const available = [...BINARY_CHARS].filter(
      (bc) => !targets.some((t) => t.character === bc.char)
    );
    if (available.length === 0) return;

    const idx = Math.floor(Math.random() * available.length);
    const charData = available[idx];
    const newTarget: BinaryTarget = {
      id: `t-${targetIdRef.current++}`,
      binary: charData.binary,
      character: charData.char,
      x: Math.random() * 80 + 5,
      speed: Math.max(0.5, 2 - level * 0.1),
    };
    setTargets((prev) => [...prev, newTarget]);
  }, [targets, level]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnInterval = getSpawnInterval();
    intervalRef.current = setInterval(() => {
      if (targets.length < getTargetCount()) {
        spawnTarget();
      }
    }, spawnInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState, targets.length, spawnTarget, getTargetCount, getSpawnInterval]);

  const startGame = useCallback(() => {
    setTargets([]);
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setHealth(MAX_HEALTH);
    setCombo(0);
    setLevel(1);
    setRound(0);
    setFeedback(null);
    setExplosion(null);
    setLastKey("");
    targetIdRef.current = 0;
    setGameState("playing");
    // Initial spawn
    setTimeout(() => {
      for (let i = 0; i < BASE_TARGETS; i++) {
        spawnTarget();
      }
    }, 300);
  }, [spawnTarget]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== "playing") return;
    const key = e.key.toUpperCase();
    if (key.length !== 1 || !/[A-Z]/.test(key)) return;

    setLastKey(key);

    const matchIdx = targets.findIndex((t) => t.character === key);
    if (matchIdx >= 0) {
      const matched = targets[matchIdx];
      setExplosion(matched.id);
      setTargets((prev) => prev.filter((t) => t.id !== matched.id));

      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboBonus = Math.floor(newCombo / 3);
      const points = 10 + comboBonus * 5 + level * 2;
      setScore((prev) => prev + points);
      setXp((prev) => Math.min(prev + points, 100));

      if (newCombo % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }

      setFeedback("correct");

      const newRound = round + 1;
      setRound(newRound);

      if (newRound % 5 === 0 && level < 10) {
        setLevel((prev) => prev + 1);
      }

      setTimeout(() => {
        setExplosion(null);
        setFeedback(null);
      }, 500);

      // Win condition
      if (newRound >= TOTAL_ROUNDS) {
        setBadge(true);
        setTimeout(() => setGameState("victory"), 600);
      }
    } else {
      setCombo(0);
      const dmg = health - 1;
      setHealth(dmg);
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 600);

      if (dmg <= 0) {
        setTimeout(() => setGameState("gameOver"), 800);
      }
    }
  }, [gameState, targets, combo, health, level, round]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <SectionWrapper
      id="input-game"
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
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-400">Lv.{level}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-400">{round}/{TOTAL_ROUNDS}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: MAX_HEALTH }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-3.5 h-3.5 ${i < health ? "text-red-400 fill-red-400" : "text-slate-700"}`}
                    />
                  ))}
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
                🔥 {combo} কম্বো! +{10 + Math.floor(combo / 3) * 5 + level * 2} পয়েন্ট
              </span>
            </motion.div>
          )}

          {/* Last key display */}
          {lastKey && gameState === "playing" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center mb-2"
            >
              <span className="text-xs text-slate-500">শেষ কী: </span>
              <span className="text-sm font-bold text-cyan-300">{lastKey}</span>
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
                  &quot;Code Breaker Input&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  বাইনারি কোড স্ক্রিনে দেখা যাচ্ছে। দ্রুত শনাক্ত করে কিবোর্ডে সঠিক অক্ষর টাইপ করো! সঠিক উত্তর বাইনারি কোড ধ্বংস করবে, ভুল উত্তর হেল্থ কমাবে। প্রতিটি লেভেলে difficulty বাড়বে। টাইপিং স্পিড স্কোর বাড়াবে!
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">উদাহরণ:</p>
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-cyan-400">01000001 = A</p>
                    <p className="text-sm font-mono text-purple-400">01000010 = B</p>
                    <p className="text-sm font-mono text-pink-400">01000011 = C</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>কোড ব্রেকার শুরু করি!</span>
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
                className="relative"
              >
                {/* Game Canvas */}
                <div className="relative w-full h-64 md:h-72 glass rounded-2xl overflow-hidden mb-4">
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.3) 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }} />
                  </div>

                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">
                    ⬇️ বাইনারি কোড নিচে আসছে — কিবোর্ডে অক্ষর টাইপ করো!
                  </div>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1">
                    <Keyboard className="w-3 h-3 inline text-slate-400 mr-1" />
                    <span className="text-[10px] text-slate-500">টাইপ করো...</span>
                  </div>

                  <AnimatePresence>
                    {targets.map((target) => (
                      <motion.div
                        key={target.id}
                        initial={{ y: -30, opacity: 0, x: `${target.x}%` }}
                        animate={{ y: "100%", opacity: [1, 1, 0.8] }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 5 + target.speed, ease: "linear" }}
                        className="absolute top-0"
                        style={{ left: `${target.x}%` }}
                        onAnimationComplete={() => {
                          setTargets((prev) => prev.filter((t) => t.id !== target.id));
                          setCombo(0);
                          const dmg = health - 1;
                          setHealth(dmg);
                          if (dmg <= 0) {
                            setTimeout(() => setGameState("gameOver"), 500);
                          }
                        }}
                      >
                        <div className="glass rounded-xl px-3 py-2 text-center border border-white/10">
                          <p className="text-[10px] md:text-xs font-mono font-bold tracking-wide text-cyan-300">
                            {target.binary}
                          </p>
                          <p className="text-[8px] text-slate-500 mt-0.5">
                            = ?
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Explosion effect */}
                  <AnimatePresence>
                    {explosion && (
                      <motion.div
                        key={explosion}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none"
                      >
                        💥
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback === "correct" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-center text-green-400 font-bold text-sm mb-2"
                    >
                      ✅ সঠিক! +{10 + Math.floor(combo / 3) * 5 + level * 2} পয়েন্ট
                    </motion.div>
                  )}
                  {feedback === "wrong" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-center text-red-400 font-bold text-sm mb-2"
                    >
                      ❌ ভুল! হেল্থ কমেছে!
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Level up notification */}
                {level > 1 && round % 5 === 0 && round > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-center mb-2"
                  >
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
                      ⬆️ লেভেল {level}! Difficulty বাড়ল!
                    </span>
                  </motion.div>
                )}
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
                  💀
                </motion.div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">হেল্থ শেষ!</h3>
                <p className="text-slate-300 mb-2">তুমি সব বাইনারি কোড শনাক্ত করতে পারোনি!</p>
                <div className="glass bg-red-500/10 border-red-500/20 rounded-xl p-4 inline-block mb-6">
                  <p className="text-sm text-slate-400">স্কোর: {score}</p>
                  <p className="text-sm text-slate-400">লেভেল: {level}</p>
                  <p className="text-sm text-slate-400">স্টার: {stars}/5</p>
                  <p className="text-sm text-slate-400">ডিকোড করা: {round}/{TOTAL_ROUNDS}</p>
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
                  তুমি সত্যিকারের Code Breaker!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব বাইনারি কোড সফলভাবে ডিকোড করেছ!
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
                  <p className="text-lg font-bold text-amber-300">Code Breaker 🏅</p>
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
