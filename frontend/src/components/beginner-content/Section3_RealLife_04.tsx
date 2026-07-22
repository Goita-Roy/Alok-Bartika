"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Smartphone, Camera, Film, Gamepad2, HardDrive, Image, Zap, Database } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const fileTypes = [
  { name: "সেলফি", icon: "🤳", count: "২,৫৪৩", color: "#38bdf8", size: "৮.২ GB" },
  { name: "সিনেমা", icon: "🎬", count: "৪৭", color: "#c084fc", size: "৩৫.৬ GB" },
  { name: "গেম ফাইল", icon: "🎮", count: "১২", color: "#34d399", size: "৬২.১ GB" },
  { name: "ডকুমেন্ট", icon: "📄", count: "৮৯১", color: "#f472b6", size: "১.৩ GB" },
  { name: "মিউজিক", icon: "🎵", count: "১,২৩৪", color: "#fbbf24", size: "৪.৭ GB" },
  { name: "অ্যাপস", icon: "📱", count: "৮৬", color: "#fb923c", size: "১২.৪ GB" },
];

export default function Section3_RealLife_04() {
  const [usedSpace] = useState(124.3);
  const maxSpace = 256;

  return (
    <SectionWrapper
      id="storage-real-life"
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
            তোমার ফোনে থাকা হাজার হাজার সেলফি,
          </p>
          <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10 mt-2">
            ডাউনলোড করা সিনেমা,
          </p>
          <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10 mt-2">
            কিংবা ফ্রি-ফায়ার গেমের ফাইলগুলো
          </p>
          <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200 relative z-10 mt-2">
            চিরতরে এই স্টোরেজেই জমা থাকে।
          </p>

          <div className="relative z-10 mt-6 space-y-2">
            {fileTypes.slice(0, 3).map((file) => (
              <motion.div
                key={file.name}
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 glass rounded-lg px-4 py-2"
              >
                <span className="text-xl">{file.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-300">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{file.count}টি ফাইল</p>
                </div>
                <span className="text-xs text-slate-400">{file.size}</span>
              </motion.div>
            ))}
          </div>

          {!false && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-base md:text-lg leading-relaxed md:leading-8 text-red-400 mt-6 font-semibold relative z-10"
            >
              যদি স্টোরেজ না থাকত,
              তবে প্রতিবার ফোন অন করার সাথে সাথে
              তোমার ফোন একদম নতুন হয়ে যেত,
              সব ছবি উধাও হয়ে যেত!
            </motion.p>
          )}
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
                  <div className="flex items-center gap-2 mb-4">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">স্টোরেজ</span>
                  </div>

                  <div className="space-y-1.5">
                    {fileTypes.map((file, i) => (
                      <motion.div
                        key={file.name}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2 glass rounded-lg px-2 py-1.5"
                      >
                        <span className="text-sm">{file.icon}</span>
                        <p className="text-[10px] text-slate-300 flex-1 truncate">{file.name}</p>
                        <span className="text-[8px] text-slate-500">{file.size}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>{usedSpace.toFixed(1)} GB ব্যবহৃত</span>
                      <span>{maxSpace} GB</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                      <motion.div
                        animate={{ width: `${(usedSpace / maxSpace) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      />
                    </div>
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">স্থায়ী ডেটা</span>
              </div>
              <p className="text-sm md:text-base leading-relaxed text-slate-300">
                স্টোরেজে রাখা ডেটা পাওয়ার বন্ধ হলেও থেকে যায়। এটি কম্পিউটারের স্থায়ী স্মৃতি হিসেবে কাজ করে।
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="glass rounded-lg p-2">
                  <p className="text-cyan-300 font-bold mb-1">অস্থায়ী (RAM)</p>
                  <p className="text-slate-500">পাওয়ার বন্ধ = ডেটা মুছে যায়</p>
                </div>
                <div className="glass rounded-lg p-2">
                  <p className="text-purple-300 font-bold mb-1">স্থায়ী (Storage)</p>
                  <p className="text-slate-500">পাওয়ার বন্ধ = ডেটা থাকে</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
