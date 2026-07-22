"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Smartphone, MessageCircle, Globe, Monitor, Zap, MemoryStick } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const apps = [
  { name: "Facebook", icon: "💬", color: "#38bdf8", ram: "1.2 GB" },
  { name: "Messenger", icon: "✉️", color: "#c084fc", ram: "0.8 GB" },
  { name: "Chrome", icon: "🌐", color: "#f472b6", ram: "2.5 GB" },
  { name: "GTA V", icon: "🎮", color: "#34d399", ram: "4.0 GB" },
];

export default function Section3_RealLife_03() {
  const [openApps, setOpenApps] = useState<string[]>(["Facebook", "Messenger", "Chrome", "GTA V"]);
  const [totalRam, setTotalRam] = useState(8.5);

  const toggleApp = useCallback((name: string) => {
    setOpenApps((prev) => {
      if (prev.includes(name)) {
        const updated = prev.filter((a) => a !== name);
        return updated;
      } else {
        return [...prev, name];
      }
    });
  }, []);

  const ramUsed = openApps.reduce((sum, name) => {
    const app = apps.find((a) => a.name === name);
    return sum + parseFloat(app?.ram || "0");
  }, 0);

  return (
    <SectionWrapper
      id="ram-real-life"
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
          <motion.p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10">
            কল্পনা করো, তুমি একসঙ্গে Facebook ব্রাউজ করছো, YouTube ভিডিও দেখছো, Messenger-এ বন্ধুর সাথে কথা বলছো আর পাশাপাশি GTA V গেম খেলছো। এই সব কাজ একসঙ্গে চালানোর জন্য RAM-ই ডেটা ধরে রাখে এবং CPU-কে সরবরাহ করে।
          </motion.p>

          <motion.p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300 mt-4 relative z-10">
            RAM যত বেশি, তত বেশি অ্যাপ একসঙ্গে খোলা রাখা যায়। RAM কম হলে অ্যাপগুলি ব্যাকগ্রাউন্ড থেকে বন্ধ হয়ে যায় — যাকে আমরা "ক্র্যাশ" বা "ল্যাগ" বলি।
          </motion.p>

          <div className="mt-6 space-y-2 relative z-10">
            {apps.map((app) => (
              <motion.div
                key={app.name}
                layout
                animate={{ opacity: openApps.includes(app.name) ? 1 : 0.4 }}
                className="flex items-center justify-between glass rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{app.icon}</span>
                  <span className={`text-sm font-medium ${openApps.includes(app.name) ? "text-slate-200" : "text-slate-500"}`}>
                    {app.name}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleApp(app.name)}
                  className={`text-xs px-3 py-1 rounded-full border ${
                    openApps.includes(app.name)
                      ? "bg-red-500/20 border-red-500/30 text-red-400"
                      : "bg-green-500/20 border-green-500/30 text-green-400"
                  }`}
                >
                  {openApps.includes(app.name) ? "বন্ধ করো" : "খোলো"}
                </motion.button>
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
                  <div className="text-xs text-slate-400 mb-3">📱 চলমান অ্যাপস</div>
                  <div className="space-y-2">
                    {openApps.map((name, i) => {
                      const app = apps.find((a) => a.name === name);
                      if (!app) return null;
                      return (
                        <motion.div
                          key={name}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="glass rounded-lg px-3 py-2 flex items-center gap-2"
                        >
                          <span className="text-lg">{app.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 truncate">{name}</p>
                            <p className="text-[10px] text-slate-500">{app.ram}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {openApps.length === 0 && (
                    <div className="flex items-center justify-center h-full text-slate-600 text-sm">
                      সব অ্যাপ বন্ধ
                    </div>
                  )}
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MemoryStick className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">RAM ব্যবহার</span>
              </div>

              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">ব্যবহার: {ramUsed.toFixed(1)} GB</span>
                <span className="text-slate-400">মোট: 8 GB</span>
              </div>

              <div className="h-4 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  animate={{ width: `${(ramUsed / 8) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${
                    ramUsed > 7
                      ? "bg-red-500"
                      : ramUsed > 5
                      ? "bg-amber-500"
                      : "bg-gradient-to-r from-blue-400 to-cyan-400"
                  }`}
                />
              </div>

              <motion.p
                animate={ramUsed > 7 ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.8, repeat: ramUsed > 7 ? Infinity : 0 }}
                className="mt-3 text-xs text-center"
              >
                {ramUsed > 7 ? (
                  <span className="text-red-400">⚠️ RAM প্রায় পূর্ণ! অ্যাপ বন্ধ করো!</span>
                ) : ramUsed > 5 ? (
                  <span className="text-amber-400">⚡ RAM ব্যবহার বেশি হচ্ছে</span>
                ) : (
                  <span className="text-green-400">✅ RAM ব্যবহার স্বাভাবিক</span>
                )}
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
