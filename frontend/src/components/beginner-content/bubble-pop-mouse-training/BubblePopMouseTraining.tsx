import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gamepad2, RefreshCw, ArrowRight, Star } from "lucide-react";
import SectionWrapper from "../SectionWrapper";

type GameState = "intro" | "playing" | "gameOver";

interface PopBubble {
  id: number;
  x: number;
  size: number;
  colorIdx: number;
  fallDuration: number;
  wobbleOffset: number;
  wobbleSpeed: number;
}

interface SplashParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

const BUBBLE_COLORS = [
  { from: "#f472b6", to: "#ec4899" },
  { from: "#a78bfa", to: "#8b5cf6" },
  { from: "#38bdf8", to: "#0ea5e9" },
  { from: "#34d399", to: "#10b981" },
  { from: "#fbbf24", to: "#f59e0b" },
  { from: "#fb923c", to: "#f97316" },
  { from: "#e879f9", to: "#d946ef" },
  { from: "#2dd4bf", to: "#14b8a6" },
  { from: "#f87171", to: "#ef4444" },
  { from: "#60a5fa", to: "#3b82f6" },
];

const SPLASH_COLORS = ["#f472b6", "#a78bfa", "#38bdf8", "#34d399", "#fbbf24", "#fb923c", "#e879f9", "#f87171"];
const GAME_DURATION = 60;
const SPAWN_INTERVAL = 800;
const MAX_BUBBLES = 12;
const CONFETTI_EVERY = 10;

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function playPopSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
  }
}

function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.18);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.18);
    });
  } catch {
  }
}

function playGameOverSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  } catch {
  }
}

function triggerConfetti(container: HTMLElement) {
  const colors = ["#f472b6", "#c084fc", "#38bdf8", "#34d399", "#fbbf24", "#fb923c", "#a78bfa", "#f87171"];
  for (let i = 0; i < 35; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${random(0, 100)}%`;
    el.style.background = colors[Math.floor(random(0, colors.length))];
    el.style.width = `${random(3, 10)}px`;
    el.style.height = `${random(3, 10)}px`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animation = `confetti-fall ${random(1.2, 2.8)}s ease-in forwards`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

interface BubbleItemProps {
  bubble: PopBubble;
  containerHeight: number;
  disabled: boolean;
  onClick: (bubble: PopBubble, e: React.MouseEvent) => void;
}

function BubbleItem({ bubble: b, containerHeight, disabled, onClick }: BubbleItemProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const color = BUBBLE_COLORS[b.colorIdx % BUBBLE_COLORS.length];
  const size = 56 * b.size;

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClick(b, { stopPropagation: () => {} } as React.MouseEvent);
    }, (b.fallDuration + 0.3) * 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <motion.button
      initial={{ y: -size - 20, opacity: 0, scale: 0.3 }}
      animate={{
        y: containerHeight + 50,
        opacity: 1,
        scale: 1,
        x: [0, b.wobbleOffset * 0.5, -b.wobbleOffset * 0.3, b.wobbleOffset * 0.2, 0],
      }}
      exit={{ scale: [1, 1.4, 0], opacity: [1, 0.8, 0], y: [null, null, "-10%"] }}
      transition={{
        y: { duration: b.fallDuration, ease: "linear" },
        opacity: { duration: 0.3 },
        scale: { duration: 0.25 },
        x: {
          duration: b.wobbleSpeed,
          repeat: Infinity,
          ease: "easeInOut",
        },
        exit: { duration: 0.3, ease: "easeOut" },
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (timerRef.current) clearTimeout(timerRef.current);
        onClick(b, e);
      }}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className="absolute focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-full cursor-pointer select-none"
      style={{ left: `${b.x}%` }}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4), transparent 60%), linear-gradient(135deg, ${color.from}, ${color.to})`,
            boxShadow: `0 4px 20px ${color.from}44, inset 0 -2px 6px rgba(0,0,0,0.1)`,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.25,
            height: size * 0.15,
            top: size * 0.15,
            left: size * 0.2,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.6), transparent)",
            transform: "rotate(-30deg)",
          }}
        />
      </div>
    </motion.button>
  );
}

export default function BubblePopMouseTraining() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bubbleCount, setBubbleCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [bubbles, setBubbles] = useState<PopBubble[]>([]);
  const [splash, setSplash] = useState<SplashParticle[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const activeRef = useRef(true);
  const bubbleIdRef = useRef(0);
  const splashIdRef = useRef(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const addSplash = useCallback((x: number, y: number) => {
    const particles: SplashParticle[] = [];
    const count = 10 + Math.floor(random(0, 6));
    for (let i = 0; i < count; i++) {
      particles.push({
        id: splashIdRef.current++,
        x,
        y,
        color: SPLASH_COLORS[Math.floor(random(0, SPLASH_COLORS.length))],
        angle: random(0, 360),
        distance: random(30, 80),
        size: random(3, 8),
      });
    }
    setSplash((prev) => [...prev, ...particles]);
    setTimeout(() => setSplash([]), 600);
  }, []);

  const handleBubbleEvent = useCallback(
    (b: PopBubble, e: React.MouseEvent) => {
      if (!activeRef.current) return;
      e.stopPropagation?.();
      setBubbles((prev) => prev.filter((bb) => bb.id !== b.id));
      setBubbleCount((prev) => {
        const next = prev + 1;
        if (next % CONFETTI_EVERY === 0 && containerRef.current) {
          triggerConfetti(containerRef.current);
          playCelebrationSound();
        }
        return next;
      });
      setXp((prev) => prev + 5);
      setTotalClicks((prev) => prev + 1);
      playPopSound();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        addSplash(
          ("clientX" in e ? e.clientX : rect.left + rect.width / 2) - rect.left,
          ("clientY" in e ? e.clientY : rect.top + rect.height / 2) - rect.top
        );
      }
    },
    [addSplash]
  );

  const handleContainerClick = useCallback(() => {
    if (!activeRef.current) return;
    setTotalClicks((prev) => prev + 1);
  }, []);

  const spawnBubble = useCallback(() => {
    if (!activeRef.current) return;
    const b: PopBubble = {
      id: bubbleIdRef.current++,
      x: random(5, 88),
      size: random(0.65, 1.2),
      colorIdx: Math.floor(random(0, BUBBLE_COLORS.length)),
      fallDuration: random(4, 8),
      wobbleOffset: random(-30, 30),
      wobbleSpeed: random(2, 4),
    };
    setBubbles((prev) => {
      if (prev.length >= MAX_BUBBLES) return prev;
      return [...prev, b];
    });
  }, []);

  const startGame = useCallback(() => {
    activeRef.current = true;
    bubbleIdRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setBubbleCount(0);
    setXp(0);
    setBubbles([]);
    setSplash([]);
    setTotalClicks(0);
    setGameState("playing");
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || !activeRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          activeRef.current = false;
          playGameOverSound();
          setGameState("gameOver");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing" || !activeRef.current) return;
    const interval = setInterval(() => {
      if (!activeRef.current) return;
      spawnBubble();
    }, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameState, spawnBubble]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
    };
  }, []);

  const continueLesson = useCallback(() => {
    const section = document.getElementById("input-game");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const accuracy = totalClicks > 0 ? Math.round((bubbleCount / totalClicks) * 100) : 0;
  const elapsed = GAME_DURATION - timeLeft;
  const popsPerMin = elapsed > 0 ? Math.round((bubbleCount / elapsed) * 60) : 0;

  return (
    <SectionWrapper
      id="mouse-training"
      title="🫧 Bubble Pop Mouse Training"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-4 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 w-40 h-20 bg-white/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-0 w-32 h-16 bg-white/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{ x: [0, 25, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 left-5 w-24 h-12 bg-white/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{ x: [0, -15, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-60 -right-5 w-36 h-14 bg-white/5 rounded-full blur-xl"
          />
        </div>

        <div className="relative z-10">
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
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-7xl mb-6"
                >
                  🫧
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &ldquo;Bubble Pop Mouse Training&rdquo;
                </h3>
                <p className="text-slate-400 mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                  পর্দায় ভাসমান রঙিন বেলুনগুলোর উপর মাউস নিয়ে গিয়ে ক্লিক করো!
                  মাউস নিয়ন্ত্রণ ও নির্ভুলতা অনুশীলনের জন্যই এই গেম।
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <span className="text-xs glass rounded-full px-3 py-1 text-slate-300">⏱️ {GAME_DURATION} সেকেন্ড</span>
                  <span className="text-xs glass rounded-full px-3 py-1 text-slate-300">🫧 প্রতি ক্লিকে +১</span>
                  <span className="text-xs glass rounded-full px-3 py-1 text-slate-300">⭐ +৫ XP</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-400 to-cyan-400 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-pink-400/25"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>খেলা শুরু করি!</span>
                </motion.button>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🫧</span>
                    <motion.span
                      key={bubbleCount}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-cyan-300"
                    >
                      {bubbleCount}
                    </motion.span>
                  </div>

                  <motion.div
                    animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className={`text-center ${timeLeft <= 10 ? "text-red-400" : "text-slate-200"}`}
                  >
                    <span className="text-3xl md:text-4xl font-bold tabular-nums">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                  </motion.div>

                  <div className="flex items-center gap-1.5">
                    <Star className={`w-5 h-5 ${xp > 0 ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                    <motion.span
                      key={xp}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-lg font-bold text-amber-400"
                    >
                      {xp}
                    </motion.span>
                  </div>
                </div>

                <div
                  ref={containerRef}
                  onClick={handleContainerClick}
                  className="relative w-full h-[360px] md:h-[420px] overflow-hidden rounded-xl cursor-crosshair"
                  style={{
                    background: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 50%, rgba(15,23,42,0.98) 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {bubbles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-sm text-slate-600 animate-pulse">
                        বেলুন আসছে...
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {bubbles.map((b) => (
                      <BubbleItem
                        key={b.id}
                        bubble={b}
                        containerHeight={containerHeight}
                        disabled={false}
                        onClick={handleBubbleEvent}
                      />
                    ))}
                  </AnimatePresence>

                  <AnimatePresence>
                    {splash.map((p) => (
                      <motion.div
                        key={p.id}
                        initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
                        animate={{
                          x: p.x + Math.cos((p.angle * Math.PI) / 180) * p.distance,
                          y: p.y + Math.sin((p.angle * Math.PI) / 180) * p.distance,
                          scale: 0,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="absolute rounded-full pointer-events-none z-20"
                        style={{ width: p.size, height: p.size, background: p.color }}
                      />
                    ))}
                  </AnimatePresence>

                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900/70 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />

                  {timeLeft <= 10 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                        ⚡ সময় ফুরাচ্ছে!
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-600">
                  <span>🖱️ বেলুনে ক্লিক করো</span>
                </div>
              </motion.div>
            )}

            {gameState === "gameOver" && (
              <motion.div
                key="gameOver"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-6"
              >
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                  className="glass rounded-2xl p-6 md:p-8 w-full max-w-sm text-center relative overflow-hidden"
                >
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />

                  <div className="relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                      className="text-5xl md:text-6xl mb-3"
                    >
                      🎉
                    </motion.div>

                    <motion.h3
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-2xl md:text-3xl font-bold text-gradient mb-4"
                    >
                      দারুণ!
                    </motion.h3>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, type: "spring" }}
                      className="glass bg-pink-500/10 border-pink-500/20 rounded-xl p-4 mb-5 inline-block"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-3xl">🫧</span>
                        <span className="text-3xl font-bold text-pink-300">{bubbleCount}</span>
                        <span className="text-xs text-slate-500">বেলুন ফাটিয়েছ</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="grid grid-cols-2 gap-3 mb-5"
                    >
                      <div className="glass rounded-xl p-3">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1" />
                        <p className="text-lg font-bold text-amber-400">{xp}</p>
                        <p className="text-[10px] text-slate-500">অর্জিত XP</p>
                      </div>
                      <div className="glass rounded-xl p-3">
                        <span className="text-xl block mb-1">🎯</span>
                        <p className="text-lg font-bold text-cyan-400">{accuracy}%</p>
                        <p className="text-[10px] text-slate-500">নির্ভুলতা</p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="glass bg-cyan-500/10 border-cyan-500/20 rounded-xl p-3 mb-5"
                    >
                      <p className="text-sm text-slate-300">
                        প্রতি মিনিটে গড়ে <span className="font-bold text-cyan-300">{popsPerMin}</span>টি বেলুন ফাটিয়েছ!
                      </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={startGame}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-hover text-slate-200 border border-white/10 font-semibold text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>আবার খেলুন</span>
                      </motion.button>
                      <motion.button
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.65 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={continueLesson}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-pink-400/25"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>পাঠ চালিয়ে যান</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
