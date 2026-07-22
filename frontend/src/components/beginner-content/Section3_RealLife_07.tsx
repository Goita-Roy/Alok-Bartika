"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Code2, Globe, Gamepad2, Smartphone, PenTool, AppWindow } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const scenarios = [
  {
    device: "অপারেটিং সিস্টেম",
    icon: "🖥️",
    action: "Windows/macOS কম্পিউটার চালু ও পরিচালনা করছে",
    color: "#38bdf8",
  },
  {
    device: "ভিএস কোড",
    icon: "💻",
    action: "VS Code-এ প্রোগ্রামিং করে ওয়েবসাইট বানাচ্ছ",
    color: "#c084fc",
  },
  {
    device: "ব্রাউজার",
    icon: "🌐",
    action: "Chrome/Firefox দিয়ে ইউটিউবে ভিডিও দেখছ",
    color: "#34d399",
  },
];

export default function Section3_RealLife_07() {
  const [activeScenario, setActiveScenario] = useState<number | null>(0);

  return (
    <SectionWrapper
      id="software-real-life"
      title="রিয়েল-লাইফ অ্যাপ্লাই"
      icon={<Smartphone className="w-5 h-5" />}
    >
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden order-2 md:order-1"
        >
          <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10">
            Windows ল্যাপটপ চালু করা (অপারেটিং সিস্টেম),
            VS Code-এ প্রোগ্রামিং করে ওয়েবসাইট বানানো (অ্যাপ্লিকেশন),
            কিংবা Chrome দিয়ে ইউটিউবে ভিডিও দেখা (ব্রাউজার) —
            প্রতিটি কাজেই তুমি সফটওয়্যার ব্যবহার করছ।
          </p>

          <div className="relative z-10 mt-4">
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              সফটওয়্যার ছাড়া কম্পিউটার হবে শুধুই প্লাস্টিক ও ধাতুর স্তূপ!
            </p>
          </div>

          <div className="relative z-10 mt-6 space-y-3">
            {scenarios.map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 5 }}
                onClick={() => setActiveScenario(i)}
                className={`glass rounded-xl px-4 py-3 cursor-pointer border transition-all ${
                  activeScenario === i ? "border-white/30 bg-white/5" : "border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      {s.action.split(/(Windows\/macOS|VS Code|Chrome\/Firefox)/).map((part, j) => {
                        const isHighlight = ["Windows/macOS", "VS Code", "Chrome/Firefox"].includes(part);
                        return isHighlight ? (
                          <span key={j} className="text-cyan-300 font-semibold">({part})</span>
                        ) : (
                          <span key={j}>{part}</span>
                        );
                      })}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{s.device}</span>
                </div>
                {activeScenario === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden mt-2 pt-2 border-t border-white/10"
                  >
                    <p className="text-xs text-slate-500">
                      {i === 0 && "অপারেটিং সিস্টেম কম্পিউটারের সব হার্ডওয়্যার ও সফটওয়্যার পরিচালনা করে — এটি সিস্টেম সফটওয়্যারের সবচেয়ে বড় উদাহরণ।"}
                      {i === 1 && "VS Code একটি অ্যাপ্লিকেশন সফটওয়্যার যা প্রোগ্রামাররা কোড লেখার জন্য ব্যবহার করে — এটি প্রোডাক্টিভিটি টুল।"}
                      {i === 2 && "ব্রাউজার একটি অ্যাপ্লিকেশন সফটওয়্যার যা ইন্টারনেট থেকে ওয়েবপেজ ডাউনলোড ও প্রদর্শন করে।"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="order-1 md:order-2 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <motion.div className="relative w-64 h-80 md:w-72 md:h-88">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2.5rem] border-2 border-slate-600 shadow-2xl overflow-hidden">
                <div className="absolute inset-2 bg-gradient-to-b from-indigo-900/60 to-purple-900/60 rounded-[2rem] overflow-hidden p-4">
                  <div className="text-xs text-slate-400 mb-4">📦 সফটওয়্যার অ্যাক্টিভিটি</div>

                  <div className="space-y-3">
                    {scenarios.map((s, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: activeScenario === i ? 1 : 0.5,
                          scale: activeScenario === i ? 1.02 : 1,
                        }}
                        className="glass rounded-lg px-3 py-2 flex items-center gap-2"
                      >
                        <span className="text-lg">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 truncate">{s.action}</p>
                          <p className="text-[10px] text-slate-500">{s.device}</p>
                        </div>
                        {activeScenario === i && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-green-400"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-4xl"
                    >
                      📦
                    </motion.div>
                    <p className="text-[10px] text-slate-500 mt-1">সফটওয়্যার = নির্দেশনা</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AppWindow className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">প্রতিটি মুহূর্ত</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                তুমি প্রতিদিন যে কাজগুলো করো — কোড লেখা, গেম খেলা, ভিডিও দেখা, ডকুমেন্ট তৈরি — সবই সফটওয়্যারের মাধ্যমে সম্ভব।
              </p>
              <div className="mt-3 flex justify-center gap-3 text-lg">
                <span>🖥️</span>
                <span>💻</span>
                <span>🌐</span>
                <span>🎮</span>
                <span>📱</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
