"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Bug, Wifi, Key, Scan } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const keywords = [
  { word: "সাইবার নিরাপত্তা (Cyber Security)", color: "#38bdf8" },
  { word: "হ্যাকার", color: "#ef4444" },
  { word: "ভাইরাস", color: "#c084fc" },
  { word: "ডিজিটাল আক্রমণ", color: "#f472b6" },
];

const floatingIcons = [
  { Icon: Shield, x: "10%", y: "20%", delay: 0, color: "#38bdf8" },
  { Icon: Lock, x: "85%", y: "25%", delay: 1, color: "#34d399" },
  { Icon: Bug, x: "12%", y: "75%", delay: 2, color: "#ef4444" },
  { Icon: Key, x: "82%", y: "72%", delay: 0.5, color: "#fbbf24" },
];

const defenseLayers = [
  { icon: "🛡️", label: "ফায়ারওয়াল", color: "from-blue-500/20 to-blue-600/10" },
  { icon: "🔐", label: "এনক্রিপশন", color: "from-green-500/20 to-green-600/10" },
  { icon: "🔑", label: "পাসওয়ার্ড", color: "from-purple-500/20 to-purple-600/10" },
  { icon: "📧", label: "স্প্যাম ফিল্টার", color: "from-amber-500/20 to-amber-600/10" },
  { icon: "🛡️", label: "অ্যান্টিভাইরাস", color: "from-cyan-500/20 to-cyan-600/10" },
  { icon: "📱", label: "2FA", color: "from-pink-500/20 to-pink-600/10" },
];

export default function Section1_Definition_10() {
  return (
    <SectionWrapper
      id="security-definition"
      title="সংজ্ঞা"
      icon={<Shield className="w-5 h-5" />}
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
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
              ইন্টারনেট ও কম্পিউটারের দুনিয়ায় আমাদের ব্যক্তিগত তথ্য, ডিভাইস, ওয়েবসাইট এবং নেটওয়ার্ককে{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[1].color, color: keywords[1].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[1].word}
              </motion.span>
              ,{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[2].color, color: keywords[2].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[2].word}
              </motion.span>
              {" "}বা যেকোনো{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[3].color, color: keywords[3].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[3].word}
              </motion.span>
              {" "}থেকে সুরক্ষিত রাখার পদ্ধতিকে{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[0].color, color: keywords[0].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[0].word}
              </motion.span>
              {" "}বলে।
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
          <motion.div className="relative z-10 flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex-shrink-0 mt-1"
            >
              <Shield className="w-6 h-6 text-cyan-400" />
            </motion.div>
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300">
              সাইবার নিরাপত্তা শুধু প্রযুক্তি নয়, এটি একটি সচেতনতা। নিজের তথ্য নিজে রক্ষা করার নামই সাইবার নিরাপত্তা।
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
          {defenseLayers.map((item, i) => (
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
