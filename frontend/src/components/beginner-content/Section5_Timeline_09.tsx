"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, RotateCcw, Play, Pause, Send, MapPin, Cable, Server, Signal, Clock, ArrowRight, Zap } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface LatencyPoint {
  label: string;
  ms: number;
}

const travelPoints: LatencyPoint[] = [
  { label: "বাংলাদেশ", ms: 0 },
  { label: "সাবমেরিন কেবল", ms: 45 },
  { label: "সমুদ্র তলদেশ", ms: 120 },
  { label: "সার্ভার (USA)", ms: 210 },
  { label: "রেসপন্স প্যাকেট", ms: 290 },
  { label: "বাংলাদেশ", ms: 380 },
];

const routeStations = [
  { id: "start", label: "🇧🇩 বাংলাদেশ", icon: "🇧🇩", color: "#38bdf8", x: "15%", y: "70%" },
  { id: "cable", label: "🌊 সাবমেরিন কেবল", icon: "🌊", color: "#c084fc", x: "38%", y: "55%" },
  { id: "ocean", label: "🌊 সমুদ্র তলদেশ", icon: "🐟", color: "#f472b6", x: "58%", y: "50%" },
  { id: "server", label: "🏢 সার্ভার (USA)", icon: "🏢", color: "#34d399", x: "78%", y: "35%" },
];

export default function Section5_Timeline_09() {
  const [step, setStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [latency, setLatency] = useState(0);
  const [packetX, setPacketX] = useState(15);
  const [packetY, setPacketY] = useState(70);
  const intervalRef = useRef<number | null>(null);
  const pauseRef = useRef(false);

  const resetAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setStep(-1);
    setLatency(0);
    setPacketX(15);
    setPacketY(70);
    pauseRef.current = false;
  }, []);

  const playFlow = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      pauseRef.current = false;
      return;
    }
    resetAll();
    setIsPlaying(true);
    setStep(0);

    let currentStep = 0;
    const totalSteps = travelPoints.length;
    const waypoints = [
      { x: 15, y: 70 },
      { x: 38, y: 55 },
      { x: 58, y: 50 },
      { x: 78, y: 35 },
      { x: 58, y: 50 },
      { x: 15, y: 70 },
    ];

    intervalRef.current = setInterval(() => {
      if (pauseRef.current) return;
      currentStep++;
      if (currentStep >= totalSteps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsPlaying(false);
        setStep(-1);
        return;
      }
      setStep(currentStep);
      setLatency(travelPoints[currentStep].ms);
      if (currentStep < waypoints.length) {
        setPacketX(waypoints[currentStep].x);
        setPacketY(waypoints[currentStep].y);
      }
    }, 1500);
  }, [isPaused, resetAll]);

  const togglePause = useCallback(() => {
    if (isPlaying && !isPaused) {
      setIsPaused(true);
      pauseRef.current = true;
    } else if (isPaused) {
      setIsPaused(false);
      pauseRef.current = false;
    }
  }, [isPlaying, isPaused]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getActiveStation = () => {
    if (step < 0) return null;
    if (step < routeStations.length) return routeStations[step];
    const returnStep = travelPoints.length - 1 - step + routeStations.length - 1;
    if (returnStep >= 0 && returnStep < routeStations.length) return routeStations[returnStep];
    return null;
  };

  const activeStation = getActiveStation();

  return (
    <SectionWrapper
      id="internet-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Globe className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-5 md:p-7 mb-8"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              &quot;Global Data Packet Tracker&quot; — বাংলাদেশ থেকে সাবমেরিন কেবল হয়ে USA-র সার্ভারে ডেটা প্যাকেটের যাত্রা। নিচের এনিমেশন দেখলেই বুঝবে!
            </p>
          </motion.div>

          {/* Map Canvas */}
          <div className="relative w-full h-80 md:h-96 glass rounded-2xl overflow-hidden mb-6 select-none">
            {/* World map dots pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(56,189,248,0.4) 1px, transparent 0)`,
                backgroundSize: "30px 30px",
              }} />
            </div>

            {/* Ocean floor visual */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-900/20 to-transparent" />

            {/* Route line (cable path) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d="M 15 70 Q 30 60 38 55 Q 50 50 58 50 Q 70 40 78 35"
                fill="none"
                stroke={isPlaying ? "#38bdf8" : "rgba(56,189,248,0.3)"}
                strokeWidth="0.5"
                strokeDasharray="2,2"
                className="transition-colors duration-500"
              />
              <path
                d="M 78 35 Q 70 40 58 50 Q 50 50 38 55 Q 30 60 15 70"
                fill="none"
                stroke={step >= 4 ? "#34d399" : "rgba(52,211,153,0.3)"}
                strokeWidth="0.5"
                strokeDasharray="2,2"
                className="transition-colors duration-500"
              />
            </svg>

            {/* Route stations */}
            {routeStations.map((station, i) => {
              const isActive = step === i || (step >= 4 && step < travelPoints.length && i === travelPoints.length - 1 - step + routeStations.length - 1);
              return (
                <motion.div
                  key={station.id}
                  className="absolute"
                  style={{ left: station.x, top: station.y, transform: "translate(-50%, -50%)" }}
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 glass rounded-xl flex items-center justify-center text-lg md:text-xl border-2 transition-all ${
                      isActive ? "border-cyan-400/50 shadow-lg shadow-cyan-500/20" : "border-white/10"
                    }`}
                  >
                    {station.icon}
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 whitespace-nowrap">
                    {station.label}
                  </span>
                </motion.div>
              );
            })}

            {/* Animated Data Packet */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  className="absolute z-10 pointer-events-none"
                  style={{
                    left: `${packetX}%`,
                    top: `${packetY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  animate={{
                    x: [0, 3, 0, -3, 0],
                    y: [0, -2, 0, 2, 0],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="relative"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40">
                      <span className="text-sm">📦</span>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-cyan-400 rounded-full -z-10"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bangladesh label */}
            <div className="absolute top-[60%] left-[8%]">
              <span className="text-[10px] text-slate-600 font-semibold">🌏 বাংলাদেশ</span>
            </div>

            {/* USA label */}
            <div className="absolute top-[25%] right-[10%]">
              <span className="text-[10px] text-slate-600 font-semibold">🇺🇸 USA</span>
            </div>

            {/* Latency counter */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-3 glass rounded-full px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">{latency}ms</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active station status */}
            <AnimatePresence>
              {isPlaying && activeStation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
                >
                  <span className="text-[10px] text-slate-400">
                    {step < routeStations.length ? "📤 যাচ্ছে..." : "📥 ফিরছে..."} {activeStation.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playFlow}
              disabled={isPlaying && !isPaused}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isPlaying && !isPaused
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
              }`}
            >
              <Send className="w-5 h-5" />
              <span>{isPaused ? "চালিয়ে যাও" : "Send Request"}</span>
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
              onClick={resetAll}
              className="px-5 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              <span>রিপ্লে</span>
            </motion.button>
          </div>

          {/* Journey Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Signal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-400">ডেটা প্যাকেট যাত্রাপথ</span>
            </div>
            <div className="relative">
              {travelPoints.map((point, i) => {
                const isActive = step >= i;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 mb-2 last:mb-0"
                    animate={{ opacity: isActive ? 1 : 0.4 }}
                  >
                    <motion.div
                      animate={step === i ? { scale: [1, 1.3, 1] } : {}}
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isActive ? "bg-cyan-400" : "bg-slate-600"
                      }`}
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-xs text-slate-300">{point.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{point.ms}ms</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
