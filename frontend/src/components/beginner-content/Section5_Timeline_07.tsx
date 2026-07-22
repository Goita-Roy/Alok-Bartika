"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Layers, RotateCcw, MousePointer2, Eye, ArrowUp } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const layers = [
  {
    id: "user",
    label: "ব্যবহারকারী",
    icon: "👤",
    color: "#fbbf24",
    desc: "তুমি — যে কম্পিউটার ব্যবহার করো",
    bg: "from-amber-500/20 to-yellow-500/10",
    border: "border-amber-500/30",
    text: "text-amber-300",
  },
  {
    id: "app",
    label: "অ্যাপ্লিকেশন সফটওয়্যার",
    icon: "📱",
    color: "#c084fc",
    desc: "VS Code, Chrome, গেম, Photoshop",
    bg: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    text: "text-purple-300",
  },
  {
    id: "os",
    label: "অপারেটিং সিস্টেম",
    icon: "🖥️",
    color: "#38bdf8",
    desc: "Windows, macOS, Linux",
    bg: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30",
    text: "text-blue-300",
  },
  {
    id: "hw",
    label: "হার্ডওয়্যার",
    icon: "⚙️",
    color: "#34d399",
    desc: "CPU, RAM, Storage, GPU",
    bg: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/30",
    text: "text-green-300",
  },
];

export default function Section5_Timeline_07() {
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || isAutoRotating) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(y * -20);
    setRotateY(x * 20);
  }, [isAutoRotating]);

  const handleMouseEnter = useCallback(() => {
    setIsInteracting(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsInteracting(false);
    if (!isAutoRotating) {
      setRotateX(0);
      setRotateY(0);
    }
  }, [isAutoRotating]);

  const handleAutoRotate = useCallback(() => {
    setIsAutoRotating(true);
    let angle = 0;
    const interval = setInterval(() => {
      angle += 2;
      setRotateY(Math.sin(angle * Math.PI / 180) * 25);
      setRotateX(Math.cos(angle * Math.PI / 180) * 10);
    }, 50);
    setTimeout(() => {
      clearInterval(interval);
      setIsAutoRotating(false);
      setRotateX(0);
      setRotateY(0);
    }, 4000);
  }, []);

  const handleReset = useCallback(() => {
    setIsAutoRotating(false);
    setRotateX(0);
    setRotateY(0);
    setActiveLayer(null);
  }, []);

  return (
    <SectionWrapper
      id="software-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Monitor className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
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
              ৩D লেয়ার অ্যানিমেশন — সফটওয়্যারের বিভিন্ন স্তর (লেয়ার) দেখার জন্য মাউস ঘোরাও বা অটো-রোটেট চাপো। প্রতিটি লেয়ারে ক্লিক করে বিস্তারিত জানো!
            </p>
          </motion.div>

          {/* 3D Layer Canvas */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-80 md:h-96 glass rounded-2xl overflow-hidden mb-6 cursor-grab active:cursor-grabbing select-none"
            style={{ perspective: "1000px" }}
          >
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                rotateX: rotateX,
                rotateY: rotateY,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="relative w-64 h-72 md:w-80 md:h-80" style={{ transformStyle: "preserve-3d" }}>
                {layers.map((layer, i) => {
                  const zOffset = (layers.length - 1 - i) * 30;
                  const isActive = activeLayer === i;
                  return (
                    <motion.div
                      key={layer.id}
                      onClick={() => setActiveLayer(isActive ? null : i)}
                      className={`absolute inset-0 glass rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer border-2 transition-all ${layer.border} ${layer.bg}`}
                      style={{
                        transform: `translateZ(${zOffset}px)`,
                        transformStyle: "preserve-3d",
                      }}
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        z: isActive ? zOffset + 20 : zOffset,
                      }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <motion.span
                        className="text-4xl md:text-5xl mb-2"
                        animate={isActive ? { y: [0, -5, 0] } : {}}
                        transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                      >
                        {layer.icon}
                      </motion.span>
                      <span className={`text-sm md:text-base font-bold ${layer.text}`}>
                        {layer.label}
                      </span>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2"
                          >
                            <p className="text-[10px] md:text-xs text-slate-400 text-center">
                              {layer.desc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!isActive && !isInteracting && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-slate-600 mt-1"
                        >
                          ক্লিক করুন
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="absolute top-3 left-3 glass rounded-full px-3 py-1">
              <Layers className="w-3 h-3 inline text-cyan-300 mr-1" />
              <span className="text-[10px] font-medium text-cyan-300">
                3D লেয়ার ভিউ
              </span>
            </div>

            <AnimatePresence>
              {!isInteracting && !isAutoRotating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
                >
                  <MousePointer2 className="w-3 h-3 inline text-slate-400 mr-1" />
                  <span className="text-[10px] text-slate-500">মাউস ঘুরিয়ে ৩D দেখো</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isAutoRotating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
              >
                <Eye className="w-3 h-3 inline text-green-400 mr-1" />
                <span className="text-[10px] text-green-300">অটো-রোটেট চলছে!</span>
              </motion.div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAutoRotate}
              disabled={isAutoRotating}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isAutoRotating
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>{isAutoRotating ? "ঘুরছে..." : "অটো রোটেট"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-5 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              <span>রিসেট</span>
            </motion.button>
          </div>

          {/* Layer legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            {layers.map((layer, i) => (
              <motion.div
                key={layer.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveLayer(activeLayer === i ? null : i)}
                className={`glass rounded-xl p-3 text-center cursor-pointer border ${layer.border} ${
                  activeLayer === i ? "ring-2 ring-white/20" : ""
                }`}
              >
                <span className="text-xl block mb-1">{layer.icon}</span>
                <span className={`text-[10px] font-semibold ${layer.text}`}>{layer.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
