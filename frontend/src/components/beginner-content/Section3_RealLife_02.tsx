"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Crosshair, Zap, Target, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const gameSteps = [
  { label: "বাটনে ক্লিক", icon: "👆", color: "#38bdf8" },
  { label: "CPU হিসাব", icon: "🧠", color: "#c084fc" },
  { label: "বুলেট পথ", icon: "💨", color: "#f472b6" },
  { label: "স্ক্রিনে অ্যানিমেশন", icon: "🎯", color: "#34d399" },
];

export default function Section3_RealLife_02() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);

  const handleShoot = useCallback(() => {
    setIsShooting(true);
    setActiveStep(0);
    gameSteps.forEach((_, i) => {
      setTimeout(() => setActiveStep(i), i * 400);
    });
    setTimeout(() => {
      setIsShooting(false);
      setActiveStep(null);
    }, 2000);
  }, []);

  return (
    <SectionWrapper
      id="cpu-real-life"
      title="রিয়েল-লাইফ অ্যাপ্লাই"
      icon={<Gamepad2 className="w-5 h-5" />}
    >
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Left: Story & Game Interaction */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden order-2 md:order-1"
        >
          <motion.p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10">
            তুমি যখন কোনো মোবাইল গেমে (যেমন: Free Fire বা PUBG) শুট করার জন্য বাটনে ক্লিক করো, তখন CPU মিলিসেকেন্ডের মধ্যে হিসাব করে যে—বুলেটটি কোন দিকে যাবে, শত্রুর গায়ে লাগবে কি না, এবং স্ক্রিনে কী অ্যানিমেশন দেখাতে হবে।
          </motion.p>

          <motion.p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300 mt-4 relative z-10">
            CPU না থাকলে গেমের ক্যারেক্টার এক পা-ও নড়তে পারত না।
          </motion.p>

          {/* Shoot Button */}
          <motion.div className="mt-6 flex justify-center relative z-10">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleShoot}
              disabled={isShooting}
              className={`relative px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 ${
                isShooting
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-red-500/25"
              }`}
            >
              <Crosshair className="w-6 h-6" />
              <span>{isShooting ? "প্রসেসিং..." : "শুট করো!"}</span>
            </motion.button>
          </motion.div>

          {/* CPU Processing Steps */}
          <div className="mt-6 space-y-2 relative z-10">
            {gameSteps.map((step, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: activeStep !== null && activeStep >= i ? 1 : 0.3,
                  x: activeStep === i ? 8 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-sm"
              >
                <motion.div
                  animate={activeStep === i ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4, repeat: activeStep === i ? 3 : 0 }}
                >
                  <span className="text-lg">{step.icon}</span>
                </motion.div>
                <span style={{ color: step.color }} className="font-medium">{step.label}</span>
                {activeStep !== null && activeStep >= i && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-400 text-xs"
                  >
                    ✅
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Game Visual */}
        <div className="order-1 md:order-2 flex flex-col gap-6">
          {/* Game Screen Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-64 h-80 md:w-72 md:h-88"
            >
              {/* Phone/Gaming Device Body */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] border-2 border-slate-600 shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-2 bg-gradient-to-b from-indigo-900/60 to-purple-900/60 rounded-[2rem] overflow-hidden">
                  {/* Crosshair */}
                  <motion.div
                    animate={isShooting ? { scale: [1, 0.8, 1.5, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Target className="w-12 h-12 text-red-400/60" />
                  </motion.div>

                  {/* Bullet animation */}
                  <AnimatePresence>
                    {isShooting && (
                      <motion.div
                        initial={{ x: -100, y: 0, opacity: 1 }}
                        animate={{ x: 100, y: -20, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute top-1/2 left-1/4 text-xl"
                      >
                        💨
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CPU Processing Indicator */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass rounded-lg px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span className="text-slate-400">CPU:</span>
                        <motion.span
                          animate={isShooting ? { opacity: [1, 0.2, 1] } : {}}
                          transition={{ duration: 0.3, repeat: isShooting ? Infinity : 0 }}
                          className="text-purple-300"
                        >
                          {isShooting ? "প্রসেসিং..." : "স্ট্যান্ডবাই"}
                        </motion.span>
                      </div>
                      {/* Mini progress */}
                      <div className="mt-1 h-1 rounded-full bg-slate-700 overflow-hidden">
                        <motion.div
                          animate={isShooting ? { width: ["0%", "100%"] } : { width: "0%" }}
                          transition={{ duration: 0.8, repeat: isShooting ? 2 : 0 }}
                          className="h-full rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">CPU গতি</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                CPU মিলিসেকেন্ডের মধ্যে লক্ষ লক্ষ হিসাব সম্পন্ন করতে পারে!
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { val: "২-৪ GHz", label: "গতি" },
                  { val: "বিলিয়ন/সে", label: "অপারেশন" },
                  { val: "ন্যানোসেকেন্ড", label: "প্রতিক্রিয়া" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="glass rounded-lg p-2"
                  >
                    <p className="text-xs font-bold text-cyan-300">{stat.val}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
