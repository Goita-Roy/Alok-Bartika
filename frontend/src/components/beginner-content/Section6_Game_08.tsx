"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Sparkles,
  RefreshCw, Clock, Heart, Shield, Zap,
  Skull, Crosshair
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

/* ─── Types ─── */

type GameState = "intro" | "playing" | "victory";

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  name: string;
  icon: string;
  isOS: boolean;
  alive: boolean;
  opacity: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: "firewall" | "cpu" | "circuit" | "virus";
  w: number;
  h: number;
  alive: boolean;
}

interface Boss {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
  phase: number;
  timer: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: "shield" | "speed" | "health" | "double";
  alive: boolean;
}

interface DroneTrail {
  x: number;
  y: number;
  life: number;
}

interface FloatingBG {
  icon: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
}

/* ─── Constants ─── */

const OS_ITEMS = [
  { name: "Windows 11", icon: "🖥️" },
  { name: "Linux", icon: "🐧" },
  { name: "macOS", icon: "🍎" },
  { name: "Android", icon: "📱" },
  { name: "Ubuntu", icon: "🟠" },
];

const WRONG_ITEMS = [
  { name: "Chrome", icon: "🌐" },
  { name: "Telegram", icon: "✈️" },
  { name: "Paint", icon: "🎨" },
  { name: "Calculator", icon: "🧮" },
  { name: "MS Word", icon: "📝" },
  { name: "VLC", icon: "🎵" },
  { name: "Photoshop", icon: "🖌️" },
  { name: "Minecraft", icon: "🎮" },
  { name: "Zoom", icon: "📹" },
];

const POWER_TYPES: Array<{ type: PowerUp["type"]; icon: string }> = [
  { type: "shield", icon: "🛡️" },
  { type: "speed", icon: "⚡" },
  { type: "health", icon: "❤️" },
  { type: "double", icon: "⭐" },
];

const BOSS_WARNINGS = ["⚠️ ফায়ারওয়াল বস!", "🔥 বস আসছে!", "🛡️ সাবধান!"];

/* ─── Sound System ─── */

function playSound(type: "collect" | "wrong" | "boss" | "tick" | "power" | "over" | "victory") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case "collect":
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        break;
      case "wrong":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
        break;
      case "boss":
        osc.type = "square";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
        break;
      case "tick":
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
      case "power":
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
        break;
      case "over":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        break;
      case "victory":
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
        break;
    }
  } catch {
    /* silent fail */
  }
}

/* ─── Background ─── */

function BackgroundEffects() {
  const floating: FloatingBG[] = [
    { icon: "🖥️", x: 5, y: 8, size: 1.2, speed: 12, delay: 0 },
    { icon: "🐧", x: 88, y: 12, size: 1, speed: 14, delay: 1 },
    { icon: "🍎", x: 12, y: 82, size: 0.9, speed: 11, delay: 0.5 },
    { icon: "📱", x: 80, y: 78, size: 1, speed: 13, delay: 2 },
    { icon: "🔒", x: 50, y: 5, size: 0.8, speed: 15, delay: 0.3 },
    { icon: "☁️", x: 68, y: 6, size: 1.1, speed: 10, delay: 0.7 },
    { icon: "⚙️", x: 22, y: 20, size: 0.7, speed: 16, delay: 1.5 },
    { icon: "🔧", x: 75, y: 88, size: 0.7, speed: 13, delay: 0.8 },
    { icon: "💻", x: 40, y: 92, size: 0.9, speed: 12, delay: 1.2 },
    { icon: "📡", x: 92, y: 45, size: 0.8, speed: 14, delay: 0.2 },
    { icon: "🛡️", x: 3, y: 55, size: 0.7, speed: 15, delay: 0.9 },
    { icon: "🧩", x: 60, y: 22, size: 0.7, speed: 11, delay: 1.8 },
  ];

  const particles = Array.from({ length: 15 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    size: 1.5 + Math.random() * 2,
    duration: 5 + Math.random() * 5,
    delay: Math.random() * 5,
    color: ["rgba(56,189,248,0.2)", "rgba(192,132,252,0.2)", "rgba(52,211,153,0.2)", "rgba(251,191,36,0.2)"][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Circuit grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 400 400">
        <defs>
          <pattern id="os-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#38bdf8" strokeWidth="0.4" />
            <circle cx="15" cy="15" r="0.8" fill="#38bdf8" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#os-grid)" />
      </svg>

      {/* Animated circuit paths */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 400 400">
        <motion.path
          d="M0,150 Q80,100 160,150 Q240,200 320,150 T400,150"
          fill="none" stroke="#c084fc" strokeWidth="0.6"
          animate={{ d: ["M0,150 Q80,100 160,150 Q240,200 320,150 T400,150", "M0,150 Q80,200 160,150 Q240,100 320,150 T400,150"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,250 Q80,300 160,250 Q240,200 320,250 T400,250"
          fill="none" stroke="#38bdf8" strokeWidth="0.6"
          animate={{ d: ["M0,250 Q80,300 160,250 Q240,200 320,250 T400,250", "M0,250 Q80,200 160,250 Q240,300 320,250 T400,250"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Binary rain */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`bin-${i}`}
          className="absolute font-mono text-[6px] text-cyan-400/10 select-none"
          style={{ left: `${12 + i * 16}%`, top: "-5%" }}
          animate={{ y: ["0vh", "110vh"] }}
          transition={{ duration: 15 + i * 3, repeat: Infinity, ease: "linear", delay: i * 2 }}
        >
          {Array.from({ length: 8 }, () => (Math.random() > 0.5 ? "1" : "0")).join("\n")}
        </motion.div>
      ))}

      {/* Floating background icons */}
      {floating.map((f, i) => (
        <motion.div
          key={`bg-${i}`}
          className={`absolute select-none opacity-[0.08]`}
          style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: `${f.size}rem` }}
          animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: f.speed, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          {f.icon}
        </motion.div>
      ))}

      {/* Ambient particles */}
      {particles.map((p, i) => (
        <motion.div
          key={`part-${i}`}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ opacity: [0, 0.5, 0], y: [0, -8 - Math.random() * 10, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}

      {/* Glow blobs */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], rotate: [0, -2, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/4 rounded-full blur-3xl"
      />
    </div>
  );
}

/* ─── Utility ─── */

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function dist(x1: number, y1: number, x2: number, y2: number) { return Math.hypot(x2 - x1, y2 - y1); }

/* ─── Main Game ─── */

export default function Section6_Game_08() {
  const [gameState, setGameState] = useState<GameState>("intro");

  /* Game state refs (for RAF loop) */
  const arenaRef = useRef<HTMLDivElement>(null);
  const droneRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 150, y: 150 });
  const dronePosRef = useRef({ x: 150, y: 150, angle: 0, scale: 1 });
  const bubblesRef = useRef<Bubble[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const trailRef = useRef<DroneTrail[]>([]);
  const bubbleIdCounter = useRef(0);
  const powerIdCounter = useRef(0);
  const spawnTimerRef = useRef(0);
  const bossSpawnTimerRef = useRef(0);
  const powerSpawnTimerRef = useRef(0);
  const screenShakeRef = useRef(0);
  const collectedRef = useRef(0);
  const wrongRef = useRef(0);
  const comboTimerRef = useRef(0);
  const engineGlowRef = useRef<HTMLDivElement>(null);

  /* Display state (updated periodically from refs) */
  const [hp, setHp] = useState(100);
  const [xp, setXp] = useState(0);
  const [timer, setTimer] = useState(60);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bossActive, setBossActive] = useState(false);
  const [powerActive, setPowerActive] = useState<{ shield: boolean; speed: boolean; double: boolean }>({ shield: false, speed: false, double: false });
  const [collected, setCollected] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [bossWarning, setBossWarning] = useState<string | null>(null);
  const [comboText, setComboText] = useState<string | null>(null);

  /* ─── Game init ─── */

  const startGame = useCallback(() => {
    const arena = arenaRef.current;
    const rect = arena ? arena.getBoundingClientRect() : { width: 500, height: 300 };
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    mouseRef.current = { x: cx, y: cy };
    dronePosRef.current = { x: cx, y: cy, angle: 0, scale: 1 };
    bubblesRef.current = [];
    obstaclesRef.current = [];
    bossRef.current = null;
    powerUpsRef.current = [];
    trailRef.current = [];
    bubbleIdCounter.current = 0;
    powerIdCounter.current = 0;
    spawnTimerRef.current = 0;
    bossSpawnTimerRef.current = 0;
    powerSpawnTimerRef.current = 0;
    screenShakeRef.current = 0;
    collectedRef.current = 0;
    wrongRef.current = 0;
    comboTimerRef.current = 0;

    setHp(100);
    setXp(0);
    setTimer(60);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setBossActive(false);
    setPowerActive({ shield: false, speed: false, double: false });
    setCollected(0);
    setWrongCount(0);
    setFlashColor(null);
    setBossWarning(null);
    setComboText(null);
    setGameState("playing");
  }, []);

  /* ─── Game Loop ─── */

  useEffect(() => {
    if (gameState !== "playing") return;

    const arena = arenaRef.current;
    const arenaRect = arena ? arena.getBoundingClientRect() : { width: 500, height: 300, top: 0, left: 0 } as DOMRect;

    let hpVal = 100;
    let xpVal = 0;
    let timerVal = 60;
    let levelVal = 1;
    let comboVal = 0;
    let maxComboVal = 0;
    let bossAlive = false;
    let collectedVal = 0;
    let wrongVal = 0;
    let shieldActive = false;
    let speedActive = false;
    let doubleActive = false;
    let lastTimerTick = Date.now();

    spawnInitialObstacles(obstaclesRef);

    function spawnInitialObstacles(obs: { current: Obstacle[] }) {
      const w = arenaRect.width;
      const h = arenaRect.height;
      let id = 100;
      obs.current.push(
        { id: id++, x: w * 0.2, y: h * 0.2, vx: 0.3, vy: 0.2, type: "firewall", w: 40, h: 32, alive: true },
        { id: id++, x: w * 0.7, y: h * 0.7, vx: -0.2, vy: 0.4, type: "cpu", w: 36, h: 36, alive: true },
        { id: id++, x: w * 0.5, y: h * 0.1, vx: 0.15, vy: 0.3, type: "circuit", w: 44, h: 20, alive: true },
        { id: id++, x: w * 0.1, y: h * 0.6, vx: 0.25, vy: -0.15, type: "virus", w: 30, h: 30, alive: true },
        { id: id++, x: w * 0.85, y: h * 0.3, vx: -0.3, vy: 0.25, type: "firewall", w: 38, h: 30, alive: true },
      );
    }

    function spawnBubbles() {
      const w = arenaRect.width;
      const h = arenaRect.height;
      const count = 2 + Math.floor(Math.random() * 2);
      const allItems = [...OS_ITEMS.map((o) => ({ ...o, isOS: true })), ...WRONG_ITEMS.map((o) => ({ ...o, isOS: false }))];
      const minDist = 90;

      for (let i = 0; i < count; i++) {
        const item = allItems[Math.floor(Math.random() * allItems.length)];
        const margin = 60;
        let x: number, y: number, attempts = 0;
        do {
          x = rand(margin, w - margin);
          y = rand(margin, h - margin);
          attempts++;
        } while (
          attempts < 20 &&
          bubblesRef.current.some((b) => b.alive && Math.hypot(b.x - x, b.y - y) < minDist)
        );
        bubblesRef.current.push({
          id: ++bubbleIdCounter.current,
          x, y,
          vx: rand(-0.3, 0.3),
          vy: rand(-0.3, 0.3),
          name: item.name,
          icon: item.icon,
          isOS: item.isOS,
          alive: true,
          opacity: 0,
        });
      }
    }

    function spawnPowerUp() {
      const w = arenaRect.width;
      const h = arenaRect.height;
      const margin = 40;
      const type = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)].type;
      powerUpsRef.current.push({
        id: ++powerIdCounter.current,
        x: rand(margin, w - margin),
        y: rand(margin, h - margin),
        type,
        alive: true,
      });
    }

    function spawnBoss() {
      const w = arenaRect.width;
      const h = arenaRect.height;
      const margin = 50;
      bossRef.current = {
        x: rand(margin, w - margin),
        y: rand(margin, h - margin),
        vx: rand(-0.5, 0.5) || 0.3,
        vy: rand(-0.5, 0.5) || 0.2,
        alive: true,
        phase: 0,
        timer: 0,
      };
    }

    function doScreenShake(intensity: number) {
      screenShakeRef.current = intensity;
    }

    /* First spawn */
    spawnBubbles();

    const loop = () => {
      const dt = 1;
      const w = arenaRect.width;
      const h = arenaRect.height;
      const drone = dronePosRef.current;
      const mouse = mouseRef.current;

      /* Drone smooth follow */
      const speed = speedActive ? 0.2 : 0.1;
      drone.x += (mouse.x - drone.x) * speed;
      drone.y += (mouse.y - drone.y) * speed;

      /* Drone rotation */
      const targetAngle = Math.atan2(mouse.y - drone.y, mouse.x - drone.x);
      let angleDiff = targetAngle - drone.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      drone.angle += angleDiff * 0.08;

      /* Drone trail */
      trailRef.current.push({ x: drone.x, y: drone.y, life: 1 });
      if (trailRef.current.length > 15) trailRef.current.shift();
      trailRef.current.forEach((t) => (t.life -= 0.07));
      trailRef.current = trailRef.current.filter((t) => t.life > 0);

      /* Update bubbles */
      bubblesRef.current.forEach((b) => {
        if (!b.alive) return;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 5 || b.x > w - 5) b.vx *= -1;
        if (b.y < 5 || b.y > h - 5) b.vy *= -1;
        b.opacity = Math.min(1, b.opacity + 0.02);
      });

      /* Update obstacles */
      obstaclesRef.current.forEach((o) => {
        if (!o.alive) return;
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        if (o.x < 5 || o.x > w - 5) o.vx *= -1;
        if (o.y < 5 || o.y > h - 5) o.vy *= -1;
      });

      /* Update boss */
      if (bossRef.current && bossRef.current.alive) {
        const b = bossRef.current;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 30 || b.x > w - 30) b.vx *= -1;
        if (b.y < 30 || b.y > h - 30) b.vy *= -1;
        b.timer += dt;
        b.timer += 1;

        /* Boss shoots virus bubbles */
        if (b.timer > 120) {
          b.timer = 0;
          for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3 + b.phase;
            bubblesRef.current.push({
              id: ++bubbleIdCounter.current,
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * 1.2,
              vy: Math.sin(angle) * 1.2,
              name: "ভাইরাস",
              icon: "☣️",
              isOS: false,
              alive: true,
              opacity: 1,
            });
          }
          b.phase += 0.3;
        }
        bossAlive = true;
      }

      /* Update power-ups */
      powerUpsRef.current = powerUpsRef.current.filter((p) => p.alive);

      /* Spawn logic */
      spawnTimerRef.current += dt;
      bossSpawnTimerRef.current += dt;
      powerSpawnTimerRef.current += dt;

      const spawnInterval = levelVal === 1 ? 4 : levelVal === 2 ? 3.5 : 3;
      if (spawnTimerRef.current >= spawnInterval * 60) {
        spawnTimerRef.current = 0;
        spawnBubbles();
      }

      if (bossSpawnTimerRef.current >= 20 * 60 && !bossRef.current?.alive) {
        bossSpawnTimerRef.current = 0;
        spawnBoss();
        playSound("boss");
        setBossWarning(BOSS_WARNINGS[Math.floor(Math.random() * BOSS_WARNINGS.length)]);
        setTimeout(() => setBossWarning(null), 2000);
      }

      if (powerSpawnTimerRef.current >= 8 * 60) {
        powerSpawnTimerRef.current = 0;
        spawnPowerUp();
      }

      /* Level up logic */
      if (collectedVal >= 5 && levelVal === 1) { levelVal = 2; setLevel(2); }
      if (collectedVal >= 12 && levelVal === 2) { levelVal = 3; setLevel(3); }

      /* Collision: drone vs bubbles */
      const droneR = 10 * drone.scale;
      const bubblesCp = [...bubblesRef.current];
      for (const b of bubblesCp) {
        if (!b.alive) continue;
        if (dist(drone.x, drone.y, b.x, b.y) < droneR + 34) {
          b.alive = false;
          if (b.isOS) {
            const xpGain = doubleActive ? 20 : 10;
            xpVal += xpGain;
            hpVal = Math.min(100, hpVal + 5);
            collectedVal++;
            comboVal++;
            if (comboVal > maxComboVal) maxComboVal = comboVal;
            drone.scale = Math.min(1.4, drone.scale + 0.02);
            playSound("collect");

            if (comboVal === 5) {
              xpVal += 50;
              setComboText("🔥 OS মাস্টার কম্বো! +৫০ XP");
              setTimeout(() => setComboText(null), 2000);
            }
          } else {
            if (!shieldActive) {
              hpVal = Math.max(0, hpVal - 10);
              doScreenShake(5);
            }
            xpVal = Math.max(0, xpVal - 5);
            wrongVal++;
            comboVal = 0;
            drone.scale = Math.max(0.7, drone.scale - 0.05);
            playSound("wrong");
            setFlashColor("rgba(239,68,68,0.25)");
            setTimeout(() => setFlashColor(null), 200);
          }
        }
      }
      bubblesRef.current = bubblesCp.filter((b) => b.alive);

      /* Collision: drone vs obstacles */
      for (const o of obstaclesRef.current) {
        if (!o.alive) continue;
        if (dist(drone.x, drone.y, o.x, o.y) < droneR + Math.max(o.w, o.h) * 0.5) {
          if (!shieldActive) {
            hpVal = Math.max(0, hpVal - 8);
            doScreenShake(4);
          }
        }
      }

      /* Collision: drone vs boss */
      if (bossRef.current?.alive) {
        const b = bossRef.current;
        if (dist(drone.x, drone.y, b.x, b.y) < droneR + 22) {
          if (!shieldActive) {
            hpVal = Math.max(0, hpVal - 15);
            doScreenShake(8);
            setFlashColor("rgba(239,68,68,0.35)");
            setTimeout(() => setFlashColor(null), 300);
          }
        }
      }

      /* Collision: drone vs power-ups */
      for (const p of powerUpsRef.current) {
        if (!p.alive) continue;
        if (dist(drone.x, drone.y, p.x, p.y) < droneR + 12) {
          p.alive = false;
          playSound("power");
          switch (p.type) {
            case "shield":
              shieldActive = true;
              setPowerActive((prev) => ({ ...prev, shield: true }));
              setTimeout(() => { shieldActive = false; setPowerActive((prev) => ({ ...prev, shield: false })); }, 5000);
              break;
            case "speed":
              speedActive = true;
              setPowerActive((prev) => ({ ...prev, speed: true }));
              setTimeout(() => { speedActive = false; setPowerActive((prev) => ({ ...prev, speed: false })); }, 5000);
              break;
            case "health":
              hpVal = Math.min(100, hpVal + 20);
              break;
            case "double":
              doubleActive = true;
              setPowerActive((prev) => ({ ...prev, double: true }));
              setTimeout(() => { doubleActive = false; setPowerActive((prev) => ({ ...prev, double: false })); }, 10000);
              break;
          }
        }
      }

      /* Timer */
      const now = Date.now();
      if (now - lastTimerTick >= 1000) {
        lastTimerTick = now;
        timerVal = Math.max(0, timerVal - 1);
        if (timerVal <= 10 && timerVal > 0) playSound("tick");
      }

      /* Screen shake decay */
      if (screenShakeRef.current > 0) screenShakeRef.current *= 0.9;
      if (screenShakeRef.current < 0.1) screenShakeRef.current = 0;

      /* Update drone element */
      if (droneRef.current) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        droneRef.current.style.transform = `translate3d(${drone.x + shakeX}px, ${drone.y + shakeY}px, 0) rotate(${drone.angle}rad) scale(${drone.scale})`;
      }

      /* Update engine glow */
      if (engineGlowRef.current) {
        const glowIntensity = 0.5 + (collectedVal * 0.02);
        engineGlowRef.current.style.opacity = String(Math.min(1, glowIntensity));
      }

      /* Sync display state periodically */
      setHp(hpVal);
      setXp(xpVal);
      setTimer(timerVal);
      setCombo(comboVal);
      setMaxCombo(maxComboVal);
      setBossActive(bossAlive);
      setCollected(collectedVal);
      setWrongCount(wrongVal);

      /* Check game over */
      if (hpVal <= 0 || timerVal <= 0) {
        playSound(timerVal <= 0 ? "victory" : "over");
        setGameState("victory");
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState]);

  /* ─── Mouse handler ─── */

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  /* ─── Render ─── */

  const accuracy = collected + wrongCount > 0 ? Math.round((collected / (collected + wrongCount)) * 100) : 0;

  return (
    <SectionWrapper
      id="os-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
      background="#FFF7ED"
    >
      <div className="glass rounded-2xl p-3 md:p-4 relative overflow-hidden">
        <BackgroundEffects />

        <div className="relative z-10">
          <AnimatePresence>
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative min-h-[420px] py-4"
              >
                {/* Cyber background overlay */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
                  {/* Boss silhouette */}
                  <motion.div
                    animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-4 -top-4 text-[120px] font-bold text-red-500 select-none"
                    style={{ filter: "blur(3px)" }}
                  >
                    🔥
                  </motion.div>

                  {/* Floating OS icons */}
                  <motion.span
                    animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute text-lg md:text-xl opacity-[0.08] select-none"
                    style={{ left: "6%", top: "12%" }}
                  >
                    🖥️
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, 5, 0], rotate: [0, 8, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute text-lg md:text-2xl opacity-[0.07] select-none"
                    style={{ left: "88%", top: "8%" }}
                  >
                    🐧
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -4, 0], rotate: [0, -3, 3, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute text-base opacity-[0.08] select-none"
                    style={{ left: "10%", top: "78%" }}
                  >
                    📱
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, 6, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                    className="absolute text-base md:text-lg opacity-[0.07] select-none"
                    style={{ left: "85%", top: "82%" }}
                  >
                    🍎
                  </motion.span>

                  {/* Floating virus icons */}
                  <motion.span
                    animate={{ y: [0, 8, 0], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute text-sm md:text-base text-red-400 select-none"
                    style={{ left: "45%", top: "5%" }}
                  >
                    ☣️
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -6, 0], opacity: [0.04, 0.09, 0.04] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute text-sm text-red-400 select-none"
                    style={{ left: "55%", top: "88%" }}
                  >
                    🦠
                  </motion.span>

                  {/* Binary numbers */}
                  {[
                    { x: 15, y: 30, text: "01101", delay: 0 },
                    { x: 75, y: 25, text: "10010", delay: 1.5 },
                    { x: 45, y: 40, text: "11000", delay: 0.8 },
                    { x: 20, y: 55, text: "00101", delay: 2 },
                    { x: 80, y: 50, text: "11101", delay: 1 },
                    { x: 60, y: 70, text: "01010", delay: 2.5 },
                  ].map((b, i) => (
                    <motion.span
                      key={`int-bin-${i}`}
                      className="absolute font-mono text-[6px] text-cyan-400/15 select-none"
                      style={{ left: `${b.x}%`, top: `${b.y}%` }}
                      animate={{ opacity: [0.1, 0.3, 0.1], y: [0, -3, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
                    >
                      {b.text}
                    </motion.span>
                  ))}

                  {/* Light particles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`int-part-${i}`}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        left: `${10 + Math.random() * 80}%`,
                        top: `${10 + Math.random() * 80}%`,
                        background: ["rgba(56,189,248,0.3)", "rgba(192,132,252,0.3)", "rgba(52,211,153,0.3)"][i % 3],
                      }}
                      animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 0.5], y: [0, -8, 0] }}
                      transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.6 }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  {/* Animated AI Drone */}
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    className="relative mb-1"
                  >
                    <motion.div
                      animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative"
                      style={{ filter: "drop-shadow(0 0 12px rgba(56,189,248,0.3))" }}
                    >
                      {/* Drone glow */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-16 h-16 rounded-full bg-cyan-400/20 blur-xl"
                        style={{ left: -8, top: -8 }}
                      />
                      <svg viewBox="0 0 40 40" className="w-12 h-12 md:w-14 md:h-14">
                        <motion.circle
                          cx="20" cy="20" r="16"
                          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
                          animate={{ rotate: [0, 360] }}
                          style={{ originX: "20px", originY: "20px" }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                        <circle cx="20" cy="20" r="10" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity={0.25} />
                        <circle cx="20" cy="20" r="5" fill="#38bdf8" opacity={0.7} />
                        <circle cx="20" cy="20" r="3" fill="#fff" opacity={0.9} />
                        <line x1="20" y1="0" x2="20" y2="40" stroke="#38bdf8" strokeWidth="0.4" opacity={0.15} />
                        <line x1="0" y1="20" x2="40" y2="20" stroke="#38bdf8" strokeWidth="0.4" opacity={0.15} />
                        <motion.polygon
                          points="20,2 18,7 22,7"
                          fill="#38bdf8" opacity={0.5}
                          animate={{ y: [0, -1, 0] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                        />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* Neon glowing title */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center"
                  >
                    <motion.h3
                      className="text-xl md:text-2xl font-extrabold"
                      animate={{
                        textShadow: [
                          "0 0 8px rgba(56,189,248,0.3), 0 0 20px rgba(192,132,252,0.15)",
                          "0 0 12px rgba(56,189,248,0.5), 0 0 30px rgba(192,132,252,0.25)",
                          "0 0 8px rgba(56,189,248,0.3), 0 0 20px rgba(192,132,252,0.15)",
                        ],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                        🛸 Operating System
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
                        Survival Arena
                      </span>
                    </motion.h3>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-slate-400 text-[10px] md:text-xs max-w-md text-center leading-relaxed px-2"
                  >
                    তুমি একটি <span className="text-cyan-300 font-semibold">AI ড্রোন</span> — অনুসন্ধান করো{' '}
                    <span className="text-emerald-300 font-semibold">অপারেটিং সিস্টেম</span> খুঁজে বের করার জন্য!
                    সঠিক OS সংগ্রহ করো, অ্যাপ্লিকেশন এড়িয়ে চলো, আর ফায়ারওয়াল বস থেকে বাঁচো!
                  </motion.p>

                  {/* Animated instruction cards */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap justify-center gap-1.5 max-w-md px-2"
                  >
                    {[
                      { emoji: "🟢", text: "OS সংগ্রহ = +১০ XP, +৫ HP", color: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20" },
                      { emoji: "🔴", text: "অ্যাপ = −১০ HP, −৫ XP", color: "from-red-500/10 to-red-600/5 border-red-500/20" },
                      { emoji: "🛡️", text: "বস/বাধা/ভাইরাস থেকে বাঁচো!", color: "from-amber-500/10 to-amber-600/5 border-amber-500/20" },
                      { emoji: "⚡", text: "পাওয়ার-আপ = বুস্ট + সুরক্ষা", color: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/20" },
                      { emoji: "⏱", text: "৬০ সেকেন্ড — সর্বোচ্চ XP!", color: "from-purple-500/10 to-purple-600/5 border-purple-500/20" },
                    ].map((card, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.12, type: "spring", stiffness: 120 }}
                        whileHover={{ scale: 1.03, x: 2 }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r ${card.color} border text-[9px] md:text-[10px] text-slate-300`}
                      >
                        <span>{card.emoji}</span>
                        <span>{card.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Pulsing button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.06, boxShadow: "0 0 30px rgba(56,189,248,0.4)" }}
                      whileTap={{ scale: 0.94 }}
                      onClick={startGame}
                      animate={{
                        boxShadow: [
                          "0 0 10px rgba(56,189,248,0.2), 0 0 20px rgba(192,132,252,0.1)",
                          "0 0 20px rgba(56,189,248,0.4), 0 0 40px rgba(192,132,252,0.2)",
                          "0 0 10px rgba(56,189,248,0.2), 0 0 20px rgba(192,132,252,0.1)",
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-7 py-2.5 md:px-8 md:py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 text-white font-bold text-sm md:text-base flex items-center gap-2 bg-[length:200%_100%]"
                      style={{ backgroundSize: "200% 100%" }}
                    >
                      <motion.span
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🚀
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        অভিযান শুরু করি!
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {gameState === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* HUD */}
                <div className="flex items-center justify-between mb-2 px-1 select-none">
                  {/* HP */}
                  <div className="flex items-center gap-1.5">
                    <Heart className={`w-3.5 h-3.5 ${hp <= 25 ? "text-red-400" : "text-red-500"}`} />
                    <div className="w-16 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <motion.div
                        animate={{ width: `${hp}%` }}
                        transition={{ duration: 0.2 }}
                        className={`h-full rounded-full ${hp <= 25 ? "bg-red-500" : "bg-gradient-to-r from-red-500 to-rose-400"}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 w-6">{hp}</span>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-1">
                    <Clock className={`w-3 h-3 ${timer <= 10 ? "text-red-400" : "text-cyan-400"}`} />
                    <motion.span
                      animate={timer <= 10 ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className={`text-xs font-bold font-mono ${timer <= 10 ? "text-red-400" : "text-slate-300"}`}
                    >
                      {timer}s
                    </motion.span>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{xp}</span>
                  </div>
                </div>

                {/* Bottom HUD */}
                <div className="flex items-center justify-between mb-1.5 px-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-500">
                      📦 {collected} OS
                    </span>
                    {combo >= 3 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[9px] text-orange-400 font-bold"
                      >
                        🔥 {combo}x
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {powerActive.shield && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        className="text-[9px] text-cyan-300"
                      >
                        🛡️
                      </motion.span>
                    )}
                    {powerActive.speed && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        className="text-[9px] text-yellow-300"
                      >
                        ⚡
                      </motion.span>
                    )}
                    {powerActive.double && (
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        className="text-[9px] text-purple-300"
                      >
                        ⭐
                      </motion.span>
                    )}
                    <span className="text-[9px] text-slate-600">Lv.{level}</span>
                  </div>
                </div>

                {/* Boss warning */}
                <AnimatePresence>
                  {bossWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center mb-1"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                        className="text-[10px] font-bold text-red-400 bg-red-500/10 px-3 py-0.5 rounded-full border border-red-500/30"
                      >
                        {bossWarning}
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Combo text */}
                <AnimatePresence>
                  {comboText && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="text-center mb-1"
                    >
                      <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 px-3 py-0.5 rounded-full border border-orange-500/30">
                        {comboText}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Arena */}
                <div
                  ref={arenaRef}
                  onMouseMove={handleMouseMove}
                  className="relative w-full aspect-[16/10] max-h-[400px] rounded-xl bg-slate-900/60 border border-white/5 overflow-hidden cursor-none select-none"
                >
                  {/* Obstacles */}
                  {obstaclesRef.current.filter((o) => o.alive).map((o) => (
                    <motion.div
                      key={o.id}
                      className="absolute rounded-lg flex items-center justify-center font-bold text-[8px] text-white/30 border border-white/5"
                      style={{
                        left: o.x - o.w / 2,
                        top: o.y - o.h / 2,
                        width: o.w,
                        height: o.h,
                        background: o.type === "firewall"
                          ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.08))"
                          : o.type === "cpu"
                            ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.08))"
                            : o.type === "circuit"
                              ? "linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.08))"
                              : "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.08))",
                      }}
                    >
                      {o.type === "firewall" ? "🧱" : o.type === "cpu" ? "⚡" : o.type === "circuit" ? "🔌" : "☣️"}
                    </motion.div>
                  ))}

                  {/* Boss */}
                  {bossRef.current?.alive && (
                    <motion.div
                      className="absolute rounded-full flex items-center justify-center"
                      style={{
                        left: bossRef.current.x - 22,
                        top: bossRef.current.y - 22,
                        width: 44,
                        height: 44,
                        background: "linear-gradient(135deg, rgba(239,68,68,0.4), rgba(239,68,68,0.1))",
                        border: "2px solid rgba(239,68,68,0.3)",
                        boxShadow: "0 0 20px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.1)",
                      }}
                      animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-lg">🔥</span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    </motion.div>
                  )}

                  {/* Bubbles */}
                  {bubblesRef.current.filter((b) => b.alive).map((b) => {
                    const isOS = b.isOS;
                    return (
                      <motion.div
                        key={b.id}
                        className="absolute rounded-full flex flex-col items-center justify-center cursor-pointer select-none backdrop-blur-sm"
                        whileHover={{ scale: 1.12 }}
                        style={{
                          left: b.x - 38,
                          top: b.y - 38,
                          width: 76,
                          height: 76,
                          opacity: b.opacity,
                          background: isOS
                            ? "linear-gradient(135deg, rgba(52,211,153,0.35), rgba(16,185,129,0.12))"
                            : "linear-gradient(135deg, rgba(239,68,68,0.35), rgba(239,68,68,0.12))",
                          border: `4px solid ${isOS ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.5)"}`,
                          boxShadow: isOS
                            ? "0 0 20px rgba(52,211,153,0.18), inset 0 0 12px rgba(52,211,153,0.05), 0 4px 10px rgba(0,0,0,0.25)"
                            : "0 0 20px rgba(239,68,68,0.18), inset 0 0 12px rgba(239,68,68,0.05), 0 4px 10px rgba(0,0,0,0.25)",
                        }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 3 + (b.id % 3), repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-3xl leading-none drop-shadow-md">{b.icon}</span>
                        <span className={`text-[13px] font-extrabold mt-0.5 leading-tight drop-shadow-sm ${isOS ? "text-emerald-200" : "text-red-200"}`}>
                          {b.name}
                        </span>
                      </motion.div>
                    );
                  })}

                  {/* Power-ups */}
                  {powerUpsRef.current.filter((p) => p.alive).map((p) => (
                    <motion.div
                      key={p.id}
                      className="absolute rounded-full flex items-center justify-center"
                      style={{
                        left: p.x - 12,
                        top: p.y - 12,
                        width: 24,
                        height: 24,
                        background: "linear-gradient(135deg, rgba(251,191,36,0.3), rgba(251,191,36,0.1))",
                        border: "1.5px solid rgba(251,191,36,0.3)",
                        boxShadow: "0 0 12px rgba(251,191,36,0.15)",
                      }}
                      animate={{ y: [0, -4, 0], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-sm leading-none">
                        {p.type === "shield" ? "🛡️" : p.type === "speed" ? "⚡" : p.type === "health" ? "❤️" : "⭐"}
                      </span>
                    </motion.div>
                  ))}

                  {/* Drone */}
                  <div
                    ref={droneRef}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{ transform: "translate3d(150px, 150px, 0)" }}
                  >
                    {/* Engine glow trail */}
                    <div
                      ref={engineGlowRef}
                      className="absolute w-5 h-5 rounded-full blur-md"
                      style={{
                        background: "radial-gradient(circle, rgba(56,189,248,0.6), transparent)",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 0.5,
                      }}
                    />

                    {/* Trail particles */}
                    {trailRef.current.map((t, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-cyan-400"
                        style={{
                          left: t.x - dronePosRef.current.x + 8,
                          top: t.y - dronePosRef.current.y + 8,
                          opacity: t.life * 0.5,
                        }}
                      />
                    ))}

                    {/* Drone body */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{
                        width: 20,
                        height: 20,
                        filter: "drop-shadow(0 0 6px rgba(56,189,248,0.3))",
                      }}
                    >
                      <svg viewBox="0 0 40 40" className="w-full h-full">
                        {/* Drone frame */}
                        <motion.circle
                          cx="20" cy="20" r="16"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          opacity={0.5}
                          animate={{ rotate: [0, 360] }}
                          style={{ transformOrigin: "center" }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        />
                        {/* Inner ring */}
                        <circle cx="20" cy="20" r="10" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity={0.3} />
                        {/* Center core */}
                        <circle cx="20" cy="20" r="5" fill="#38bdf8" opacity={0.8} />
                        <circle cx="20" cy="20" r="3" fill="#fff" opacity={0.9} />
                        {/* Cross lines */}
                        <line x1="20" y1="0" x2="20" y2="40" stroke="#38bdf8" strokeWidth="0.4" opacity={0.2} />
                        <line x1="0" y1="20" x2="40" y2="20" stroke="#38bdf8" strokeWidth="0.4" opacity={0.2} />
                        {/* Direction indicator */}
                        <motion.polygon
                          points="20,2 18,8 22,8"
                          fill="#38bdf8"
                          opacity={0.6}
                          animate={{ y: [0, -1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      </svg>

                      {/* Shield visual */}
                      {powerActive.shield && (
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: 32,
                            height: 32,
                            border: "2px solid rgba(103,232,249,0.3)",
                            boxShadow: "0 0 15px rgba(103,232,249,0.15)",
                          }}
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Flash overlay */}
                  {flashColor && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: flashColor }}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 select-none">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                    <span className="text-[7px] text-slate-500">OS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400/60" />
                    <span className="text-[7px] text-slate-500">অ্যাপ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px]">🧱</span>
                    <span className="text-[7px] text-slate-500">বাধা</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px]">🔥</span>
                    <span className="text-[7px] text-slate-500">বস</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px]">⭐</span>
                    <span className="text-[7px] text-slate-500">পাওয়ার-আপ</span>
                  </div>
                </div>
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
                  {hp <= 0 ? "💥" : "🏆"}
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
                  {hp <= 0 ? "মিশন ব্যর্থ!" : "অভিযান সফল!"}
                </h3>
                <p className="text-slate-300 mb-4 text-xs">
                  {hp <= 0
                    ? "তোমার ড্রোন ধ্বংস হয়ে গেছে! আবার চেষ্টা করো।"
                    : "৬০ সেকেন্ড শেষ! তুমি অপারেটিং সিস্টেম চিহ্নিত করতে দক্ষ!"}
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-4 inline-block mb-4 text-left"
                >
                  <div className="space-y-1 text-xs text-slate-300">
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-400">📦</span>
                      <span>সংগৃহীত OS: <strong className="text-emerald-400">{collected}টি</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-red-400">❌</span>
                      <span>ভুল সফটওয়্যার: <strong className="text-red-400">{wrongCount}টি</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span>XP অর্জিত: <strong className="text-amber-400">{xp}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span>অবশিষ্ট HP: <strong className={hp <= 25 ? "text-red-400" : "text-green-400"}>{hp}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Crosshair className="w-3 h-3 text-cyan-400" />
                      <span>নির্ভুলতা: <strong className="text-cyan-400">{accuracy}%</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span>সর্বোচ্চ কম্বো: <strong className="text-orange-400">{maxCombo}x</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-slate-500">Lv.</span>
                      <span>লেভেল: <strong className="text-purple-400">{level}</strong></span>
                    </p>
                  </div>
                </motion.div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-500/25"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>আবার খেলো</span>
                  </motion.button>
                </div>

                {/* Result confetti */}
                {hp > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none z-20"
                  >
                    {Array.from({ length: 25 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{
                          left: `${15 + Math.random() * 70}%`,
                          top: `${10 + Math.random() * 80}%`,
                          background: ["#c084fc", "#818cf8", "#38bdf8", "#34d399", "#f472b6", "#fbbf24"][Math.floor(Math.random() * 6)],
                        }}
                        animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
                        transition={{ duration: 1.5, delay: i * 0.05, repeat: Infinity }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
