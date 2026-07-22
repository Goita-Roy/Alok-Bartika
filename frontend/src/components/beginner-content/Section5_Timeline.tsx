"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Timer, ChevronRight } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { useScrollContainer } from "./ScrollContext";

interface Era {
  year: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
  details: string[];
}

const eras: Era[] = [
  {
    year: "~৩০০০ খ্রিস্টপূর্ব",
    title: "অ্যাবাকাস (Abacus)",
    icon: "🧮",
    color: "#d4a574",
    gradient: "from-amber-500/20 to-amber-600/10",
    description: "প্রথম গণনা যন্ত্র",
    details: [
      "কাঠের তৈরি ফ্রেমে পুঁতি সাজিয়ে গণনা করা হতো",
      "এখনও কিছু দেশে ব্যবহার হয়",
    ],
  },
  {
    year: "১৯৪৬",
    title: "ENIAC",
    icon: "🖥️",
    color: "#c084fc",
    gradient: "from-purple-500/20 to-purple-600/10",
    description: "প্রথম ইলেকট্রনিক কম্পিউটার",
    details: [
      "ঘরের সমান বড় ছিল!",
      "ওজন ছিল ২৭ টনের বেশি",
      "প্রতি সেকেন্ডে ৫,০০০ যোগ করতে পারত",
    ],
  },
  {
    year: "২০২৪",
    title: "আধুনিক ডিভাইস",
    icon: "💻",
    color: "#38bdf8",
    gradient: "from-blue-500/20 to-blue-600/10",
    description: "স্লিম ল্যাপটপ ও স্মার্টফোন",
    details: [
      "পকেটে পুরো ENIAC-এর চেয়েও শক্তিশালী কম্পিউটার",
      "প্রতি সেকেন্ডে বিলিয়ন অপারেশন",
    ],
  },
];

export default function Section5_Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainer || undefined,
    offset: ["start center", "end center"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const lineHeight = useTransform(lineProgress, (v) => `${v}%`);

  return (
    <SectionWrapper
      id="timeline"
      title="অ্যানিমেশন আইডিয়া"
      icon={<Timer className="w-5 h-5" />}
    >
      <div ref={containerRef} className="relative">
        {/* Original Educational Text - preserved exactly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-6 md:p-8 mb-8"
        >
          <p className="text-base md:text-lg leading-relaxed md:leading-8 text-slate-200">
            লুপিং টাইমলাইন অ্যানিমেশন: ওয়েবসাইটের স্ক্রল করার সাথে সাথে একটি অ্যানিমেটেড টাইমলাইন স্ক্রিনে আসবে। প্রথমে দেখাবে একটি কাঠের তৈরি অ্যাবাকাস (Abacus), স্ক্রল করলে সেটা রূপান্তরিত হবে ১৯৪৬ সালের ঘরের সমান বড় ENIAC কম্পিউটারে, এবং সবশেষে সেটি সংকুচিত হয়ে আজকের স্লিম ল্যাপটপ বা স্মার্টফোনে রূপ নেবে।
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-sm text-slate-500 mb-2">স্ক্রল করে টাইমলাইন দেখুন</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-5 h-5 mx-auto text-slate-500 rotate-90" />
          </motion.div>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Center line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-700/50 -translate-x-1/2">
            <motion.div
              className="w-full bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-400"
              style={{ height: lineHeight }}
            />
          </div>

          {/* Timeline items */}
          <div className="space-y-16 md:space-y-24">
            {eras.map((era, i) => (
              <TimelineItem key={i} era={era} index={i} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function TimelineItem({ era, index }: { era: Era; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isLeft = index % 2 === 0;
  const scrollContainer = useScrollContainer();

  const { scrollYProgress } = useScroll({
    target: ref,
    container: scrollContainer || undefined,
    offset: ["start end", "end center"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 1]);
  const x = useTransform(scrollYProgress, [0, 0.5], [isLeft ? -60 : 60, 0]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      style={{ scale, x }}
      className={`relative flex items-start gap-6 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Dot on timeline */}
      <motion.div
        className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full -translate-x-1/2 mt-6 z-10"
        style={{
          background: `radial-gradient(circle, ${era.color}, transparent)`,
          boxShadow: `0 0 20px ${era.color}40`,
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Content Card */}
      <motion.div
        style={{ x }}
        className={`glass rounded-2xl p-5 md:p-7 ml-16 md:ml-0 md:w-[calc(50%-2rem)] relative overflow-hidden ${
          isLeft ? "md:mr-auto" : "md:ml-auto"
        }`}
        whileHover={{ scale: 1.02, y: -4 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${era.gradient} opacity-50`} />
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${era.color}15` }} />

        <div className="relative z-10">
          {/* Year Badge */}
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-block px-3 py-1 rounded-full text-xs font-mono mb-3"
            style={{
              backgroundColor: `${era.color}20`,
              color: era.color,
              border: `1px solid ${era.color}30`,
            }}
          >
            {era.year}
          </motion.span>

          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-3xl md:text-4xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
            >
              {era.icon}
            </motion.span>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-100">{era.title}</h3>
              <p className="text-sm" style={{ color: era.color }}>{era.description}</p>
            </div>
          </div>

          {/* Details */}
          <ul className="space-y-2 mt-4">
            {era.details.map((detail, j) => (
              <motion.li
                key={j}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: j * 0.15 }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-xs mt-1" style={{ color: era.color }}>▸</span>
                {detail}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
