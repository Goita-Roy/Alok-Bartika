import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Star, RefreshCw, ArrowRight, Zap, ShieldCheck, ShieldX, Gamepad2, Crosshair, Volume2, VolumeX } from "lucide-react";
import SectionWrapper from "../SectionWrapper";
import outputMusic from "../../../assets/audio/output.mp3";

type GameState = "intro" | "playing" | "gameOver";

interface DeviceItem {
  emoji: string;
  name: string;
  nameBn: string;
  isOutput: boolean;
  explanation: string;
}

interface TargetData {
  id: number;
  device: DeviceItem;
  x: number;
  y: number;
  scale: number;
  swayOffset: number;
  swaySpeed: number;
  swayAmount: number;
  spawnTime: number;
}

interface HitEffect {
  id: number;
  x: number;
  y: number;
  type: "correct" | "wrong";
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

interface FeedbackToast {
  id: number;
  device: DeviceItem;
  type: "correct" | "wrong";
}

interface XpFloat {
  id: number;
  x: number;
  y: number;
  amount: number;
}

interface ArrowProjectile {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  angle: number;
}

interface TrailParticle {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
}

interface DustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Bird {
  id: number;
  x: number;
  direction: number;
}

const OUTPUT_DEVICES: DeviceItem[] = [
  { emoji: "🖥️", name: "Monitor", nameBn: "মনিটর", isOutput: true, explanation: "মনিটর একটি আউটপুট ডিভাইস। এটি কম্পিউটারের তথ্য ব্যবহারকারীর সামনে প্রদর্শন করে।" },
  { emoji: "🖨️", name: "Printer", nameBn: "প্রিন্টার", isOutput: true, explanation: "প্রিন্টার একটি আউটপুট ডিভাইস। এটি তথ্য কাগজে মুদ্রণ করে।" },
  { emoji: "🔊", name: "Speaker", nameBn: "স্পিকার", isOutput: true, explanation: "স্পিকার একটি আউটপুট ডিভাইস। এটি অডিও বা শব্দ আউটপুট করে।" },
  { emoji: "📽️", name: "Projector", nameBn: "প্রজেক্টর", isOutput: true, explanation: "প্রজেক্টর একটি আউটপুট ডিভাইস। এটি কম্পিউটারের স্ক্রিন বড় পর্দায় দেখায়।" },
  { emoji: "🖨️", name: "Plotter", nameBn: "প্লটার", isOutput: true, explanation: "প্লটার একটি আউটপুট ডিভাইস। এটি বড় আকারের গ্রাফিক্স ও ডিজাইন প্রিন্ট করে।" },
];

const INPUT_DEVICES: DeviceItem[] = [
  { emoji: "🖱️", name: "Mouse", nameBn: "মাউস", isOutput: false, explanation: "মাউস একটি ইনপুট ডিভাইস, তাই এটি লক্ষ্যবস্তু ছিল না।" },
  { emoji: "⌨️", name: "Keyboard", nameBn: "কীবোর্ড", isOutput: false, explanation: "কীবোর্ড একটি ইনপুট ডিভাইস, তাই এটি নির্বাচন করা সঠিক নয়।" },
  { emoji: "🎤", name: "Microphone", nameBn: "মাইক্রোফোন", isOutput: false, explanation: "মাইক্রোফোন একটি ইনপুট ডিভাইস, তাই এটি নির্বাচন করা সঠিক নয়।" },
  { emoji: "📷", name: "Webcam", nameBn: "ওয়েবক্যাম", isOutput: false, explanation: "ওয়েবক্যাম একটি ইনপুট ডিভাইস। এটি ছবি ধারণ করে কম্পিউটারে পাঠায়।" },
  { emoji: "📠", name: "Scanner", nameBn: "স্ক্যানার", isOutput: false, explanation: "স্ক্যানার একটি ইনপুট ডিভাইস। এটি ডকুমেন্ট স্ক্যান করে কম্পিউটারে পাঠায়।" },
];

const ALL_DEVICES = [...OUTPUT_DEVICES, ...INPUT_DEVICES];

const GAME_DURATION = 60;
const SPAWN_INTERVAL = 1800;
const MAX_TARGETS = 8;
const TARGET_LIFETIME = 7000;
const TARGET_BASE_SIZE = 56;
const CHAR_X = 50;
const CHAR_Y = 87;

const SPARKLE_COLORS = ["#34d399", "#38bdf8", "#c084fc", "#f472b6", "#fbbf24", "#60a5fa", "#a78bfa", "#2dd4bf"];

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function playBowDrawSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {
  }
}

function playArrowReleaseSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
  }
}

function playCorrectSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.15);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.15);
    });
  } catch {
  }
}

function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch {
  }
}

function playMissSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
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
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.22);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.22);
    });
  } catch {
  }
}

function triggerConfetti(container: HTMLElement, x: number, y: number, count: number) {
  const colors = ["#34d399", "#38bdf8", "#c084fc", "#f472b6", "#fbbf24", "#fb923c", "#a78bfa", "#60a5fa"];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${x + random(-6, 6)}%`;
    el.style.top = `${y + random(-6, 6)}%`;
    el.style.background = colors[Math.floor(random(0, colors.length))];
    el.style.width = `${random(3, 9)}px`;
    el.style.height = `${random(3, 9)}px`;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.position = "absolute";
    el.style.pointerEvents = "none";
    el.style.zIndex = "50";
    el.style.animation = `confetti-fall ${random(0.8, 1.8)}s ease-in forwards`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }
}

interface TargetRingProps {
  target: TargetData;
  onClick: (target: TargetData) => void;
  disabled: boolean;
  shaking: boolean;
  idleBob: number;
  hoveredTarget: TargetData | null;
}

function TargetRing({ target, onClick, disabled, shaking, idleBob, hoveredTarget }: TargetRingProps) {
  const size = 80;
  const isOutput = target.device.isOutput;
  const isHovered = hoveredTarget?.id === target.id;
  const isWrong = hoveredTarget && !hoveredTarget.device.isOutput;
  const isCorrect = hoveredTarget && hoveredTarget.device.isOutput;
  const ringColor = isCorrect ? "#00E5FF" : isWrong ? "#FF1744" : "#00E5FF";
  const ringGlow = isCorrect ? "rgba(0,229,255,0.7)" : isWrong ? "rgba(255,23,68,0.7)" : "rgba(0,229,255,0.4)";
  const ringGlowStrong = isCorrect ? "rgba(0,229,255,0.9)" : isWrong ? "rgba(255,23,68,0.9)" : "rgba(0,229,255,0.5)";

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: shaking ? [0, -6, 6, -5, 5, -3, 3, -1, 1, 0] : idleBob,
        x: shaking
          ? [0, 5, -5, 4, -4, 3, -3, 2, -2, 0]
          : target.swayAmount
          ? [null, target.swayAmount * 0.7, -target.swayAmount * 0.7, target.swayAmount * 0.4, 0]
          : 0,
      }}
      exit={{ scale: [1, 1.5, 0], opacity: [1, 0.5, 0] }}
      transition={{
        scale: { duration: 0.35, ease: "easeOut" },
        opacity: { duration: 0.3 },
        y: shaking ? { duration: 0.3, ease: "easeInOut" } : { duration: 3 + target.swaySpeed * 0.2, repeat: Infinity, ease: "easeInOut" },
        x: shaking ? { duration: 0.3, ease: "easeInOut" } : target.swayAmount ? { duration: target.swaySpeed, repeat: Infinity, ease: "easeInOut" } : undefined,
      }}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(target); }}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className="absolute focus:outline-none cursor-pointer"
      style={{
        left: `${target.x}%`,
        top: `${target.y}%`,
        width: size, height: size,
        transform: "translate(-50%, -50%)",
        filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 ${isHovered ? 20 : 10}px ${ringGlow})`,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <filter id={`arcade-glow-${target.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`arcade-shadow-${target.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1a3a6c" floodOpacity="0.5" />
          </filter>
          <radialGradient id={`arcade-bg-${target.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#arcade-bg-${target.id})" stroke={ringColor} strokeWidth="3" filter={`url(#arcade-shadow-${target.id})`} />
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,229,255,0.15)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="38" fill="none" stroke={ringColor} strokeWidth="2" opacity="0.7" filter={`url(#arcade-glow-${target.id})`}>
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 4">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="8s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <line x1="50" y1="6" x2="50" y2="94" stroke="rgba(255,255,255,0.35)" strokeWidth="1">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(255,255,255,0.35)" strokeWidth="1">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite" />
        </line>
        <line x1="20" y1="20" x2="80" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="80" y1="20" x2="20" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="0.7">
          <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="5s" repeatCount="indefinite" />
        </line>
        <circle cx="50" cy="50" r="5" fill="#00E5FF" opacity="0.9" filter={`url(#arcade-glow-${target.id})`}>
          <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ padding: size * 0.06 }}>
        <div className="flex items-center justify-center" style={{ width: size * 0.65, height: size * 0.65, borderRadius: "50%", background: "rgba(0,0,0,0.7)", boxShadow: `0 0 20px ${ringGlow}, inset 0 0 12px rgba(0,0,0,0.6)`, border: `2px solid ${ringColor}` }}>
          <span style={{ fontSize: size * 0.45, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.9))" }}>{target.device.emoji}</span>
        </div>
        <span style={{ fontSize: size * 0.12, lineHeight: 1.2, marginTop: size * 0.05, fontWeight: 800, color: "#ffffff", textShadow: "0 1px 6px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)" }} className="text-center leading-tight">
          {target.device.name}
        </span>
      </div>
    </motion.button>
  );
}

interface CloudProps {
  x: number;
  y: number;
  scale: number;
  speed: number;
}

function Cloud({ x, y, scale, speed }: CloudProps) {
  return (
    <motion.div
      animate={{ x: [null, -120 * scale] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      className="absolute pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: `scale(${scale})` }}
    >
      <div className="flex items-center">
        <div className="w-12 h-6 bg-white/15 rounded-full blur-[1px]" />
        <div className="w-16 h-8 bg-white/10 rounded-full blur-[1px] -ml-3" />
        <div className="w-10 h-5 bg-white/15 rounded-full blur-[1px] -ml-2" />
      </div>
    </motion.div>
  );
}

function MountainSVG() {
  return (
    <svg className="absolute bottom-[30%] w-full h-[60%] pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
      <path d="M0,200 L80,100 L160,150 L260,60 L380,130 L480,40 L600,110 L720,50 L840,120 L950,70 L1000,90 L1000,200 Z" fill="#4ade80" />
      <path d="M0,200 L120,130 L240,170 L340,90 L460,150 L560,70 L680,130 L800,80 L920,140 L1000,110 L1000,200 Z" fill="#22d3ee" style={{ opacity: 0.5 }} />
    </svg>
  );
}

function Tree({ side }: { side: "left" | "right" }) {
  const xPos = side === "left" ? 2 : 94;
  return (
    <div className="absolute pointer-events-none" style={{ bottom: "8%", left: `${xPos}%` }}>
      <motion.div animate={{ rotate: [0, 0.5, -0.3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "bottom center" }}>
        <svg width="70" height="120" viewBox="0 0 70 120">
          <rect x="28" y="70" width="14" height="40" rx="3" fill="#8B4513" />
          <ellipse cx="35" cy="45" rx="30" ry="35" fill="#22c55e" />
          <ellipse cx="25" cy="35" rx="18" ry="22" fill="#16a34a" />
          <ellipse cx="45" cy="40" rx="16" ry="20" fill="#15803d" />
        </svg>
      </motion.div>
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(34,197,94,0)",
            "0 0 20px 4px rgba(34,197,94,0.08)",
            "0 0 0 0 rgba(34,197,94,0)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-green-500/5 blur-md"
      />
    </div>
  );
}

function ArcherCharacter({
  aimX,
  aimY,
  bowState,
  facingRight,
}: {
  aimX: number;
  aimY: number;
  bowState: "idle" | "draw" | "release" | "recoil";
  facingRight: boolean;
}) {
  const leanAngle = Math.min(Math.max((aimX - 50) * 0.15, -8), 8);
  const breathOffset = useMemo(() => Math.sin(Date.now() / 1200) * 0.3, []);
  const [breath, setBreath] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setBreath(Math.sin(Date.now() / 1200) * 0.3), 50);
    return () => clearInterval(id);
  }, []);

  const drawPull = bowState === "draw" ? 10 : bowState === "release" ? -2 : 0;
  const recoilOffset = bowState === "recoil" ? 2 : 0;
  const armAngleOffset = bowState === "draw" ? -0.08 : bowState === "release" ? 0.04 : 0;

  return (
    <motion.div
      animate={{
        x: [0, recoilOffset * 0.5, 0],
      }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute pointer-events-none z-25"
      style={{
        left: `${CHAR_X}%`,
        top: `${CHAR_Y}%`,
        transform: `translate(-50%, -50%) scaleX(${facingRight ? 1 : -1})`,
      }}
    >
      <svg width="90" height="110" viewBox="-45 -55 90 110">
        {/* Shadow */}
        <ellipse cx="0" cy="48" rx="22" ry="4" fill="rgba(0,0,0,0.15)" />

        {/* Back leg */}
        <motion.path
          d="M-8,25 L-14,45 L-10,48"
          stroke="#475569"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ y: [0, -breath * 0.3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Front leg */}
        <motion.path
          d="M8,25 L14,45 L18,48"
          stroke="#475569"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animate={{ y: [0, breath * 0.3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Shoes */}
        <ellipse cx="-12" cy="49" rx="6" ry="3" fill="#1e293b" />
        <ellipse cx="16" cy="49" rx="6" ry="3" fill="#1e293b" />

        {/* Torso */}
        <motion.g
          animate={{
            rotate: leanAngle * 0.3,
            y: [0, -breath * 0.4, 0],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "0px 25px" }}
        >
          <rect x="-14" y="-5" width="28" height="32" rx="8" fill="#14b8a6" />
          {/* Collar */}
          <path d="M-8,-5 L0,-12 L8,-5" fill="none" stroke="#0d9488" strokeWidth="1.5" />
          {/* Belly */}
          <rect x="-10" y="10" width="20" height="12" rx="4" fill="#0d9488" opacity="0.3" />
        </motion.g>

        {/* Head */}
        <motion.g
          animate={{
            rotate: leanAngle * 0.5,
            y: [0, -breath * 0.5, 0],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "0px -5px" }}
        >
          {/* Neck */}
          <rect x="-4" y="-18" width="8" height="14" rx="3" fill="#fcd34d" />

          {/* Face */}
          <circle cx="0" cy="-26" r="14" fill="#fcd34d" />

          {/* Hair */}
          <path d="M-14,-30 Q-14,-44 0,-44 Q14,-44 14,-30 Q14,-26 12,-28 Q10,-32 8,-28 Q6,-32 4,-28 Q2,-32 0,-28 Q-2,-32 -4,-28 Q-6,-32 -8,-28 Q-10,-32 -12,-28 Q-14,-26 -14,-30Z" fill="#78350f" />
          <path d="M-12,-30 Q-8,-34 0,-34 Q8,-34 12,-30" fill="none" stroke="#451a03" strokeWidth="1" opacity="0.3" />

          {/* Eyes */}
          <motion.ellipse cx="-5" cy="-27" rx="2.5" ry="2" fill="#1e293b" />
          <motion.ellipse cx="5" cy="-27" rx="2.5" ry="2" fill="#1e293b" />
          <circle cx="-4" cy="-28" r="0.8" fill="white" />
          <circle cx="6" cy="-28" r="0.8" fill="white" />

          {/* Eyebrows */}
          <path d="M-8,-31 Q-5,-33 -2,-31" fill="none" stroke="#451a03" strokeWidth="1" />
          <path d="M2,-31 Q5,-33 8,-31" fill="none" stroke="#451a03" strokeWidth="1" />

          {/* Smile */}
          <path d="M-4,-22 Q0,-19 4,-22" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />

          {/* Cheeks */}
          <circle cx="-9" cy="-23" r="2.5" fill="#fca5a5" opacity="0.3" />
          <circle cx="9" cy="-23" r="2.5" fill="#fca5a5" opacity="0.3" />
        </motion.g>

        {/* Bow arm (front) */}
        <motion.g
          animate={{
            rotate: armAngleOffset + leanAngle * 0.15,
          }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{ transformOrigin: "12px -5px" }}
        >
          <line x1="12" y1="-5" x2="32" y2="-18" stroke="#fcd34d" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="32" cy="-18" r="4" fill="#fcd34d" />

          {/* Bow */}
          <g transform="translate(32, -18)">
            <path
              d="M-2,-16 Q-8,-2 -2,12"
              fill="none"
              stroke="url(#bow-limb)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line x1="0" y1="-16" x2="0" y2="12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            <path
              d="M-1,-12 Q-5,-2 -1,8"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          </g>
        </motion.g>

        {/* String arm (back) */}
        <motion.g
          animate={{
            x: drawPull * (facingRight ? -1 : 1),
            rotate: -drawPull * 0.5 + armAngleOffset,
          }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{ transformOrigin: "-10px -3px" }}
        >
          <line x1="-10" y1="-3" x2="-22" y2="-15" stroke="#fcd34d" strokeWidth="4.5" strokeLinecap="round" />
          {/* Sleeve */}
          <line x1="-10" y1="-3" x2="-14" y2="-8" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" />
          <circle cx="-22" cy="-15" r="4" fill="#fcd34d" />
        </motion.g>

        {/* Arrow nocked */}
        {(bowState === "idle" || bowState === "draw") && (
          <g>
            <line
              x1={-22 + drawPull * (facingRight ? -1 : 1)}
              y1="-15"
              x2="32"
              y2="-18"
              stroke="#e2e8f0"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <polygon points="30,-21 38,-18 30,-15" fill="#a78bfa" />
          </g>
        )}

        {/* Floor shadow under character */}
        <ellipse cx="2" cy="50" rx="24" ry="3" fill="rgba(0,0,0,0.1)" />
      </svg>

      <defs>
        <linearGradient id="bow-limb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
    </motion.div>
  );
}

export default function OutputTargetChallenge() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [wrongHits, setWrongHits] = useState(0);
  const [missedShots, setMissedShots] = useState(0);
  const [targets, setTargets] = useState<TargetData[]>([]);
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hoveredTarget, setHoveredTarget] = useState<TargetData | null>(null);
  const [totalShots, setTotalShots] = useState(0);
  const [shakingTargets, setShakingTargets] = useState<Record<number, boolean>>({});
  const [feedback, setFeedback] = useState<FeedbackToast | null>(null);
  const [xpFloats, setXpFloats] = useState<XpFloat[]>([]);
  const [arrows, setArrows] = useState<ArrowProjectile[]>([]);
  const [trails, setTrails] = useState<TrailParticle[]>([]);
  const [bowState, setBowState] = useState<"idle" | "draw" | "release" | "recoil">("idle");
  const [cameraShake, setCameraShake] = useState(0);
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [musicOn, setMusicOn] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(true);
  const targetIdRef = useRef(0);
  const hitIdRef = useRef(0);
  const sparkleIdRef = useRef(0);
  const xpFloatIdRef = useRef(0);
  const arrowIdRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(outputMusic);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (gameState === "gameOver") {
      let fadeOutInterval: ReturnType<typeof setInterval> | null = null;
      const fadeStep = 0.02;

      fadeOutInterval = setInterval(() => {
        audio.volume = Math.max(0, audio.volume - fadeStep);
        if (audio.volume <= 0) {
          if (fadeOutInterval) clearInterval(fadeOutInterval);
          fadeOutInterval = null;
          audio.pause();
          audio.currentTime = 0;
        }
      }, 50);

      return () => {
        if (fadeOutInterval) clearInterval(fadeOutInterval);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      };
    }
  }, [gameState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const id = Date.now();
        setBirds((prev) => [...prev, { id, x: -10, direction: 1 }]);
        setTimeout(() => setBirds((prev) => prev.filter((b) => b.id !== id)), 6000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    const hitTarget = targets.find((t) => {
      const size = TARGET_BASE_SIZE * t.scale;
      const dx = x - t.x;
      const dy = y - t.y;
      const radius = (size / rect.width) * 100 * 1.2;
      return Math.sqrt(dx * dx + dy * dy) < radius;
    });
    setHoveredTarget(hitTarget || null);
  }, [targets]);

  const spawnTarget = useCallback(() => {
    if (!activeRef.current) return;
    const device = pick(ALL_DEVICES);
    const swayAmount = Math.random() > 0.25 ? random(20, 60) : 0;
    const target: TargetData = {
      id: targetIdRef.current++,
      device,
      x: random(8, 92),
      y: random(10, 65),
      scale: random(0.5, 1.0),
      swayOffset: random(0, 100),
      swaySpeed: random(2, 4.5),
      swayAmount,
      spawnTime: Date.now(),
    };
    setTargets((prev) => (prev.length >= MAX_TARGETS ? prev : [...prev, target]));
  }, []);

  const addHitEffect = useCallback((x: number, y: number, type: "correct" | "wrong") => {
    const id = hitIdRef.current++;
    setHitEffects((prev) => [...prev, { id, x, y, type }]);
    setTimeout(() => setHitEffects((prev) => prev.filter((h) => h.id !== id)), 500);
  }, []);

  const addSparkles = useCallback((x: number, y: number) => {
    const particles: SparkleParticle[] = [];
    const count = 10 + Math.floor(random(0, 6));
    for (let i = 0; i < count; i++) {
      particles.push({
        id: sparkleIdRef.current++, x, y, color: pick(SPARKLE_COLORS),
        angle: random(0, 360), distance: random(20, 70), size: random(2, 7),
      });
    }
    setSparkles((prev) => [...prev, ...particles]);
    setTimeout(() => setSparkles([]), 550);
  }, []);

  const addXpFloat = useCallback((x: number, y: number, amount: number) => {
    const id = xpFloatIdRef.current++;
    setXpFloats((prev) => [...prev, { id, x, y, amount }]);
    setTimeout(() => setXpFloats((prev) => prev.filter((f) => f.id !== id)), 1200);
  }, []);

  const showFeedback = useCallback((device: DeviceItem, type: "correct" | "wrong") => {
    setFeedback({ id: Date.now(), device, type });
    setTimeout(() => setFeedback(null), 2200);
  }, []);

  const shootArrow = useCallback((toX: number, toY: number) => {
    const id = arrowIdRef.current++;
    const angle = Math.atan2(toY - CHAR_Y, toX - CHAR_X);

    setBowState("draw");
    playBowDrawSound();

    const trailId = arrowIdRef.current;
    const trailParticles: TrailParticle[] = [];
    for (let i = 0; i < 4; i++) {
      trailParticles.push({ id: trailId + i * 1000, fromX: CHAR_X, fromY: CHAR_Y, toX, toY, delay: i * 0.04 });
    }
    setTrails((prev) => [...prev, ...trailParticles]);
    setTimeout(() => setTrails((prev) => prev.filter((t) => trailParticles.some((tp) => tp.id === t.id) ? false : true)), 500);

    setTimeout(() => {
      setArrows((prev) => [...prev, { id, fromX: CHAR_X, fromY: CHAR_Y, toX, toY, angle }]);
      setBowState("release");
      playArrowReleaseSound();
      setCameraShake(5);
      setTimeout(() => setCameraShake(3), 40);
      setTimeout(() => setCameraShake(1), 90);
      setTimeout(() => setCameraShake(0), 160);

      setTimeout(() => {
        setArrows((prev) => prev.filter((a) => a.id !== id));
        setBowState("idle");
      }, 350);
    }, 200);
  }, []);

  const handleTargetClick = useCallback(
    (target: TargetData) => {
      if (!activeRef.current) return;
      shootArrow(target.x, target.y);
      setTargets((prev) => prev.filter((t) => t.id !== target.id));
      setTotalShots((prev) => prev + 1);

      if (target.device.isOutput) {
        setScore((prev) => prev + 10);
        setXp((prev) => prev + 10);
        setCorrectHits((prev) => prev + 1);
        setTimeout(() => {
          addSparkles(target.x, target.y);
          addXpFloat(target.x, target.y - 5, 10);
          addHitEffect(target.x, target.y, "correct");
          showFeedback(target.device, "correct");
          playCorrectSound();
          if (containerRef.current) triggerConfetti(containerRef.current, target.x, target.y, 14);
        }, 250);
      } else {
        setScore((prev) => Math.max(0, prev - 5));
        setXp((prev) => Math.max(0, prev - 5));
        setWrongHits((prev) => prev + 1);
        setTimeout(() => {
          addXpFloat(target.x, target.y - 5, -5);
          addHitEffect(target.x, target.y, "wrong");
          showFeedback(target.device, "wrong");
          playWrongSound();
          setShakingTargets((prev) => ({ ...prev, [target.id]: true }));
          setTimeout(() => setShakingTargets((prev) => ({ ...prev, [target.id]: false })), 350);
        }, 250);
      }
    },
    [shootArrow, addSparkles, addXpFloat, addHitEffect, showFeedback]
  );

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      if (!activeRef.current || gameState !== "playing" || bowState !== "idle") return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const hitTarget = targets.find((t) => {
        const size = TARGET_BASE_SIZE * t.scale;
        const dx = x - t.x;
        const dy = y - t.y;
        const radius = (size / rect.width) * 100 * 1.2;
        return Math.sqrt(dx * dx + dy * dy) < radius;
      });

      if (hitTarget) {
        handleTargetClick(hitTarget);
      } else {
        setTotalShots((prev) => prev + 1);
        setMissedShots((prev) => prev + 1);
        shootArrow(x, y);
        setTimeout(() => playMissSound(), 250);
      }
    },
    [gameState, targets, handleTargetClick, shootArrow, bowState]
  );

  const startGame = useCallback(() => {
    activeRef.current = true;
    targetIdRef.current = 0;
    hitIdRef.current = 0;
    sparkleIdRef.current = 0;
    xpFloatIdRef.current = 0;
    arrowIdRef.current = 0;
    setTimeLeft(GAME_DURATION);
    setScore(0); setXp(0); setCorrectHits(0); setWrongHits(0); setMissedShots(0);
    setTargets([]); setHitEffects([]); setSparkles([]); setArrows([]); setTrails([]);
    setTotalShots(0); setFeedback(null); setXpFloats([]);
    setBowState("idle"); setCameraShake(0);
    setGameState("playing");
    const audio = audioRef.current;
    if (audio && musicOn) {
      audio.currentTime = 0;
      audio.volume = 0;
      audio.play().catch(() => {});
      const fadeInterval = setInterval(() => {
        if (audio.volume < 0.15) {
          audio.volume = Math.min(0.15, audio.volume + 0.01);
        } else {
          clearInterval(fadeInterval);
        }
      }, 50);
    }
  }, [musicOn]);

  useEffect(() => {
    if (gameState !== "playing" || !activeRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { activeRef.current = false; setGameState("gameOver"); playGameOverSound(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing" || !activeRef.current) return;
    const interval = setInterval(() => { if (!activeRef.current) return; spawnTarget(); }, SPAWN_INTERVAL);
    spawnTarget();
    return () => clearInterval(interval);
  }, [gameState, spawnTarget]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const checkInterval = setInterval(() => setTargets((prev) => prev.filter((t) => Date.now() - t.spawnTime < TARGET_LIFETIME)), 1000);
    return () => clearInterval(checkInterval);
  }, [gameState]);

  useEffect(() => { return () => { activeRef.current = false; }; }, []);

  const continueLesson = useCallback(() => {
    const section = document.getElementById("output-game");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }, []);

  const facingRight = mousePos.x >= CHAR_X;
  const bowOpacity = bowState === "idle" ? 1 : bowState === "draw" ? 0.9 : 0.85;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const accuracy = totalShots > 0 ? Math.round((correctHits / totalShots) * 100) : 0;
  const remainingTargets = targets.length;

  return (
    <SectionWrapper
      id="output-target-challenge"
      title="🎯 আউটপুট টার্গেট চ্যালেঞ্জ"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-4 md:p-8 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-7xl mb-6">
                🏹
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">&quot;আউটপুট টার্গেট চ্যালেঞ্জ&quot;</h3>
              <p className="text-slate-400 mb-6 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                একটি আধুনিক তীরন্দাজ রেঞ্জে বিভিন্ন ডিভাইসের টার্গেট দেখানো হবে।
                শুধুমাত্র <span className="text-green-400 font-semibold">আউটপুট ডিভাইস</span> গুলোতে তীর ছুঁড়ো!
                ইনপুট ডিভাইসে আঘাত করলে পয়েন্ট কাটা যাবে।
              </p>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-emerald-500/25">
                <Crosshair className="w-5 h-5" /><span>চ্যালেঞ্জ শুরু করি!</span>
              </motion.button>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Star className={`w-5 h-5 ${score > 0 ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                  <motion.span key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-lg font-bold text-amber-400">{score}</motion.span>
                </div>
                <motion.div animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 0.5, repeat: Infinity }} className="text-center">
                  <motion.div animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 0.4, repeat: Infinity }} className={`text-3xl md:text-5xl font-bold tabular-nums tracking-wider ${timeLeft <= 10 ? "text-red-400" : "text-slate-100"}`}>
                    {minutes}:{seconds.toString().padStart(2, "0")}
                  </motion.div>
                  {timeLeft <= 10 && <span className="text-[10px] text-red-400 font-semibold animate-pulse">সময় ফুরাচ্ছে!</span>}
                </motion.div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <motion.span key={correctHits} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-lg font-bold text-emerald-400">{correctHits}</motion.span>
                </div>
              </div>

              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onClick={handleContainerClick}
                className="relative w-full h-[400px] md:h-[480px] overflow-hidden rounded-xl cursor-none select-none"
                style={{
                  background: "linear-gradient(180deg, #1a5a8a 0%, #3a7db4 25%, #6aadc8 50%, #4a8a5a 75%, #227a32 85%, #145a1e 100%)",
                }}
              >
                {/* Sky gradient overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(56,189,248,0.15) 0%, transparent 40%, rgba(74,222,128,0.1) 70%, rgba(34,197,94,0.2) 100%)" }} />

                {/* Sun */}
                <motion.div
                  animate={{ scale: [1, 1.03, 1], opacity: [0.5, 0.6, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute pointer-events-none rounded-full"
                  style={{ left: "78%", top: "6%", width: 50, height: 50, background: "radial-gradient(circle, rgba(255,255,255,0.3), rgba(255,255,255,0.05))", boxShadow: "0 0 60px rgba(255,255,255,0.15), 0 0 120px rgba(255,255,255,0.05)" }}
                />

                {/* Mountains */}
                <MountainSVG />

                {/* Clouds */}
                <Cloud x={10} y={5} scale={0.9} speed={60} />
                <Cloud x={40} y={8} scale={1.2} speed={80} />
                <Cloud x={70} y={3} scale={0.7} speed={50} />
                <Cloud x={25} y={12} scale={0.5} speed={70} />
                <Cloud x={85} y={10} scale={1.0} speed={90} />

                {/* Birds */}
                <AnimatePresence>
                  {birds.map((bird) => (
                    <motion.div
                      key={bird.id}
                      initial={{ x: "-10%", y: "15%" }}
                      animate={{ x: "110%", y: ["15%", "12%", "18%", "15%"] }}
                      transition={{ duration: 6, ease: "linear" }}
                      exit={{ opacity: 0 }}
                      className="absolute pointer-events-none z-10"
                    >
                      <svg width="16" height="10" viewBox="0 0 16 10">
                        <path d="M0,5 Q4,0 8,5 Q12,0 16,5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                      </svg>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Trees */}
                <Tree side="left" />
                <Tree side="right" />

                {/* Grass decoration */}
                <div className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 h-full" style={{ background: "linear-gradient(0deg, rgba(34,197,94,0.3) 0%, transparent 100%)" }} />
                  {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95].map((x) => (
                    <motion.div
                      key={x}
                      animate={{ rotate: [0, 1, -0.5, 0], scaleY: [1, 1.02, 0.98, 1] }}
                      transition={{ duration: 2 + (x % 3), repeat: Infinity, ease: "easeInOut", delay: x * 0.02 }}
                      className="absolute bottom-0"
                      style={{ left: `${x}%`, width: 3, height: 10 + (x % 8), background: "#15803d", borderRadius: "0 0 2px 2px", transformOrigin: "bottom center" }}
                    />
                  ))}
                </div>

                {/* Fence */}
                <div className="absolute bottom-[22%] left-[5%] right-[5%] h-6 pointer-events-none">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-800/30 rounded" />
                  {[6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94].map((x) => (
                    <div key={x} className="absolute bottom-0" style={{ left: `${x}%`, width: 4, height: 16, background: "#92400e", borderRadius: "1px", transform: "translateX(-50%)" }} />
                  ))}
                </div>

                {/* Dust particles */}
                {dustParticles.map((p) => (
                  <motion.div
                    key={p.id}
                    animate={{ y: [0, -30, -60], opacity: [0, 0.3, 0], x: [0, (p.id % 2 === 0 ? 10 : -10)] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
                    className="absolute pointer-events-none rounded-full bg-white/20"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                  />
                ))}

                {/* Range floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none" style={{ background: "linear-gradient(0deg, rgba(21,128,61,0.4) 0%, rgba(34,197,94,0.15) 60%, transparent 100%)" }} />

                {/* Shooting station platform */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-6 pointer-events-none" style={{ background: "linear-gradient(0deg, rgba(120,53,15,0.3) 0%, rgba(180,83,9,0.1) 100%)", borderRadius: "4px 4px 0 0" }} />

                {/* Targets */}
                <AnimatePresence>
                  {targets.map((t) => (
                    <TargetRing key={t.id} target={t} onClick={handleTargetClick} disabled={false} shaking={!!shakingTargets[t.id]} idleBob={Math.sin(Date.now() / 1000 + t.swayOffset) * (0.3 + t.scale * 0.4)} hoveredTarget={hoveredTarget} />
                  ))}
                </AnimatePresence>

                {/* Arrow projectiles */}
                <AnimatePresence>
                  {arrows.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ x: `${a.fromX}%`, y: `${a.fromY}%`, opacity: 1, scale: 1 }}
                      animate={{ x: `${a.toX}%`, y: `${a.toY}%`, opacity: [1, 1, 0], scale: [1, 1, 0.4] }}
                      transition={{ duration: 0.3, ease: "easeOut", times: [0, 0.75, 1] }}
                      className="absolute pointer-events-none z-20"
                      style={{ transform: `translate(-50%, -50%) rotate(${a.angle}rad)` }}
                    >
                      <svg width="32" height="6" viewBox="0 0 32 6">
                        <defs><linearGradient id="arrow-shaft" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="rgba(255,255,255,0.1)" /><stop offset="50%" stopColor="#e2e8f0" /><stop offset="100%" stopColor="rgba(255,255,255,0.1)" /></linearGradient></defs>
                        <line x1="0" y1="3" x2="24" y2="3" stroke="url(#arrow-shaft)" strokeWidth="1.8" strokeLinecap="round" />
                        <polygon points="24,0 32,3 24,6" fill="#a78bfa" />
                      </svg>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Arrow trail particles */}
                <AnimatePresence>
                  {trails.map((t) => (
                    <motion.div
                      key={t.id}
                      initial={{ x: `${t.fromX}%`, y: `${t.fromY}%`, opacity: 0.35, scale: 1 }}
                      animate={{ x: `${t.toX}%`, y: `${t.toY}%`, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: t.delay }}
                      className="absolute pointer-events-none z-10"
                      style={{ transform: "translate(-50%, -50%)" }}
                    >
                      <div className="w-1 h-1 bg-cyan-300/60 rounded-full" />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Camera shake overlay */}
                {cameraShake > 0 && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-45"
                    animate={{ x: [0, cameraShake * 0.6, -cameraShake * 0.4, cameraShake * 0.2, 0], y: [0, -cameraShake * 0.3, cameraShake * 0.5, -cameraShake * 0.2, 0] }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                )}

                {/* Hit effects */}
                <AnimatePresence>
                  {hitEffects.map((h) => (
                    <motion.div
                      key={h.id}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="absolute pointer-events-none z-30 rounded-full"
                      style={{
                        left: `${h.x}%`, top: `${h.y}%`, width: 14, height: 14,
                        background: h.type === "correct" ? "radial-gradient(circle, rgba(52,211,153,0.9), transparent)" : "radial-gradient(circle, rgba(248,113,113,0.8), transparent)",
                        boxShadow: h.type === "correct" ? "0 0 25px rgba(52,211,153,0.5)" : "0 0 20px rgba(248,113,113,0.4)",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Glow rings */}
                <AnimatePresence>
                  {hitEffects.filter((h) => h.type === "correct").map((h) => (
                    <motion.div key={`glow-${h.id}`} initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 7, opacity: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="absolute pointer-events-none z-15 rounded-full" style={{ left: `${h.x}%`, top: `${h.y}%`, width: 20, height: 20, background: "radial-gradient(circle, rgba(52,211,153,0.25), transparent)", transform: "translate(-50%, -50%)" }} />
                  ))}
                  {hitEffects.filter((h) => h.type === "wrong").map((h) => (
                    <motion.div key={`flash-${h.id}`} initial={{ scale: 0, opacity: 0.6 }} animate={{ scale: 5, opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="absolute pointer-events-none z-15 rounded-full" style={{ left: `${h.x}%`, top: `${h.y}%`, width: 16, height: 16, background: "radial-gradient(circle, rgba(248,113,113,0.35), transparent)", transform: "translate(-50%, -50%)" }} />
                  ))}
                </AnimatePresence>

                {/* Sparkles */}
                <AnimatePresence>
                  {sparkles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
                      animate={{ x: p.x + Math.cos((p.angle * Math.PI) / 180) * p.distance, y: p.y + Math.sin((p.angle * Math.PI) / 180) * p.distance, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      className="absolute rounded-full pointer-events-none z-30"
                      style={{ width: p.size, height: p.size, background: p.color }}
                    />
                  ))}
                </AnimatePresence>

                {/* XP floats */}
                <AnimatePresence>
                  {xpFloats.map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ x: f.x, y: f.y, opacity: 1, scale: 0.8 }}
                      animate={{ y: f.y - 14, opacity: 0, scale: 1.4 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className={`absolute pointer-events-none z-40 font-bold text-sm drop-shadow-lg ${f.amount > 0 ? "text-emerald-400" : "text-red-400"}`}
                      style={{ left: `${f.x}%`, top: `${f.y}%`, transform: "translate(-50%, -50%)" }}
                    >
                      {f.amount > 0 ? `+${f.amount}` : `${f.amount}`} XP
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Archer character */}
                <ArcherCharacter aimX={mousePos.x} aimY={mousePos.y} bowState={bowState} facingRight={facingRight} />

                {/* Archery crosshair */}
                <motion.div
                  className="absolute pointer-events-none z-30"
                  animate={{ scale: bowState === "draw" ? 0.9 : 1 }}
                  transition={{ duration: 0.15 }}
                  style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%`, transform: "translate(-50%, -50%)" }}
                >
                  <svg width="34" height="34" viewBox="0 0 34 34">
                    <circle
                      cx="17" cy="17" r="15"
                      fill="none"
                      stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.6)" : "rgba(248,113,113,0.6)") : "rgba(255,255,255,0.25)"}
                      strokeWidth="1" strokeDasharray="3 3"
                    />
                    <circle
                      cx="17" cy="17" r="4"
                      fill="none"
                      stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.8)" : "rgba(248,113,113,0.8)") : "rgba(255,255,255,0.4)"}
                      strokeWidth="1"
                    />
                    <circle
                      cx="17" cy="17" r="1.5"
                      fill={hoveredTarget ? (hoveredTarget.device.isOutput ? "#34d399" : "#f87171") : "rgba(52,211,153,0.6)"}
                    />
                    <line x1="17" y1="0" x2="17" y2="5" stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.7)" : "rgba(248,113,113,0.7)") : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                    <line x1="17" y1="29" x2="17" y2="34" stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.7)" : "rgba(248,113,113,0.7)") : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                    <line x1="0" y1="17" x2="5" y2="17" stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.7)" : "rgba(248,113,113,0.7)") : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                    <line x1="29" y1="17" x2="34" y2="17" stroke={hoveredTarget ? (hoveredTarget.device.isOutput ? "rgba(52,211,153,0.7)" : "rgba(248,113,113,0.7)") : "rgba(255,255,255,0.3)"} strokeWidth="1" />
                  </svg>
                </motion.div>

                {/* Feedback toast */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      key={feedback.id}
                      initial={{ y: -25, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -25, opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 250, damping: 18 }}
                      className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl backdrop-blur-md border shadow-2xl max-w-xs w-[90%] ${feedback.type === "correct" ? "bg-emerald-500/15 border-emerald-400/30 shadow-emerald-500/10" : "bg-red-500/15 border-red-400/30 shadow-red-500/10"}`}
                    >
                      <p className={`text-xs font-bold mb-0.5 ${feedback.type === "correct" ? "text-emerald-300" : "text-red-300"}`}>
                        {feedback.type === "correct" ? "✅ সঠিক!" : "❌ ভুল!"}
                        <span className="ml-1.5 font-normal opacity-80">{feedback.device.emoji} {feedback.device.nameBn}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{feedback.device.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
                  <span className="text-[10px] text-slate-600 bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    বাকি টার্গেট: {remainingTargets}
                  </span>
                </div>

                {timeLeft <= 10 && (
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full animate-pulse">⏰ সময় ফুরাচ্ছে!</span>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-slate-600">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-green-400" /><span>আউটপুট +১০</span></span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-red-400" /><span>ইনপুট -৫</span></span>
              </div>
            </motion.div>
          )}

          {gameState === "gameOver" && (
            <motion.div key="gameOver" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-6">
              <motion.div initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 180, damping: 18 }} className="glass rounded-2xl p-6 md:p-8 w-full max-w-sm text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 120, delay: 0.1 }} className="text-5xl md:text-6xl mb-3">🏆</motion.div>
                  <motion.h3 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-2xl md:text-3xl font-bold text-gradient mb-4">দারুণ!</motion.h3>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: "spring" }} className="glass bg-emerald-500/10 border-emerald-500/20 rounded-xl p-4 mb-5 inline-block">
                    <div className="flex items-center gap-3"><span className="text-3xl">🏹</span><div><span className="text-3xl font-bold text-emerald-300">{correctHits}</span><span className="text-xs text-slate-500 block mt-1">সঠিক শট</span></div></div>
                  </motion.div>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="grid grid-cols-2 gap-3 mb-5">
                    <div className="glass rounded-xl p-3"><ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><p className="text-lg font-bold text-emerald-400">{correctHits}</p><p className="text-[10px] text-slate-500">সঠিক</p></div>
                    <div className="glass rounded-xl p-3"><ShieldX className="w-5 h-5 text-red-400 mx-auto mb-1" /><p className="text-lg font-bold text-red-400">{wrongHits}</p><p className="text-[10px] text-slate-500">ভুল</p></div>
                    <div className="glass rounded-xl p-3"><span className="text-xl block mb-1">🎯</span><p className="text-lg font-bold text-cyan-400">{accuracy}%</p><p className="text-[10px] text-slate-500">নির্ভুলতা</p></div>
                    <div className="glass rounded-xl p-3"><Star className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1" /><p className="text-lg font-bold text-amber-400">{xp} XP</p><p className="text-[10px] text-slate-500">অর্জিত</p></div>
                  </motion.div>
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="glass bg-cyan-500/10 border-cyan-500/20 rounded-xl p-3 mb-5">
                    <p className="text-sm text-slate-300">মোট স্কোর: <span className="font-bold text-cyan-300">{score}</span></p>
                    <p className="text-[10px] text-slate-500 mt-1">{correctHits > wrongHits ? "তুমি আউটপুট ডিভাইস চিনতে পারো!" : "আরও অনুশীলন করো!"}</p>
                  </motion.div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={startGame} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-hover text-slate-200 border border-white/10 font-semibold text-sm"><RefreshCw className="w-4 h-4" /><span>আবার খেলুন</span></motion.button>
                    <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={continueLesson} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25"><ArrowRight className="w-4 h-4" /><span>পাঠ চালিয়ে যান</span></motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
