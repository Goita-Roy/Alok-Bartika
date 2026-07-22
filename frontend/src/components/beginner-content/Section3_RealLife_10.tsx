"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, AlertTriangle, Smartphone, DollarSign, Image } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const scenarios = [
  {
    device: "2FA",
    icon: "📱",
    action: "তোমার ফেসবুক আইডিতে টু-ফ্যাক্টর অথেন্টিকেশন (2FA) অন রাখা",
    color: "#38bdf8",
  },
  {
    device: "পাসওয়ার্ড",
    icon: "🔑",
    action: "শক্তিশালী পাসওয়ার্ড ব্যবহার করা",
    color: "#c084fc",
  },
  {
    device: "লিংক",
    icon: "🔗",
    action: "অপরিচিত কোনো লিংকে ক্লিক না করা",
    color: "#34d399",
  },
];

export default function Section3_RealLife_10() {
  const [activeScenario, setActiveScenario] = useState<number | null>(0);

  return (
    <SectionWrapper
      id="security-real-life"
      title="রিয়েল-লাইফ অ্যাপ্লাই"
      icon={<Shield className="w-5 h-5" />}
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
            তোমার ফেসবুক আইডিতে টু-ফ্যাক্টর অথেন্টিকেশন (2FA) অন রাখা,
            <br />
            শক্তিশালী পাসওয়ার্ড ব্যবহার করা
            <br />
            এবং অপরিচিত কোনো লিংকে ক্লিক না করা—
            <br />
            এসবই সাইবার নিরাপত্তার অংশ।
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
                    <p className="text-sm text-slate-300">{s.action}</p>
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
                      {i === 0 && "2FA চালু করলে লগইনের সময় পাসওয়ার্ডের পাশাপাশি একটি OTP কোড লাগে, যা হ্যাকারদের জন্য অ্যাক্সেস করা প্রায় অসম্ভব করে দেয়।"}
                      {i === 1 && "শক্তিশালী পাসওয়ার্ড মানে ছোট-বড় হাতের অক্ষর, সংখ্যা ও স্পেশাল ক্যারেক্টারের মিশ্রণ। '123456' বা 'password' এর মতো দুর্বল পাসওয়ার্ড ব্যবহার করা বিপজ্জনক।"}
                      {i === 2 && "অপরিচিত লিংকে ক্লিক করলে তা ফিশিং আক্রমণের অংশ হতে পারে। ভুয়া ইমেইল বা মেসেজের লিংক দিয়ে হ্যাকাররা তোমার তথ্য চুরি করে।"}
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
                <div className="absolute inset-2 bg-gradient-to-b from-blue-900/60 to-cyan-900/60 rounded-[2rem] overflow-hidden p-4">
                  <div className="text-xs text-slate-400 mb-4">🛡️ সাইবার নিরাপত্তা</div>

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
                      🛡️
                    </motion.div>
                    <p className="text-[10px] text-slate-500 mt-1">ডিজিটাল ফোর্ট্রেস</p>
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-red-400">সতর্কতা</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                একটু অসচেতন হলেই
                <br />
                <span className="text-lg font-bold text-red-300">তোমার পার্সোনাল ছবি</span>
                <br />
                বা
                <br />
                <span className="text-lg font-bold text-red-300">ব্যাংকের টাকা</span>
                <br />
                চুরি হয়ে যেতে পারে।
              </p>
              <div className="mt-3 flex justify-center gap-3 text-lg">
                <span>📸</span>
                <span>💰</span>
                <span>🔒</span>
                <span>⚠️</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
