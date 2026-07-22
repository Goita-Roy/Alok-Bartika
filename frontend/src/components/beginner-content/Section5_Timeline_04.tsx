"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, HardDrive, Zap, Flag, Trophy } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface Runner {
  x: number;
  done: boolean;
  label: string;
  color: string;
  icon: string;
}

export default function Section5_Timeline_04() {
  const [isRacing, setIsRacing] = useState(false);
  const [hddX, setHddX] = useState(0);
  const [ssdX, setSsdX] = useState(0);
  const [hddDone, setHddDone] = useState(false);
  const [ssdDone, setSsdDone] = useState(false);
  const [winner, setWinner] = useState<"hdd" | "ssd" | null>(null);

  const startRace = useCallback(() => {
    setIsRacing(true);
    setHddX(0);
    setSsdX(0);
    setHddDone(false);
    setSsdDone(false);
    setWinner(null);

    // HDD takes longer
    setTimeout(() => {
      setHddX(100);
      setHddDone(true);
      checkWinner(true, false);
    }, 4000);

    // SSD is much faster
    setTimeout(() => {
      setSsdX(100);
      setSsdDone(true);
      checkWinner(false, true);
    }, 1200);

    const interval = setInterval(() => {
      setHddX((prev) => Math.min(prev + 2.5, 100));
      setSsdX((prev) => Math.min(prev + 8.3, 100));
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setIsRacing(false);
    }, 4200);

    function checkWinner(hddFinished: boolean, ssdFinished: boolean) {
      if (ssdFinished && !hddFinished) {
        setWinner("ssd");
      } else if (hddFinished && !ssdFinished) {
        setWinner("hdd");
      } else {
        setWinner("ssd");
      }
    }
  }, []);

  const resetRace = useCallback(() => {
    setIsRacing(false);
    setHddX(0);
    setSsdX(0);
    setHddDone(false);
    setSsdDone(false);
    setWinner(null);
  }, []);

  return (
    <SectionWrapper
      id="storage-animation"
      title="অ্যানিমেশন আইডিয়া"
      icon={<HardDrive className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
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
              রেসিং ট্র্যাক অ্যানিমেশন — HDD বনাম SSD।
            </p>
          </motion.div>

          <div className="relative w-full h-72 md:h-80 glass rounded-2xl overflow-hidden mb-6">
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(52,211,153,0.3) 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }} />
            </div>

            {/* Track labels */}
            <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-center gap-8 z-10">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-400">HDD</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-400">SSD</span>
              </div>
            </div>

            {/* Finish line */}
            <div className="absolute right-12 top-0 bottom-0 w-1 flex flex-col">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i % 2 === 0 ? "bg-white/40" : "bg-transparent"}`}
                />
              ))}
            </div>
            <div className="absolute right-8 top-0 bottom-0 flex items-center">
              <Flag className="w-5 h-5 text-slate-400" />
            </div>

            {/* Track 1 - HDD */}
            <div className="absolute left-16 right-16 top-[25%] h-0.5 bg-gradient-to-r from-blue-500/20 to-blue-400/60 rounded-full" />
            <div className="absolute left-16 right-16 top-[60%] h-0.5 bg-gradient-to-r from-green-500/20 to-green-400/60 rounded-full" />

            {/* HDD Runner */}
            <motion.div
              animate={{ left: `${hddX}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="absolute top-[21%] z-20"
              style={{ left: "12%" }}
            >
              <motion.div
                animate={isRacing ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  hddDone ? "bg-blue-500/30 border-2 border-blue-400" : "glass"
                }`}>
                  <HardDrive className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                {isRacing && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-[8px] text-blue-400 mt-0.5"
                  >
                    🐢 {Math.round(hddX)}%
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* SSD Runner */}
            <motion.div
              animate={{ left: `${ssdX}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="absolute top-[56%] z-20"
              style={{ left: "12%" }}
            >
              <motion.div
                animate={isRacing ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.15, repeat: Infinity }}
                className="flex flex-col items-center"
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                  ssdDone ? "bg-green-500/30 border-2 border-green-400" : "glass"
                }`}>
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                {isRacing && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    className="text-[8px] text-green-400 mt-0.5"
                  >
                    ⚡ {Math.round(ssdX)}%
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Speed comparison overlay */}
            <AnimatePresence>
              {winner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30"
                >
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="glass rounded-2xl p-6 text-center"
                  >
                    <Trophy className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                    <p className="text-lg font-bold text-green-400">
                      🏆 SSD জিতেছে!
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {winner === "ssd" ? "SSD প্রায় ৩ গুণ দ্রুত ফাইল লোড করেছে!" : ""}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div className="glass rounded-lg p-2">
                        <p className="text-blue-400 font-bold">HDD</p>
                        <p className="text-slate-500">{Math.round(hddX)}%</p>
                      </div>
                      <div className="glass rounded-lg p-2">
                        <p className="text-green-400 font-bold">SSD</p>
                        <p className="text-slate-500">{Math.round(ssdX)}%</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRace}
              disabled={isRacing}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isRacing
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-lg shadow-green-500/25"
              }`}
            >
              <Play className="w-5 h-5" />
              <span>Load File</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetRace}
              className="px-6 py-3 rounded-xl glass-hover flex items-center gap-2 text-slate-300 border border-white/10"
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
