"use client";

import { motion } from "framer-motion";
import { Monitor, Speaker, Printer, Projector, Eye } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const keywords = [
  { word: "আউটপুট ডিভাইস (Output Devices)", color: "#38bdf8" },
  { word: "মনিটর", color: "#c084fc" },
  { word: "স্পিকার", color: "#f472b6" },
  { word: "প্রিন্টার, প্রজেক্টর", color: "#34d399" },
];

const floatingIcons = [
  { Icon: Monitor, x: "10%", y: "20%", delay: 0, color: "#c084fc" },
  { Icon: Speaker, x: "85%", y: "30%", delay: 1, color: "#38bdf8" },
  { Icon: Printer, x: "15%", y: "70%", delay: 2, color: "#34d399" },
  { Icon: Projector, x: "80%", y: "75%", delay: 0.5, color: "#f472b6" },
];

const outputDevices = [
  { icon: "🖥️", label: "মনিটর", color: "from-blue-500/20 to-blue-600/10" },
  { icon: "🔊", label: "স্পিকার", color: "from-purple-500/20 to-purple-600/10" },
  { icon: "🖨️", label: "প্রিন্টার", color: "from-green-500/20 to-green-600/10" },
  { icon: "📽️", label: "প্রজেক্টর", color: "from-pink-500/20 to-pink-600/10" },
  { icon: "🎧", label: "হেডফোন", color: "from-cyan-500/20 to-cyan-600/10" },
  { icon: "📺", label: "এলইডি স্ক্রিন", color: "from-amber-500/20 to-amber-600/10" },
];

export default function Section1_Definition_06() {
  return (
    <SectionWrapper
      id="output-definition"
      title="সংজ্ঞা"
      icon={<Monitor className="w-5 h-5" />}
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
              ইনপুট করা ডেটা প্রসেসিং হওয়ার পর যে সকল ডিভাইসের মাধ্যমে কম্পিউটার আমাদের ফলাফল বা আউটপুট প্রদর্শন করে, সেগুলোকে{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[0].color, color: keywords[0].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[0].word}
              </motion.span>
              {" "}বলে। যেমন:{" "}
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
              ,{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[3].color, color: keywords[3].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[3].word}
              </motion.span>
              {" "}ইত্যাদি।
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
              <Eye className="w-6 h-6 text-pink-400" />
            </motion.div>
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300">
              আউটপুট ডিভাইস কম্পিউটারের মুখ ও ভাষার মতো কাজ করে। প্রসেসিং শেষে ডিজিটাল তথ্যকে মানুষের বোধগম্য রূপে রূপান্তর করে উপস্থাপন করে — ছবি, শব্দ, প্রিন্টেড কাগজ বা প্রজেক্টেড ইমেজ হিসেবে।
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
          {outputDevices.map((item, i) => (
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
