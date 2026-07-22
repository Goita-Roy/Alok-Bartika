"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Trophy, Star, Award, Sparkles,
  RefreshCw, Clock, Zap, Monitor, Heart,
  Shield, AlertTriangle, Skull, Lock, Wifi,
  Bug, Mail, Server
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

type GameState = "intro" | "playing" | "victory" | "gameover";

interface Attack {
  id: string;
  name: string;
  icon: string;
  description: string;
  correctDefense: string;
  color: string;
}

interface Defense {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const attacks: Attack[] = [
  { id: "phishing", name: "Phishing Email", icon: "📧", description: "একটি ভুয়া ইমেইল এসেছে! লিংকে ক্লিক করতে বলছে!", correctDefense: "spam", color: "#ef4444" },
  { id: "ddos", name: "DDoS Attack", icon: "🌊", description: "হাজার হাজার ফেক রিকুয়েস্ট আসছে! সার্ভার ডাউন হওয়ার পথে!", correctDefense: "firewall", color: "#f472b6" },
  { id: "brute", name: "Brute Force Password", icon: "🔑", description: "কেউ তোমার পাসওয়ার্ড বারবার চেষ্টা করছে!", correctDefense: "2fa", color: "#fb923c" },
  { id: "malware", name: "Malware", icon: "🦠", description: "একটি ক্ষতিকারক সফটওয়্যার সিস্টেমে ঢোকার চেষ্টা করছে!", correctDefense: "antivirus", color: "#a855f7" },
  { id: "ransom", name: "Ransomware", icon: "💰", description: "তোমার ফাইল এনক্রিপ্ট করে মুক্তিপণ চাচ্ছে!", correctDefense: "update", color: "#dc2626" },
];

const defenses: Defense[] = [
  { id: "firewall", name: "Firewall", icon: "🧱", color: "#38bdf8" },
  { id: "antivirus", name: "Antivirus", icon: "🛡️", color: "#34d399" },
  { id: "2fa", name: "2FA Shield", icon: "📱", color: "#c084fc" },
  { id: "spam", name: "Spam Filter", icon: "📧", color: "#fbbf24" },
  { id: "update", name: "Security Update", icon: "🔄", color: "#f472b6" },
];

export default function Section6_Game_10() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentAttack, setCurrentAttack] = useState<Attack | null>(null);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(false);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [health, setHealth] = useState(5);
  const [wave, setWave] = useState(1);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);
  const [securityMeter, setSecurityMeter] = useState(100);
  const [attackIndex, setAttackIndex] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const attackTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const getRandomAttack = useCallback((): Attack => {
    const shuffled = [...attacks].sort(() => Math.random() - 0.5);
    return shuffled[0];
  }, []);

  const showFeedback = useCallback((message: string, type: "success" | "error" | "warning") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 1200);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setXp(0);
    setStars(0);
    setBadge(false);
    setCombo(0);
    setTimeLeft(60);
    setHealth(5);
    setWave(1);
    setSecurityMeter(100);
    setAttackIndex(0);
    setWarnings([]);
    setFeedback(null);
    setGameState("playing");

    const firstAttack = getRandomAttack();
    setCurrentAttack(firstAttack);

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

    attackTimerRef.current = setInterval(() => {
      setWave((prev) => prev + 1);
      const newAttack = getRandomAttack();
      setCurrentAttack(newAttack);
      setWarnings((prev) => [...prev.slice(-2), `⚠️ New ${newAttack.name} detected!`]);
    }, 8000);
  }, [getRandomAttack]);

  const handleDefense = useCallback((defenseId: string) => {
    if (gameState !== "playing" || !currentAttack) return;

    if (defenseId === currentAttack.correctDefense) {
      const comboBonus = combo * 2;
      const waveBonus = Math.floor(wave / 2) * 5;
      const points = 20 + comboBonus + waveBonus;
      setScore((prev) => prev + points);
      setXp((prev) => Math.min(prev + 8, 100));
      setCombo((prev) => prev + 1);
      setSecurityMeter((prev) => Math.min(100, prev + 3));

      if (combo >= 2 && (combo + 1) % 3 === 0) {
        setStars((prev) => Math.min(prev + 1, 5));
      }

      showFeedback(`✅ Correct! ${currentAttack.name} blocked! +${points} pts`, "success");

      const newAttack = getRandomAttack();
      setCurrentAttack(newAttack);
      setAttackIndex((prev) => prev + 1);
    } else {
      setHealth((prev) => {
        const newHealth = prev - 1;
        if (newHealth <= 0) {
          setTimeout(() => setGameState("gameover"), 300);
        }
        return Math.max(0, newHealth);
      });
      setCombo(0);
      setSecurityMeter((prev) => Math.max(0, prev - 15));
      showFeedback(`❌ Wrong defense! -1 HP!`, "error");
    }
  }, [gameState, currentAttack, combo, wave, getRandomAttack, showFeedback]);

  const getDefenseForAttack = (attackId: string): string => {
    const attack = attacks.find((a) => a.id === attackId);
    return attack?.correctDefense || "";
  };

  useEffect(() => {
    if (health <= 0) {
      setGameState("gameover");
    }
  }, [health]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (attackTimerRef.current) clearInterval(attackTimerRef.current);
    };
  }, []);

  const isCorrectDefense = (defenseId: string) => currentAttack?.correctDefense === defenseId;

  return (
    <SectionWrapper
      id="security-game"
      title="গ্যামিফিকেশন লার্নিং"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
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
                  🏰
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gradient mb-4">
                  &quot;Fortress Shield&quot; গেম:
                </h3>
                <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                  তুমি এখন একটি কোম্পানির <span className="text-cyan-300 font-semibold">Security Officer</span>! বিভিন্ন সাইবার আক্রমণ মোকাবেলা করে সঠিক ডিফেন্স নির্বাচন করো। তোমার ফোর্ট্রেস রক্ষা করো!
                </p>
                <div className="glass rounded-xl p-4 mb-6 inline-block">
                  <p className="text-xs text-slate-400 mb-2">কীভাবে খেলবে:</p>
                  <div className="space-y-1 text-xs text-left">
                    <p className="text-slate-400">⚔️ আক্রমণ দেখার সাথে সাথে সঠিক ডিফেন্স বাছাই করো</p>
                    <p className="text-slate-400">📧 Phishing Email → Spam Filter</p>
                    <p className="text-slate-400">🌊 DDoS Attack → Firewall</p>
                    <p className="text-slate-400">🔑 Brute Force → 2FA Shield</p>
                    <p className="text-slate-400">🦠 Malware → Antivirus</p>
                    <p className="text-slate-400">💰 Ransomware → Security Update</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg flex items-center gap-2 mx-auto shadow-lg shadow-purple-500/25"
                >
                  <Shield className="w-5 h-5" />
                  <span>ফোর্ট্রেস রক্ষা করো!</span>
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
                {/* HUD */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-bold text-red-400">{health}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">HP</span>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold text-amber-400">{score}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Score</span>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-bold text-cyan-400">{timeLeft}s</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Time</span>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-bold text-purple-400">Wave {wave}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Wave</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                </div>

                {/* XP Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500">Security XP</span>
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

                {/* Security Meter */}
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-3 h-3 text-slate-500" />
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <motion.div
                      animate={{ width: `${securityMeter}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: securityMeter > 70 ? "#34d399" : securityMeter > 40 ? "#fbbf24" : "#ef4444" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{Math.round(securityMeter)}%</span>
                </div>

                {/* Combo Display */}
                {combo >= 2 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center mb-3"
                  >
                    <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                      🔥 {combo} কম্বো! +{combo * 2} বোনাস
                    </span>
                  </motion.div>
                )}

                {/* Current Attack Display */}
                <AnimatePresence mode="wait">
                  {currentAttack && (
                    <motion.div
                      key={currentAttack.id + wave}
                      initial={{ opacity: 0, x: 100, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="glass rounded-2xl p-6 mb-4 text-center border-2"
                      style={{ borderColor: `${currentAttack.color}40` }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="text-5xl mb-3"
                      >
                        {currentAttack.icon}
                      </motion.div>
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <h4 className="text-lg font-bold mb-1" style={{ color: currentAttack.color }}>
                          ⚠️ {currentAttack.name}!
                        </h4>
                        <p className="text-sm text-slate-300">{currentAttack.description}</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Defenses Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {defenses.map((defense) => (
                    <motion.button
                      key={defense.id}
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDefense(defense.id)}
                      className={`glass rounded-xl p-4 text-center border-2 transition-all ${
                        currentAttack?.correctDefense === defense.id
                          ? "border-green-500/40 bg-green-500/10"
                          : "border-white/5"
                      }`}
                    >
                      <motion.div
                        animate={currentAttack?.correctDefense === defense.id ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-2xl mb-1"
                      >
                        {defense.icon}
                      </motion.div>
                      <span className="text-[10px] font-semibold block" style={{ color: defense.color }}>
                        {defense.name}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`text-center py-2 px-4 rounded-xl glass mb-2 ${
                        feedback.type === "error" ? "border-red-500/30" :
                        feedback.type === "warning" ? "border-amber-500/30" :
                        "border-green-500/30"
                      }`}
                    >
                      <span className={`text-xs font-semibold ${
                        feedback.type === "error" ? "text-red-400" :
                        feedback.type === "warning" ? "text-amber-400" :
                        "text-green-400"
                      }`}>
                        {feedback.message}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Warning Log */}
                {warnings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-xl p-3"
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-red-400">Threat Log</span>
                    </div>
                    <div className="space-y-1">
                      {warnings.map((w, i) => (
                        <motion.div
                          key={i}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="text-[10px] text-slate-500"
                        >
                          {w}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
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
                  {health <= 0 ? "💀" : "⏰"}
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-red-400 mb-2">
                  {health <= 0 ? "System Breached!" : "Time's Up!"}
                </h3>
                <p className="text-slate-300 mb-2">
                  {health <= 0
                    ? "ফোর্ট্রেস দখল হয়ে গেছে! আক্রমণ প্রতিরোধ করতে ব্যর্থ হয়েছো।"
                    : "সময় শেষ! আরও দ্রুত সিদ্ধান্ত নিতে হবে।"}
                </p>
                <p className="text-sm text-slate-500 mb-4">তোমার স্কোর: {score} পয়েন্ট | Wave: {wave} | কম্বো: {combo}</p>
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
                  ফোর্ট্রেস নিরাপদ!
                </h3>
                <p className="text-slate-300 mb-4">
                  তুমি সব সাইবার আক্রমণ সফলভাবে প্রতিরোধ করেছো! কোম্পানি নিরাপদ!
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
                  <p className="text-lg font-bold text-amber-300">Security Champion 🏅</p>
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

          {/* Game over breach effect */}
          <AnimatePresence>
            {gameState === "gameover" && health <= 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-red-500/20 pointer-events-none z-20"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
