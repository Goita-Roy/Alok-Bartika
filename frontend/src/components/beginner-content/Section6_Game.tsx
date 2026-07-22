"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Star, Trophy, Clock, RefreshCw,
  ChevronRight, Award, Sparkles
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface Level {
  id: number;
  year: string;
  title: string;
  scene: string;
  parts: Part[];
  score: number;
}

interface Part {
  id: string;
  name: string;
  emoji: string;
  correctSlot: string;
  description: string;
}

interface Slot {
  id: string;
  name: string;
  emoji: string;
  occupied: boolean;
}

const levels: Level[] = [
  {
    id: 1,
    year: "১৯৪০",
    title: "ভ্যাকুয়াম টিউব যুগ",
    scene: "🕰️",
    score: 100,
    parts: [
      { id: "tube1", name: "ভ্যাকুয়াম টিউব", emoji: "💡", correctSlot: "slot1", description: "সুইচ অন/অফ কন্ট্রোল" },
      { id: "tube2", name: "সার্কিট বোর্ড", emoji: "🔌", correctSlot: "slot2", description: "সংযোগ স্থাপন" },
      { id: "tube3", name: "পাওয়ার সাপ্লাই", emoji: "⚡", correctSlot: "slot3", description: "বিদ্যুৎ সরবরাহ" },
    ],
  },
  {
    id: 2,
    year: "১৯৭০",
    title: "মাইক্রোপ্রসেসর বিপ্লব",
    scene: "🔬",
    score: 150,
    parts: [
      { id: "mp1", name: "মাইক্রোপ্রসেসর", emoji: "🧠", correctSlot: "slot4", description: "প্রক্রিয়াকরণ ইউনিট" },
      { id: "mp2", name: "মেমোরি চিপ", emoji: "💾", correctSlot: "slot5", description: "ডেটা সংরক্ষণ" },
      { id: "mp3", name: "ক্লক জেনারেটর", emoji: "⏱️", correctSlot: "slot6", description: "সময় নিয়ন্ত্রণ" },
    ],
  },
  {
    id: 3,
    year: "২০২৪",
    title: "আধুনিক যুগ",
    scene: "🚀",
    score: 200,
    parts: [
      { id: "mod1", name: "কোয়ান্টাম প্রসেসর", emoji: "🔮", correctSlot: "slot7", description: "অত্যাধুনিক প্রক্রিয়াকরণ" },
      { id: "mod2", name: "এআই চিপ", emoji: "🤖", correctSlot: "slot8", description: "কৃত্রিম বুদ্ধিমত্তা" },
      { id: "mod3", name: "নিউরাল নেটওয়ার্ক", emoji: "🌐", correctSlot: "slot9", description: "জালিকাবদ্ধ সংযোগ" },
    ],
  },
];

const slotPositions: Record<string, Slot> = {
  slot1: { id: "slot1", name: "ভ্যাকুয়াম টিউব স্লট", emoji: "🕳️", occupied: false },
  slot2: { id: "slot2", name: "সার্কিট স্লট", emoji: "🕳️", occupied: false },
  slot3: { id: "slot3", name: "পাওয়ার স্লট", emoji: "🕳️", occupied: false },
  slot4: { id: "slot4", name: "প্রসেসর স্লট", emoji: "🕳️", occupied: false },
  slot5: { id: "slot5", name: "মেমোরি স্লট", emoji: "🕳️", occupied: false },
  slot6: { id: "slot6", name: "ক্লক স্লট", emoji: "🕳️", occupied: false },
  slot7: { id: "slot7", name: "কোয়ান্টাম স্লট", emoji: "🕳️", occupied: false },
  slot8: { id: "slot8", name: "এআই স্লট", emoji: "🕳️", occupied: false },
  slot9: { id: "slot9", name: "নিউরাল স্লট", emoji: "🕳️", occupied: false },
};

type GameState = "intro" | "playing" | "levelComplete" | "gameComplete";

export default function Section6_Game() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [draggedPart, setDraggedPart] = useState<string | null>(null);
  const [placedParts, setPlacedParts] = useState<string[]>([]);
  const [slotStates, setSlotStates] = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const level = levels[currentLevel];
  const slots = Object.values(slotPositions).slice(currentLevel * 3, currentLevel * 3 + 3);

  const startGame = useCallback(() => {
    setGameState("playing");
    setCurrentLevel(0);
    setScore(0);
    setBadges([]);
    setPlacedParts([]);
    setSlotStates({});
    setMistakes(0);
  }, []);

  const handleDragStart = useCallback((partId: string) => {
    setDraggedPart(partId);
  }, []);

  const handleDrop = useCallback((slotId: string) => {
    if (!draggedPart) return;

    const part = level.parts.find((p) => p.id === draggedPart);
    if (!part) return;

    if (part.correctSlot === slotId && !slotStates[slotId]) {
      setPlacedParts((prev) => [...prev, draggedPart]);
      setSlotStates((prev) => ({ ...prev, [slotId]: true }));
      setScore((prev) => prev + level.score / level.parts.length);

      if (placedParts.length + 1 === level.parts.length) {
        // Level complete
        setTimeout(() => {
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
            if (currentLevel < levels.length - 1) {
              setGameState("levelComplete");
            } else {
              const newBadges = [...badges, "History Maestro"];
              setBadges(newBadges);
              setGameState("gameComplete");
            }
          }, 1500);
        }, 500);
      }
    } else {
      setMistakes((prev) => prev + 1);
    }

    setDraggedPart(null);
  }, [draggedPart, level, slotStates, placedParts, currentLevel, badges]);

  const nextLevel = useCallback(() => {
    setCurrentLevel((prev) => prev + 1);
    setPlacedParts([]);
    setSlotStates({});
    setGameState("playing");
  }, []);

  return (
    <SectionWrapper
      id="game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-bold text-amber-400">{score}</span>
            </div>
            <div className="flex gap-1">
              {badges.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300"
                >
                  🏅 {badge}
                </motion.div>
              ))}
            </div>
          </div>

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
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  🚀
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;Time Traveler Explorer&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                  ইউজারকে একটি ভার্চুয়াল টাইম মেশিনে বসিয়ে দেওয়া হবে। তাকে ১৯৪০ সালের ল্যাবরেটরিতে গিয়ে ভ্যাকুয়াম টিউব পাল্টাতে হবে, কিংবা ১৯৭০ সালে গিয়ে মাইক্রোপ্রসেসর আর্কিটেকচার ঠিক করতে হবে। প্রতিটি সঠিক যুগে সঠিক পার্টস বসাতে পারলে পয়েন্ট মিলবে এবং &quot;History Maestro&quot; ব্যাজ আনলক হবে।
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-emerald-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>যাত্রা শুরু!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING */}
            {gameState === "playing" && (
              <motion.div
                key={`playing-${currentLevel}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* Level Info */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-mono text-cyan-400">{level.year}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-100">{level.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{level.scene} টাইম মেশিনে আগমন!</p>
                </div>

                {/* Drag Area */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Parts (draggable) */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-3">📦 পার্টস নির্বাচন করো:</p>
                    {level.parts.map((part) => (
                      <motion.div
                        key={part.id}
                        draggable
                        onDragStart={() => handleDragStart(part.id)}
                        className={`glass rounded-xl p-3 cursor-grab active:cursor-grabbing border transition-all ${
                          placedParts.includes(part.id)
                            ? "opacity-30 border-green-500/30"
                            : draggedPart === part.id
                            ? "border-purple-400 scale-105"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        whileHover={!placedParts.includes(part.id) ? { scale: 1.02 } : {}}
                        whileTap={!placedParts.includes(part.id) ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{part.emoji}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{part.name}</p>
                            <p className="text-xs text-slate-500">{part.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Slots (drop targets) */}
                  <div className="space-y-3">
                    <p className="text-sm text-slate-400 mb-3">🎯 সঠিক জায়গায় রাখো:</p>
                    {slots.map((slot) => {
                      const isOccupied = slotStates[slot.id];
                      const placedPart = level.parts.find((p) => p.correctSlot === slot.id);

                      return (
                        <motion.div
                          key={slot.id}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(slot.id)}
                          className={`glass rounded-xl p-3 border-2 border-dashed text-center transition-all min-h-[60px] flex items-center justify-center ${
                            isOccupied
                              ? "border-green-500/50 bg-green-500/10"
                              : draggedPart
                              ? "border-purple-400/50 bg-purple-500/5"
                              : "border-white/10"
                          }`}
                          whileHover={!isOccupied ? { scale: 1.02 } : {}}
                        >
                          {isOccupied && placedPart ? (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{placedPart.emoji}</span>
                              <span className="text-sm text-green-300">{placedPart.name} ✅</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-600">{slot.emoji} {slot.name}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>অগ্রগতি</span>
                    <span>{placedParts.length} / {level.parts.length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      animate={{ width: `${(placedParts.length / level.parts.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>

                {/* Mistakes indicator */}
                {mistakes > 0 && (
                  <p className="text-xs text-red-400 mt-2 text-center">
                    ভুল尝试: {mistakes} বার
                  </p>
                )}
              </motion.div>
            )}

            {/* LEVEL COMPLETE */}
            {gameState === "levelComplete" && (
              <motion.div
                key="levelComplete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold text-emerald-400 mb-2">লেভেল ক্লিয়ার!</h3>
                <p className="text-slate-300 mb-6">
                  তুমি {level.year} সালের চ্যালেঞ্জ সফলভাবে পার করেছ!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextLevel}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <ChevronRight className="w-5 h-5" />
                  <span>পরবর্তী যুগে যাও</span>
                </motion.button>
              </motion.div>
            )}

            {/* GAME COMPLETE */}
            {gameState === "gameComplete" && (
              <motion.div
                key="gameComplete"
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
                  মহা অভিযান সফল!
                </h3>
                <p className="text-slate-300 mb-4">
                  তুমি ইতিহাসের তিনটি যুগ সফলভাবে অতিক্রম করেছ!
                </p>

                {/* Score */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-amber-400 mb-4"
                >
                  {score} পয়েন্ট
                </motion.div>

                {/* Badge Unlocked */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="glass bg-amber-500/10 border-amber-500/30 rounded-xl p-6 inline-block mb-6"
                >
                  <Award className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                  <p className="text-lg font-bold text-amber-300">History Maestro 🏅</p>
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

          {/* Celebration Overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${20 + Math.random() * 60}%`,
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
