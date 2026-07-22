import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch2-pythagorean";
const SOLUTION_CODE = `a = 3\nb = 4\n\nc = (a ** 2 + b ** 2) ** 0.5\n\nprint(c)`;

const SUGGESTED_QUESTIONS = [
  "Pythagorean Theorem কী?",
  "Hypotenuse কী?",
  "** Operator কেন ব্যবহার করছি?",
  "**0.5 মানে কী?",
  "Right Triangle কী?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! Pythagorean master!",
];

const HINTS = [
  "Python-এ বর্গ করতে ** operator ব্যবহার করো — যেমন: a ** 2",
  "দুটো বাহুকে আলাদাভাবে বর্গ করো — a ** 2 এবং b ** 2",
  "দুটো বর্গকে যোগ করো — (a ** 2 + b ** 2)",
  "বর্গমূল নিতে **0.5 ব্যবহার করো — (a ** 2 + b ** 2) ** 0.5",
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch2PythagoreanProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── Animated Triangle ── */
function AnimatedTriangle() {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <svg viewBox="0 0 260 200" className="w-full h-full max-w-xs">
        {/* Right angle marker */}
        <motion.path
          d="M 60 160 L 60 130 L 90 130 L 90 160"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />
        {/* Right angle label */}
        <motion.text
          x="72"
          y="150"
          fill="#f59e0b"
          fontSize="10"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          90°
        </motion.text>

        {/* Side a (vertical) */}
        <motion.line
          x1="60"
          y1="160"
          x2="60"
          y2="40"
          stroke="#3b82f6"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />
        <motion.text
          x="30"
          y="100"
          fill="#3b82f6"
          fontSize="16"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          a
        </motion.text>

        {/* Side b (horizontal) */}
        <motion.line
          x1="60"
          y1="160"
          x2="200"
          y2="160"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
        <motion.text
          x="120"
          y="185"
          fill="#10b981"
          fontSize="16"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          b
        </motion.text>

        {/* Side c (hypotenuse) */}
        <motion.line
          x1="60"
          y1="40"
          x2="200"
          y2="160"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />
        <motion.text
          x="140"
          y="85"
          fill="#ef4444"
          fontSize="16"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          c (Hypotenuse)
        </motion.text>

        {/* Glowing dots on corners */}
        <motion.circle
          cx="60"
          cy="160"
          r="5"
          fill="#f59e0b"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.1, duration: 0.5 }}
        />
        <motion.circle
          cx="60"
          cy="40"
          r="5"
          fill="#3b82f6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />
        <motion.circle
          cx="200"
          cy="160"
          r="5"
          fill="#10b981"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />
      </svg>
    </div>
  );
}

/* ── Formula Animation ── */
function FormulaAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { label: "a²", value: "3²", color: "text-blue-400" },
    { label: "b²", value: "4²", color: "text-emerald-400" },
    { label: "a²", value: "9", color: "text-blue-400" },
    { label: "b²", value: "16", color: "text-emerald-400" },
    { label: "a² + b²", value: "9 + 16", color: "text-amber-400" },
    { label: "Total", value: "25", color: "text-amber-400" },
    { label: "√25", value: "5", color: "text-red-400" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "▶ Next Step" : "🔄 Restart Animation"}
      </button>

      <div className="grid grid-cols-2 gap-3">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              i <= step
                ? { opacity: 1, scale: 1 }
                : { opacity: 0.3, scale: 0.8 }
            }
            transition={{ duration: 0.4, type: "spring" }}
            className={`p-3 rounded-xl border-2 ${
              i <= step
                ? "bg-gray-800 border-indigo-500/50"
                : "bg-gray-800/50 border-gray-700"
            }`}
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
              {s.label}
            </p>
            <p className={`font-mono text-lg font-bold ${i <= step ? s.color : "text-gray-600"}`}>
              {s.value}
            </p>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            step >= steps.length - 1
              ? { opacity: 1, scale: 1 }
              : { opacity: 0.3, scale: 0.8 }
          }
          transition={{ duration: 0.4, type: "spring" }}
          className={`p-4 rounded-xl border-2 col-span-2 text-center ${
            step >= steps.length - 1
              ? "bg-green-900/30 border-green-500/50"
              : "bg-gray-800/50 border-gray-700"
          }`}
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
            Result
          </p>
          <p className={`font-mono text-2xl font-bold ${
            step >= steps.length - 1 ? "text-green-400" : "text-gray-600"
          }`}>
            c = {step >= steps.length - 1 ? "5.0" : "?"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function Ch2Pythagorean({
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: Ch2PythagoreanProps) {
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
          const expr = t.slice(eqIdx + 1).trim();
          try {
            const evalExpr = expr
              .replace(/([a-zA-Z_]\w*)/g, (m) => {
                if (vars[m] !== undefined) return vars[m];
                if (m === "True") return "1";
                if (m === "False") return "0";
                return m;
              });
            let val = String(new Function(`return (${evalExpr})`)());
            if (
              (expr.startsWith('"') && expr.endsWith('"')) ||
              (expr.startsWith("'") && expr.endsWith("'"))
            ) {
              val = expr.slice(1, -1);
            }
            vars[varName] = val;
          } catch {
            let val = expr;
            if (
              (expr.startsWith('"') && expr.endsWith('"')) ||
              (expr.startsWith("'") && expr.endsWith("'"))
            ) {
              val = expr.slice(1, -1);
            }
            vars[varName] = val;
          }
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
            try {
              const evalExpr = inner
                .replace(/([a-zA-Z_]\w*)/g, (m) => {
                  if (vars[m] !== undefined) return vars[m];
                  if (m === "True") return "1";
                  if (m === "False") return "0";
                  return m;
                });
              out.push(String(new Function(`return (${evalExpr})`)()));
            } catch {
              out.push(`>>> ${inner}`);
            }
          }
        } else if (t) {
          out.push(`>>> ${t}`);
        }
      }
      if (out.length === 0) out.push("⚠️ কোনো output পাওয়া যায়নি। print() ব্যবহার করো!");
      setConsoleLines(out);
      setIsRunning(false);

      const hasResult = out.some((l) => {
        const n = parseFloat(l);
        return !isNaN(n) && n >= 4.9 && n <= 5.1;
      });
      if (hasResult) {
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

  const copySolution = useCallback(() => {
    navigator.clipboard.writeText(SOLUTION_CODE);
    setSolutionCopied(true);
    setTimeout(() => setSolutionCopied(false), 2000);
  }, []);

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

  const aiSend = useCallback(() => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages((m) => [...m, { role: "user", text: q }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      let a = "";
      if (q.includes("Pythagorean") || q.includes("theorem") || q.includes("থিওরেম")) {
        a = "Pythagorean Theorem বলে যে একটি Right Triangle-এ Hypotenuse (c)-এর বর্গ অন্য দুটো বাহুর বর্গের সমান। অর্থাৎ: c² = a² + b²";
      } else if (q.includes("Hypotenuse") || q.includes("hypotenuse")) {
        a = "Hypotenuse হলো Right Triangle-এর দীর্ঘতম বাহু। এটি 90° কোণের বিপরীতে থাকে। এটি সবসময় অন্য দুটো বাহুর চেয়ে বড়।";
      } else if (q.includes("**") || q.includes("operator") || q.includes("ব্যবহার")) {
        a = "** operator হলো Power বা ঘাত অপারেটর। a ** 2 মানে a-এর বর্গ (a×a), এবं a ** 0.5 মানে a-এর বর্গমূল (√a)।";
      } else if (q.includes("0.5") || q.includes("square root") || q.includes("বর্গমূল")) {
        a = "** 0.5 মানে বর্গমূল (√)। যেমন: 25 ** 0.5 = 5.0 কারণ √25 = 5। Python-এ এটি সবচেয়ে সহজ উপায় বর্গমূল বের করার।";
      } else if (q.includes("Right Triangle") || q.includes("right triangle") || q.includes("সমকোণী")) {
        a = "Right Triangle হলো এমন একটি ত্রিভুজ যার একটি কোণ 90° (সমকোণ)। এর তিনটি বাহু থাকে — দুটো ছোট বাহু এবং একটি বড় Hypotenuse।";
      } else {
        a = "ভালো প্রশ্ন! Pythagorean Theorem হলো গণিতের একটি মৌলিক উপপাদ্য। নিচের suggested questions দেখো!";
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
          <motion.div variants={FADE_UP}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Pythagorean Theorem কী?
            </h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              একটি <span className="font-bold text-blue-600">Right Triangle</span>-এ
              একটি <span className="font-bold text-amber-600">90°</span> কোণ থাকে।
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              এই ত্রিভুজের তিনটি বাহু আছে:
            </p>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <AnimatedTriangle />
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl block mb-2"
                >
                  📏
                </motion.span>
                <p className="font-extrabold text-gray-900 text-sm">Opposite</p>
                <p className="text-xs text-blue-600 font-mono mt-1">a</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  className="text-2xl block mb-2"
                >
                  📏
                </motion.span>
                <p className="font-extrabold text-gray-900 text-sm">Adjacent</p>
                <p className="text-xs text-emerald-600 font-mono mt-1">b</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="text-2xl block mb-2"
                >
                  📏
                </motion.span>
                <p className="font-extrabold text-gray-900 text-sm">Hypotenuse</p>
                <p className="text-xs text-red-600 font-mono mt-1">c (Longest)</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gray-900 rounded-2xl p-5 font-mono text-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">
                ✨ সূত্র (Formula)
              </p>
              <div className="text-center py-4">
                <p className="text-2xl font-bold text-indigo-400">
                  c² = a² + b²
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Hypotenuse-এর বর্গ = অন্য দুটো বাহুর বর্গের যোগফল
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Python-এ
                বর্গ করতে <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">**</code> operator ব্যবহার হয়।
                যেমন: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">3 ** 2 = 9</code>
              </p>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <FormulaAnimation />
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
            Pythagorean Theorem প্রতিদিনের জীবনে অনেক জায়গায় ব্যবহার হয়!
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🪜", label: "ল্যাডার", desc: "দেয়ালে ল্যাডার রাখা", code: "wall=4, ground=3 → ladder=5" },
              { icon: "🏠", label: "ছাদ নির্মাণ", desc: "ছাদের ঢাল মাপা", code: "roof height & width" },
              { icon: "📐", label: "কর্ণ মাপা", desc: "জমির কর্ণ বের করা", code: "diagonal calculation" },
              { icon: "🎮", label: "Game Dev", desc: "দূরত্ব গণনা", code: "distance formula" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={FADE_UP}
                whileHover={{ scale: 1.03, y: -3 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-4 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * i, type: "spring", stiffness: 250 }}
                  className="text-4xl mb-2"
                >
                  {item.icon}
                </motion.div>
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                <p className="mt-2 font-mono text-[11px] text-teal-600 bg-white/50 rounded-lg px-2 py-1">
                  {item.code}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
                🪜 ল্যাডার উদাহরণ
              </p>
              <div className="flex items-center justify-center gap-6">
                <svg viewBox="0 0 160 140" className="w-40 h-36">
                  <motion.line
                    x1="20"
                    y1="120"
                    x2="20"
                    y2="20"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  />
                  <motion.line
                    x1="20"
                    y1="120"
                    x2="120"
                    y2="120"
                    stroke="#10b981"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  />
                  <motion.line
                    x1="20"
                    y1="20"
                    x2="120"
                    y2="120"
                    stroke="#ef4444"
                    strokeWidth="4"
                    strokeDasharray="8 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                  <motion.text
                    x="5"
                    y="70"
                    fill="#3b82f6"
                    fontSize="12"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    4m
                  </motion.text>
                  <motion.text
                    x="60"
                    y="138"
                    fill="#10b981"
                    fontSize="12"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    3m
                  </motion.text>
                  <motion.text
                    x="80"
                    y="60"
                    fill="#ef4444"
                    fontSize="14"
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    ?m
                  </motion.text>
                </svg>
                <div className="text-sm space-y-2">
                  <p className="text-gray-400">
                    <span className="text-blue-400 font-bold">Wall:</span> 4m
                  </p>
                  <p className="text-gray-400">
                    <span className="text-emerald-400 font-bold">Ground:</span> 3m
                  </p>
                  <p className="text-gray-400">
                    <span className="text-red-400 font-bold">Ladder:</span> ?
                  </p>
                  <p className="text-green-400 font-bold text-lg">
                    √(4² + 3²) = 5m
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> বিল্ডার,
                ইঞ্জিনিয়ার এবং Game Developerরা প্রতিদিন
                Pythagorean Theorem ব্যবহার করে!
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
        variants={FADE_UP}
        className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💻</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Example
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          <ExampleSection />
        </div>
      </motion.section>

      {/* ═══════════ SECTION 4: Instructions (নির্দেশনা) ═══════════ */}
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
                    Mission: Hypotenuse গণনা করো!
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    pythagorean.py ফাইলে a=3, b=4 দিয়ে c বের করো
                  </p>
                  <div className="flex items-center gap-2 mt-2">
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
                <p><span className="text-cyan-400">a</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">3</span></p>
                <p><span className="text-cyan-400">b</span> <span className="text-yellow-400">=</span> <span className="text-orange-400">4</span></p>
                <p><span className="text-cyan-400">c</span> <span className="text-yellow-400">=</span> <span className="text-gray-300">(</span><span className="text-cyan-400">a</span> <span className="text-orange-400">**</span> <span className="text-orange-400">2</span> <span className="text-orange-400">+</span> <span className="text-cyan-400">b</span> <span className="text-orange-400">**</span> <span className="text-orange-400">2</span><span className="text-gray-300">)</span> <span className="text-orange-400">**</span> <span className="text-orange-400">0.5</span></p>
                <p><span className="text-purple-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">c</span><span className="text-gray-300">)</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                text: "দুটো Variable তৈরি করো — a = 3 এবং b = 4।",
                code: "a = 3",
              },
              {
                num: 2,
                text: "Pythagorean Formula ব্যবহার করে Hypotenuse গণনা করো এবং c-তে রাখো।",
                code: "c = (a ** 2 + b ** 2) ** 0.5",
              },
              {
                num: 3,
                text: "print(c) দিয়ে ফলাফল দেখাও!",
                code: "print(c)",
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
                        : step.code.includes("**")
                        ? "text-orange-400"
                        : "text-orange-400"
                    }>
                      {step.code.split(" = ").slice(1).join(" = ")}
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

      {/* ═══════════ SECTION 5: Hint ═══════════ */}
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

      {/* ═══════════ SECTION 6: Walkthrough Video ═══════════ */}
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
                    Chapter 2: Pythagorean Theorem
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Calculate hypotenuse in Bangla
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">
              6:20
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
              6:20
            </span>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ SECTION 7: Practice ═══════════ */}
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
          <motion.div
            variants={FADE_UP}
            className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">
                Goal: a=3, b=4 দিয়ে Hypotenuse বের করো!
              </p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-sm space-y-1">
              <p className="text-cyan-400">a = <span className="text-orange-400">3</span></p>
              <p className="text-cyan-400">b = <span className="text-orange-400">4</span></p>
              <p className="text-cyan-400">c = <span className="text-orange-400">(a ** 2 + b ** 2) ** 0.5</span></p>
              <p className="text-cyan-400">print(<span className="text-cyan-400">c</span>) <span className="text-gray-500"># 5.0</span></p>
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
                    pythagorean.py
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
                  placeholder={'a = 3\nb = 4\n\nc = (a ** 2 + b ** 2) ** 0.5\n\nprint(c)'}
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
                      { parts: [{ c: "text-cyan-400", t: "a" }, { c: "text-yellow-400", t: " = " }, { c: "text-orange-400", t: "3" }] },
                      { parts: [{ c: "text-cyan-400", t: "b" }, { c: "text-yellow-400", t: " = " }, { c: "text-orange-400", t: "4" }] },
                      { parts: [] },
                      { parts: [{ c: "text-cyan-400", t: "c" }, { c: "text-yellow-400", t: " = " }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "a" }, { c: "text-orange-400", t: " ** " }, { c: "text-orange-400", t: "2" }, { c: "text-orange-400", t: " + " }, { c: "text-cyan-400", t: "b" }, { c: "text-orange-400", t: " ** " }, { c: "text-orange-400", t: "2" }, { c: "text-gray-300", t: ")" }, { c: "text-orange-400", t: " ** " }, { c: "text-orange-400", t: "0.5" }] },
                      { parts: [] },
                      { parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-cyan-400", t: "c" }, { c: "text-gray-300", t: ")" }] },
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
                      <span className="text-green-400 font-bold">5.0</span>
                    </div>
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
                    Pythagorean Theorem সম্পর্কে যেকোনো প্রশ্ন করো! নিচের যেকোনো
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

/* ── Example Section (with animated typing) ── */
function ExampleSection() {
  const [typingLine, setTypingLine] = useState(-1);
  const [showOutput, setShowOutput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const lines = [
    { code: "a = 3", color: "text-cyan-400" },
    { code: "b = 4", color: "text-cyan-400" },
    { code: "", color: "" },
    { code: "c = (a ** 2 + b ** 2) ** 0.5", color: "text-cyan-400" },
    { code: "", color: "" },
    { code: "print(c)", color: "text-purple-400" },
  ];

  const startTyping = useCallback(() => {
    setTypingLine(-1);
    setShowOutput(false);
    setIsTyping(true);

    let currentLine = 0;
    const typeInterval = setInterval(() => {
      setTypingLine(currentLine);
      currentLine++;
      if (currentLine >= lines.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setShowOutput(true);
          setIsTyping(false);
        }, 500);
      }
    }, 400);
  }, []);

  return (
    <div className="space-y-4">
      <button
        onClick={startTyping}
        disabled={isTyping}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {isTyping ? "⏳ Typing..." : "▶ Animate Typing"}
      </button>

      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-gray-400 text-xs font-mono">
              example.py
            </span>
          </div>
        </div>
        <div className="bg-gray-900 p-4 font-mono text-sm">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">
                {i + 1}
              </span>
              <div>
                {i <= typingLine && line.code && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={line.color}
                  >
                    {line.code}
                  </motion.span>
                )}
                {i === typingLine && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-green-400"
                  >
                    _
                  </motion.span>
                )}
              </div>
            </div>
          ))}
        </div>
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-4 bg-gray-900"
          >
            <div className="p-3 bg-gray-800 rounded-lg font-mono text-xs">
              <span className="text-gray-500">Output → </span>
              <span className="text-green-400 font-bold">5.0</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
