"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, HardDrive, Shield, AlertTriangle, Skull,
  Clock, Zap
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface FileItem {
  id: string;
  name: string;
  emoji: string;
  extension: string;
  category: string;
}

interface Folder {
  id: string;
  name: string;
  icon: string;
  color: string;
  accept: string[];
}

type GameState = "intro" | "playing" | "gameOver" | "victory";
type RandomEvent = "bad-sector" | "virus" | "corrupted" | null;

const folders: Folder[] = [
  { id: "music", name: "Music", icon: "🎵", color: "#38bdf8", accept: [".mp3", ".wav", ".flac"] },
  { id: "videos", name: "Videos", icon: "🎬", color: "#c084fc", accept: [".mp4", ".mkv", ".avi"] },
  { id: "programs", name: "Programs", icon: "💻", color: "#f472b6", accept: [".exe", ".msi"] },
  { id: "documents", name: "Documents", icon: "📄", color: "#34d399", accept: [".pdf", ".docx", ".txt"] },
  { id: "images", name: "Images", icon: "🖼️", color: "#fbbf24", accept: [".jpg", ".png", ".gif"] },
];

const filePool: FileItem[] = [
  { id: "f1", name: "Song.mp3", emoji: "🎵", extension: ".mp3", category: "music" },
  { id: "f2", name: "Movie.mp4", emoji: "🎬", extension: ".mp4", category: "videos" },
  { id: "f3", name: "Setup.exe", emoji: "⚙️", extension: ".exe", category: "programs" },
  { id: "f4", name: "Doc.pdf", emoji: "📄", extension: ".pdf", category: "documents" },
  { id: "f5", name: "Photo.jpg", emoji: "🖼️", extension: ".jpg", category: "images" },
  { id: "f6", name: "Track.wav", emoji: "🎼", extension: ".wav", category: "music" },
  { id: "f7", name: "Clip.mkv", emoji: "🎞️", extension: ".mkv", category: "videos" },
  { id: "f8", name: "App.msi", emoji: "📦", extension: ".msi", category: "programs" },
  { id: "f9", name: "Report.docx", emoji: "📝", extension: ".docx", category: "documents" },
  { id: "f10", name: "Pic.png", emoji: "🌅", extension: ".png", category: "images" },
  { id: "f11", name: "Podcast.mp3", emoji: "🎙️", extension: ".mp3", category: "music" },
  { id: "f12", name: "Tutorial.avi", emoji: "📺", extension: ".avi", category: "videos" },
  { id: "f13", name: "Driver.exe", emoji: "🛠️", extension: ".exe", category: "programs" },
  { id: "f14", name: "Book.txt", emoji: "📖", extension: ".txt", category: "documents" },
  { id: "f15", name: "Selfie.jpg", emoji: "🤳", extension: ".jpg", category: "images" },
  { id: "f16", name: "Guitar.flac", emoji: "🎸", extension: ".flac", category: "music" },
  { id: "f17", name: "Vlog.mp4", emoji: "📹", extension: ".mp4", category: "videos" },
  { id: "f18", name: "Game.exe", emoji: "🎮", extension: ".exe", category: "programs" },
  { id: "f19", name: "Form.pdf", emoji: "📋", extension: ".pdf", category: "documents" },
  { id: "f20", name: "Banner.gif", emoji: "🎨", extension: ".gif", category: "images" },
];

export default function Section6_Game_04() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [combo, setCombo] = useState(0);
  const [timer, setTimer] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [randomEvent, setRandomEvent] = useState<RandomEvent>(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [draggedFile, setDraggedFile] = useState<string | null>(null);
  const [placedFiles, setPlacedFiles] = useState<string[]>([]);
  const totalFiles = 15;
  const intervalRef = useRef<number | null>(null);
  const eventIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    if (timer <= 0 && gameState === "playing") {
      setGameState("victory");
      setBadge(true);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timer, gameState]);

  const startGame = useCallback(() => {
    const shuffled = [...filePool].sort(() => Math.random() - 0.5);
    setFiles(shuffled.slice(0, totalFiles));
    setCurrentFileIndex(0);
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setFeedback(null);
    setCombo(0);
    setTimer(60);
    setShieldActive(false);
    setRandomEvent(null);
    setDraggedFile(null);
    setPlacedFiles([]);

    // Random events every 10 seconds
    const events: RandomEvent[] = ["bad-sector", "virus", "corrupted"];
    eventIntervalRef.current = setInterval(() => {
      const event = events[Math.floor(Math.random() * events.length)];
      setRandomEvent(event);
      setTimeout(() => setRandomEvent(null), 3000);
    }, 10000);

    setTimeout(() => setIsActive(true), 100);
    setGameState("playing");
  }, []);

  useEffect(() => {
    return () => {
      if (eventIntervalRef.current) clearInterval(eventIntervalRef.current);
    };
  }, []);

  const currentFile = files[currentFileIndex];

  const handleFolderDrop = useCallback((folderId: string) => {
    if (!currentFile || gameState !== "playing" || randomEvent) return;

    const correct = folderId === currentFile.category;

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const comboBonus = Math.floor(newCombo / 3);
      const points = 10 + comboBonus * 5;
      setScore((prev) => prev + points);
      setXp((prev) => Math.min(prev + points * 2, 100));
      setPlacedFiles((prev) => [...prev, currentFile.id]);

      if (newCombo % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }
      setFeedback("correct");
    } else {
      setCombo(0);
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentFileIndex >= totalFiles - 1) {
        setBadge(true);
        setGameState("victory");
        setIsActive(false);
      } else {
        setCurrentFileIndex((prev) => prev + 1);
      }
    }, correct ? 500 : 800);
  }, [currentFile, currentFileIndex, combo, gameState, randomEvent]);

  const handleShield = useCallback(() => {
    setShieldActive(true);
    setRandomEvent(null);
    setXp((prev) => Math.min(prev + 10, 100));
    setTimeout(() => setShieldActive(false), 2000);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <SectionWrapper
      id="storage-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Game Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{score}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-purple-400">XP {xp}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className={`text-sm font-bold ${timer < 15 ? "text-red-400" : "text-slate-300"}`}>
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                />
              ))}
            </div>
          </div>

          {/* XP Bar */}
          <div className="mb-4">
            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                animate={{ width: `${xp}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
              />
            </div>
          </div>

          {/* Random Event Banner */}
          <AnimatePresence>
            {randomEvent && (
              <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                className={`mb-4 px-4 py-2 rounded-xl flex items-center justify-between ${
                  randomEvent === "virus"
                    ? "bg-red-500/20 border border-red-500/30"
                    : randomEvent === "bad-sector"
                    ? "bg-orange-500/20 border border-orange-500/30"
                    : "bg-yellow-500/20 border border-yellow-500/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {randomEvent === "virus" ? (
                    <Skull className="w-4 h-4 text-red-400" />
                  ) : randomEvent === "bad-sector" ? (
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-xs text-slate-200">
                    {randomEvent === "virus"
                      ? "⚠️ Virus Attack! Shield ব্যবহার করো!"
                      : randomEvent === "bad-sector"
                      ? "⚠️ Bad Sector! Shield ব্যবহার করো!"
                      : "⚠️ Corrupted File! Shield ব্যবহার করো!"}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShield}
                  disabled={shieldActive}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    shieldActive
                      ? "bg-slate-700 text-slate-400"
                      : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Shield</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

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
                  🗂️
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;Storage Organizer&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  বিভিন্ন ফাইল উপরে থেকে নিচে পড়ছে। প্রতিটি ফাইলকে সঠিক ফোল্ডারে ড্র্যাগ করে ফেলো! সময়ের সাথে সাথে র‍্যান্ডম ইভেন্ট আসবে — Bad Sector, Virus Attack, Corrupted File। Shield ব্যবহার করে ফাইল প্রোটেক্ট করো। ভুল ফোল্ডারে দিলে স্কোর কমবে, সঠিক ফোল্ডারে দিলে XP ও কম্বো বাড়বে।
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-green-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-green-500/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>অর্গানাইজ করা শুরু করি!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING */}
            {gameState === "playing" && currentFile && (
              <motion.div
                key={`playing-${currentFileIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <p className="text-xs text-slate-500 mb-3">
                  ফাইল {currentFileIndex + 1} / {totalFiles}
                </p>

                {/* Falling File */}
                <motion.div
                  key={currentFile.id}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className={`glass rounded-2xl p-5 md:p-6 mb-5 inline-block ${
                    feedback === "correct" ? "border-green-500/50" : feedback === "wrong" ? "border-red-500/50" : ""
                  }`}
                >
                  <motion.span
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl block mb-2"
                  >
                    {currentFile.emoji}
                  </motion.span>
                  <p className="text-base md:text-lg font-bold text-slate-100">
                    {currentFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">কোন ফোল্ডারে রাখবে?</p>
                </motion.div>

                {/* Folder Grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-w-2xl mx-auto mb-3">
                  {folders.map((folder) => (
                    <motion.div
                      key={folder.id}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFolderDrop(folder.id)}
                      className={`glass rounded-xl p-3 cursor-pointer border-2 transition-all ${
                        feedback === "correct" && folder.accept.includes(currentFile.extension)
                          ? "border-green-500 bg-green-500/10"
                          : feedback === "wrong" && folder.accept.includes(currentFile.extension)
                          ? "border-red-500 bg-red-500/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="text-2xl mb-1">{folder.icon}</div>
                      <p className="text-[10px] font-medium text-slate-300">{folder.name}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Placed Files */}
                {placedFiles.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-slate-600">✅ সঠিক স্থানে রাখা: {placedFiles.length}</p>
                  </div>
                )}

                {/* Feedback */}
                <AnimatePresence>
                  {feedback === "correct" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-green-400 font-bold text-xs"
                    >
                      ✅ ঠিক আছে! +{10 + Math.floor(combo / 3) * 5} পয়েন্ট
                    </motion.div>
                  )}
                  {feedback === "wrong" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="text-red-400 font-bold text-xs"
                    >
                      ❌ ভুল ফোল্ডার!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* GAME OVER - Time ran out */}
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
                  ⏰
                </motion.div>
                <h3 className="text-2xl font-bold text-red-400 mb-2">সময় শেষ!</h3>
                <p className="text-slate-300 mb-2">তুমি সব ফাইল সাজাতে পারোনি!</p>
                <div className="glass bg-red-500/10 border-red-500/20 rounded-xl p-4 inline-block mb-6">
                  <p className="text-sm text-slate-400">স্কোর: {score}</p>
                  <p className="text-sm text-slate-400">XP: {xp}%</p>
                  <p className="text-sm text-slate-400">স্টার: {stars}/5</p>
                  <p className="text-sm text-slate-400">ফাইল সাজানো: {placedFiles.length}/{totalFiles}</p>
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
                  তুমি সত্যিকারের Storage Organizer!
                </h3>
                <p className="text-slate-300 mb-4">
                  সব ফাইল সঠিকভাবে সাজিয়েছ!
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
                  <p className="text-lg font-bold text-amber-300">Storage Pro 🏅</p>
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

          {/* Shield Active Effect */}
          <AnimatePresence>
            {shieldActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none z-20"
              >
                <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl" />
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                    }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [1, 0.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      delay: i * 0.08,
                      repeat: Infinity,
                    }}
                  >
                    🛡️
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
