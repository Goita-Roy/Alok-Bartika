import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch2-basic";
const SOLUTION_CODE = `name = "Rahim"\nage = 13\nfood = "Mango"\n\nprint(name)\nprint(age)\nprint(food)`;

const SUGGESTED_QUESTIONS = [
  "Variable কী?",
  "Variable কেন ব্যবহার করি?",
  "= কী কাজ করে?",
  "print(name) কেন লিখি?",
  "Variable-এর নাম কীভাবে দিই?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! Variable master!",
];

const HINTS = [
  "Variable-এর নাম দাও, তারপর = ব্যবহার করো।",
  "Value লেখো — text হলে quotes ব্যবহার করো।",
  "print() দিয়ে variable-এর নাম লিখে output দেখাও।",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch2BasicProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── Animated Variable Container ── */
function VariableContainer({
  name,
  value,
  color,
  delay,
  icon,
}: {
  name: string;
  value: string;
  color: string;
  delay: number;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="flex flex-col items-center"
    >
      <div
        className={`relative w-32 h-28 ${color} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center shadow-lg overflow-hidden`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="absolute -top-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow text-sm"
        >
          {icon}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="font-mono text-[11px] font-extrabold text-gray-700 bg-white/80 px-2 py-0.5 rounded-full mb-1"
        >
          {name}
        </motion.div>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ delay: delay + 0.6, duration: 0.4 }}
          className="font-mono text-xs font-bold text-gray-800 bg-white/60 px-2 py-1 rounded-lg"
        >
          "{value}"
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Arrow Animation ── */
function ArrowConnect({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col items-center -my-2"
    >
      <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </motion.div>
  );
}

/* ── Memory Visualization ── */
function MemoryViz() {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 space-y-3">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">🧠 Memory</p>
      {[
        { name: "name", value: "Rahim", color: "bg-indigo-500" },
        { name: "age", value: "13", color: "bg-emerald-500" },
        { name: "food", value: "Mango", color: "bg-amber-500" },
      ].map((v, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.3, duration: 0.5, type: "spring" }}
          className="flex items-center gap-3"
        >
          <div className={`${v.color} w-2 h-8 rounded-full`} />
          <div className="flex-1 flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">{v.name}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="font-mono text-xs font-bold text-green-400 bg-white/5 px-2 py-1 rounded">"{v.value}"</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Ch2Basic({
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: Ch2BasicProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [encourage, setEncourage] = useState("");
  const [showEncourage, setShowEncourage] = useState(false);
  const [stepsDone, setStepsDone] = useState([false, false, false]);
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
      if (out.includes("Rahim") || out.includes("Mango")) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
        setStepsDone([true, true, true]);
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
      if (q.includes("Variable") || q.includes("variable")) {
        a = "Variable হলো একটি container — যেটি কম্পিউটারের মধ্যে কোনো তথ্য সংরক্ষণ করে। যেমন: name = \"Rahim\" — এখানে name হলো Variable, আর \"Rahim\" হলো সংরক্ষিত মান।";
      } else if (q.includes("কেন") || q.includes("ব্যবহার")) {
        a = "Variable ব্যবহার করি যাতে তথ্য একবার সংরক্ষণ করে বারবার ব্যবহার করা যায়। যেমন: তোমার নাম একবার রাখলে print(name) দিয়ে যতবার চাও output দেখাতে পারো!";
      } else if (q.includes("=")) {
        a = "= হলো assignment operator। এটি বাম পাশের Variable-এ ডান পাশের value সংরক্ষণ করে। যেমন: name = \"Rahim\" — এখানে \"Rahim\" মানটি name Variable-এ রাখা হয়েছে।";
      } else if (q.includes("print") || q.includes("লিখি")) {
        a = "print(name) লিখলে Python name Variable-এ যে value আছে সেটি স্ক্রিনে দেখায়। যেমন: name = \"Rahim\" হলে print(name) লেখে \"Rahim\" output দেখাবে।";
      } else if (q.includes("নাম") || q.includes("নামকরণ")) {
        a = "Variable-এর নাম দেওয়ার নিয়ম: ১) শুরুতে letter বা underscore (_) থাকতে হবে, ২) space বা special character ব্যবহার করা যায় না, ৩) Python reserved word ব্যবহার করা যায় না। ভালো অভ্যাস: name, age, food — ছোট অক্ষরে লেখো!";
      } else {
        a = "ভালো প্রশ্ন! Variable Python-এর সবচেয়ে গুরুত্বপূর্ণ concept। নিচের suggested questions দেখো!";
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
        variants={stagger}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={fadeUp}
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
          <motion.div variants={fadeUp}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Variable মানে কী?
            </h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              Variable হলো একটি <span className="font-bold text-indigo-600">container</span> — যেটি কম্পিউটারের মধ্যে কোনো তথ্য সংরক্ষণ করে।
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              ঠিক যেমন একটি বাক্সে নাম দেওয়া হয়, তেমনি Variable-ও একটি নাম থাকে।
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-5">
                ✨ Variable-এর কাঠামো
              </p>
              <div className="flex flex-col items-center gap-3">
                <VariableContainer
                  name='name = "Rahim"'
                  value="Rahim"
                  color="bg-indigo-100 border-indigo-300"
                  delay={0.2}
                  icon="🏷️"
                />
                <ArrowConnect delay={0.8} />
                <VariableContainer
                  name='age = 13'
                  value="13"
                  color="bg-emerald-100 border-emerald-300"
                  delay={0.5}
                  icon="🔢"
                />
                <ArrowConnect delay={1.1} />
                <VariableContainer
                  name='food = "Mango"'
                  value="Mango"
                  color="bg-amber-100 border-amber-300"
                  delay={0.8}
                  icon="🧃"
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🏷️", label: "নাম", desc: "Variable Name" },
                { icon: "📦", label: "মান", desc: "Stored Value" },
                { icon: "🔄", label: "ব্যবহার", desc: "Reuse Again" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-white border-2 border-indigo-100 rounded-xl p-3 text-center shadow-sm"
                >
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <p className="text-xs font-bold text-gray-700">{item.label}</p>
                  <p className="text-[10px] font-mono text-indigo-600 mt-0.5">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              Python-এ Variable তৈরি করতে <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-xs font-semibold">=</code> চিহ্ন ব্যবহার করি।
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-gray-900 rounded-2xl p-4 font-mono text-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-2 text-gray-500 text-xs">variables.py</span>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-cyan-400">name</span>
                  <span className="text-yellow-400"> = </span>
                  <span className="text-green-400">"Rahim"</span>
                </div>
                <div>
                  <span className="text-cyan-400">age</span>
                  <span className="text-yellow-400"> = </span>
                  <span className="text-orange-400">13</span>
                </div>
                <div>
                  <span className="text-cyan-400">food</span>
                  <span className="text-yellow-400"> = </span>
                  <span className="text-green-400">"Mango"</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-gray-500 text-xs mb-2">Output:</p>
                <div>
                  <span className="text-purple-400">print</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-cyan-400">name</span>
                  <span className="text-gray-300">)</span>
                  <span className="text-gray-600 ml-2">→ Rahim</span>
                </div>
                <div>
                  <span className="text-purple-400">print</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-cyan-400">age</span>
                  <span className="text-gray-300">)</span>
                  <span className="text-gray-600 ml-2">→ 13</span>
                </div>
                <div>
                  <span className="text-purple-400">print</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-cyan-400">food</span>
                  <span className="text-gray-300">)</span>
                  <span className="text-gray-600 ml-2">→ Mango</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <MemoryViz />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Variable হলো
                একটি "বাক্স" — তুমি একবার value রাখো, তারপর যতবার চাও
                print() দিয়ে দেখাতে পারো!
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
        variants={stagger}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={fadeUp}
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
            variants={fadeUp}
            className="text-sm text-gray-500 mb-5"
          >
            জীবনে আমরা অনেক জায়গায় variable-এর মতো কাজ করি!
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            {/* School Bag */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎒</span>
                <p className="text-sm font-bold text-gray-800">School Bag</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/80 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Bag Name</p>
                  <p className="font-mono text-xs font-bold text-blue-700">bag = "MySchoolBag"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="bg-white/80 border border-blue-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Items Inside</p>
                  <p className="font-mono text-xs font-bold text-green-700">Books, Pencil, Eraser</p>
                </div>
              </div>
            </motion.div>

            {/* Storage Box */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📦</span>
                <p className="text-sm font-bold text-gray-800">Storage Box</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Box Name</p>
                  <p className="font-mono text-xs font-bold text-amber-700">box = "Toys"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="bg-white/80 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Inside</p>
                  <p className="font-mono text-xs font-bold text-green-700">Car, Doll, Ball</p>
                </div>
              </div>
            </motion.div>

            {/* Name Tag */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🏷️</span>
                <p className="text-sm font-bold text-gray-800">Name Tag</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/80 border border-green-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Tag</p>
                  <p className="font-mono text-xs font-bold text-green-700">name = "Rahim"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="bg-white/80 border border-green-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Written</p>
                  <p className="font-mono text-xs font-bold text-green-700">Rahim</p>
                </div>
              </div>
            </motion.div>

            {/* Water Bottle */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🧃</span>
                <p className="text-sm font-bold text-gray-800">Water Bottle</p>
              </div>
              <div className="space-y-2">
                <div className="bg-white/80 border border-cyan-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Bottle</p>
                  <p className="font-mono text-xs font-bold text-cyan-700">bottle = "Water"</p>
                </div>
                <div className="text-center text-gray-400">↓</div>
                <div className="bg-white/80 border border-cyan-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Contains</p>
                  <p className="font-mono text-xs font-bold text-green-700">500ml Water</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Variable-এর
                কাজ ঠিক একই — একটি নাম দাও, মান রাখো, তারপর প্রয়োজনে
                ব্যবহার করো!
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
        variants={stagger}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <motion.div
          variants={fadeUp}
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
          <motion.div variants={fadeUp} className="mb-5">
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
                    Mission: Variables তৈরি করো!
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {stepsDone.map((d, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i === 0 ? "w-16" : i === 1 ? "w-12" : "w-10"
                        } ${d ? "bg-green-400" : "bg-orange-200"}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-1">
                      {stepsDone.filter(Boolean).length}/3
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p className="text-cyan-400">name = <span className="text-green-400">"Rahim"</span></p>
                <p className="text-cyan-400">age = <span className="text-orange-400">13</span></p>
                <p className="text-cyan-400">food = <span className="text-green-400">"Mango"</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                text: "নিচের Practice সেকশনে যাও।",
                code: false,
              },
              {
                num: 2,
                text: "Code Editor-এ নিচের কোডটি লেখো:",
                code: true,
              },
              {
                num: 3,
                text: "Run বাটনে ক্লিক করো এবং output দেখো!",
                code: false,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
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
                    {step.text}
                  </p>
                  {step.code && (
                    <div className="mt-2 bg-gray-900 rounded-lg p-2.5 font-mono text-xs space-y-0.5">
                      <p><span className="text-cyan-400">name</span> <span className="text-yellow-400">=</span> <span className="text-green-400">"Rahim"</span></p>
                      <p><span className="text-cyan-400">age</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">13</span></p>
                      <p><span className="text-cyan-400">food</span> <span className="text-yellow-400">=</span> <span className="text-green-400">"Mango"</span></p>
                      <p className="pt-1 border-t border-gray-700"><span className="text-purple-400">print</span>(<span className="text-cyan-400">name</span>)</p>
                      <p><span className="text-purple-400">print</span>(<span className="text-cyan-400">age</span>)</p>
                      <p><span className="text-purple-400">print</span>(<span className="text-cyan-400">food</span>)</p>
                    </div>
                  )}
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
        variants={fadeUp}
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
        variants={fadeUp}
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
                    Chapter 2: Variables
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Variables explained in Bangla
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
              6:15
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
              6:15
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 6: Practice ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={fadeUp}
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
          <motion.div
            variants={fadeUp}
            className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">
                Goal: তোমার Name, Age, Favourite Food Variable-এ রাখো!
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-center text-sm space-y-1">
              <p className="text-cyan-400">name = <span className="text-green-400">"তোমার নাম"</span></p>
              <p className="text-cyan-400">age = <span className="text-orange-400">তোমার বয়স</span></p>
              <p className="text-cyan-400">food = <span className="text-green-400">"তোমার পছন্দের খাবার"</span></p>
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
                    variables.py
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
                  placeholder={'name = "Rahim"\nage = 13\nfood = "Mango"\n\nprint(name)\nprint(age)\nprint(food)'}
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
        variants={fadeUp}
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
                      { line: 'name = "Rahim"', type: "assign" },
                      { line: "age = 13", type: "assign" },
                      { line: 'food = "Mango"', type: "assign" },
                      { line: "", type: "empty" },
                      { line: "print(name)", type: "print" },
                      { line: "print(age)", type: "print" },
                      { line: "print(food)", type: "print" },
                    ].map((item, i) => (
                      <div key={i} className="flex">
                        <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">
                          {i + 1}
                        </span>
                        <div>
                          {item.type === "assign" && (
                            <>
                              <span className="text-cyan-400">{item.line.split(" = ")[0]}</span>
                              <span className="text-yellow-400"> = </span>
                              <span className="text-green-400">{item.line.split(" = ")[1]}</span>
                            </>
                          )}
                          {item.type === "print" && (
                            <>
                              <span className="text-purple-400">print</span>
                              <span className="text-gray-300">(</span>
                              <span className="text-cyan-400">{item.line.slice(6, -1)}</span>
                              <span className="text-gray-300">)</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 bg-gray-900">
                    <div className="p-3 bg-gray-800 rounded-lg font-mono text-xs">
                      <span className="text-gray-500">Output → </span>
                      <span className="text-green-400 font-bold">Rahim</span>
                      <br />
                      <span className="text-green-400 font-bold">13</span>
                      <br />
                      <span className="text-green-400 font-bold">Mango</span>
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
        variants={fadeUp}
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
                    Variable সম্পর্কে যেকোনো প্রশ্ন করো! নিচের যেকোনো
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
        variants={fadeUp}
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
