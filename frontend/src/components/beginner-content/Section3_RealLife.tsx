"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Smartphone, Play, Rocket, Sparkles, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const apps = [
  { name: "অ্যালার্ম", icon: "⏰", color: "#38bdf8", desc: "সকালে ঘুম থেকে উঠে" },
  { name: "ইউটিউব", icon: "▶️", color: "#ef4444", desc: "ভিডিও দেখা" },
  { name: "পরীক্ষার রেজাল্ট", icon: "📊", color: "#34d399", desc: "অনলাইনে চেক" },
];

export default function Section3_RealLife() {
  const [activeApp, setActiveApp] = useState<number | null>(null);

  return (
    <SectionWrapper
      id="real-life"
      title="রিয়েল-লাইফ অ্যাপ্লাই"
      icon={<Globe className="w-5 h-5" />}
    >
      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Left: Story Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden order-2 md:order-1"
        >
          <motion.p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10">
            আজকে তুমি সকালে ঘুম থেকে উঠে যে স্মার্টফোনে অ্যালার্ম বন্ধ করলে, ইউটিউবে ভিডিও দেখলে, কিংবা পরীক্ষার রেজাল্ট অনলাইনে চেক করলে—তার প্রতিটিই কম্পিউটারের যাত্রার ফসল।
          </motion.p>

          {/* App Interaction */}
          <div className="mt-6 space-y-3 relative z-10">
            {apps.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15 }}
                whileHover={{ x: 8 }}
                onClick={() => setActiveApp(activeApp === i ? null : i)}
                className="glass rounded-xl p-4 cursor-pointer border border-white/5 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-100">{app.name}</p>
                    <AnimatePresence>
                      {activeApp === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-sm text-slate-400 mt-1 overflow-hidden"
                        >
                          {app.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={{ rotate: activeApp === i ? 90 : 0 }}
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Smartphone Mockup + Power Comparison */}
        <div className="order-1 md:order-2 flex flex-col gap-6">
          {/* Smartphone Mockup */}
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
              className="relative w-48 h-96 md:w-56 md:h-[22rem]"
            >
              {/* Phone Body */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] border-2 border-slate-600 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10" />
                {/* Screen */}
                <div className="absolute inset-2 bg-gradient-to-b from-indigo-900/40 to-purple-900/40 rounded-[2rem] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeApp === null ? (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full gap-3"
                      >
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-4xl"
                        >
                          📱
                        </motion.span>
                        <span className="text-xs text-slate-400">একটি অ্যাপ সিলেক্ট করো</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={activeApp}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full gap-2 p-4"
                      >
                        <span className="text-5xl">{apps[activeApp].icon}</span>
                        <span className="text-sm font-medium text-slate-200 mt-2">{apps[activeApp].name}</span>
                        <span className="text-[10px] text-slate-400 text-center">{apps[activeApp].desc}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Home Button */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-slate-600" />
              </div>
            </motion.div>
          </motion.div>

          {/* Power Comparison Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">ক্ষমতার তুলনা</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                তোমার পকেটের স্মার্টফোনটি{" "}
                <motion.span
                  className="text-emerald-400 font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  ১৯টি অ্যাপোলো মিশন
                </motion.span>{" "}
                (যা চাঁদে মানুষ পাঠিয়েছিল) এর সব কম্পিউটার মিলিয়ে যা ক্ষমতা ছিল, তার চেয়েও{" "}
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-emerald-300 font-bold inline-block"
                >
                  কয়েক লক্ষ গুণ বেশি শক্তিশালী
                </motion.span>
                !
              </p>

              {/* Visual comparison indicator */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "0.5%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 1 }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>অ্যাপোলো মিশন</span>
                <span>তোমার স্মার্টফোন</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
