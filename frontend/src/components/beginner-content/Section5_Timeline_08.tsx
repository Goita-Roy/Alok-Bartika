"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, RotateCcw, Play, Pause, Bell, ArrowRight, Cpu, MemoryStick, HardDrive, Keyboard, Mouse, AppWindow } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface ResourceWidget {
  id: string;
  label: string;
  icon: string;
  color: string;
  usage: number;
}

const resources: ResourceWidget[] = [
  { id: "cpu", label: "CPU", icon: "⚡", color: "#38bdf8", usage: 0 },
  { id: "ram", label: "RAM", icon: "🧠", color: "#c084fc", usage: 0 },
  { id: "storage", label: "Storage", icon: "💾", color: "#34d399", usage: 0 },
];

const peripheralIcons = [
  { id: "kb", Icon: Keyboard, label: "Keyboard", color: "#f472b6" },
  { id: "mouse", Icon: Mouse, label: "Mouse", color: "#fbbf24" },
  { id: "apps", Icon: AppWindow, label: "Applications", color: "#818cf8" },
];

const flowSteps = [
  { from: "peripheral", to: "os", label: "রিকোয়েস্ট আসছে..." },
  { from: "os", to: "cpu", label: "CPU তে পাঠানো হচ্ছে" },
  { from: "os", to: "ram", label: "RAM বরাদ্দ করা হচ্ছে" },
  { from: "os", to: "storage", label: "Storage এ সংরক্ষণ" },
  { from: "peripheral", to: "os", label: "রেজাল্ট ফিরিয়ে আনা" },
];

export default function Section5_Timeline_08() {
  const [step, setStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [bellRings, setBellRings] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, number>>({ cpu: 0, ram: 0, storage: 0 });
  const intervalRef = useRef<number | null>(null);
  const pauseRef = useRef(false);

  const resetAll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setStep(-1);
    setBellRings(false);
    setAllocations({ cpu: 0, ram: 0, storage: 0 });
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
    setBellRings(true);
    setTimeout(() => setBellRings(false), 800);

    let currentStep = 0;
    const totalSteps = flowSteps.length;

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
      if (currentStep === 1) {
        setBellRings(true);
        setTimeout(() => setBellRings(false), 600);
      }
      setAllocations((prev) => {
        const next = { ...prev };
        if (currentStep === 1) next.cpu = Math.min(100, next.cpu + 35);
        if (currentStep === 2) next.ram = Math.min(100, next.ram + 45);
        if (currentStep === 3) next.storage = Math.min(100, next.storage + 30);
        return next;
      });
    }, 1800);
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

  const getActiveFlow = () => {
    if (step < 0) return null;
    return flowSteps[step];
  };

  const activeFlow = getActiveFlow();

  return (
    <SectionWrapper
      id="os-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Monitor className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass rounded-2xl p-5 md:p-7 mb-8"
          >
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              &quot;The Royal Manager&quot; — একটি অফিস এনভায়রনমেন্ট যেখানে OS-ম্যানেজার CPU, RAM, Storage-এ কাজ বন্টন করে। নিচের এনিমেশন দেখলেই বুঝবে!
            </p>
          </motion.div>

          {/* Animation Canvas */}
          <div className="relative w-full h-80 md:h-96 glass rounded-2xl overflow-hidden mb-6 select-none">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(56,189,248,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            {/* Center - OS Manager */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  scale: isPlaying ? [1, 1.05, 1] : 1,
                }}
                transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0 }}
                className="relative"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 glass rounded-2xl flex items-center justify-center text-3xl md:text-4xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20">
                  🖥️
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-semibold whitespace-nowrap">
                  OS Manager
                </span>
              </motion.div>
            </div>

            {/* Peripheral devices - Left side */}
            {peripheralIcons.map((p, i) => {
              const positions = [
                { top: "15%", left: "8%" },
                { top: "40%", left: "5%" },
                { top: "65%", left: "8%" },
              ];
              const pos = positions[i];
              const isActive = activeFlow?.from === "peripheral" || (step >= 0 && i === step % 3);
              return (
                <motion.div
                  key={p.id}
                  className="absolute"
                  style={{ top: pos.top, left: pos.left }}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 glass rounded-xl flex items-center justify-center border border-white/10">
                    <p.Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: p.color }} />
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 whitespace-nowrap">{p.label}</span>
                </motion.div>
              );
            })}

            {/* Resource nodes - Right side */}
            {resources.map((r, i) => {
              const positions = [
                { top: "15%", right: "8%" },
                { top: "40%", right: "5%" },
                { top: "65%", right: "8%" },
              ];
              const pos = positions[i];
              const isActive = activeFlow?.to === r.id || (step > 0 && (step - 1) === i);
              return (
                <motion.div
                  key={r.id}
                  className="absolute"
                  style={{ top: pos.top, right: pos.right }}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
                >
                  <motion.div
                    className="w-12 h-12 md:w-14 md:h-14 glass rounded-xl flex items-center justify-center border border-white/10"
                    animate={isActive ? { borderColor: r.color } : {}}
                  >
                    <span className="text-xl md:text-2xl">{r.icon}</span>
                  </motion.div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-slate-500 whitespace-nowrap">{r.label}</span>
                </motion.div>
              );
            })}

            {/* Animated flow arrows */}
            <AnimatePresence>
              {activeFlow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex flex-col items-center"
                  >
                    <ArrowRight className="w-5 h-5 text-cyan-400" />
                    <span className="text-[10px] text-cyan-400/80 mt-1 whitespace-nowrap">{activeFlow.label}</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bell animation */}
            <AnimatePresence>
              {bellRings && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: [0, -20, 20, -10, 10, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-3 right-3"
                >
                  <Bell className="w-6 h-6 text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flow status badge */}
            <AnimatePresence>
              {isPlaying && activeFlow && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
                >
                  <span className="text-[10px] text-slate-400">{activeFlow.label}</span>
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
              <Play className="w-5 h-5" />
              <span>{isPaused ? "চালিয়ে যাও" : "এনিমেশন শুরু করো"}</span>
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
              <span>রিসেট</span>
            </motion.button>
          </div>

          {/* Live Resource Meters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {resources.map((r) => (
              <motion.div
                key={r.id}
                className="glass rounded-xl p-4"
                animate={{ borderColor: allocations[r.id] > 0 ? r.color : "rgba(255,255,255,0.1)" }}
                style={{ borderWidth: 1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.icon}</span>
                    <span className="text-xs font-medium text-slate-400">{r.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: r.color }}>
                    {allocations[r.id]}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: r.color }}
                    animate={{ width: `${allocations[r.id]}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
