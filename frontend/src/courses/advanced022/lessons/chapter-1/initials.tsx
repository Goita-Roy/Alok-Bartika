import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch1-initials";
const SOLUTION_LINES = [
  '# I love playing cricket.',
  'print("DDDD   L")',
  'print("D   D  L")',
  'print("D   D  L")',
  'print("D   D  L")',
  'print("D   D  L")',
  'print("D   D  L")',
  'print("DDDD   LLLLL")',
];
const SOLUTION_CODE = SOLUTION_LINES.join("\n");

const EXAMPLE_LINES = [
  '# My favorite game is Football',
  "",
  'print("Hello!")',
];

const SUGGESTED_QUESTIONS = [
  "Comment কী?",
  "Python কেন Comment পড়ে না?",
  "আমার Initials ঠিকভাবে দেখাচ্ছে না কেন?",
  "কতগুলো print() ব্যবহার করবো?",
  "Block Letter কী?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! Comment master!",
];

const HINTS = [
  "Comment সবসময় # দিয়ে শুরু হয়।",
  "Comment Python কর্তৃক উপেক্ষিত হয়।",
  "প্রতিটি letter-এর প্রতিটি line আলাদা print() দিয়ে লেখো।",
  "সঠিক alignment-এর জন্য space সঠিকভাবে ব্যবহার করো।",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch1InitialsProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

export function Ch1Initials({
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: Ch1InitialsProps) {
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
  const [commentFaded, setCommentFaded] = useState(false);
  const [stepsDone, setStepsDone] = useState([false, false, false]);
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

  /* example run */
  const handleExampleRun = useCallback(() => {
    setExampleRunning(true);
    setExampleOutput([]);
    setCommentFaded(false);
    setTimeout(() => setCommentFaded(true), 400);
    setTimeout(() => {
      setExampleOutput(["Hello!"]);
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
      if (q.toLowerCase().includes("comment")) {
        a = "Comment হলো # দিয়ে শুরু হওয়া লাইন। Python এটি পড়ে না — এটি শুধু মানুষদের জন্য!";
      } else if (q.includes("পড়ে না") || q.includes("ignore")) {
        a = "Python শুধু executable code run করে। Comment (# দিয়ে শুরু) Python-এর কাছে অদৃশ্য!";
      } else if (q.includes("Initials") || q.includes("initials")) {
        a = "Initials মানে তোমার নামের প্রথম অক্ষর। প্রতিটি letter print() দিয়ে Block Letter-এ লেখো।";
      } else if (q.includes("print") || q.includes("কতবার")) {
        a = "প্রতিটি line আলাদা print() দিয়ে লিখতে হবে। Comment-এর পর প্রতিটি initials-এর line একটি print()!";
      } else if (q.includes("Block")) {
        a = "Block Letter মানে বড় অক্ষর যা print()-এর মধ্যে space দিয়ে তৈরি করা হয়। যেমন: print('DDDD')";
      } else {
        a = "ভালো প্রশ্ন! নিচের suggested questions দেখো।";
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
          {/* What is a comment */}
          <motion.div variants={fadeUp}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Comment মানে কী?
            </h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              Comment হলো এমন একটি লাইন যা শুধু মানুষদের জন্য লেখা হয়।
              Python এটি পড়ে না!
            </p>
          </motion.div>

          {/* Animated # symbol */}
          <motion.div variants={fadeUp} className="flex justify-center py-2">
            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl"
              >
                <span className="text-5xl font-mono font-black text-white">
                  #
                </span>
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-indigo-400 rounded-3xl -z-10 blur-xl"
              />
            </div>
          </motion.div>

          {/* Comment vs Code comparison */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-mono font-bold">#</span>
                </span>
                <p className="text-sm font-bold text-indigo-800">Comment</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                <p className="text-gray-500"># I love football</p>
              </div>
              <p className="mt-2 text-[10px] text-indigo-600 font-semibold">
                Python এটি দেখে না!
              </p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-mono font-bold">&gt;&gt;</span>
                </span>
                <p className="text-sm font-bold text-green-800">Code</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                <p className="text-green-400">print("Hello!")</p>
              </div>
              <p className="mt-2 text-[10px] text-green-600 font-semibold">
                Python এটি run করে!
              </p>
            </div>
          </motion.div>

          {/* Animation: comment fades out when run */}
          <motion.div variants={fadeUp}>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5">
              <p className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3">
                ✨ Watch what happens when you Run
              </p>
              <div className="bg-gray-900 rounded-xl p-4 space-y-1">
                <motion.p
                  animate={
                    commentFaded
                      ? { opacity: 0.25 }
                      : { opacity: 1 }
                  }
                  transition={{ duration: 0.5 }}
                  className="font-mono text-sm text-gray-500"
                >
                  # I love football
                </motion.p>
                <motion.p
                  animate={
                    commentFaded
                      ? { opacity: 1, x: [0, 4, 0] }
                      : { opacity: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className="font-mono text-sm text-green-400"
                >
                  print("Hello!")
                </motion.p>
                {commentFaded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-2 mt-2 border-t border-gray-700"
                  >
                    <p className="text-xs text-green-400 font-mono">
                      Output: Hello!
                    </p>
                  </motion.div>
                )}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCommentFaded(false);
                  setTimeout(() => setCommentFaded(true), 300);
                }}
                className="mt-3 px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-xl hover:bg-purple-600 transition-colors"
              >
                ▶ Watch Again
              </motion.button>
            </div>
          </motion.div>

          {/* Key point */}
          <motion.div variants={fadeUp}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Comment মানে
                "#" দিয়ে শুরু। Python এটি ignore করে — শুধু মানুষ পড়তে পারে!
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
            জীবনে আমরা অনেক জায়গায় comment-এর মতো জিনিস ব্যবহার করি!
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            {/* Sticky Note */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.03, rotate: -1 }}
              className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-center mb-3"
              >
                <div className="inline-block bg-yellow-200 px-4 py-3 rounded-lg shadow-md transform rotate-2">
                  <p className="text-xs font-bold text-yellow-800 font-mono">
                    📝 পড়তে ভুোোবেন না!
                  </p>
                </div>
              </motion.div>
              <p className="text-sm font-bold text-gray-800 text-center">
                Sticky Note
              </p>
              <p className="text-[10px] text-gray-500 text-center mt-1">
                শুধু পড়ার জন্য
              </p>
            </motion.div>

            {/* Teacher's Note */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.03, rotate: 1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="text-center mb-3"
              >
                <div className="inline-block bg-blue-100 px-4 py-3 rounded-lg shadow-md transform -rotate-1">
                  <p className="text-xs font-bold text-blue-800">
                    📖 শিক্ষকের নোট
                  </p>
                </div>
              </motion.div>
              <p className="text-sm font-bold text-gray-800 text-center">
                Teacher's Note
              </p>
              <p className="text-[10px] text-gray-500 text-center mt-1">
                বইতে লেখা
              </p>
            </motion.div>

            {/* Package Label */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.03, rotate: -1 }}
              className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="text-center mb-3"
              >
                <div className="inline-block bg-orange-100 px-4 py-3 rounded-lg shadow-md transform rotate-1">
                  <p className="text-xs font-bold text-orange-800">
                    📦 ভাঙো না!
                  </p>
                </div>
              </motion.div>
              <p className="text-sm font-bold text-gray-800 text-center">
                Package Label
              </p>
              <p className="text-[10px] text-gray-500 text-center mt-1">
                প্যাকেজে লেখা
              </p>
            </motion.div>

            {/* Notebook Reminder */}
            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.03, rotate: 1 }}
              className="bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 rounded-2xl p-4"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="text-center mb-3"
              >
                <div className="inline-block bg-green-100 px-4 py-3 rounded-lg shadow-md transform -rotate-2">
                  <p className="text-xs font-bold text-green-800">
                    📒 মনে রাখো!
                  </p>
                </div>
              </motion.div>
              <p className="text-sm font-bold text-gray-800 text-center">
                Notebook Reminder
              </p>
              <p className="text-[10px] text-gray-500 text-center mt-1">
                খাতায় লেখা
              </p>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Comment
                হলো code-এর মধ্যে sticky note — শুধু মানুষদের জন্য। Python
                এটি ignore করে!
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
            {/* title bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors" />
                <span className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors" />
                <span className="ml-2 text-gray-400 text-xs font-mono">
                  example.py
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

            {/* code */}
            <div className="bg-gray-900 p-4 font-mono text-sm space-y-1 min-h-[100px]">
              <div className="flex">
                <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">1</span>
                <motion.p
                  animate={exampleRunning ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 1 }}
                  className={exampleRunning ? "text-gray-500" : "text-gray-500"}
                >
                  # My favorite game is Football
                </motion.p>
              </div>
              <div className="flex">
                <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">2</span>
                <p className="text-gray-300">&nbsp;</p>
              </div>
              <div className="flex">
                <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">3</span>
                <p>
                  <span className="text-purple-400">print</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-green-400">"Hello!"</span>
                  <span className="text-gray-300">)</span>
                </p>
              </div>
            </div>

            {/* terminal */}
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
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-xs text-gray-500 mt-2"
                    >
                      (comment line output-এ দেখা যায় না!)
                    </motion.p>
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
              নির্দেশনা
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
                    Mission: initials.py তৈরি করো!
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

              {/* file name badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-orange-100 border border-orange-300 rounded-lg text-xs font-mono font-bold text-orange-700">
                  📄 initials.py
                </span>
              </div>
            </div>
          </motion.div>

          {/* step 1: Comment */}
          <motion.div
            variants={fadeUp}
            onClick={() => toggleStep(0)}
            className={`mb-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              stepsDone[0]
                ? "bg-green-50 border-green-300 shadow-sm"
                : "bg-orange-50 border-orange-100 hover:border-orange-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={stepsDone[0] ? { scale: [1, 1.3, 1] } : {}}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${
                  stepsDone[0] ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {stepsDone[0] ? "✓" : "1"}
              </motion.div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">
                  তোমার সম্পর্কে একটি fun fact comment লেখো:
                </p>
                <div className="mt-2 bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                  <p className="text-gray-500"># I love playing cricket.</p>
                </div>
                <p className="mt-1.5 text-[10px] text-gray-500">
                  # দিয়ে শুরু করো — এটি comment!
                </p>
              </div>
            </div>
          </motion.div>

          {/* step 2: Initials */}
          <motion.div
            variants={fadeUp}
            onClick={() => toggleStep(1)}
            className={`mb-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              stepsDone[1]
                ? "bg-green-50 border-green-300 shadow-sm"
                : "bg-orange-50 border-orange-100 hover:border-orange-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={stepsDone[1] ? { scale: [1, 1.3, 1] } : {}}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${
                  stepsDone[1] ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {stepsDone[1] ? "✓" : "2"}
              </motion.div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm mb-2">
                  তোমার initials Block Letter-এ print করো:
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  উদাহরণ (যদি নাম হয় Dua Lipa):
                </p>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-0.5">
                  <p className="text-green-400">print("DDDD   L")</p>
                  <p className="text-green-400">print("D   D  L")</p>
                  <p className="text-green-400">print("D   D  L")</p>
                  <p className="text-green-400">print("D   D  L")</p>
                  <p className="text-green-400">print("D   D  L")</p>
                  <p className="text-green-400">print("D   D  L")</p>
                  <p className="text-green-400">print("DDDD   LLLLL")</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* step 3: Run */}
          <motion.div
            variants={fadeUp}
            onClick={() => toggleStep(2)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              stepsDone[2]
                ? "bg-green-50 border-green-300 shadow-sm"
                : "bg-orange-50 border-orange-100 hover:border-orange-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={stepsDone[2] ? { scale: [1, 1.3, 1] } : {}}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${
                  stepsDone[2] ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                }`}
              >
                {stepsDone[2] ? "✓" : "3"}
              </motion.div>
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Run বাটনে ক্লিক করো!
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Output-এ শুধু initials দেখা যাবে, comment দেখা যাবে না।
                </p>
              </div>
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
                    Chapter 1: Initials
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Comments & Block Letters in Bangla
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
              6:18
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
              6:18
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
          {/* mission reminder */}
          <motion.div
            variants={fadeUp}
            className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">
                Goal: Comment লেখো এবং Initials print করো!
              </p>
            </div>
            <div className="space-y-1 text-xs text-purple-700 ml-8">
              <p>✔ একটি Python comment লেখো</p>
              <p>✔ তোমার initials Block Letter-এ print করো</p>
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
                    initials.py
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
                  placeholder={"# I love cricket\nprint('DDDD   L')\nprint('D   D  L')"}
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
                        initials.py
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
                          {line.startsWith("#") ? (
                            <span className="text-gray-500">{line}</span>
                          ) : (
                            <>
                              <span className="text-purple-400">print</span>
                              <span className="text-gray-300">(</span>
                              <span className="text-green-400">
                                {line.slice(6, -1)}
                              </span>
                              <span className="text-gray-300">)</span>
                            </>
                          )}
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
                    Comment ও Initials সম্পর্কে যেকোনো প্রশ্ন করো!
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
