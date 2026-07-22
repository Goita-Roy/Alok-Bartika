"use client";

import { motion } from "framer-motion";
import { Keyboard, Mouse, ScanLine, Mic, Monitor, Fingerprint } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

const keywords = [
  { word: "ইনপুট ডিভাইস (Input Devices)", color: "#38bdf8" },
  { word: "কিবোর্ড", color: "#c084fc" },
  { word: "মাউস", color: "#f472b6" },
  { word: "স্ক্যানার, মাইক্রোফোন", color: "#34d399" },
];

const floatingIcons = [
  { Icon: Keyboard, x: "10%", y: "20%", delay: 0, color: "#c084fc" },
  { Icon: Mouse, x: "85%", y: "30%", delay: 1, color: "#38bdf8" },
  { Icon: ScanLine, x: "15%", y: "70%", delay: 2, color: "#34d399" },
  { Icon: Mic, x: "80%", y: "75%", delay: 0.5, color: "#f472b6" },
];

const inputDevices = [
  { icon: "⌨️", label: "কিবোর্ড", color: "from-blue-500/20 to-blue-600/10" },
  { icon: "🖱️", label: "মাউস", color: "from-purple-500/20 to-purple-600/10" },
  { icon: "📄", label: "স্ক্যানার", color: "from-green-500/20 to-green-600/10" },
  { icon: "🎤", label: "মাইক্রোফোন", color: "from-pink-500/20 to-pink-600/10" },
  { icon: "📷", label: "ওয়েবক্যাম", color: "from-cyan-500/20 to-cyan-600/10" },
  { icon: "🖍️", label: "টাচস্ক্রিন", color: "from-amber-500/20 to-amber-600/10" },
];

export default function Section1_Definition_05() {
  return (
    <SectionWrapper
      id="input-definition"
      title="সংজ্ঞা"
      icon={<Keyboard className="w-5 h-5" />}
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
              যেসব যন্ত্রাংশ বা ডিভাইসের মাধ্যমে আমরা কম্পিউটারকে কোনো তথ্য, নির্দেশ বা কমান্ড প্রদান করি, সেগুলোকে{" "}
              <motion.span
                className="keyword-highlight"
                style={{ borderColor: keywords[0].color, color: keywords[0].color }}
                whileHover={{ scale: 1.05 }}
              >
                {keywords[0].word}
              </motion.span>
              {" "}বলে।{" "}
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
              {" "}ইত্যাদি এর অন্যতম উদাহরণ।
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
              <Monitor className="w-6 h-6 text-pink-400" />
            </motion.div>
            <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-300">
              ইনপুট ডিভাইস কম্পিউটারের চোখ ও কানের মতো কাজ করে। এগুলো কম্পিউটারকে বোঝায় আমরা কী চাই — টেক্সট লিখতে, ছবি তুলতে, সাউন্ড রেকর্ড করতে বা স্ক্রিনে কিছু নির্দেশ দিতে। ইনপুট ডিভাইস ছাড়া কম্পিউটার শুধু একটি মেশিন, কিছুই করতে পারে না।
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
          {inputDevices.map((item, i) => (
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
