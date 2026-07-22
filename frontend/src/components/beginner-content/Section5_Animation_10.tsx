"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Unlock, Key, RotateCcw, Play, Pause, Zap, ArrowRight, Binary, Sparkles } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const PLAIN_TEXT = "HELLO";
const ENCRYPTED_TEXT = "@#$!&%";

export default function Section5_Animation_10() {
  const [phase, setPhase] = useState<"idle" | "encrypting" | "encrypted" | "decrypting" | "decrypted">("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [keyEntered, setKeyEntered] = useState(false);
  const [binaryStream, setBinaryStream] = useState<string[]>([]);
  const [shieldPulse, setShieldPulse] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const pauseRef = useRef(false);

  const generateBinary = () => {
    const lines: string[] = [];
    for (let i = 0; i < 8; i++) {
      lines.push(Array.from({ length: 16 }, () => Math.random() > 0.5 ? "1" : "0").join(""));
    }
    return lines;
  };

  const startEncryption = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      pauseRef.current = false;
      return;
    }
    resetAll();
    setIsPlaying(true);
    setPhase("encrypting");

    const encryptDelay = slowMo ? 3000 : 1500;
    const decryptDelay = slowMo ? 3000 : 1500;

    setTimeout(() => {
      if (pauseRef.current) return;
      setPhase("encrypted");
      setBinaryStream(generateBinary());
      setShieldPulse(true);
      setTimeout(() => setShieldPulse(false), 1000);

      setTimeout(() => {
        if (pauseRef.current) return;
        setPhase("decrypting");
        setBinaryStream(generateBinary());

        setTimeout(() => {
          if (pauseRef.current) return;
          setPhase("decrypted");
          setBinaryStream([]);
          setTimeout(() => {
            setIsPlaying(false);
          }, 2000);
        }, decryptDelay);
      }, encryptDelay);
    }, encryptDelay);
  }, [isPaused, slowMo]);

  const togglePause = useCallback(() => {
    if (isPlaying && !isPaused) {
      setIsPaused(true);
      pauseRef.current = true;
    } else if (isPaused) {
      setIsPaused(false);
      pauseRef.current = false;
    }
  }, [isPlaying, isPaused]);

  const resetAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setPhase("idle");
    setKeyEntered(false);
    setBinaryStream([]);
    setShieldPulse(false);
    pauseRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleKeyClick = () => {
    if (phase === "encrypted") {
      setKeyEntered(true);
      setPhase("decrypting");
      setBinaryStream(generateBinary());

      setTimeout(() => {
        setPhase("decrypted");
        setBinaryStream([]);
        setTimeout(() => {
          setIsPlaying(false);
        }, 2000);
      }, slowMo ? 3000 : 1500);
    }
  };

  const getDisplayText = () => {
    switch (phase) {
      case "idle": return PLAIN_TEXT;
      case "encrypting": return PLAIN_TEXT.split("").map((ch, i) =>
        <motion.span
          key={i}
          animate={{ opacity: [1, 0.3, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
          className="inline-block"
        >{ch}</motion.span>
      );
      case "encrypted": return ENCRYPTED_TEXT.split("").map((ch, i) =>
        <motion.span
          key={i}
          animate={{ y: [0, -3, 0], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
          className="inline-block text-red-400"
        >{ch}</motion.span>
      );
      case "decrypting": return ENCRYPTED_TEXT.split("").map((ch, i) =>
        <motion.span
          key={i}
          animate={{ opacity: [1, 0, 1], scale: [1, 0.5, 1] }}
          transition={{ duration: 0.4, delay: i * 0.1, repeat: Infinity }}
          className="inline-block text-amber-400"
        >{ch}</motion.span>
      );
      case "decrypted": return PLAIN_TEXT.split("").map((ch, i) =>
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: i * 0.15 }}
          className="inline-block text-green-400"
        >{ch}</motion.span>
      );
    }
  };

  return (
    <SectionWrapper
      id="security-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Shield className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-5 md:p-7 mb-8"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              &quot;Encryption Pipeline Animation&quot; — একটি মেসেজ কীভাবে এনক্রিপ্ট ও ডিক্রিপ্ট হয়, তা নিচের এনিমেশনে দেখো!
            </p>
          </motion.div>

          {/* Encryption Pipeline */}
          <div className="relative w-full min-h-[320px] glass rounded-2xl overflow-hidden mb-6 select-none p-6">
            {/* Binary stream background */}
            <AnimatePresence>
              {binaryStream.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.15 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 overflow-hidden font-mono text-[8px] leading-tight text-cyan-400"
                >
                  {binaryStream.map((line, i) => (
                    <motion.div
                      key={i}
                      animate={{ x: [0, -20, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shield pulse effect */}
            <AnimatePresence>
              {shieldPulse && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 border-4 border-cyan-400 rounded-2xl pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
              {/* Left - Plain Text */}
              <motion.div
                animate={phase === "encrypting" ? { x: [0, -5, 0] } : {}}
                transition={{ duration: 0.8, repeat: phase === "encrypting" ? Infinity : 0 }}
                className="flex-1 text-center"
              >
                <div className="text-xs text-slate-500 mb-2">Plain Text</div>
                <motion.div
                  className="text-3xl md:text-5xl font-mono font-bold tracking-widest text-slate-200 bg-slate-800/50 rounded-xl px-6 py-4 inline-block border border-white/10"
                >
                  {getDisplayText()}
                </motion.div>
                {(phase === "idle" || phase === "encrypting") && (
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="mt-3 text-lg"
                  >
                    ↓
                  </motion.div>
                )}
              </motion.div>

              {/* Center - Encryption Tunnel */}
              <motion.div
                animate={phase === "encrypting" || phase === "decrypting" ? {
                  boxShadow: [
                    "0 0 20px rgba(56,189,248,0.3)",
                    "0 0 40px rgba(56,189,248,0.6)",
                    "0 0 20px rgba(56,189,248,0.3)",
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex-1 text-center relative"
              >
                {/* Lock / Unlock icon */}
                <motion.div
                  animate={phase === "encrypted" ? { scale: [1, 1.1, 1] } : phase === "decrypted" ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5, repeat: phase === "encrypted" ? Infinity : 0 }}
                  className="text-5xl mb-3"
                >
                  {phase === "decrypted" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <Unlock className="w-12 h-12 mx-auto text-green-400" />
                    </motion.div>
                  ) : phase === "encrypted" || phase === "decrypting" ? (
                    <Lock className="w-12 h-12 mx-auto text-red-400" />
                  ) : (
                    <Lock className="w-12 h-12 mx-auto text-slate-500" />
                  )}
                </motion.div>

                <div className="text-xs text-slate-500 mb-2">
                  {phase === "encrypting" && "Encrypting..."}
                  {phase === "encrypted" && "🔒 Encrypted"}
                  {phase === "decrypting" && "Decrypting..."}
                  {phase === "decrypted" && "✅ Decrypted"}
                  {phase === "idle" && "Encryption Tunnel"}
                </div>

                {/* Encryption pulse rings */}
                {(phase === "encrypting" || phase === "encrypted") && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 border border-cyan-400 rounded-full pointer-events-none"
                  />
                )}

                {/* Binary particles */}
                {(phase === "encrypting" || phase === "decrypting") && (
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.6, delay: i * 0.08, repeat: Infinity }}
                        className="text-[10px] font-mono text-cyan-400"
                      >
                        {Math.random() > 0.5 ? "1" : "0"}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Right - Key */}
              <motion.div className="flex-1 text-center">
                <div className="text-xs text-slate-500 mb-2">Key</div>
                <motion.div
                  onClick={handleKeyClick}
                  whileHover={phase === "encrypted" ? { scale: 1.1 } : {}}
                  whileTap={phase === "encrypted" ? { scale: 0.9 } : {}}
                  className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 cursor-pointer transition-all ${
                    phase === "encrypted"
                      ? "bg-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/20 animate-pulse"
                      : phase === "decrypting" || phase === "decrypted"
                      ? "bg-green-500/20 border-green-400/50"
                      : "bg-slate-800/50 border-white/10 cursor-not-allowed"
                  }`}
                >
                  <Key className={`w-8 h-8 md:w-10 md:h-10 ${
                    phase === "encrypted" ? "text-amber-400" :
                    phase === "decrypting" || phase === "decrypted" ? "text-green-400" :
                    "text-slate-600"
                  }`} />
                </motion.div>
                {phase === "encrypted" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-amber-400 mt-2"
                  >
                    🔑 Key টিপে ডিক্রিপ্ট করো!
                  </motion.p>
                )}
                {(phase === "decrypting" || phase === "decrypted") && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-green-400 mt-2"
                  >
                    ✅ Correct Key!
                  </motion.p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startEncryption}
              disabled={isPlaying && !isPaused}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isPlaying && !isPaused
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              <Play className="w-5 h-5" />
              <span>{isPaused ? "চালিয়ে যাও" : "Encrypt করো"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={togglePause}
              disabled={!isPlaying}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                !isPlaying
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "glass-hover text-slate-300 border border-white/10"
              }`}
            >
              <Pause className="w-5 h-5" />
              <span>{isPaused ? "চালু" : "থামাও"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSlowMo(!slowMo)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold border transition-all ${
                slowMo
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "glass-hover border-white/10 text-slate-400"
              }`}
            >
              🐢 {slowMo ? "Slow-Mo চালু" : "Slow-Mo"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetAll}
              className="px-5 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              <span>রিপ্লে</span>
            </motion.button>
          </div>

          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Binary className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">এনক্রিপশন প্রক্রিয়া</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Plain Text", status: phase === "idle" ? "ready" : phase === "encrypting" ? "processing" : "done", color: "#38bdf8" },
                { label: "Encryption", status: phase === "encrypting" ? "processing" : phase === "encrypted" || phase === "decrypting" || phase === "decrypted" ? "done" : "pending", color: "#f472b6" },
                { label: "Encrypted Data", status: phase === "encrypted" || phase === "decrypting" ? "active" : phase === "decrypted" ? "done" : "pending", color: "#ef4444" },
                { label: "Decryption", status: phase === "decrypting" ? "processing" : phase === "decrypted" ? "done" : "pending", color: "#fbbf24" },
                { label: "Decrypted Text", status: phase === "decrypted" ? "done" : "pending", color: "#34d399" },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  animate={{ opacity: step.status === "pending" ? 0.4 : 1 }}
                >
                  <motion.div
                    animate={step.status === "processing" ? { scale: [1, 1.3, 1] } : step.status === "done" ? { scale: 1 } : {}}
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      step.status === "pending" ? "bg-slate-600" :
                      step.status === "processing" ? "bg-amber-400" :
                      step.status === "active" ? "bg-red-400" :
                      "bg-green-400"
                    }`}
                    style={step.status === "done" ? { backgroundColor: step.color } : {}}
                  />
                  <span className="text-xs text-slate-300">{step.label}</span>
                  <span className="text-[9px] text-slate-500 ml-auto">
                    {step.status === "pending" && "⏳"}
                    {step.status === "processing" && "⚙️"}
                    {step.status === "active" && "🔒"}
                    {step.status === "done" && "✅"}
                    {step.status === "ready" && "📝"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
