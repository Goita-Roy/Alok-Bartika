import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch2-data-types";
const SOLUTION_CODE = `name = "Rahim"\nroll = 15\ngpa = 5.0\npassed = True\n\nprint(name)\nprint(roll)\nprint(gpa)\nprint(passed)`;

const SUGGESTED_QUESTIONS = [
  "Integer কী?",
  "Float আর Integer-এর পার্থক্য কী?",
  "String-এর জন্য quotation marks কেন লাগে?",
  "Boolean কী?",
  "True আর False কোথায় ব্যবহার হয়?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! Data Types master!",
];

const HINTS = [
  "Text লিখতে quotation marks ব্যবহার করো — যেমন: \"Rahim\"",
  "পূর্ণসংখ্যা হলো Integer — যেমন: 15",
  "দশমিক সংখ্যা হলো Float — যেমন: 5.0",
  "Boolean-এ শুধু True বা False লিখতে হয়।",
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch2DataTypesProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── Data Type Card (animated) ── */
function DataTypeCard({
  title,
  pythonName,
  color,
  icon,
  description,
  example,
  exampleLabel,
  delay,
}: {
  title: string;
  pythonName: string;
  color: string;
  icon: string;
  description: string;
  example: string;
  exampleLabel: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 180 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className={`${color} rounded-2xl border-2 p-5 cursor-default`}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.span
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: delay * 0.5 }}
          className="text-3xl"
        >
          {icon}
        </motion.span>
        <div>
          <p className="font-extrabold text-gray-900 text-base">{title}</p>
          <p className="font-mono text-xs font-bold text-gray-500 bg-white/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
            {pythonName}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-3">{description}</p>
      <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs">
        <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">
          {exampleLabel}
        </p>
        <div
          dangerouslySetInnerHTML={{ __html: example }}
        />
      </div>
    </motion.div>
  );
}

/* ── Real Life Card ── */
function RealLifeCard({
  icon,
  label,
  dataType,
  pythonExample,
  bgClass,
  borderClass,
  delay,
}: {
  icon: string;
  label: string;
  dataType: string;
  pythonExample: string;
  bgClass: string;
  borderClass: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={FADE_UP}
      whileHover={{ scale: 1.03, y: -3 }}
      className={`${bgClass} ${borderClass} rounded-2xl p-4 text-center`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 250 }}
        className="text-4xl mb-2"
      >
        {icon}
      </motion.div>
      <p className="text-sm font-bold text-gray-800">{label}</p>
      <div className="mt-2 inline-block px-3 py-1 bg-white/70 rounded-full">
        <p className="text-xs font-extrabold text-gray-600">{dataType}</p>
      </div>
      <p className="mt-2 font-mono text-[11px] text-gray-600 bg-white/50 rounded-lg px-2 py-1">
        {pythonExample}
      </p>
    </motion.div>
  );
}

export function Ch2DataTypes({
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: Ch2DataTypesProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [encourage, setEncourage] = useState("");
  const [showEncourage, setShowEncourage] = useState(false);
  const [stepsDone, setStepsDone] = useState([false, false, false, false]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoComplete, setVideoComplete] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLInputElement>(null);

  const codeLen = editorCode.length;
  const codeLines = editorCode.split("\n").length;

  /* ── video progress ── */
  const videoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleVideoToggle = useCallback(() => {
    if (videoComplete) return;
    if (videoPlaying) {
      setVideoPlaying(false);
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    } else {
      setVideoPlaying(true);
      videoIntervalRef.current = setInterval(() => {
        setVideoProgress((p) => {
          if (p >= 100) {
            if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
            setVideoPlaying(false);
            setVideoComplete(true);
            return 100;
          }
          return p + 2;
        });
      }, 60);
    }
  }, [videoPlaying, videoComplete]);

  /* ── practice run ── */
  const handleRun = useCallback(() => {
    if (!editorCode.trim()) {
      setConsoleLines(["⚠️ প্রথমে কিছু কোড লেখো!"]);
      return;
    }
    setIsRunning(true);
    setConsoleLines([]);
    setTimeout(() => {
      const out: string[] = [];
      const vars: Record<string, string> = {};
      for (const line of editorCode.split("\n")) {
        const t = line.trim();
        if (t === "" || t.startsWith("#")) continue;
        const eqIdx = t.indexOf("=");
        if (eqIdx > 0 && !t.startsWith("print")) {
          const varName = t.slice(0, eqIdx).trim();
          let val = t.slice(eqIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          vars[varName] = val;
        } else if (t.startsWith("print(") && t.endsWith(")")) {
          const inner = t.slice(6, -1).trim();
          if (vars[inner] !== undefined) {
            out.push(vars[inner]);
          } else if (
            (inner.startsWith('"') && inner.endsWith('"')) ||
            (inner.startsWith("'") && inner.endsWith("'"))
          ) {
            out.push(inner.slice(1, -1));
          } else {
            out.push(`>>> ${inner}`);
          }
        } else if (t) {
          out.push(`>>> ${t}`);
        }
      }
      if (out.length === 0) out.push("⚠️ কোনো output পাওয়া যায়নি। print() ব্যবহার করো!");
      setConsoleLines(out);
      setIsRunning(false);
      if (out.includes("Rahim") && (out.includes("15") || out.includes("5.0"))) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
        setStepsDone([true, true, true, true]);
      }
    }, 650);
  }, [editorCode]);

  const handleReset = useCallback(() => {
    setEditorCode("");
    setConsoleLines([]);
    setShowEncourage(false);
  }, []);

  /* ── solution copy ── */
  const copySolution = useCallback(() => {
    navigator.clipboard.writeText(SOLUTION_CODE);
    setSolutionCopied(true);
    setTimeout(() => setSolutionCopied(false), 2000);
  }, []);

  /* ── hint expand ── */
  const handleHintToggle = useCallback(() => {
    if (!hintOpen) {
      setHintOpen(true);
      let idx = 0;
      const t = setInterval(() => {
        idx++;
        setHintsRevealed(idx);
        if (idx >= HINTS.length) clearInterval(t);
      }, 350);
    } else {
      setHintOpen(false);
      setHintsRevealed(0);
    }
  }, [hintOpen]);

  /* ── AI chat ── */
  const aiSend = useCallback(() => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages((m) => [...m, { role: "user", text: q }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      let a = "";
      if (q.includes("Integer") || q.includes("integer") || q.includes("int")) {
        a = "Integer হলো পূর্ণসংখ্যা — এতে কোনো দশমিক থাকে না। যেমন: 15, 100, -3। Python-এ int টাইপ বলে।";
      } else if (q.includes("Float") || q.includes("float")) {
        a = "Float হলো দশমিক সংখ্যা। যেমন: 3.14, 5.0, 12.99। সাধারণত মূল্য, পরিমাপ এবং PI-এর জন্য ব্যবহার হয়।";
      } else if (q.includes("String") || q.includes("string") || q.includes("str") || q.includes("quotation")) {
        a = "String হলো text — যেমন: \"Rahim\", 'Hello'। Quotation marks লাগে যাতে Python বুঝতে পারে এটি text। double quotes বা single quotes — দুটোই চলে!";
      } else if (q.includes("Boolean") || q.includes("boolean") || q.includes("bool")) {
        a = "Boolean-এ শুধু দুটি মান থাকে: True বা False। যেমন: passed = True বা late_to_class = False। এটি সত্য/মিথ্যা পরিস্থিতি বোঝাতে ব্যবহার হয়।";
      } else if (q.includes("True") || q.includes("False") || q.includes("কোথায়")) {
        a = "True/False ব্যবহার হয় যখন কোনো জিনিস হয় বা হয় না। যেমন: is_student = True, is_raining = False। এটি সিদ্ধান্ত নিতে সাহায্য করে।";
      } else {
        a = "ভালো প্রশ্ন! Data Types হলো Variable-এ সংরক্ষিত তথ্যের ধরন। নিচের suggested questions দেখো!";
      }
      setAiMessages((m) => [...m, { role: "ai", text: a }]);
      setAiTyping(false);
    }, 1100);
  }, [aiInput]);

  const toggleStep = (i: number) => {
    setStepsDone((s) => {
      const n = [...s];
      n[i] = !n[i];
      return n;
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ═══════════ SECTION 1: Basic ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={STAGGER}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={FADE_UP}
          className="px-6 py-5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📘</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Basic
            </h2>
          </div>
        </motion.div>

        <div className="px-6 py-6 space-y-6">
          {/* intro */}
          <motion.div variants={FADE_UP}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Data Types মানে কী?
            </h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              প্রতিটি Variable একটি নির্দিষ্ট ধরনের তথ্য সংরক্ষণ করে। সেই ধরনকে বলে <span className="font-bold text-indigo-600">Data Type</span>।
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              Python-এ মূলত <span className="font-bold">৪টি</span> ধরনের Data Type আছে।
            </p>
          </motion.div>

          {/* 4 data type cards */}
          <motion.div variants={FADE_UP}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DataTypeCard
                title="Integer"
                pythonName="int"
                color="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                icon="🔢"
                description="পূর্ণসংখ্যা — এতে কোনো দশমিক থাকে না।"
                example='<span className="text-cyan-400">year</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">2023</span><br/><span className="text-cyan-400">age</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">32</span>'
                exampleLabel="উদাহরণ"
                delay={0.15}
              />
              <DataTypeCard
                title="Float"
                pythonName="float"
                color="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                icon="📏"
                description="দশমিক সংখ্যা — মূল্য, পরিমাপ ও PI-এর জন্য।"
                example='<span className="text-cyan-400">pi</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">3.14159</span><br/><span className="text-cyan-400">meal_cost</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">12.99</span>'
                exampleLabel="উদাহরণ"
                delay={0.3}
              />
              <DataTypeCard
                title="String"
                pythonName="str"
                color="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                icon="📝"
                description="Text — quotation marks-এর ভেতরে লিখতে হয়।"
                example='<span className="text-cyan-400">message</span> <span className="text-yellow-400">=</span> <span className="text-green-400">"good nite"</span><br/><span className="text-cyan-400">username</span> <span className="text-yellow-400">=</span> <span className="text-green-400">"@snoopdogg"</span>'
                exampleLabel="উদাহরণ"
                delay={0.45}
              />
              <DataTypeCard
                title="Boolean"
                pythonName="bool"
                color="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200"
                icon="💡"
                description="শুধু দুটি মান: True বা False।"
                example='<span className="text-cyan-400">late_to_class</span> <span className="text-yellow-400">=</span> <span className="text-rose-400">False</span><br/><span className="text-cyan-400">cranky</span> <span className="text-yellow-400">=</span> <span className="text-rose-400">True</span>'
                exampleLabel="উদাহরণ"
                delay={0.6}
              />
            </div>
          </motion.div>

          {/* comparison */}
          <motion.div variants={FADE_UP}>
            <div className="bg-gray-900 rounded-2xl p-5 font-mono text-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                ✨ চলো তুলনা করি
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-500 rounded-full" />
                  <div>
                    <span className="text-cyan-400">age</span>
                    <span className="text-yellow-400"> = </span>
                    <span className="text-orange-400">32</span>
                    <span className="text-gray-500 ml-3">→ int</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                  <div>
                    <span className="text-cyan-400">pi</span>
                    <span className="text-yellow-400"> = </span>
                    <span className="text-orange-400">3.14</span>
                    <span className="text-gray-500 ml-3">→ float</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-8 bg-amber-500 rounded-full" />
                  <div>
                    <span className="text-cyan-400">name</span>
                    <span className="text-yellow-400"> = </span>
                    <span className="text-green-400">"Rahim"</span>
                    <span className="text-gray-500 ml-3">→ str</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-8 bg-rose-500 rounded-full" />
                  <div>
                    <span className="text-cyan-400">passed</span>
                    <span className="text-yellow-400"> = </span>
                    <span className="text-rose-400">True</span>
                    <span className="text-gray-500 ml-3">→ bool</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* tip */}
          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Data Type
                নির্ধারণ করে কম্পিউটার কীভাবে তথ্য প্রক্রিয়া করবে।
                ভুল Data Type দিলে সমস্যা হতে পারে!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 2: Real Life Example ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={STAGGER}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={FADE_UP}
          className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Real Life Example
            </h2>
          </div>
        </motion.div>

        <div className="px-6 py-6">
          <motion.p
            variants={FADE_UP}
            className="text-sm text-gray-500 mb-5"
          >
            জীবনে আমরা অনেক জায়গায় বিভিন্ন ধরনের তথ্য ব্যবহার করি!
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            <RealLifeCard
              icon="🎂"
              label="বয়স"
              dataType="Integer"
              pythonExample="age = 13"
              bgClass="bg-gradient-to-br from-blue-50 to-indigo-50"
              borderClass="border border-blue-100"
              delay={0.1}
            />
            <RealLifeCard
              icon="💰"
              label="মূল্য"
              dataType="Float"
              pythonExample="price = 12.99"
              bgClass="bg-gradient-to-br from-emerald-50 to-green-50"
              borderClass="border border-emerald-100"
              delay={0.2}
            />
            <RealLifeCard
              icon="🏷️"
              label="নাম"
              dataType="String"
              pythonExample='name = "Rahim"'
              bgClass="bg-gradient-to-br from-amber-50 to-orange-50"
              borderClass="border border-amber-100"
              delay={0.3}
            />
            <RealLifeCard
              icon="💡"
              label="লাইট সুইচ"
              dataType="Boolean"
              pythonExample="light_on = True"
              bgClass="bg-gradient-to-br from-rose-50 to-pink-50"
              borderClass="border border-rose-100"
              delay={0.4}
            />
          </div>

          {/* light switch animation */}
          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
                💡 Light Switch Animation
              </p>
              <div className="flex items-center justify-center gap-8">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30 mb-2">
                    <span className="text-2xl">☀️</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-yellow-400">True</p>
                </motion.div>
                <div className="text-gray-500 text-2xl">⟷</div>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <span className="text-2xl">🌙</span>
                  </div>
                  <p className="text-xs font-mono font-bold text-gray-400">False</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> বিভিন্ন ধরনের
                তথ্যের জন্য বিভিন্ন Data Type লাগে — যেমন বয়স Integer,
                নাম String, মূল্য Float!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 3: Instructions (নির্দেশনা) ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={STAGGER}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={FADE_UP}
          className="px-6 py-5 bg-gradient-to-r from-orange-500 to-rose-500"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📝</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              নির্দেশনা
            </h2>
          </div>
        </motion.div>

        <div className="px-6 py-6">
          {/* mission card */}
          <motion.div variants={FADE_UP} className="mb-5">
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  ⚡
                </motion.span>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">
                    Mission: Data Types তৈরি করো!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    data_types.py ফাইলে ৪টি Variable তৈরি করো
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {stepsDone.map((d, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i === 0 ? "w-16" : i === 1 ? "w-12" : i === 2 ? "w-12" : "w-10"
                        } ${d ? "bg-green-400" : "bg-orange-200"}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-1">
                      {stepsDone.filter(Boolean).length}/4
                    </span>
                  </div>
                </div>
              </div>

              {/* preview */}
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p><span className="text-cyan-400">name</span> <span className="text-yellow-400">=</span> <span className="text-green-400">"Rahim"</span></p>
                <p><span className="text-cyan-400">roll</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">15</span></p>
                <p><span className="text-cyan-400">gpa</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">5.0</span></p>
                <p><span className="text-cyan-400">passed</span> <span className="text-yellow-400">=</span> <span className="text-rose-400">True</span></p>
              </div>
            </div>
          </motion.div>

          {/* steps */}
          <div className="space-y-3">
            {[
              {
                num: 1,
                text: "name Variable-এ তোমার নাম String হিসেবে রাখো।",
                code: 'name = "Rahim"',
              },
              {
                num: 2,
                text: "roll Variable-এ তোমার রোল নম্বর Integer হিসেবে রাখো।",
                code: "roll = 15",
              },
              {
                num: 3,
                text: "gpa Variable-এ তোমার GPA Float হিসেবে রাখো।",
                code: "gpa = 5.0",
              },
              {
                num: 4,
                text: "passed Variable-এ True বা False রাখো, তারপর print() দিয়ে সব দেখাও!",
                code: "passed = True",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={FADE_UP}
                onClick={() => toggleStep(i)}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  stepsDone[i]
                    ? "bg-green-50 border-green-300 shadow-sm"
                    : "bg-orange-50 border-orange-100 hover:border-orange-200"
                }`}
              >
                <motion.div
                  animate={stepsDone[i] ? { scale: [1, 1.3, 1] } : {}}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${
                    stepsDone[i]
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {stepsDone[i] ? "✓" : step.num}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">
                    Step {step.num}: {step.text}
                  </p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                    <span className="text-cyan-400">{step.code.split(" = ")[0]}</span>
                    <span className="text-yellow-400"> = </span>
                    <span className={
                      step.code.includes('"')
                        ? "text-green-400"
                        : step.code.includes("True") || step.code.includes("False")
                        ? "text-rose-400"
                        : "text-orange-400"
                    }>
                      {step.code.split(" = ")[1]}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {stepsDone.every(Boolean) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="mt-5 text-center"
              >
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-100 border-2 border-green-300 rounded-2xl">
                  <motion.span
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    className="text-2xl"
                  >
                    🎉
                  </motion.span>
                  <span className="font-extrabold text-green-700">
                    Mission Complete!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 4: Hint ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Hint
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <button
            onClick={handleHintToggle}
            className="w-full flex items-center justify-between px-5 py-4 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl transition-all duration-200"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold text-cyan-800">
              <motion.span
                animate={hintOpen ? { rotate: [0, 20, -20, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="text-xl"
              >
                💡
              </motion.span>
              Need a Hint?
            </span>
            <motion.svg
              animate={{ rotate: hintOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>

          <AnimatePresence>
            {hintOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {HINTS.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={
                        i < hintsRevealed
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -20 }
                      }
                      transition={{ duration: 0.4 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {h}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 5: Walkthrough Video ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-pink-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎥</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Walkthrough Video
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <div
            className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video cursor-pointer group"
            onClick={handleVideoToggle}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={videoPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{
                      duration: 1.5,
                      repeat: videoPlaying ? Infinity : 0,
                    }}
                    className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300"
                  >
                    {videoPlaying ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </motion.div>
                  <p className="text-white/80 text-sm font-medium mt-3">
                    Chapter 2: Data Types
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    int, float, str, bool explained in Bangla
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
              7:45
            </div>

            <AnimatePresence>
              {videoComplete && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-3 px-3 py-1 bg-green-500 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500 w-10">0:00</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                animate={{ width: `${videoProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">
              7:45
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 6: Practice ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Practice
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* goal */}
          <motion.div
            variants={FADE_UP}
            className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">
                Goal: ৪টি Variable তৈরি করো — ৪টি ভিন্ন Data Type!
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-center text-sm space-y-1">
              <p className="text-cyan-400">name = <span className="text-green-400">"তোমার নাম"</span> <span className="text-gray-500"># str</span></p>
              <p className="text-cyan-400">roll = <span className="text-orange-400">তোমার রোল</span> <span className="text-gray-500"># int</span></p>
              <p className="text-cyan-400">gpa = <span className="text-orange-400">5.0</span> <span className="text-gray-500"># float</span></p>
              <p className="text-cyan-400">passed = <span className="text-rose-400">True</span> <span className="text-gray-500"># bool</span></p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* editor */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">
                    data_types.py
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <span>{codeLen} chars</span>
                  <span>·</span>
                  <span>{codeLines} lines</span>
                </div>
              </div>
              <div className="flex bg-gray-900">
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-gray-700">
                  {Array.from({ length: Math.max(codeLines, 12) }, (_, i) => (
                    <div
                      key={i}
                      className="text-gray-600 text-xs font-mono leading-6 h-6"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={editorCode}
                  onChange={(e) => {
                    setEditorCode(e.target.value);
                    setShowEncourage(false);
                  }}
                  placeholder={'name = "Rahim"\nroll = 15\ngpa = 5.0\npassed = True\n\nprint(name)\nprint(roll)\nprint(gpa)\nprint(passed)'}
                  className="flex-1 bg-transparent text-green-400 font-mono text-sm p-3 resize-none outline-none leading-6 min-h-[288px] placeholder-gray-600"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* console + controls */}
            <div className="flex flex-col gap-3">
              <div className="bg-gray-900 rounded-2xl border border-gray-200 shadow-md flex-1 min-h-[200px]">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
                    Console
                  </span>
                  {isRunning && (
                    <span className="ml-auto text-[10px] text-yellow-400 flex items-center gap-1">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-2.5 h-2.5 border-2 border-yellow-400 border-t-transparent rounded-full"
                      />
                      Running...
                    </span>
                  )}
                </div>
                <div
                  ref={consoleRef}
                  className="p-4 font-mono text-sm min-h-[160px] overflow-y-auto max-h-[220px]"
                >
                  {consoleLines.length === 0 ? (
                    <p className="text-gray-600 text-xs italic">
                      Output এখানে দেখা যাবে...
                    </p>
                  ) : (
                    <div className="space-y-0.5">
                      {consoleLines.map((l, i) => (
                        <div
                          key={i}
                          className={
                            l.startsWith("⚠️")
                              ? "text-yellow-400"
                              : l.startsWith(">>>")
                              ? "text-gray-400"
                              : "text-green-400"
                          }
                        >
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  {isRunning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Reset
                </motion.button>
                <button
                  disabled
                  className="px-4 py-3 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl border border-gray-200 cursor-not-allowed"
                >
                  Check
                </button>
              </div>

              {/* encouragement */}
              <AnimatePresence>
                {showEncourage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl"
                  >
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 0.5 }}
                      className="text-xl"
                    >
                      🎉
                    </motion.span>
                    <p className="text-sm font-bold text-green-700">
                      {encourage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 7: Solution ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Solution
            </h2>
          </div>
        </div>

        <div className="px-6 py-5">
          <button
            onClick={() => setSolutionOpen(!solutionOpen)}
            className="w-full flex items-center justify-between px-5 py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-2xl transition-all duration-200"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold text-amber-800">
              <span className="text-xl">{solutionOpen ? "👁️" : "🔒"}</span>
              {solutionOpen ? "Hide Solution" : "Show Solution"}
            </span>
            <motion.svg
              animate={{ rotate: solutionOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="w-5 h-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 9l-7 7-7-7"
              />
            </motion.svg>
          </button>

          <AnimatePresence>
            {solutionOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-2 text-gray-400 text-xs font-mono">
                        solution.py
                      </span>
                    </div>
                    <button
                      onClick={copySolution}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {solutionCopied ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
                    {[
                      { text: 'name = "Rahim"', parts: [{ c: "text-cyan-400", t: "name" }, { c: "text-yellow-400", t: " = " }, { c: "text-green-400", t: '"Rahim"' }] },
                      { text: "roll = 15", parts: [{ c: "text-cyan-400", t: "roll" }, { c: "text-yellow-400", t: " = " }, { c: "text-orange-400", t: "15" }] },
                      { text: "gpa = 5.0", parts: [{ c: "text-cyan-400", t: "gpa" }, { c: "text-yellow-400", t: " = " }, { c: "text-orange-400", t: "5.0" }] },
                      { text: "passed = True", parts: [{ c: "text-cyan-400", t: "passed" }, { c: "text-yellow-400", t: " = " }, { c: "text-rose-400", t: "True" }] },
                      { text: "", parts: [] },
                      { text: "print(name)", parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "name" }, { c: "text-gray-300", t: ")" }] },
                      { text: "print(roll)", parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "roll" }, { c: "text-gray-300", t: ")" }] },
                      { text: "print(gpa)", parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "gpa" }, { c: "text-gray-300", t: ")" }] },
                      { text: "print(passed)", parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "passed" }, { c: "text-gray-300", t: ")" }] },
                    ].map((item, i) => (
                      <div key={i} className="flex">
                        <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">
                          {item.parts.length > 0 ? i + 1 : ""}
                        </span>
                        <div>
                          {item.parts.map((p, j) => (
                            <span key={j} className={p.c}>{p.t}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 bg-gray-900">
                    <div className="p-3 bg-gray-800 rounded-lg font-mono text-xs">
                      <span className="text-gray-500">Output → </span>
                      <span className="text-green-400 font-bold">Rahim</span>
                      <br />
                      <span className="text-green-400 font-bold">15</span>
                      <br />
                      <span className="text-green-400 font-bold">5.0</span>
                      <br />
                      <span className="text-green-400 font-bold">True</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 8: AI Companion ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-fuchsia-500 to-purple-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              AI Coding Companion
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
            {/* header */}
            <div className="px-5 py-3.5 bg-purple-100/50 border-b border-purple-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg">
                <motion.span
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xl"
                >
                  🤖
                </motion.span>
              </div>
              <div>
                <p className="text-sm font-extrabold text-purple-900">PyBot</p>
                <p className="text-[10px] text-purple-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Online
                </p>
              </div>
            </div>

            {/* chat */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3"
                  >
                    <span className="text-3xl">👋</span>
                  </motion.div>
                  <p className="text-sm font-extrabold text-gray-800 mb-1">
                    Hello! I'm PyBot
                  </p>
                  <p className="text-xs text-gray-500 max-w-[240px] mb-4 leading-relaxed">
                    Data Types সম্পর্কে যেকোনো প্রশ্ন করো! নিচের যেকোনো
                    প্রশ্নে ক্লিক করো।
                  </p>
                  <div className="space-y-2 w-full max-w-[300px]">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 * i }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setAiInput(q);
                          setTimeout(() => aiRef.current?.focus(), 50);
                        }}
                        className="w-full text-left px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors shadow-sm"
                      >
                        💡 {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {aiMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-purple-600 text-white rounded-br-md"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {aiTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                            className="w-2 h-2 bg-purple-400 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* suggested chips */}
            {aiMessages.length > 0 && aiMessages.length < 6 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
                {SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiInput(q);
                      setTimeout(() => aiRef.current?.focus(), 50);
                    }}
                    className="flex-shrink-0 px-3 py-1.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-sm">
                <input
                  ref={aiRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && aiSend()}
                  placeholder="তোমার প্রশ্ন লেখো..."
                  className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={aiSend}
                  disabled={!aiInput.trim() || aiTyping}
                  className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ Bottom Actions ═══════════ */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={FADE_UP}
        className="flex items-center justify-between pt-6 border-t border-gray-200"
      >
        {!isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onComplete(LESSON_ID)}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-green-600 text-white text-sm font-extrabold rounded-2xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Complete
          </motion.button>
        ) : (
          <span className="flex items-center gap-2.5 px-7 py-3.5 bg-green-50 text-green-700 text-sm font-extrabold rounded-2xl border-2 border-green-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Completed!
          </span>
        )}

        {hasNext && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 text-white text-sm font-extrabold rounded-2xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Next Lesson
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
