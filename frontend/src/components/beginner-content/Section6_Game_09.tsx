"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Clock, Zap, Monitor, Heart,
  Map, Navigation, Wifi, WifiOff, Shield
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "victory" | "gameover";

interface MazeCell {
  type: "empty" | "wall" | "router" | "switch" | "traffic" | "boost" | "signal" | "finish";
  icon: string;
  label: string;
}

interface Position {
  row: number;
  col: number;
}

const MAZE_HEIGHT = 9;
const MAZE_WIDTH = 9;

function generateMaze(): MazeCell[][] {
  const maze: MazeCell[][] = [];

  const defaultCell = (): MazeCell => ({ type: "empty", icon: "", label: "" });

  for (let r = 0; r < MAZE_HEIGHT; r++) {
    maze.push([]);
    for (let c = 0; c < MAZE_WIDTH; c++) {
      maze[r].push(defaultCell());
    }
  }

  // Walls
  const wallPositions = [
    [1, 2], [1, 3], [1, 5], [1, 6],
    [2, 1], [2, 4], [2, 7],
    [3, 3], [3, 5], [3, 7],
    [4, 1], [4, 6],
    [5, 2], [5, 4], [5, 7],
    [6, 1], [6, 3], [6, 5], [6, 6],
    [7, 4], [7, 7],
  ];
  for (const [r, c] of wallPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "wall", icon: "🧱", label: "Wall" };
    }
  }

  // Routers
  const routerPositions = [[1, 1], [3, 8], [5, 3], [7, 6]];
  for (const [r, c] of routerPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "router", icon: "📡", label: "Router" };
    }
  }

  // Switches
  const switchPositions = [[2, 5], [4, 3], [6, 7]];
  for (const [r, c] of switchPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "switch", icon: "🔀", label: "Switch" };
    }
  }

  // Traffic
  const trafficPositions = [[2, 2], [4, 5], [6, 4]];
  for (const [r, c] of trafficPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "traffic", icon: "🚦", label: "Traffic" };
    }
  }

  // Boosts
  const boostPositions = [[0, 4], [3, 1], [7, 2]];
  for (const [r, c] of boostPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "boost", icon: "⚡", label: "Speed Boost" };
    }
  }

  // Signal
  const signalPositions = [[5, 5], [1, 7]];
  for (const [r, c] of signalPositions) {
    if (r < MAZE_HEIGHT && c < MAZE_WIDTH) {
      maze[r][c] = { type: "signal", icon: "📶", label: "Signal Booster" };
    }
  }

  // Finish at bottom-right
  maze[MAZE_HEIGHT - 1][MAZE_WIDTH - 1] = { type: "finish", icon: "🎯", label: "Destination" };

  return maze;
}

function isWall(maze: MazeCell[][], row: number, col: number): boolean {
  if (row < 0 || row >= MAZE_HEIGHT || col < 0 || col >= MAZE_WIDTH) return true;
  return maze[row][col].type === "wall";
}

export default function Section6_Game_09() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [maze, setMaze] = useState<MazeCell[][]>(generateMaze);
  const [playerPos, setPlayerPos] = useState<Position>({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [health, setHealth] = useState(3);
  const [feedback, setFeedback] = useState<{ message: string; type: string } | null>(null);
  const [latencyMeter, setLatencyMeter] = useState(0);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const latencyIntervalRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    setPlayerPos({ row: 0, col: 0 });
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setCombo(0);
    setTimeLeft(45);
    setHealth(3);
    setFeedback(null);
    setLatencyMeter(0);
    setCollectedItems([]);
    setGameState("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setGameState("gameover");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    latencyIntervalRef.current = setInterval(() => {
      setLatencyMeter((prev) => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 20)));
    }, 2000);
  }, []);

  const movePlayer = useCallback((dRow: number, dCol: number) => {
    if (gameState !== "playing") return;
    const newRow = playerPos.row + dRow;
    const newCol = playerPos.col + dCol;

    if (isWall(maze, newRow, newCol)) {
      setFeedback({ message: "🧱 দেয়াল! অন্য পথে যাও!", type: "wall" });
      setTimeout(() => setFeedback(null), 800);
      return;
    }

    setPlayerPos({ row: newRow, col: newCol });
    const cell = maze[newRow][newCol];
    let pointsEarned = 5;
    let feedbackMsg = "";

    if (cell.type === "router") {
      pointsEarned = 15;
      setCombo((prev) => prev + 1);
      feedbackMsg = "📡 Router পেয়েছ! +15 পয়েন্ট!";
      setScore((prev) => prev + 15);
      setXp((prev) => Math.min(prev + 10, 100));
      if (combo >= 2 && (combo + 1) % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }
    } else if (cell.type === "switch") {
      pointsEarned = 10;
      feedbackMsg = "🔀 Switch পেয়েছ! +10 পয়েন্ট!";
      setScore((prev) => prev + 10);
      setXp((prev) => Math.min(prev + 8, 100));
    } else if (cell.type === "traffic") {
      setHealth((prev) => Math.max(0, prev - 1));
      setCombo(0);
      feedbackMsg = "🚦 Network Traffic! -1 HP!";
      setScore((prev) => Math.max(0, prev - 5));
      if (health <= 1) {
        setTimeout(() => setGameState("gameover"), 500);
      }
    } else if (cell.type === "boost") {
      setTimeLeft((prev) => Math.min(prev + 5, 60));
      if (!collectedItems.includes("boost")) {
        setCollectedItems((prev) => [...prev, "boost"]);
      }
      feedbackMsg = "⚡ Speed Boost! +5 সেকেন্ড!";
      setScore((prev) => prev + 8);
    } else if (cell.type === "signal") {
      setTimeLeft((prev) => Math.min(prev + 3, 60));
      if (!collectedItems.includes("signal")) {
        setCollectedItems((prev) => [...prev, "signal"]);
      }
      feedbackMsg = "📶 Signal Booster! +3 সেকেন্ড!";
      setScore((prev) => prev + 10);
    } else if (cell.type === "finish") {
      setBadge(true);
      const timeBonus = timeLeft * 2;
      setScore((prev) => prev + 50 + timeBonus);
      setXp(100);
      setStars((prev) => Math.min(prev + 3, 5));
      if (timerRef.current) clearInterval(timerRef.current);
      if (latencyIntervalRef.current) clearInterval(latencyIntervalRef.current);
      setTimeout(() => setGameState("victory"), 300);
      feedbackMsg = `🎯 Destination! +${50 + timeBonus} পয়েন্ট!`;
    } else {
      setScore((prev) => prev + 2);
      setXp((prev) => Math.min(prev + 1, 100));
    }

    if (feedbackMsg) {
      setFeedback({ message: feedbackMsg, type: "success" });
      setTimeout(() => setFeedback(null), 1000);
    }
  }, [gameState, playerPos, maze, combo, health, timeLeft, collectedItems]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp": case "w": case "W": e.preventDefault(); movePlayer(-1, 0); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); movePlayer(1, 0); break;
        case "ArrowLeft": case "a": case "A": e.preventDefault(); movePlayer(0, -1); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); movePlayer(0, 1); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (latencyIntervalRef.current) clearInterval(latencyIntervalRef.current);
    };
  }, []);

  const isPlayer = (r: number, c: number) => playerPos.row === r && playerPos.col === c;

  const getCellStyle = (cell: MazeCell) => {
    if (cell.type === "wall") return "bg-slate-800/80";
    if (cell.type === "router") return "bg-blue-500/20 border-blue-500/40";
    if (cell.type === "switch") return "bg-purple-500/20 border-purple-500/40";
    if (cell.type === "traffic") return "bg-red-500/20 border-red-500/40";
    if (cell.type === "boost") return "bg-amber-500/20 border-amber-500/40";
    if (cell.type === "signal") return "bg-cyan-500/20 border-cyan-500/40";
    if (cell.type === "finish") return "bg-green-500/20 border-green-500/40 animate-pulse";
    return "bg-slate-800/30";
  };

  return (
    <SectionWrapper
      id="internet-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Score and Stats Bar */}
          {gameState === "playing" && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-bold text-red-400">{health}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-cyan-400">{timeLeft}s</span>
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
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-slate-500">XP</span>
                <span className="text-[10px] text-slate-500">{xp}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  animate={{ width: `${xp}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Latency meter */}
          {gameState === "playing" && (
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-3 h-3 text-slate-500" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  animate={{ width: `${latencyMeter}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: latencyMeter > 70 ? "#ef4444" : latencyMeter > 40 ? "#fbbf24" : "#34d399" }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{Math.round(latencyMeter)}ms</span>
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
                🔥 {combo} কম্বো! +{Math.floor(combo / 3) * 5} বোনাস
              </span>
            </motion.div>
          )}

          {/* Mini-map / legend */}
          {gameState === "playing" && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center text-[9px] text-slate-500">
              <span>📡 Router</span>
              <span>🔀 Switch</span>
              <span>🚦 Traffic</span>
              <span>⚡ Boost</span>
              <span>📶 Signal</span>
              <span>🎯 Destination</span>
            </div>
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
                  📦
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;Packet Delivery Boy&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  তুমি এখন একটি <span className="text-cyan-300 font-semibold">Data Packet</span>! সঠিক IP ঠিকানায় পৌঁছাতে হবে। Router, Switch পেরিয়ে Network Traffic এড়িয়ে <span className="text-green-300 font-semibold">Destination</span>-এ যাও!
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">কীভাবে খেলবে:</p>
                  <div className="space-y-1 text-xs text-left">
                    <p className="text-slate-400">⬆️⬇️⬅️➡️ Arrow Keys বা WASD দিয়ে মুভ করো</p>
                    <p className="text-slate-400">📡 Router → +১৫ পয়েন্ট, কম্বো</p>
                    <p className="text-slate-400">🚦 Traffic → -১ HP এবং পয়েন্ট কাটা</p>
                    <p className="text-slate-400">⚡ Speed Boost → +৫ সেকেন্ড</p>
                    <p className="text-slate-400">🎯 Destination → গেম জয়!</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Packet পাঠাও!</span>
                </motion.button>
              </motion.div>
            )}

            {/* PLAYING STATE */}
            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Maze Grid */}
                <div className="flex justify-center mb-4">
                  <div
                    className="grid gap-0.5 md:gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${MAZE_WIDTH}, minmax(0, 1fr))`,
                      width: "100%",
                      maxWidth: "360px",
                    }}
                  >
                    {maze.map((row, r) =>
                      row.map((cell, c) => (
                        <motion.div
                          key={`${r}-${c}`}
                          animate={isPlayer(r, c) ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.3, repeat: isPlayer(r, c) ? Infinity : 0, repeatDelay: 1 }}
                          onClick={() => {
                            const dRow = r - playerPos.row;
                            const dCol = c - playerPos.col;
                            if (Math.abs(dRow) + Math.abs(dCol) === 1) {
                              movePlayer(dRow, dCol);
                            }
                          }}
                          className={`
                            aspect-square rounded-md flex items-center justify-center text-xs md:text-sm
                            border border-white/5 cursor-pointer transition-all select-none
                            ${getCellStyle(cell)}
                            ${isPlayer(r, c) ? "ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/30 z-10 scale-110" : ""}
                          `}
                        >
                          {isPlayer(r, c) ? (
                            <motion.span
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            >
                              📦
                            </motion.span>
                          ) : (
                            <span>{cell.icon}</span>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Touch controls */}
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-4 md:hidden">
                  <div />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => movePlayer(-1, 0)}
                    className="glass rounded-xl p-3 text-lg flex items-center justify-center border border-white/10"
                  >
                    ⬆️
                  </motion.button>
                  <div />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => movePlayer(0, -1)}
                    className="glass rounded-xl p-3 text-lg flex items-center justify-center border border-white/10"
                  >
                    ⬅️
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => movePlayer(1, 0)}
                    className="glass rounded-xl p-3 text-lg flex items-center justify-center border border-white/10"
                  >
                    ⬇️
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onPointerDown={() => movePlayer(0, 1)}
                    className="glass rounded-xl p-3 text-lg flex items-center justify-center border border-white/10"
                  >
                    ➡️
                  </motion.button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`text-center py-2 px-4 rounded-xl glass mb-2 ${
                        feedback.type === "wall" ? "border-red-500/30" : "border-green-500/30"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${
                        feedback.type === "wall" ? "text-red-400" : "text-green-400"
                      }`}>
                        {feedback.message}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Collected items */}
                {collectedItems.length > 0 && (
                  <div className="flex justify-center gap-2 mt-2">
                    {collectedItems.includes("boost") && <span className="text-sm">⚡</span>}
                    {collectedItems.includes("signal") && <span className="text-sm">📶</span>}
                  </div>
                )}
              </motion.div>
            )}

            {/* GAME OVER STATE */}
            {gameState === "gameover" && (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl mb-4"
                >
                  💥
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-red-400 mb-2">
                  Packet Lost!
                </h3>
                <p className="text-slate-300 mb-2">
                  {health <= 0 ? "Network Traffic এ ডেটা প্যাকেট হারিয়ে গেছে!" : "সময় শেষ! প্যাকেট টাইমআউট!"}
                </p>
                <p className="text-sm text-slate-500 mb-4">তোমার স্কোর: {score} পয়েন্ট</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>আবার চেষ্টা করো</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGameState("intro")}
                    className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
                  >
                    <Monitor className="w-5 h-5" />
                    <span>শুরুতে ফিরে যাও</span>
                  </motion.button>
                </div>
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
                  Packet সফলভাবে পৌঁছেছে!
                </h3>
                <p className="text-slate-300 mb-4">
                  সঠিক IP ঠিকানায় পৌঁছাতে পেরেছ! কোনো ডেটা লস হয়নি!
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
                  <p className="text-lg font-bold text-amber-300">Packet Delivery Expert 🏅</p>
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
        </div>
      </div>
    </SectionWrapper>
  );
}
