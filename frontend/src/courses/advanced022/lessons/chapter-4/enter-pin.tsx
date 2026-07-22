import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch4-enter-pin";
const SOLUTION_CODE = `pin = ""\n\nwhile pin != "1234":\n    pin = input("Enter PIN: ")\n\nprint("Access Granted!")`;

const SUGGESTED_QUESTIONS = [
  "while Loop কী?",
  "কেন while ব্যবহার করি?",
  "!= এর মানে কী?",
  "Loop কখন বন্ধ হবে?",
  "input() কী কাজ করে?",
];

const MOTIVATIONAL = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! While loop master!",
];

const HINTS = [
  "একটি খালি variable তৈরি করো: pin = \"\"",
  "while loop ব্যবহার করো: while pin != \"1234\":",
  "!= দিয়ে compare করো — PIN সঠিক না কি না!",
  "input() দিয়ে ব্যবহারকারীর কাছ থেকে PIN নাও।",
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch4EnterPinProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── While Loop Learning Flow Animation ── */
function WhileFlowAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "🏧", label: "Enter PIN", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "❌", label: "Wrong PIN", color: "text-red-400", bg: "bg-red-900/30 border-red-500/50" },
    { icon: "🔄", label: "Try Again", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "✅", label: "Correct PIN", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
    { icon: "🔓", label: "Access Granted!", color: "text-emerald-400", bg: "bg-emerald-900/30 border-emerald-500/50" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "▶ Next Step" : "🔄 Restart Animation"}
      </button>

      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={i <= step ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.6 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
              <span className="text-lg sm:text-xl">{s.icon}</span>
            </div>
            <p className={`text-[8px] sm:text-[10px] font-bold mt-2 ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-bold text-green-400">While loop stops when condition is False!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── ATM Simulation ── */
function ATMSimulation() {
  const [attempts, setAttempts] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [phase, setPhase] = useState<"input" | "checking" | "granted">("input");

  const handleSubmit = useCallback(() => {
    if (!currentInput) return;
    setPhase("checking");
    setTimeout(() => {
      if (currentInput === "1234") {
        setAttempts(prev => [...prev, currentInput]);
        setPhase("granted");
      } else {
        setAttempts(prev => [...prev, currentInput]);
        setCurrentInput("");
        setPhase("input");
      }
    }, 1000);
  }, [currentInput]);

  const reset = useCallback(() => {
    setAttempts([]);
    setCurrentInput("");
    setPhase("input");
  }, []);

  return (
    <div className="space-y-4">
      {/* ATM Screen */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🏧 ATM Screen</p>
        
        <div className="bg-gray-950 rounded-xl p-4 border border-gray-700">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-2">Enter your PIN</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i}
                  animate={phase === "granted" ? { backgroundColor: "#22c55e" } : attempts.length > i ? { backgroundColor: "#ef4444" } : { backgroundColor: "#374151" }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {phase === "granted" ? "●" : attempts.length > i ? "●" : currentInput[i] ? "●" : ""}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Attempts Display */}
          <div className="space-y-1 mb-4">
            {attempts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 text-xs font-mono ${a === "1234" && phase === "granted" ? "text-green-400" : "text-red-400"}`}>
                <span>Attempt {i + 1}:</span>
                <span>{a}</span>
                <span>{a === "1234" && phase === "granted" ? "✅" : "❌"}</span>
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          {phase === "input" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
              <input type="text" value={currentInput} onChange={e => setCurrentInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="Enter 4-digit PIN"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono outline-none focus:border-cyan-500" maxLength={4} />
              <button onClick={handleSubmit}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold rounded-lg transition-colors">Enter</button>
            </motion.div>
          )}

          {phase === "checking" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-cyan-400 mt-2">Checking...</p>
            </motion.div>
          )}

          {phase === "granted" && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
                <span className="text-lg">🔓</span>
                <p className="text-sm font-bold text-green-400">Access Granted!</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <button onClick={reset} className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-colors">
        🔄 Reset ATM
      </button>
    </div>
  );
}

/* ── Example Section ── */
function ExampleSection() {
  const [phase, setPhase] = useState<"idle" | "looping" | "done">("idle");
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [outputLines, setOutputLines] = useState<string[]>([]);

  const startDemo = useCallback(() => {
    setPhase("looping");
    setCurrentAttempt(0);
    setOutputLines([]);

    let attempt = 0;
    const pins = ["1111", "2222", "1234"];

    const t = setInterval(() => {
      setCurrentAttempt(attempt + 1);
      setOutputLines(prev => [...prev, `Enter PIN: ${pins[attempt]}`]);
      
      setTimeout(() => {
        if (pins[attempt] !== "1234") {
          setOutputLines(prev => [...prev, "Wrong PIN", ""]);
        } else {
          setOutputLines(prev => [...prev, "", "Access Granted!"]);
          clearInterval(t);
          setTimeout(() => setPhase("done"), 500);
        }
      }, 600);

      attempt++;
      if (attempt >= pins.length) clearInterval(t);
    }, 1200);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <button onClick={startDemo} disabled={phase === "looping"}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all shadow-md">
        {phase === "idle" || phase === "done" ? "▶ Run Demo" : "⏳ Looping..."}
      </button>

      {/* Code Editor */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-gray-400 text-xs font-mono">enter_pin.py</span>
          </div>
        </div>
        <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">1</span>
            <div><span className="text-cyan-400">pin</span><span className="text-yellow-400"> = </span><span className="text-green-400">""</span></div>
          </div>
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">2</span>
            <div></div>
          </div>
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">3</span>
            <div><span className="text-purple-400">while</span><span className="text-cyan-400"> pin</span><span className="text-red-400"> != </span><span className="text-green-400">"1234"</span><span className="text-gray-300">:</span></div>
          </div>
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">4</span>
            <div className="pl-4"><span className="text-cyan-400">pin</span><span className="text-yellow-400"> = </span><span className="text-amber-400">input</span><span className="text-gray-300">(</span><span className="text-green-400">"Enter PIN: "</span><span className="text-gray-300">)</span></div>
          </div>
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">5</span>
            <div></div>
          </div>
          <div className="flex">
            <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">6</span>
            <div><span className="text-purple-400">print</span><span className="text-gray-300">(</span><span className="text-green-400">"Access Granted!"</span><span className="text-gray-300">)</span></div>
          </div>
        </div>

        {/* Attempt Counter */}
        <div className="px-4 pb-3 bg-gray-900">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-bold">Attempt:</span>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(n => (
                <motion.div key={n}
                  animate={n <= currentAttempt ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.3 }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${n <= currentAttempt ? (n === 3 && phase !== "looping" ? "bg-green-500 text-white" : "bg-purple-500 text-white") : "bg-gray-700 text-gray-500"}`}>
                  {n}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-950">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Terminal</span>
          </div>
          <div className="font-mono text-xs space-y-0.5">
            {outputLines.length === 0 ? (
              <p className="text-gray-600 italic">Output এখানে দেখা যাবে...</p>
            ) : (
              outputLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={line === "Wrong PIN" ? "text-red-400" : line === "Access Granted!" ? "text-green-400 font-bold" : line.startsWith("Enter PIN:") ? "text-cyan-400" : "text-gray-500"}>
                  {line}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="text-sm font-bold text-green-700">The while Loop keeps running until the correct PIN is entered!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Ch4EnterPin({
  onComplete, onNext, isCompleted, hasNext,
}: Ch4EnterPinProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [encourage, setEncourage] = useState("");
  const [showEncourage, setShowEncourage] = useState(false);
  const [stepsDone, setStepsDone] = useState([false, false, false, false, false]);
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
          if (p >= 100) { if (videoIntervalRef.current) clearInterval(videoIntervalRef.current); setVideoPlaying(false); setVideoComplete(true); return 100; }
          return p + 2;
        });
      }, 60);
    }
  }, [videoPlaying, videoComplete]);

  const handleRun = useCallback(() => {
    if (!editorCode.trim()) { setConsoleLines(["⚠️ প্রথমে কিছু কোড লেখো!"]); return; }
    setIsRunning(true);
    setConsoleLines([]);
    setTimeout(() => {
      const out: string[] = [];
      const lines = editorCode.split("\n");

      let inWhileLoop = false;
      let conditionMet = false;
      let loopBody: string[] = [];
      let attempts = 0;

      for (const line of lines) {
        const t = line.trim();
        if (t === "" || t.startsWith("#")) continue;

        const whileMatch = t.match(/^while\s+(.+)\s*:/);
        if (whileMatch) {
          inWhileLoop = true;
          conditionMet = false;
          loopBody = [];
          attempts = 0;
          continue;
        }

        if (inWhileLoop) {
          if (line.startsWith("    ") || line.startsWith("\t")) {
            loopBody.push(t);
          } else {
            while (!conditionMet && attempts < 10) {
              attempts++;
              for (const bodyLine of loopBody) {
                if (bodyLine.includes("input(")) {
                  out.push("Enter PIN: 1234");
                } else if (bodyLine.match(/^\w+\s*=\s*input/)) {
                  out.push("Enter PIN: 1234");
                }
              }
              conditionMet = true;
            }
            inWhileLoop = false;
            loopBody = [];
          }
        } else {
          out.push(`>>> ${t}`);
        }
      }

      if (inWhileLoop && loopBody.length > 0) {
        while (!conditionMet && attempts < 10) {
          attempts++;
          for (const bodyLine of loopBody) {
            if (bodyLine.includes("input(")) {
              out.push("Enter PIN: 1234");
            }
          }
          conditionMet = true;
        }
      }

      if (out.length === 0) out.push("⚠️ কোনো output পাওয়া যায়নি।");
      setConsoleLines(out);
      setIsRunning(false);

      const hasSuccess = out.some(l => !l.startsWith("❌") && !l.startsWith("⚠️") && !l.startsWith(">>>") && l.length > 0);
      const hasError = out.some(l => l.startsWith("❌"));
      if (hasSuccess && !hasError) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
        setStepsDone([true, true, true, true, true]);
      }
    }, 650);
  }, [editorCode]);

  const handleReset = useCallback(() => { setEditorCode(""); setConsoleLines([]); setShowEncourage(false); }, []);
  const copySolution = useCallback(() => { navigator.clipboard.writeText(SOLUTION_CODE); setSolutionCopied(true); setTimeout(() => setSolutionCopied(false), 2000); }, []);

  const handleHintToggle = useCallback(() => {
    if (!hintOpen) { setHintOpen(true); let idx = 0; const t = setInterval(() => { idx++; setHintsRevealed(idx); if (idx >= HINTS.length) clearInterval(t); }, 350); }
    else { setHintOpen(false); setHintsRevealed(0); }
  }, [hintOpen]);

  const aiSend = useCallback(() => {
    if (!aiInput.trim()) return;
    const q = aiInput.trim();
    setAiMessages(m => [...m, { role: "user", text: q }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      let a = "";
      if (q.includes("while Loop") || q.includes("while loop")) { a = "while Loop হলো Python-এ এমন loop যেটা একটি শর্ত (condition) False না হওয়া পর্যন্ত চলতে থাকে। যেমন: while pin != '1234': — PIN সঠিক না হওয়া পর্যন্ত loop চলবে!"; }
      else if (q.includes("কেন while") || q.includes("কেন while")) { a = "while loop ব্যবহার করি যখন জানি না কতবার loop চালাতে হবে। for Loop-এর মতো নির্দিষ্ট সংখ্যা নয় — শর্ত পূরণ না হওয়া পর্যন্ত চলে!"; }
      else if (q.includes("!=") || q.includes("not equal")) { a = "!= মানে 'not equal' বা 'সমান নয়'। যেমন: pin != '1234' মানে pin '1234' না হলে True, সমান হলে False। এটি while loop-এর শর্ত!"; }
      else if (q.includes("বন্ধ") || q.includes("stop")) { a = "Loop বন্ধ হয় যখন while-এর শর্ত False হয়। যেমন: pin != '1234' যখন pin '1234' হয়, তখন শর্ত False — loop বন্ধ!"; }
      else if (q.includes("input()") || q.includes("input")) { a = "input() function ব্যবহারকারীর কাছ থেকে keyboard-এ input নেয়। যেমন: input('Enter PIN: ') লিখলে screen-এ 'Enter PIN: ' দেখাবে এবং ব্যবহারকারী PIN লিখতে পারবে!"; }
      else { a = "ভালো প্রশ্ন! while Loop একটি শর্ত পূরণ না হওয়া পর্যন্ত চলে। নিচের suggested questions দেখো!"; }
      setAiMessages(m => [...m, { role: "ai", text: a }]);
      setAiTyping(false);
    }, 1100);
  }, [aiInput]);

  const toggleStep = (i: number) => { setStepsDone(s => { const n = [...s]; n[i] = !n[i]; return n; }); };

  return (
    <div className="space-y-8 pb-12">
      {/* ═══ SECTION 1: Basic ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-red-500 via-pink-500 to-rose-600">
          <div className="flex items-center gap-3"><span className="text-3xl">📘</span><h2 className="text-xl font-extrabold text-white tracking-tight">Basic</h2></div>
        </motion.div>
        <div className="px-6 py-6 space-y-6">
          <motion.div variants={FADE_UP}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">while Loop কী?</h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              <span className="font-bold text-cyan-600">while Loop</span> হলো Python-এর এমন একটি loop যেটা
              <span className="font-bold text-red-600"> একটি শর্ত (condition) False না হওয়া পর্যন্ত</span> চলতে থাকে!
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              ATM-এর মতো — PIN ভুল হলে <span className="font-bold text-purple-600">আবার আবার</span> জিজ্ঞাসা করে!
            </p>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🔄 While Loop Flow</p>
              <WhileFlowAnimation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🏧 ATM PIN Simulation</p>
              <ATMSimulation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> while Loop
                তখন পর্যন্ত চলে যতক্ষণ না শর্ত False হয় —
                ঠিক যেমন ATM সঠিক PIN না পাওয়া পর্যন্ত জিজ্ঞাসা করে!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ SECTION 2: Real Life ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-3"><span className="text-3xl">🌍</span><h2 className="text-xl font-extrabold text-white tracking-tight">Real Life Example</h2></div>
        </motion.div>
        <div className="px-6 py-6">
          <motion.p variants={FADE_UP} className="text-sm text-gray-500 mb-5">while Loop আমাদের দৈনন্দিন জীবনেও ঘটে!</motion.p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🏧", label: "ATM PIN", desc: "সঠিক PIN না দিলে আবার জিজ্ঞাসা", code: "Try again!" },
              { icon: "🔒", label: "Phone Lock", desc: "ভুল PIN দিলে আবার লিখো", code: "Wrong PIN" },
              { icon: "🚪", label: "Door Lock", desc: "সঠিক কোড না দিলে খুলবে না", code: "Enter code" },
              { icon: "🎮", label: "Game Login", desc: "সঠিক password না দিলে login হবে না", code: "Login fail" },
            ].map((item, i) => (
              <motion.div key={i} variants={FADE_UP} whileHover={{ scale: 1.03, y: -3 }}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-2xl p-4 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 * i, type: "spring", stiffness: 250 }} className="text-4xl mb-2">{item.icon}</motion.div>
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                <p className="mt-2 font-mono text-[11px] text-teal-600 bg-white/50 rounded-lg px-2 py-1">{item.code}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🔒 Phone Lock Example</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 font-mono text-sm">"0000"</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">❌ Wrong</p>
                </div>
                <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-400 text-xl">→</motion.div>
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="px-4 py-3 bg-green-900/30 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-mono text-sm">"1234"</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">✅ Correct!</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Python
                ঠিক যেমন ফোন লক সঠিক PIN না দিলে খুলে না —
                while Loop-ও শর্ত পূরণ না হওয়া পর্যন্ত চলে!
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══ SECTION 3: Example ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">💻</span><h2 className="text-xl font-extrabold text-white tracking-tight">Example</h2></div>
        </div>
        <div className="px-6 py-6"><ExampleSection /></div>
      </motion.section>

      {/* ═══ SECTION 4: Instructions ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-orange-500 to-rose-500">
          <div className="flex items-center gap-3"><span className="text-3xl">📝</span><h2 className="text-xl font-extrabold text-white tracking-tight">নির্দেশনা</h2></div>
        </motion.div>
        <div className="px-6 py-6">
          <motion.div variants={FADE_UP} className="mb-5">
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">⚡</motion.span>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">Mission: PIN Verification তৈরি করো!</p>
                  <p className="text-xs text-gray-500 mt-1">enter_pin.py ফাইলে while loop দিয়ে PIN verify করো</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stepsDone.map((d, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? "w-16" : i === 1 ? "w-12" : i === 2 ? "w-12" : i === 3 ? "w-10" : "w-8"} ${d ? "bg-green-400" : "bg-orange-200"}`} />))}
                    <span className="text-xs font-bold text-gray-500 ml-1">{stepsDone.filter(Boolean).length}/5</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p><span className="text-cyan-400">pin</span> <span className="text-yellow-400">=</span> <span className="text-green-400">""</span></p>
                <p></p>
                <p><span className="text-purple-400">while</span> <span className="text-cyan-400">pin</span> <span className="text-red-400">!=</span> <span className="text-green-400">"1234"</span><span className="text-gray-300">:</span></p>
                <p className="pl-4"><span className="text-cyan-400">pin</span> <span className="text-yellow-400">=</span> <span className="text-amber-400">input</span><span className="text-gray-300">(</span><span className="text-green-400">"Enter PIN: "</span><span className="text-gray-300">)</span></p>
                <p></p>
                <p><span className="text-purple-400">print</span><span className="text-gray-300">(</span><span className="text-green-400">"Access Granted!"</span><span className="text-gray-300">)</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { num: 1, text: "একটি খালি variable তৈরি করো।", code: 'pin = ""' },
              { num: 2, text: "while Loop ব্যবহার করো।", code: 'while pin != "1234":' },
              { num: 3, text: "ব্যবহারকারীর কাছ থেকে PIN নাও।", code: '    pin = input("Enter PIN: ")' },
              { num: 4, text: "PIN সঠিক হলে Loop বন্ধ হবে।", code: "# pin == '1234' → loop stops" },
              { num: 5, text: "Access Granted প্রিন্ট করো।", code: 'print("Access Granted!")' },
            ].map((step, i) => (
              <motion.div key={i} variants={FADE_UP} onClick={() => toggleStep(i)}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${stepsDone[i] ? "bg-green-50 border-green-300 shadow-sm" : "bg-orange-50 border-orange-100 hover:border-orange-200"}`}>
                <motion.div animate={stepsDone[i] ? { scale: [1, 1.3, 1] } : {}}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${stepsDone[i] ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                  {stepsDone[i] ? "✓" : step.num}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Step {step.num}: {step.text}</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                    <span className={step.code.includes("#") ? "text-gray-400" : step.code.includes("print") ? "text-green-400" : step.code.includes("while") ? "text-purple-400" : "text-cyan-400"}>{step.code}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {stepsDone.every(Boolean) && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-100 border-2 border-green-300 rounded-2xl">
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }} className="text-2xl">🎉</motion.span>
                  <span className="font-extrabold text-green-700">Mission Complete!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══ SECTION 5: Hint ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center gap-3"><span className="text-3xl">💡</span><h2 className="text-xl font-extrabold text-white tracking-tight">Hint</h2></div>
        </div>
        <div className="px-6 py-5">
          <button onClick={handleHintToggle} className="w-full flex items-center justify-between px-5 py-4 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl transition-all duration-200">
            <span className="flex items-center gap-2.5 text-sm font-bold text-cyan-800">
              <motion.span animate={hintOpen ? { rotate: [0, 20, -20, 0] } : {}} transition={{ duration: 0.5 }} className="text-xl">💡</motion.span>
              Need a Hint?
            </span>
            <motion.svg animate={{ rotate: hintOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {hintOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="overflow-hidden">
                <div className="mt-4 space-y-3">
                  {HINTS.map((h, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={i < hintsRevealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl">
                      <span className="flex-shrink-0 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{h}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══ SECTION 6: Video ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-pink-600">
          <div className="flex items-center gap-3"><span className="text-3xl">🎥</span><h2 className="text-xl font-extrabold text-white tracking-tight">Walkthrough Video</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video cursor-pointer group" onClick={handleVideoToggle}>
            <div className="absolute inset-0 bg-gradient-to-br from-rose-800 via-pink-800 to-purple-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div animate={videoPlaying ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: videoPlaying ? Infinity : 0 }}
                    className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    {videoPlaying ? (<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>)
                      : (<svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>)}
                  </motion.div>
                  <p className="text-white/80 text-sm font-medium mt-3">Chapter 4: Enter PIN</p>
                  <p className="text-white/50 text-xs mt-1">While loops and PIN verification</p>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">5:10</div>
            <AnimatePresence>
              {videoComplete && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 left-3 px-3 py-1 bg-green-500 rounded-full text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Completed
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500 w-10">0:00</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" animate={{ width: `${videoProgress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">5:10</span>
          </div>
        </div>
      </motion.section>

      {/* ═══ SECTION 7: Practice ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-700">
          <div className="flex items-center gap-3"><span className="text-3xl">🎯</span><h2 className="text-xl font-extrabold text-white tracking-tight">Practice</h2></div>
        </div>
        <div className="px-6 py-6">
          <motion.div variants={FADE_UP} className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <p className="text-sm font-bold text-purple-800">Goal: PIN verification system তৈরি করো!</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-sm space-y-1">
              <p className="text-cyan-400">pin = "" <span className="text-gray-500"># Start empty</span></p>
              <p className="text-purple-400">while pin != "1234": <span className="text-gray-500"># Loop until correct</span></p>
              <p className="text-green-400 pl-4">pin = input("Enter PIN: ")</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">enter_pin.py</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono"><span>{codeLen} chars</span><span>·</span><span>{codeLines} lines</span></div>
              </div>
              <div className="flex bg-gray-900">
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-gray-700">
                  {Array.from({ length: Math.max(codeLines, 12) }, (_, i) => (<div key={i} className="text-gray-600 text-xs font-mono leading-6 h-6">{i + 1}</div>))}
                </div>
                <textarea value={editorCode} onChange={(e) => { setEditorCode(e.target.value); setShowEncourage(false); }}
                  placeholder={'pin = ""\n\nwhile pin != "1234":\n    pin = input("Enter PIN: ")\n\nprint("Access Granted!")'}
                  className="flex-1 bg-transparent text-green-400 font-mono text-sm p-3 resize-none outline-none leading-6 min-h-[288px] placeholder-gray-600" spellCheck={false} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-gray-900 rounded-2xl border border-gray-200 shadow-md flex-1 min-h-[200px]">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Console</span>
                  {isRunning && (<span className="ml-auto text-[10px] text-yellow-400 flex items-center gap-1"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-2.5 h-2.5 border-2 border-yellow-400 border-t-transparent rounded-full" />Running...</span>)}
                </div>
                <div ref={consoleRef} className="p-4 font-mono text-sm min-h-[160px] overflow-y-auto max-h-[220px]">
                  {consoleLines.length === 0 ? (<p className="text-gray-600 text-xs italic">Output এখানে দেখা যাবে...</p>)
                    : (<div className="space-y-0.5">{consoleLines.map((l, i) => (<div key={i} className={l.startsWith("❌") ? "text-red-400" : l.startsWith(">>>") ? "text-gray-400" : l.startsWith("⚠️") ? "text-yellow-400" : "text-green-400"}>{l}</div>))}</div>)}
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleRun} disabled={isRunning}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                  {isRunning ? (<><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Running...</>)
                    : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Run</>)}
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleReset} className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-xl transition-colors">Reset</motion.button>
                <button disabled className="px-4 py-3 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl border border-gray-200 cursor-not-allowed">Check</button>
              </div>

              <AnimatePresence>
                {showEncourage && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }} className="text-xl">🎉</motion.span>
                    <p className="text-sm font-bold text-green-700">{encourage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ SECTION 8: Solution ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center gap-3"><span className="text-3xl">✅</span><h2 className="text-xl font-extrabold text-white tracking-tight">Solution</h2></div>
        </div>
        <div className="px-6 py-5">
          <button onClick={() => setSolutionOpen(!solutionOpen)} className="w-full flex items-center justify-between px-5 py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-2xl transition-all duration-200">
            <span className="flex items-center gap-2.5 text-sm font-bold text-amber-800">
              <span className="text-xl">{solutionOpen ? "👁️" : "🔒"}</span>{solutionOpen ? "Hide Solution" : "Show Solution"}
            </span>
            <motion.svg animate={{ rotate: solutionOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {solutionOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="overflow-hidden">
                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 shadow-md">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="ml-2 text-gray-400 text-xs font-mono">solution.py</span>
                    </div>
                    <button onClick={copySolution} className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                      {solutionCopied ? (<><svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Copied!</>)
                        : (<><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>)}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
                    {[
                      { parts: [{ c: "text-cyan-400", t: "pin" }, { c: "text-yellow-400", t: " = " }, { c: "text-green-400", t: '""' }] },
                      { parts: [] },
                      { parts: [{ c: "text-purple-400", t: "while" }, { c: "text-cyan-400", t: " pin" }, { c: "text-red-400", t: " != " }, { c: "text-green-400", t: '"1234"' }, { c: "text-gray-300", t: ":" }] },
                      { parts: [{ c: "text-cyan-400", t: "    pin" }, { c: "text-yellow-400", t: " = " }, { c: "text-amber-400", t: "input" }, { c: "text-gray-300", t: "(" }, { c: "text-green-400", t: '"Enter PIN: "' }, { c: "text-gray-300", t: ")" }] },
                      { parts: [] },
                      { parts: [{ c: "text-purple-400", t: "print" }, { c: "text-gray-300", t: "(" }, { c: "text-green-400", t: '"Access Granted!"' }, { c: "text-gray-300", t: ")" }] },
                    ].map((item, i) => (
                      <div key={i} className="flex">
                        <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">{item.parts.length > 0 ? i + 1 : ""}</span>
                        <div>{item.parts.map((p, j) => (<span key={j} className={p.c}>{p.t}</span>))}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 bg-gray-900">
                    <div className="p-3 bg-gray-800 rounded-lg font-mono text-xs">
                      <span className="text-gray-500">Output → </span>
                      <span className="text-green-400 font-bold">Access Granted!</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══ SECTION 9: AI Companion ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-fuchsia-500 to-purple-700">
          <div className="flex items-center gap-3"><span className="text-3xl">🤖</span><h2 className="text-xl font-extrabold text-white tracking-tight">AI Coding Companion</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 bg-purple-100/50 border-b border-purple-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-lg">
                <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">🤖</motion.span>
              </div>
              <div><p className="text-sm font-extrabold text-purple-900">PyBot</p><p className="text-[10px] text-purple-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />Online</p></div>
            </div>

            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3"><span className="text-3xl">👋</span></motion.div>
                  <p className="text-sm font-extrabold text-gray-800 mb-1">Hello! I'm PyBot</p>
                  <p className="text-xs text-gray-500 max-w-[240px] mb-4 leading-relaxed">while Loop সম্পর্কে যেকোনো প্রশ্ন করো! নিচের যেকোনো প্রশ্নে ক্লিক করো।</p>
                  <div className="space-y-2 w-full max-w-[300px]">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 * i }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setAiInput(q); setTimeout(() => aiRef.current?.focus(), 50); }}
                        className="w-full text-left px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors shadow-sm">💡 {q}</motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {aiMessages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-purple-600 text-white rounded-br-md" : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
                    </motion.div>
                  ))}
                  {aiTyping && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start"><div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">{[0, 1, 2].map(i => (<motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} className="w-2 h-2 bg-purple-400 rounded-full" />))}</div></motion.div>)}
                </>
              )}
            </div>

            {aiMessages.length > 0 && aiMessages.length < 6 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">{SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (<button key={i} onClick={() => { setAiInput(q); setTimeout(() => aiRef.current?.focus(), 50); }} className="flex-shrink-0 px-3 py-1.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full hover:bg-purple-200 transition-colors">{q}</button>))}</div>
            )}

            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all shadow-sm">
                <input ref={aiRef} type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && aiSend()} placeholder="তোমার প্রশ্ন লেখো..." className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent" />
                <motion.button whileTap={{ scale: 0.9 }} onClick={aiSend} disabled={!aiInput.trim() || aiTyping}
                  className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ BOTTOM BUTTONS ═══ */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button onClick={onComplete.bind(null, LESSON_ID)}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-lg transition-all duration-300 shadow-lg ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"}`}>
          {isCompleted ? "✅ Completed!" : "🏁 Mark Complete"}
        </button>
        {hasNext && (
          <button onClick={onNext}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
            Next Lesson <span className="text-xl">→</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}
