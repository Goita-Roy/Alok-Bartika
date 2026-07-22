import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch7-favorite-cities";
const SOLUTION_CODE = `class City:\n    pass\n\n\ncity1 = City()\n\nprint(city1)`;

const SUGGESTED_QUESTIONS = [
  "Class কী?",
  "Object কী?",
  "City Class কী?",
  "`pass` কেন ব্যবহার করি?",
  "City Object কীভাবে তৈরি করি?",
];

const MOTIVATIONAL = [
  "চমৎকার! City Class তৈরি হয়েছে!",
  "দারুণ! তুমি পারবে!",
  "অসাধারণ চেষ্টা!",
  "তুমি সঠিক পথে আছো!",
  "বাহ! City master!",
];

const HINTS = [
  "`class` keyword ব্যবহার করো।",
  "Class name `City` রাখো।",
  "Empty Class-এর জন্য `pass` ব্যবহার করো।",
  "Object তৈরি করতে `City()` ব্যবহার করো।",
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch7FavoriteCitiesProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── City Blueprint Animation ── */
function CityBlueprintAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "🌍", label: "City Class", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "⬇️", label: "", color: "text-gray-400", bg: "bg-gray-800/30 border-gray-500/50" },
    { icon: "🏙️", label: "Dhaka", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
    { icon: "🏖️", label: "Cox's Bazar", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "🏛️", label: "Rajshahi", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
    { icon: "✨", label: "One Class → Many Cities!", color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-500/50" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "▶ Next Step" : "🔄 Restart Animation"}
      </button>

      <div className="flex flex-col items-center gap-2">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={i <= step ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.6 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center"
          >
            {s.label ? (
              <div className={`w-28 sm:w-32 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
                </div>
              </div>
            ) : (
              <motion.div
                animate={i <= step ? { y: [0, 4, 0] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-2xl"
              >
                {s.icon}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-bold text-green-400">One class creates many city objects!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Learning Flow Animation ── */
function LearningFlowAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "📝", label: "Write Class", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "⬇️", label: "", color: "text-gray-400", bg: "bg-gray-800/30 border-gray-500/50" },
    { icon: "🌍", label: "City Class", color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-500/50" },
    { icon: "⬇️", label: "", color: "text-gray-400", bg: "bg-gray-800/30 border-gray-500/50" },
    { icon: "📦", label: "Create Objects", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "⬇️", label: "", color: "text-gray-400", bg: "bg-gray-800/30 border-gray-500/50" },
    { icon: "🏙️", label: "Different Cities", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
    { icon: "🔄", label: "Easy to Organize!", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "▶ Next Step" : "🔄 Restart Animation"}
      </button>

      <div className="flex flex-col items-center gap-2">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={i <= step ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.6 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center"
          >
            {s.label ? (
              <div className={`w-28 sm:w-32 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
                </div>
              </div>
            ) : (
              <motion.div
                animate={i <= step ? { y: [0, 4, 0] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-2xl"
              >
                {s.icon}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 7 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">🎉</span>
              <p className="text-sm font-bold text-green-400">City Class → Objects → Easy Organization!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Class Keyword Intro ── */
function ClassKeywordIntro() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShow(!show)}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {show ? "🔄 Replay" : "▶ Show class Keyword"}
      </button>

      <div className="flex items-center justify-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl font-mono font-bold text-white">class</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="flex gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.6, type: "spring" }}
              className="px-4 py-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <span className="text-lg font-mono font-bold text-white">City</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
              className="px-3 py-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md"
            >
              <span className="text-lg font-mono font-bold text-white">:</span>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[10px] text-gray-400 mt-2 font-mono"
          >
            class keyword + Class name + colon
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.3 }}
          className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span className="text-xl font-mono font-bold text-white">pass</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-xl">
              <span className="text-lg">💡</span>
              <p className="text-sm font-bold text-purple-400">Classes use `class` keyword + name + colon + `pass`!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Example Section ── */
function ExampleSection() {
  const [phase, setPhase] = useState<"idle" | "typing" | "running" | "done">("idle");
  const [typedCode, setTypedCode] = useState("");
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [flowSteps, setFlowSteps] = useState<string[]>([]);

  const fullCode = 'class City:\n    pass\n\n\ncity1 = City()\n\nprint(city1)';

  const startDemo = useCallback(() => {
    setPhase("typing");
    setTypedCode("");
    setOutputLines([]);
    setFlowSteps([]);

    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx < fullCode.length) {
        setTypedCode(fullCode.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhase("running");
          setFlowSteps(["🌍 Creating City Class..."]);
          setTimeout(() => {
            setFlowSteps(prev => [...prev, "🏙️ Creating City Object..."]);
            setTimeout(() => {
              setFlowSteps(prev => [...prev, "✅ City Object Ready!"]);
              setOutputLines(["<__main__.City object at 0x7f8b8c0b4d90>"]);
              setPhase("done");
            }, 600);
          }, 800);
        }, 400);
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, []);

  const codeLines = typedCode.split("\n");

  return (
    <div className="space-y-4">
      <button onClick={startDemo} disabled={phase === "typing" || phase === "running"}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all shadow-md">
        {phase === "idle" || phase === "done" ? "▶ Run Demo" : phase === "typing" ? "⌨️ Typing..." : "⚡ Running..."}
      </button>

      {/* Code Editor */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-gray-400 text-xs font-mono">city.py</span>
          </div>
        </div>
        <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
          {codeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">{i + 1}</span>
              <div>
                {line.trim().startsWith("class") ? (
                  <>
                    <span className="text-purple-400">class</span>
                    <span className="text-cyan-400"> {line.trim().match(/class\s+(\w+)/)?.[1]}</span>
                    <span className="text-gray-300">:</span>
                  </>
                ) : line.trim().startsWith("pass") ? (
                  <span className="pl-4 text-gray-500">pass</span>
                ) : line.trim().startsWith("city1") ? (
                  <>
                    <span className="text-cyan-400">city1</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-cyan-400">City()</span>
                  </>
                ) : line.trim().startsWith("print") ? (
                  <span className="pl-4"><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">city1</span><span className="text-gray-300">)</span></span>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Animated Function Flow */}
        <div className="px-4 pb-3 bg-gray-900">
          <div className="space-y-1.5">
            {flowSteps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-2"
              >
                <span className="text-amber-400 font-mono text-xs">→</span>
                <span className="text-cyan-400 font-mono text-[11px]">{step}</span>
              </motion.div>
            ))}
            {flowSteps.length === 0 && (
              <p className="text-[10px] text-gray-500 font-mono">🌍 Create a city class to start...</p>
            )}
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
                  className="text-green-400 font-bold">
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
              <p className="text-sm font-bold text-green-700">The `City` Class is the blueprint. `City()` creates a new City Object. The Object is stored inside `city1`!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export function Ch7FavoriteCities({
  onComplete, onNext, isCompleted, hasNext,
}: Ch7FavoriteCitiesProps) {
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
      let className = "";
      let objectName = "";

      for (const line of lines) {
        const t = line.trim();
        if (t === "" || t.startsWith("#")) continue;

        const classMatch = t.match(/^class\s+(\w+)\s*:/);
        if (classMatch) {
          className = classMatch[1];
          continue;
        }

        const objectMatch = t.match(/^(\w+)\s*=\s*(\w+)\s*\(\s*\)$/);
        if (objectMatch) {
          objectName = objectMatch[1];
          continue;
        }

        if (t.startsWith("print") && objectName) {
          out.push(`<__main__.${className} object at 0x7f8b8c0b4d90>`);
        }
      }

      if (out.length === 0) out.push("⚠️ কোনো output পাওয়া যায়নি।");
      setConsoleLines(out);
      setIsRunning(false);

      const hasSuccess = out.some(l => !l.startsWith("❌") && !l.startsWith("⚠️") && l.length > 0);
      const hasError = out.some(l => l.startsWith("❌"));
      if (hasSuccess && !hasError) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
        setStepsDone([true, true, true, true]);
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
      if (q.includes("Class") || q.includes("class")) { a = "Class হলো Python-এ একটি blueprint বা template যেটা দিয়ে আমরা Object তৈরি করি!"; }
      else if (q.includes("Object") || q.includes("object")) { a = "Object হলো Class থেকে তৈরি করা একটি instance। যেমন: city1 = City() — এতে city1 একটি Object।"; }
      else if (q.includes("City Class")) { a = "City Class হলো একটি blueprint যেটা দিয়ে আমরা বিভিন্ন city Object তৈরি করতে পারি!"; }
      else if (q.includes("pass")) { a = "`pass` keyword ব্যবহার করি যখন Class-এর ভেতরে কিছু লিখতে না হয় — এটা empty Class তৈরি করে!"; }
      else if (q.includes("কীভাবে") || q.includes("তৈরি")) { a = "City Object তৈরি করতে `City()` ব্যবহার করো। যেমন: city1 = City()"; }
      else { a = "ভালো প্রশ্ন! City Class হলো blueprint, যেটা দিয়ে অনেক city Object তৈরি করো!"; }
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
            <h3 className="text-lg font-bold text-gray-900 mb-3">City Class কী?</h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              <span className="font-bold text-cyan-600">City Class</span> হলো একটি <span className="font-bold text-purple-600">blueprint</span> — যেটা দিয়ে আমরা অনেক city Object তৈরি করি!
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              <span className="font-bold text-amber-600">City Object</span> হলো Class থেকে তৈরি করা একটি <span className="font-bold text-green-600">instance</span> —
              একই Class থেকে অনেক city তৈরি করা যায়!
            </p>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🌍 City Class → Many Cities</p>
              <CityBlueprintAnimation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">📦 Learning Flow</p>
              <LearningFlowAnimation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🔍 The `class` Keyword</p>
              <ClassKeywordIntro />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> City Class
                হলো blueprint —
                একবার লিখো, অনেক city Object তৈরি করো!
                `class` keyword দিয়ে তৈরি করো।
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
          <motion.p variants={FADE_UP} className="text-sm text-gray-500 mb-5">City Class আমাদের দৈনন্দিন জীবনেও ঘটে!</motion.p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "🏙️", label: "Cities", desc: "একটি design দিয়ে অনেক city!", code: "City()" },
              { icon: "🚗", label: "Cars", desc: "একটি design দিয়ে অনেক car!", code: "Car()" },
              { icon: "🐶", label: "Pets", desc: "একটি design দিয়ে অনেক pet!", code: "Pet()" },
              { icon: "📚", label: "Books", desc: "একটি design দিয়ে অনেক book!", code: "Book()" },
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">🏙️ City Example</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-xl">
                    <p className="text-red-400 font-mono text-sm">Create each city manually</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">❌ Slow!</p>
                </div>
                <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-400 text-xl">→</motion.div>
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                    className="px-4 py-3 bg-green-900/30 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-mono text-sm">Use City Class!</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">🎉 Fast!</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">🔑</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">মনে রাখো:</span> Python
                City Class ঠিক যেমন city design —
                একটি blueprint দিয়ে অনেক city Object তৈরি করো!
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
                  <p className="font-extrabold text-gray-900 text-lg">Mission: City Class তৈরি করো!</p>
                  <p className="text-xs text-gray-500 mt-1">city.py ফাইলে Class এবং Object তৈরি করো</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stepsDone.map((d, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? "w-16" : i === 1 ? "w-12" : i === 2 ? "w-12" : "w-10"} ${d ? "bg-green-400" : "bg-orange-200"}`} />))}
                    <span className="text-xs font-bold text-gray-500 ml-1">{stepsDone.filter(Boolean).length}/4</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p><span className="text-purple-400">class</span> <span className="text-cyan-400">City</span><span className="text-gray-300">:</span></p>
                <p className="pl-4"><span className="text-gray-500">pass</span></p>
                <p></p>
                <p><span className="text-cyan-400">city1</span> <span className="text-gray-300">=</span> <span className="text-cyan-400">City()</span></p>
                <p></p>
                <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">city1</span><span className="text-gray-300">)</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { num: 1, text: "City নামে একটি Class তৈরি করো।", code: "class City:" },
              { num: 2, text: "Class-এর ভেতরে `pass` ব্যবহার করো।", code: "    pass" },
              { num: 3, text: "city1 নামে একটি Object তৈরি করো।", code: "city1 = City()" },
              { num: 4, text: "Object কে Print করো।", code: "print(city1)" },
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
                    <span className={step.code.includes("#") ? "text-gray-400" : step.code.includes("print") ? "text-green-400" : step.code.includes("class") ? "text-purple-400" : "text-cyan-400"}>{step.code}</span>
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
                  <p className="text-white/80 text-sm font-medium mt-3">Chapter 7: Classes & Objects - Favorite Cities</p>
                  <p className="text-white/50 text-xs mt-1">Learn about Python City Classes</p>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">7:00</div>
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
            <span className="text-xs font-mono text-gray-500 w-10 text-right">7:00</span>
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
              <p className="text-sm font-bold text-purple-800">Goal: City Class তৈরি করো!</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-sm space-y-1">
              <p className="text-purple-400">class City:</p>
              <p className="text-gray-500 pl-4">pass</p>
              <p></p>
              <p className="text-cyan-400">city1 = City()</p>
              <p className="text-green-400">print(city1)</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">city.py</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono"><span>{codeLen} chars</span><span>·</span><span>{codeLines} lines</span></div>
              </div>
              <div className="flex bg-gray-900">
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-gray-700">
                  {Array.from({ length: Math.max(codeLines, 12) }, (_, i) => (<div key={i} className="text-gray-600 text-xs font-mono leading-6 h-6">{i + 1}</div>))}
                </div>
                <textarea value={editorCode} onChange={(e) => { setEditorCode(e.target.value); setShowEncourage(false); }}
                  placeholder={'class City:\n    pass\n\n\ncity1 = City()\n\nprint(city1)'}
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
                    <button onClick={copySolution} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 font-mono transition-colors">
                      {solutionCopied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
                    <p><span className="text-purple-400">class</span> <span className="text-cyan-400">City</span><span className="text-gray-300">:</span></p>
                    <p className="pl-4"><span className="text-gray-500">pass</span></p>
                    <p></p>
                    <p><span className="text-cyan-400">city1</span> <span className="text-gray-300">=</span> <span className="text-cyan-400">City()</span></p>
                    <p></p>
                    <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">city1</span><span className="text-gray-300">)</span></p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ═══ SECTION 9: AI Coding Companion ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">🤖</span><h2 className="text-xl font-extrabold text-white tracking-tight">AI Coding Companion</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-indigo-800 leading-relaxed">
              City Class সম্পর্কে জিজ্ঞাসা করো! AI তোমাকে help করবে।
            </p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
            {aiMessages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${msg.role === "user" ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {aiTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => { setAiInput(q); }} className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input ref={aiRef} value={aiInput} onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aiSend()}
              placeholder="Ask about City Classes..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={aiSend} disabled={!aiInput.trim()}
              className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors shadow-sm">
              Send
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ═══ BOTTOM NAVIGATION ═══ */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex items-center justify-between pt-4">
        <button onClick={onComplete.bind(null, LESSON_ID)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-md">
          {isCompleted ? "✓ Completed" : "Mark Complete"}
        </button>
        {hasNext && (
          <button onClick={onNext}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-md">
            Next Lesson →
          </button>
        )}
      </motion.div>
    </div>
  );
}