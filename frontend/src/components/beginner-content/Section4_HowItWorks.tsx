"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Keyboard, Cpu, Monitor, HardDrive, 
  ArrowDown, Play, RotateCcw, ChevronRight 
} from "lucide-react";
import SectionWrapper from "./SectionWrapper";

interface Step {
  id: string;
  title: string;
  icon: typeof Keyboard;
  color: string;
  gradient: string;
  description: string;
  input: string;
  output: string;
}

const steps: Step[] = [
  {
    id: "input",
    title: "ইনপুট (Input)",
    icon: Keyboard,
    color: "#38bdf8",
    gradient: "from-blue-500/20 to-blue-600/10",
    description: "তুমি কিবোর্ডে চাপলে $2 + 2$",
    input: "2 + 2",
    output: "কিবোর্ড ইনপুট",
  },
  {
    id: "process",
    title: "প্রসেস (Process)",
    icon: Cpu,
    color: "#c084fc",
    gradient: "from-purple-500/20 to-purple-600/10",
    description: "কম্পিউটারের প্রসেসর হিসাব করল $2 + 2 = 4$",
    input: "2 + 2",
    output: "4",
  },
  {
    id: "output",
    title: "আউটপুট (Output)",
    icon: Monitor,
    color: "#34d399",
    gradient: "from-green-500/20 to-green-600/10",
    description: "স্ক্রিনে ভেসে উঠল $4$",
    input: "4 (ডেটা)",
    output: "স্ক্রিনে 4",
  },
  {
    id: "storage",
    title: "স্টোরেজ (Storage)",
    icon: HardDrive,
    color: "#f472b6",
    gradient: "from-pink-500/20 to-pink-600/10",
    description: "তুমি চাইলে এই হিসাবটি মেমোরিতে সেভ করে রাখতে পারো।",
    input: "4 (ফলাফল)",
    output: "মেমোরিতে সংরক্ষিত",
  },
];

export default function Section4_HowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);

  const startSimulation = useCallback(() => {
    setIsPlaying(true);
    setShowCalculation(false);
    setActiveStep(-1);

    steps.forEach((_, i) => {
      setTimeout(() => {
        setActiveStep(i);
        if (i === 1) {
          setTimeout(() => setShowCalculation(true), 400);
        }
        if (i === steps.length - 1) {
          setTimeout(() => setIsPlaying(false), 600);
        }
      }, i * 1200);
    });
  }, []);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setActiveStep(-1);
    setShowCalculation(false);
  }, []);

  return (
    <SectionWrapper
      id="how-it-works"
      title="যেভাবে কাজ করে"
      icon={<Cpu className="w-5 h-5" />}
    >
      <div className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <p className="text-base md:text-lg text-slate-300 mb-8 text-center">
            কম্পিউটারের কাজের মূল ধারাটি ৪টি ধাপে সম্পন্ন হয়:
          </p>

          {/* Step Flow */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2 justify-center mb-10">
            {steps.map((step, i) => (
              <div key={step.id} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                <motion.div
                  animate={{
                    scale: activeStep === i ? 1.05 : 1,
                    borderColor: activeStep >= i ? step.color : "rgba(255,255,255,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                  className={`glass rounded-xl p-4 md:p-5 w-full md:w-48 text-center border transition-all ${
                    activeStep >= i ? "bg-white/5" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    animate={activeStep === i ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 0.8 }}
                    className="flex justify-center mb-2"
                  >
                    <step.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: step.color }} />
                  </motion.div>

                  <h4 className="text-sm font-semibold mb-1" style={{ color: step.color }}>
                    {step.title}
                  </h4>

                  <AnimatePresence>
                    {activeStep >= i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-slate-400 mt-1 overflow-hidden"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {activeStep === i && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2"
                    >
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-2 h-2 rounded-full mx-auto"
                        style={{ backgroundColor: step.color }}
                      />
                    </motion.div>
                  )}
                </motion.div>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <motion.div
                    animate={activeStep > i ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 1, repeat: activeStep > i ? Infinity : 0 }}
                    className="flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
                    <ArrowDown className="w-5 h-5 text-slate-600 md:hidden" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {/* Live Calculation Display */}
          <motion.div
            animate={{ opacity: showCalculation ? 1 : 0.3 }}
            className="glass bg-black/20 rounded-xl p-6 mb-8 text-center"
          >
            <div className="flex items-center justify-center gap-4 text-2xl md:text-3xl font-mono">
              <motion.span
                animate={showCalculation ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: showCalculation ? Infinity : 0, repeatDelay: 1 }}
                className="text-blue-400"
              >
                2
              </motion.span>
              <motion.span
                animate={showCalculation ? { rotate: [0, 180, 360] } : {}}
                transition={{ duration: 0.8, repeat: showCalculation ? Infinity : 0 }}
                className="text-purple-400"
              >
                +
              </motion.span>
              <motion.span
                animate={showCalculation ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: showCalculation ? Infinity : 0, repeatDelay: 0.5 }}
                className="text-blue-400"
              >
                2
              </motion.span>
              <motion.span
                animate={showCalculation ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: showCalculation ? Infinity : 0 }}
                className="text-green-400"
              >
                =
              </motion.span>
              <motion.span
                initial={{ scale: 0 }}
                animate={showCalculation ? { scale: [0, 1.2, 1] } : {}}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-emerald-400 font-bold"
              >
                4
              </motion.span>
            </div>
          </motion.div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSimulation}
              disabled={isPlaying}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold ${
                isPlaying
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25"
              }`}
            >
              <Play className="w-5 h-5" />
              <span>সিমুলেশন শুরু</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSimulation}
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
