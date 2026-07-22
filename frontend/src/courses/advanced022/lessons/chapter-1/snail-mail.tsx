import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch1-snail-mail";
const SOLUTION_LINES = [
  'print("Date: 29 May 2026")',
  'print("Feeling: super excited & full of dreams!")',
  'print("I want to build creative tools and help people using code.")',
  'print("Dear future programmer: keep learning, stay curious!")',
  'print("Favorite emoji: 🚀🐍")',
];
const SOLUTION_CODE = SOLUTION_LINES.join("\n");

const EXAMPLE_LINES = [
  'print("Hello from the past!")',
  'print("I am learning Python.")',
];

const SUGGESTED_QUESTIONS = [
  "print() দিয়ে চিঠি কিভাবে লিখবো?",
  "Quotation marks কেন দরকার?",
  "একাধিক print() কিভাবে ব্যবহার করবো?",
  "Emoji print() এ কাজ করে?",
  "print() এক লাইনে একাধিক কথা কি লেখা যায়?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! Letter master!",
];

const HINTS = [
  "প্রতিটি লাইনের জন্য print() ব্যবহার করো।",
  "লেখাগুলো অবশ্যই \" \" অথবা ' ' এর ভিতরে লিখতে হবে।",
  "প্রতিটি তথ্য আলাদা print() এ লিখলে পড়তে সহজ হবে।",
  "নিজের ইচ্ছামতো message লিখতে পারো।",
  "Emoji-ও print() এর মাধ্যমে দেখানো যায়।",
  "ভুল হলে ভয় পেও না—আবার চেষ্টা করো।",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch1SnailMailProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

export function Ch1SnailMail({
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: Ch1SnailMailProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [encourage, setEncourage] = useState("");
  const [showEncourage, setShowEncourage] = useState(false);
  const [exampleCopied, setExampleCopied] = useState(false);
  const [exampleRunning, setExampleRunning] = useState(false);
  const [exampleOutput, setExampleOutput] = useState<string[]>([]);
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [letterInMailbox, setLetterInMailbox] = useState(false);
  const [terminalMode, setTerminalMode] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [stepsDone, setStepsDone] = useState([false, false, false, false, false]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoComplete, setVideoComplete] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ role: "user" | "ai"; text: string }>
  >([]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLInputElement>(null);

  const codeLen = editorCode.length;
  const codeLines = editorCode.split("\n").length;

  /* video progress */
  useEffect(() => {
    if (!videoPlaying) return;
    const t = setInterval(() => {
      setVideoProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setVideoPlaying(false);
          setVideoComplete(true);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(t);
  }, [videoPlaying]);

  /* mailbox animation */
  useEffect(() => {
    const t1 = setTimeout(() => setMailboxOpen(true), 500);
    const t2 = setTimeout(() => setLetterInMailbox(true), 1200);
    const t3 = setTimeout(() => setTerminalMode(true), 2000);
    const t4 = setTimeout(() => {
      setTerminalLines(["print('Hello from the past!')"]);
    }, 2500);
    const t5 = setTimeout(() => {
      setTerminalLines((prev) => [...prev, "Hello from the past!"]);
    }, 3200);
    const t6 = setTimeout(() => {
      setTerminalLines((prev) => [...prev, "print('I am learning Python.')"]);
    }, 3800);
    const t7 = setTimeout(() => {
      setTerminalLines((prev) => [...prev, "I am learning Python."]);
    }, 4400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, []);

  /* example run */
  const handleExampleRun = useCallback(() => {
    setExampleRunning(true);
    setExampleOutput([]);
    setTimeout(() => {
      setExampleOutput(["Hello from the past!", "I am learning Python."]);
      setExampleRunning(false);
    }, 1000);
  }, []);

  const copyExample = useCallback(() => {
    navigator.clipboard.writeText(EXAMPLE_LINES.join("\n"));
    setExampleCopied(true);
    setTimeout(() => setExampleCopied(false), 2000);
  }, []);

  /* practice run */
  const handleRun = useCallback(() => {
    if (!editorCode.trim()) {
      setConsoleLines(["⚠️ প্রথমে কিছু কোড লেখো!"]);
      return;
    }
    setIsRunning(true);
    setConsoleLines([]);
    setTimeout(() => {
      const out: string[] = [];
      for (const line of editorCode.split("\n")) {
        const t = line.trim();
        if (t.startsWith("#")) continue;
        if (t.startsWith("print(") && t.endsWith(")")) {
          const inner = t.slice(6, -1).trim();
          if (
            (inner.startsWith("'") && inner.endsWith("'")) ||
            (inner.startsWith('"') && inner.endsWith('"'))
          ) {
            out.push(inner.slice(1, -1));
          } else {
            out.push(`>>> ${inner}`);
          }
        } else if (t) {
          out.push(`>>> ${t}`);
        }
      }
      if (out.length === 0) out.push("⚠️ কোনো output পাওয়া যায়নি।");
      setConsoleLines(out);
      setIsRunning(false);
      if (out.length > 0 && !out[0].startsWith("⚠️")) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
      }
    }, 650);
  }, [editorCode]);

  const handleReset = useCallback(() => {
    setEditorCode("");
    setConsoleLines([]);
    setShowEncourage(false);
  }, []);

  /* solution copy */
  const copySolution = useCallback(() => {
    navigator.clipboard.writeText(SOLUTION_CODE);
    setSolutionCopied(true);
    setTimeout(() => setSolutionCopied(false), 2000);
  }, []);

  /* hints */
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

  /* AI chat */
  const aiSend = useCallback(() => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages((m) => [...m, { role: "user", text: q }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      let a = "";
      if (q.includes("চিঠি") || q.includes("letter")) {
        a = "print() দিয়ে চিঠি লিখতে প্রতিটি line আলাদা print() এ লেখো। যেমন: print(' Dear Future Self')";
      } else if (q.includes("Quotation") || q.includes("quotation") || q.includes("\"")) {
        a = "Quotation marks ছাড়লে Python string বুঝতে পারে না। সবসময় \" \" অথবা ' ' ব্যবহার করো।";
      } else if (q.includes("একাধিক") || q.includes("multiple")) {
        a = "প্রতিটি message আলাদা print() এ লেখো। এক print()-এ এক line!";
      } else if (q.includes("Emoji") || q.includes("emoji")) {
        a = "হ্যাঁ! Emoji print() এ কাজ করে। print('🚀') — এভাবে emoji দেখাতে পারো!";
      } else {
        a = "ভালো প্রশ্ন! print() দিয়ে যেকোনো text, message, এমনকি emoji দেখাতে পারো!";
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
              print() দিয়ে মেসেজ পাঠাও!
            </h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              Python দিয়ে আমরা <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-semibold">print()</code> ব্যবহার করে মেসেজ দেখাতে পারি।
              এটি শুরুবের Python command গুলোর একটি!
            </p>
          </motion.div>

          {/* Animated mailbox → terminal sequence */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">
                ✨ Watch the magic happen
              </p>
              <div className="flex items-center justify-center gap-6 min-h-[160px]">
                {/* Mailbox */}
                <motion.div
                  animate={mailboxOpen ? { scale: 1 } : { scale: 0.8, opacity: 0.5 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-20 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl flex items-end justify-center pb-2 shadow-lg relative overflow-hidden">
                    <motion.div
                      animate={mailboxOpen ? { rotateX: -30 } : { rotateX: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-0 left-0 right-0 h-6 bg-blue-400 rounded-t-xl origin-top"
                    />
                    <span className="text-2xl relative z-10">📬</span>
                  </div>
                  <p className="text-[10px] text-center mt-1 font-bold text-gray-500">Mailbox</p>
                </motion.div>

                {/* Letter flying */}
                <AnimatePresence>
                  {letterInMailbox && !terminalMode && (
                    <motion.div
                      initial={{ x: -20, opacity: 0, rotate: -10 }}
                      animate={{ x: 0, opacity: 1, rotate: 0 }}
                      exit={{ x: 60, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.6 }}
                      className="text-3xl"
                    >
                      ✉️
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Arrow */}
                <motion.div
                  animate={terminalMode ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.8 }}
                  className="text-2xl text-gray-300"
                >
                  →
                </motion.div>

                {/* Terminal */}
                <motion.div
                  animate={terminalMode ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-900 rounded-xl p-3 w-48 shadow-lg"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  <div className="space-y-0.5 font-mono text-[10px]">
                    {terminalLines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={
                          line.startsWith("print(")
                            ? "text-purple-400"
                            : "text-green-400"
                        }
                      >
                        {line}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Key points */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            {[
              { icon: "📝", title: "এক print() = এক line", desc: "প্রতিটি print() একটি লাইন output দেখায়" },
              { icon: "💬", title: "Quotation marks দরকার", desc: "Text \" \" অথবা ' ' এর ভিতরে লিখো" },
              { icon: "✉️", title: "চিঠি লেখো print() দিয়ে", desc: "মেসেজ, চিঠি, reminder — সব সম্ভব!" },
              { icon: "🐍", title: "Python লোগো", desc: "print() হলো Python-এর প্রথম বন্ধু!" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white border-2 border-indigo-100 rounded-xl p-3 text-center shadow-sm"
              >
                <span className="text-2xl block mb-1">{item.icon}</span>
                <p className="text-xs font-bold text-gray-700">{item.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> print() দিয়ে
                যেকোনো message, letter, reminder দেখাতে পারো। এটি Python-এর
                সবচেয়ে প্রথম command!
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
          <motion.p variants={fadeUp} className="text-sm text-gray-500 mb-5">
            ভাবো — তুমি তোমার future self-কে একটি চিঠি লিখছো!
          </motion.p>

          {/* Animated story sequence */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-center justify-between min-h-[200px]">
                {/* Student at desk */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-center"
                >
                  <div className="text-4xl mb-1">🧑‍🎓</div>
                  <div className="text-2xl">📝</div>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">Writing...</p>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl text-gray-300"
                >
                  →
                </motion.div>

                {/* Calendar flipping */}
                <motion.div className="text-center">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-3xl"
                  >
                    📅
                  </motion.div>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">Future</p>
                </motion.div>

                {/* Arrow */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="text-2xl text-gray-300"
                >
                  →
                </motion.div>

                {/* Letter flying */}
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-3xl"
                >
                  ✉️
                </motion.div>

                {/* Arrow */}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  className="text-2xl text-gray-300"
                >
                  →
                </motion.div>

                {/* Future self receiving */}
                <motion.div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-4xl mb-1"
                  >
                    🎉
                  </motion.div>
                  <div className="text-2xl">😊</div>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">Happy!</p>
                </motion.div>
              </div>

              {/* Computer with Python code */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-4 bg-gray-900 rounded-xl p-3 font-mono text-xs"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span className="ml-1 text-gray-500 text-[9px]">letter.py</span>
                </div>
                <p className="text-purple-400">print(<span className="text-green-400">"Dear Future Me!"</span>)</p>
                <p className="text-purple-400">print(<span className="text-green-400">"Keep coding! 🚀"</span>)</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Python দিয়েও
                চিঠি লেখা যায়! print() ব্যবহার করে তোমার ভবিষ্যতের
                version-কে message পাঠাও!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 3: Example ═══════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={fadeUp}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💻</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Example
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors" />
                <span className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors" />
                <span className="ml-2 text-gray-400 text-xs font-mono">
                  letter.py
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyExample}
                  className="px-2 py-1 text-[10px] text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {exampleCopied ? "✓ Copied" : "📋 Copy"}
                </button>
                <button
                  onClick={handleExampleRun}
                  disabled={exampleRunning}
                  className="px-2 py-1 text-[10px] text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                >
                  ▶ Run
                </button>
              </div>
            </div>

            <div className="bg-gray-900 p-4 font-mono text-sm space-y-1 min-h-[80px]">
              {EXAMPLE_LINES.map((line, i) => (
                <div key={i} className="flex">
                  <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">{i + 1}</span>
                  <div>
                    <span className="text-purple-400">print</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-green-400">{line.slice(6, -1)}</span>
                    <span className="text-gray-300">)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-950 border-t border-gray-700">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  Terminal
                </span>
              </div>
              <div className="p-4 min-h-[60px] font-mono text-sm">
                {exampleRunning ? (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full"
                    />
                    Running...
                  </div>
                ) : exampleOutput.length > 0 ? (
                  <div className="space-y-0.5">
                    {exampleOutput.map((l, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="text-green-400"
                      >
                        {l}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs italic">
                    Run বাটনে ক্লিক করো...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 4: Instructions ═══════════ */}
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
              নির্দেশনা ・ letter.py ・ Future Self
            </h2>
          </div>
        </motion.div>

        <div className="px-6 py-6">
          {/* mission card */}
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
                    Mission: Future Self-কে চিঠি লেখো!
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {stepsDone.map((d, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          d ? "bg-green-400" : "bg-orange-200"
                        } ${i === 0 ? "w-12" : i === 1 ? "w-10" : "w-8"}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-gray-500 ml-1">
                      {stepsDone.filter(Boolean).length}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-orange-100 border border-orange-300 rounded-lg text-xs font-mono font-bold text-orange-700">
                  📄 letter.py
                </span>
              </div>
            </div>
          </motion.div>

          {/* instruction text */}
          <motion.div variants={fadeUp} className="mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-3">
              <p className="text-sm text-gray-800 leading-relaxed">
                একটি খালি <strong className="font-extrabold">letter.py</strong> প্রোগ্রাম তৈরি করো।
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                এই exercise-এ তুমি Python ব্যবহার করে তোমার future self-কে একটি চিঠি লিখবে।
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                একটু ভাবো – coding শেখার এই যাত্রায় তুমি কী অর্জন করতে চাও।
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                print() ব্যবহার করে নিচের বিষয়গুলো output দেখাও:
              </p>
            </div>
          </motion.div>

          {/* steps */}
          <div className="space-y-3">
            {[
              { text: "আজকের তারিখ", icon: "📅", num: 1 },
              { text: "এখন তোমার কেমন লাগছে", icon: "😊", num: 2 },
              { text: "Coding শিখে তুমি কী করতে চাও", icon: "🎯", num: 3 },
              { text: "ভবিষ্যতের programmer version-এর জন্য একটি মেসেজ", icon: "💌", num: 4 },
              { text: "তোমার favorite emoji", icon: "🚀", num: 5 },
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
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    stepsDone[i]
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  {stepsDone[i] ? "✓" : step.icon}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {step.num}. {step.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* example code hint */}
          <motion.div variants={fadeUp} className="mt-4">
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-xs space-y-0.5">
              <p className="text-purple-400">
                print(<span className="text-green-400">"Date: 29 May 2026"</span>)
              </p>
              <p className="text-purple-400">
                print(<span className="text-green-400">"Feeling: super excited!"</span>)
              </p>
            </div>
          </motion.div>

          {/* completion */}
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

      {/* ═══════════ SECTION 5: Hint ═══════════ */}
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

      {/* ═══════════ SECTION 6: Walkthrough Video ═══════════ */}
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
            onClick={() => {
              if (!videoComplete) setVideoPlaying(!videoPlaying);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-800 to-pink-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={videoPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1.5, repeat: videoPlaying ? Infinity : 0 }}
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
                    Chapter 1: Snail Mail
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Writing letters with print() in Bangla
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
              7:24
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
              7:24
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 7: Practice ═══════════ */}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">
                Goal: Future Self-কে চিঠি লেখো print() দিয়ে!
              </p>
            </div>
            <div className="space-y-1 text-xs text-purple-700 ml-8">
              <p>✔ আজকের তারিখ লেখো</p>
              <p>✔ তোমার feeling লেখো</p>
              <p>✔ ভবিষ্যতের জন্য message লেখো</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">
                    letter.py
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
                  placeholder={"print('Date: 29 May 2026')\nprint('Feeling: excited!')\nprint('I want to code!')"}
                  className="flex-1 bg-transparent text-green-400 font-mono text-sm p-3 resize-none outline-none leading-6 min-h-[288px] placeholder-gray-600"
                  spellCheck={false}
                />
              </div>
            </div>

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

      {/* ═══════════ SECTION 8: Solution ═══════════ */}
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
                        letter.py
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
                    {SOLUTION_LINES.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex"
                      >
                        <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">
                          {i + 1}
                        </span>
                        <div>
                          <span className="text-purple-400">print</span>
                          <span className="text-gray-300">(</span>
                          <span className="text-green-400">
                            {line.slice(6, -1)}
                          </span>
                          <span className="text-gray-300">)</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 9: AI Companion ═══════════ */}
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
                    print() দিয়ে চিঠি লেখা সম্পর্কে যেকোনো প্রশ্ন করো!
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
