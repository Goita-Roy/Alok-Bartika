"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, MousePointer2, Monitor, Eye } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface Pixel {
  id: number;
  x: number;
  y: number;
  color: string;
}

const generatePixels = (count: number): Pixel[] => {
  const pixels: Pixel[] = [];
  const colors = ["#ff0000", "#00ff00", "#0000ff"];
  for (let i = 0; i < count; i++) {
    pixels.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * 3)],
    });
  }
  return pixels;
};

export default function Section5_Timeline_06() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showPixels, setShowPixels] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    setPixels(generatePixels(300));
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const newZoom = Math.max(1, Math.min(4, zoomLevel + delta));
    setZoomLevel(newZoom);
    setIsZoomed(newZoom > 1.5);
    setShowPixels(newZoom > 2);
  }, [zoomLevel]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(4, zoomLevel + 0.5);
    setZoomLevel(newZoom);
    setIsZoomed(newZoom > 1.5);
    setShowPixels(newZoom > 2);
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(1, zoomLevel - 0.5);
    setZoomLevel(newZoom);
    setIsZoomed(newZoom > 1.5);
    setShowPixels(newZoom > 2);
  }, [zoomLevel]);

  const handleReset = useCallback(() => {
    setZoomLevel(1);
    setIsZoomed(false);
    setShowPixels(false);
    setIsAutoPlaying(false);
  }, []);

  const handleAutoPlay = useCallback(() => {
    setIsAutoPlaying(true);
    setZoomLevel(1);
    setIsZoomed(false);
    setShowPixels(false);

    setTimeout(() => {
      setZoomLevel(1.8);
      setIsZoomed(true);
    }, 500);

    setTimeout(() => {
      setZoomLevel(3.5);
      setShowPixels(true);
    }, 1500);

    setTimeout(() => {
      setZoomLevel(1);
      setIsZoomed(false);
      setShowPixels(false);
      setIsAutoPlaying(false);
    }, 3000);
  }, []);

  const catSvg = (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="catGrad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
      {/* Cat head */}
      <circle cx="100" cy="100" r="70" fill="url(#catGrad)" />
      {/* Ears */}
      <polygon points="45,55 55,25 70,50" fill="#f59e0b" />
      <polygon points="155,55 145,25 130,50" fill="#f59e0b" />
      <polygon points="50,52 58,32 68,50" fill="#fbbf24" />
      <polygon points="150,52 142,32 132,50" fill="#fbbf24" />
      {/* Eyes */}
      <ellipse cx="75" cy="90" rx="10" ry="12" fill="#1e293b" />
      <ellipse cx="125" cy="90" rx="10" ry="12" fill="#1e293b" />
      <ellipse cx="77" cy="88" rx="4" ry="5" fill="#38bdf8" />
      <ellipse cx="127" cy="88" rx="4" ry="5" fill="#38bdf8" />
      {/* Nose */}
      <polygon points="100,105 95,112 105,112" fill="#f472b6" />
      {/* Mouth */}
      <path d="M95,112 Q100,120 105,112" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M85,115 Q95,122 100,115" fill="none" stroke="#1e293b" strokeWidth="1" />
      <path d="M115,115 Q105,122 100,115" fill="none" stroke="#1e293b" strokeWidth="1" />
      {/* Whiskers */}
      <line x1="40" y1="98" x2="75" y2="105" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="108" x2="75" y2="110" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <line x1="160" y1="98" x2="125" y2="105" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
      <line x1="162" y1="108" x2="125" y2="110" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  return (
    <SectionWrapper
      id="output-animation"
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
              পিক্সেল জুম অ্যানিমেশন — মাউস হুইল বা পিঞ্চ জেসচার ব্যবহার করে ইমেজের ভেতরে জুম করো এবং RGB পিক্সেল দেখো।
            </p>
          </motion.div>

          {/* Pixel Zoom Canvas */}
          <div
            ref={containerRef}
            onWheel={handleWheel}
            className="relative w-full h-72 md:h-80 glass rounded-2xl overflow-hidden mb-6 cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: "none" }}
          >
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(192,132,252,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            {/* Zoom container */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: zoomLevel }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                {/* Cat Image */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: showPixels ? 0 : 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {catSvg}
                </motion.div>

                {/* RGB Pixels overlay */}
                <AnimatePresence>
                  {showPixels && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <div className="w-full h-full" style={{
                        background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px),
                                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
                      }} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="grid grid-cols-8 gap-0.5">
                          {Array.from({ length: 64 }).map((_, i) => {
                            const r = Math.floor(Math.random() * 256);
                            const g = Math.floor(Math.random() * 256);
                            const b = Math.floor(Math.random() * 256);
                            return (
                              <motion.div
                                key={i}
                                className="w-3 h-3 md:w-4 md:h-4 rounded-sm"
                                style={{
                                  backgroundColor: `rgb(${r},${g},${b})`,
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, opacity: [0.7, 1, 0.7] }}
                                transition={{
                                  duration: 1.5,
                                  delay: i * 0.02,
                                  repeat: Infinity,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Zoom level indicator */}
            <div className="absolute top-3 left-3 glass rounded-full px-3 py-1">
              <span className="text-xs font-medium text-cyan-300">
                {(zoomLevel * 100).toFixed(0)}% জুম
              </span>
            </div>

            {/* Info labels */}
            <AnimatePresence>
              {!showPixels && !isZoomed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
                >
                  <MousePointer2 className="w-3 h-3 inline text-slate-400 mr-1" />
                  <span className="text-[10px] text-slate-500">জুম করতে মাউস হুইল ব্যবহার করো</span>
                </motion.div>
              )}
            </AnimatePresence>

            {showPixels && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-1.5"
              >
                <Eye className="w-3 h-3 inline text-green-400 mr-1" />
                <span className="text-[10px] text-green-300">RGB পিক্সেল দৃশ্যমান!</span>
              </motion.div>
            )}

            {/* RGB sub-pixel indicators */}
            <AnimatePresence>
              {showPixels && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-3 right-3 glass rounded-xl px-3 py-2"
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span className="text-[8px] text-red-400">R</span>
                    <div className="w-3 h-3 rounded-sm bg-green-500" />
                    <span className="text-[8px] text-green-400">G</span>
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-[8px] text-blue-400">B</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4 || isAutoPlaying}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                zoomLevel >= 4 || isAutoPlaying
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/25"
              }`}
            >
              <ZoomIn className="w-5 h-5" />
              <span>জুম ইন</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1 || isAutoPlaying}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                zoomLevel <= 1 || isAutoPlaying
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
              }`}
            >
              <ZoomOut className="w-5 h-5" />
              <span>জুম আউট</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAutoPlay}
              disabled={isAutoPlaying}
              className={`px-5 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isAutoPlaying
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
              }`}
            >
              <ZoomIn className="w-5 h-5" />
              <span>{isAutoPlaying ? "চলছে..." : "অটো জুম"}</span>
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
        </div>
      </div>
    </SectionWrapper>
  );
}
