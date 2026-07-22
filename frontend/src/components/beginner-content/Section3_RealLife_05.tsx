"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Keyboard, Mic, Mouse, Smartphone, MessageCircle, Gamepad2, Headphones, Speech } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const scenarios = [
  {
    device: "কিবোর্ড",
    icon: "⌨️",
    action: "মেসেঞ্জারে টাইপ করো",
    color: "#38bdf8",
  },
  {
    device: "মাইক্রোফোন",
    icon: "🎤",
    action: "ভয়েস মেসেজ পাঠাও",
    color: "#c084fc",
  },
  {
    device: "মাউস/টাচস্ক্রিন",
    icon: "🖱️",
    action: "পাবজি গেমে চারদিকে তাকাও",
    color: "#34d399",
  },
];

export default function Section3_RealLife_05() {
  const [activeScenario, setActiveScenario] = useState<number | null>(0);

  return (
    <SectionWrapper
      id="input-real-life"
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
            তুমি যখন মেসেঞ্জারে টাইপ করো (কিবোর্ড), ভয়েস মেসেজ পাঠাও (মাইক্রোফোন), কিংবা পাবজি গেমে চারদিকে তাকাও (মাউস/টাচস্ক্রিন)—তার প্রতিটি মুহূর্তেই তুমি ইনপুট ডিভাইস ব্যবহার করে কম্পিউটারকে নির্দেশ দিচ্ছ।
          </p>

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
                      {s.action.split(/(কিবোর্ড|মাইক্রোফোন|মাউস\/টাচস্ক্রিন)/).map((part, j) => {
                        const isHighlight = ["কিবোর্ড", "মাইক্রোফোন", "মাউস/টাচস্ক্রিন"].includes(part);
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
                      {i === 0 && "কিবোর্ডের মাধ্যমে তুমি অক্ষর টাইপ করে কম্পিউটারকে নির্দেশ দিচ্ছ কী লিখতে হবে।"}
                      {i === 1 && "মাইক্রোফোন তোমার কণ্ঠস্বরকে বৈদ্যুতিক সংকেতে রূপান্তর করে কম্পিউটারে পাঠায়।"}
                      {i === 2 && "মাউস বা টাচস্ক্রিনের মাধ্যমে তুমি স্ক্রিনের অবস্থান ও ক্লিকের তথ্য কম্পিউটারে পাঠাও।"}
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
                  <div className="text-xs text-slate-400 mb-4">📱 ইনপুট অ্যাক্টিভিটি</div>

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
                      🎮
                    </motion.div>
                    <p className="text-[10px] text-slate-500 mt-1">ইনপুট = নির্দেশ</p>
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
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">প্রতিটি মুহূর্ত</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                তুমি প্রতিদিন যে কাজগুলো করো — টাইপ করা, কথা বলা, স্ক্রিন টাচ করা — সবই ইনপুট ডিভাইসের মাধ্যমে কম্পিউটারে নির্দেশ হিসেবে যায়।
              </p>
              <div className="mt-3 flex justify-center gap-3 text-lg">
                <span>⌨️</span>
                <span>🎤</span>
                <span>🖱️</span>
                <span>📷</span>
                <span>🖍️</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
