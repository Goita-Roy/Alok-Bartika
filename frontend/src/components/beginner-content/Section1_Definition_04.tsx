"use client";

import { motion } from "framer-motion";
import { HardDrive, Database, Zap, Layers, Cpu } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const keywords = [
  { word: "স্টোরেজ (Storage)", color: "#38bdf8" },
  { word: "সেকেন্ডারি মেমোরি", color: "#c084fc" },
  { word: "HDD (Hard Disk Drive)", color: "#f472b6" },
  { word: "SSD (Solid State Drive)", color: "#34d399" },
];

const floatingIcons = [
  { Icon: HardDrive, x: "10%", y: "20%", delay: 0, color: "#c084fc" },
  { Icon: Database, x: "85%", y: "30%", delay: 1, color: "#38bdf8" },
  { Icon: Zap, x: "15%", y: "70%", delay: 2, color: "#34d399" },
  { Icon: Layers, x: "80%", y: "75%", delay: 0.5, color: "#f472b6" },
];

export default function Section1_Definition_04() {
  return (
    <SectionWrapper
      id="storage-definition"
      title="সংজ্ঞা"
      icon={<HardDrive className="w-5 h-5" />}
    >
      <div className="relative">
        {floatingIcons.map(({ Icon, x, y, delay, color }, i) => (
          <motion.div
            key={i}
            className="hidden md:block absolute pointer-events-none"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          >
            <Icon className="w-8 h-8 md:w-12 md:h-12" style={{ color }} />
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          className="glass rounded-2xl p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              কম্পিউটার বন্ধ করলেও যে মেমোরিতে রাখা ডেটা চিরতরে মুছে যায় না, বরং স্থায়ীভাবে জমা থাকে, তাকে{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[0].color, color: keywords[0].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[0].word}
              </motion.span>{" "}
              বা{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[1].color, color: keywords[1].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[1].word}
              </motion.span>
              {" "}বলে। এটি মূলত দুই প্রকার: গতিশীল কিন্তু পুরনো{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[2].color, color: keywords[2].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[2].word}
              </motion.span>{" "}
              এবং সুপার-ফাস্ট আধুনিক{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[3].color, color: keywords[3].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[3].word}
              </motion.span>
              ।
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-5 md:p-8 mt-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/5 rounded-full blur-2xl" />

          <motion.div className="relative z-10 flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex-shrink-0 mt-1"
            >
              <Database className="w-6 h-6 text-pink-400" />
            </motion.div>
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300">
              স্টোরেজ হলো কম্পিউটারের স্থায়ী স্মৃতি। পাওয়ার বন্ধ হলেও ডেটা থেকে যায়। এখানে অপারেটিং সিস্টেম, সফটওয়্যার, ছবি, ভিডিও, ডকুমেন্ট — সবকিছু স্থায়ীভাবে জমা থাকে। স্টোরেজ যত বেশি, তত বেশি ফাইল রাখা যায়।
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap gap-3 mt-6 justify-center"
        >
          {[
            { label: "Permanent", icon: "💾", color: "from-blue-500/20 to-blue-600/10" },
            { label: "Non-Volatile", icon: "🔒", color: "from-purple-500/20 to-purple-600/10" },
            { label: "Large Capacity", icon: "📦", color: "from-green-500/20 to-green-600/10" },
            { label: "Slower than RAM", icon: "🐢", color: "from-pink-500/20 to-pink-600/10" },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-xl bg-gradient-to-br ${item.color} border border-white/10 backdrop-blur-sm cursor-pointer`}
            >
              <span className="mr-2">{item.icon}</span>
              <span className="text-sm font-medium text-slate-200">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
