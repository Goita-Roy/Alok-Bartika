import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch8-zen-of-python";
const SOLUTION_CODE = "import this";

const SUGGESTED_QUESTIONS = [
  "Module \u0995\u09C0?",
  "`this` Module \u0995\u09C0?",
  "Zen of Python \u0995\u09C0?",
  "`import` Keyword \u0995\u09C0?",
  "Zen of Python \u0995\u09C7\u09A8 \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3?",
];

const MOTIVATIONAL = [
  "\u099A\u09AE\u09A4\u09CD\u0995\u09BE\u09B0! Zen of Python \u09A6\u09C7\u0996\u09BE\u099A\u09CD\u099B\u09C7!",
  "\u09A6\u09BE\u09B0\u09C1\u09A3! \u09A4\u09C1\u09AE\u09BF \u09AA\u09BE\u09B0\u09AC\u09C7!",
  "\u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099A\u09C7\u09B7\u09CD\u099F\u09BE!",
  "\u09A4\u09C1\u09AE\u09BF \u09B8\u09A0\u09BF\u0995 \u09AA\u09A5\u09C7 \u0986\u099B\u09CB!",
  "\u09AC\u09BE\u09B9! Python master!",
];

const HINTS = [
  "`import` keyword \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09CB\u0964",
  "Module name \u09B9\u09B2\u09CB `this`\u0964",
  "`print()` \u09B2\u09BE\u0997\u09AC\u09C7 \u09A8\u09BE\u0964",
  "Import \u0995\u09B0\u09BE\u09B0 \u09AA\u09B0\u09C7ই program run \u0995\u09B0\u09CB\u0964",
];

const ZEN_OUTPUT = `The Zen of Python, by Tim Peters

Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
Special cases aren't special enough to break the rules.
Although practicality beats purity.
Errors should never pass silently.
Unless explicitly silenced.
In the face of ambiguity, refuse the temptation to guess.
There should be one-- and preferably only one --obvious way to do it.
Although that way may not be obvious at first unless you're Dutch.
Now is better than never.
Although never is often better than *right* now.
If the implementation is hard to explain, it's a bad idea.
If the implementation is easy to explain, it may be a good idea.
Namespaces are one honking great idea -- let's do more of those!`;

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

interface Ch8ZenOfPythonProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── ZenOfPythonAnimation ── */
function ZenOfPythonAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "\u{1F4E6}", label: "Import Module", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "\u{1F4DC}", label: "Zen of Python", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "\u{1F4A1}", label: "Programming Wisdom", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
    { icon: "\u{1F40D}", label: "Better Python Code", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "\u25B6 Next Step" : "\u{1F504} Restart Animation"}
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
            <div className={`w-28 sm:w-32 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">{"\u{1F40D}"}</span>
              <p className="text-sm font-bold text-green-400">{"\u{1F40D} Zen of Python \u09A6\u09C7\u09AF\u09BC\u09C7 Python code \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u09B9\u09AF\u09BC!"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── LearningFlowAnimation ── */
function LearningFlowAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "\u{1F4E5}", label: "Import Module", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "\u{1F50D}", label: "Load `this`", color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-500/50" },
    { icon: "\u{1F4DC}", label: "Display Zen", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "\u{1F4DA}", label: "Learn Good Practices", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
    { icon: "\u{1F680}", label: "Better Programmer", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setStep(step < steps.length - 1 ? step + 1 : -1)}
        className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {step < steps.length - 1 ? "\u25B6 Next Step" : "\u{1F504} Restart Animation"}
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
            <div className={`w-28 sm:w-32 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.icon}</span>
                <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">{"\u{1F680}"}</span>
              <p className="text-sm font-bold text-green-400">{"this Module \u09A6\u09BF\u09AF\u09BC\u09C7 Zen \u09B6\u09C7\u0996\u09C7 \u09AD\u09B2 \u09B9\u09B8\u09CD\u09A4\u09BE!"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── ImportKeywordIntro ── */
function ImportKeywordIntro() {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShow(!show)}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {show ? "\u{1F504} Replay" : "\u25B6 Show import Keyword"}
      </button>

      <div className="flex items-center justify-center gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span className="text-2xl font-mono font-bold text-white">import</span>
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
              <span className="text-lg font-mono font-bold text-white">this</span>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[10px] text-gray-400 mt-2 font-mono"
          >
            import keyword + module name
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.3 }}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span className="text-xl font-mono font-bold text-white">this</span>
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
              <span className="text-lg">{"\u{1F4A1}"}</span>
              <p className="text-sm font-bold text-purple-400">{"`import this` = Zen of Python \u09A6\u09C7\u0996\u09BE!"}</p>
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

  const fullCode = "import this";

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
          setFlowSteps(["\u{1F4E5} Importing `this` module..."]);
          setTimeout(() => {
            setFlowSteps(prev => [...prev, "\u{1F4DC} Opening Zen of Python..."]);
            setTimeout(() => {
              setFlowSteps(prev => [...prev, "\u2728 Programming Wisdom Displayed!"]);
              const lines = ZEN_OUTPUT.split("\n");
              setOutputLines(lines);
              setPhase("done");
            }, 800);
          }, 600);
        }, 400);
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, []);

  const codeLines = typedCode.split("\n");

  return (
    <div className="space-y-4">
      <button onClick={startDemo} disabled={phase === "typing" || phase === "running"}
        className="w-full px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all shadow-md">
        {phase === "idle" || phase === "done" ? "\u25B6 Run Demo" : phase === "typing" ? "\u2328\uFE0F Typing..." : "\u26A1 Running..."}
      </button>

      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-gray-400 text-xs font-mono">zen.py</span>
          </div>
        </div>
        <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
          {codeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-gray-600 text-xs w-6 text-right mr-3 select-none">{i + 1}</span>
              <div>
                {line.trim().startsWith("import") ? (
                  <>
                    <span className="text-purple-400">import</span>
                    <span className="text-cyan-400"> this</span>
                  </>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-3 bg-gray-900">
          <div className="space-y-1.5">
            {flowSteps.map((fStep, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-2"
              >
                <span className="text-amber-400 font-mono text-xs">{"\u2192"}</span>
                <span className="text-cyan-400 font-mono text-[11px]">{fStep}</span>
              </motion.div>
            ))}
            {flowSteps.length === 0 && (
              <p className="text-[10px] text-gray-500 font-mono">{"\u{1F40D}"} this module import \u0995\u09B0\u09C7 Zen \u09A6\u09C7\u0996\u09BE...</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 px-4 py-3 bg-gray-950">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Terminal</span>
          </div>
          <div className="font-mono text-xs space-y-0.5">
            {outputLines.length === 0 ? (
              <p className="text-gray-600 italic">{"Output \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7..."}</p>
            ) : (
              <div className="max-h-[250px] overflow-y-auto">
                {outputLines.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className={`font-mono text-[11px] leading-relaxed ${i === 0 ? "text-amber-400 font-bold" : i === 1 ? "text-gray-500" : line === "" ? "h-2" : "text-green-400"}`}>
                    {line}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{"\u2705"}</span>
              <p className="text-sm font-bold text-green-700">{"`import this` \u09A6\u09BF\u09AF\u09BC\u09C7 \u099A\u09AE\u09A4\u0995\u09BE\u09B0 Zen of Python \u09A6\u09C7\u0996\u09BE!"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export function Ch8ZenOfPython({
  onComplete, onNext, isCompleted, hasNext,
}: Ch8ZenOfPythonProps) {
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
  const codeLinesCount = editorCode.split("\n").length;
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
    if (!editorCode.trim()) { setConsoleLines(["\u26A0\uFE0F \u09AA\u09CD\u09B0\u09A5\u09AE\u09C7 \u0995\u09BF\u099B\u09C1 \u0995\u09CB\u09A1 \u09B2\u09C7\u0996\u09CB!"]); return; }
    setIsRunning(true);
    setConsoleLines([]);
    setStepsDone([true, false, false]);

    const code = editorCode;
    const hasImportThis = /import\s+this/.test(code);

    if (!hasImportThis) {
      setConsoleLines(["\u274C \u09A4\u09C1\u09AE\u09BF `import this` \u09B2\u09BF\u0996\u09A8\u09BF!"]);
      setIsRunning(false);
      return;
    }
    setStepsDone([true, true, false]);

    setTimeout(() => {
      const lines = ZEN_OUTPUT.split("\n");
      setConsoleLines(lines);
      setStepsDone([true, true, true]);
      setIsRunning(false);
      setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
      setShowEncourage(true);
      setTimeout(() => setShowEncourage(false), 3500);
    }, 500);
  }, [editorCode]);

  const handleReset = useCallback(() => { setEditorCode(""); setConsoleLines([]); setShowEncourage(false); setStepsDone([false, false, false]); }, []);
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
      if (q.includes("Module") || q.includes("module")) { a = "Module \u09B9\u09B2\u09CB Python-\u09A8\u09C7 \u098F\u0995\u099F\u09BF reusable code file \u09AF\u09C7\u099F\u09BE \u0985\u09A8\u09CD\u09AF \u0995\u09CB\u09A1\u09C7 import \u0995\u09B0\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC! \u099F\u09C7\u09AE\u09A8: `this`, `math`, `random`\u0964"; }
      else if (q.includes("this") || q.includes("this")) { a = "`this` Module \u09B9\u09B2\u09CB Python-\u09A8\u09C7\u09B0 \u098F\u0995\u099F\u09BF easter egg \u09AE\u09A1\u09BF\u09A6\u09C1\u09B2! `import this` \u09B2\u09BF\u0996\u09B2\u09C7 Zen of Python \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AF\u09BC \u09AF\u09C7 19\u099F\u09BF \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AC\u09BE\u09B0\u09A4\u09A9!"; }
      else if (q.includes("Zen") || q.includes("zen")) { a = "Zen of Python \u09B9\u09B2\u09CB Python \u09AD\u09BE\u09B7\u09BE\u09AA\u09A8\u09BE\u09B0 \u09A4\u09A4\u09CD\u09A4\u09CD\u09B5 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099A\u09C2\u09B2\u09C7\u09A6\u09A6\u09C7\u09B0 Tim Peters \u09B2\u09BF\u0996\u09C7\u09A8\u099F\u09C7\u09A8\u0964 \u098F\u099F\u09BF 19\u099F\u09BF \u09A6\u09BE\u09B0\u09CD\u09B6\u09A8\u09BE \u09A6\u09C7\u09AF\u09BC\u09C7 Python code \u0995\u09BF\u09AD\u09BE\u09AC\u09C7 \u09B2\u09BF\u0996\u09A8\u09B9\u09BF\u09A4\u09C7\u09B8!"; }
      else if (q.includes("import")) { a = "`import` keyword \u09A6\u09BF\u09AF\u09BC\u09C7 \u0986\u09AE\u09B0\u09BE Module import \u0995\u09B0\u09BF\u0964 \u09AF\u09C7\u09AE\u09A8: `import this` \u2014 \u098F\u09A4\u09C7 this module-\u09A8\u09C7\u09B0 Zen of Python \u09A6\u09C7\u0996\u09BE\u09B0 \u09B8\u09A4\u09B0!"; }
      else if (q.includes("\u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3") || q.includes("important")) { a = "Zen of Python \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3 \u0995\u09BE\u09B0\u09A3 \u0995\u09BE\u09B0\u09A8 \u0995\u09BE\u09B0\u09A8 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09C7\u0995\u09CD\u099F \u09A6\u09B0\u09B8\u09A8\u098F\u09B0\u09B8 \u0996\u09A4\u09C7\u09B0 \u09AC\u09CD\u09AF\u09B6\u09A4\u09CD\u09A4\u09BE\u09B0! \u09A8\u09A4\u09C1\u09A8 \u09B8\u09BE \u09A1\u09C7\u09AF\u09BC\u09B2\u09C7\u09AA\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09B2\u09C7 \u099B\u09C7!"; }
      else { a = "\u09AD\u09BE\u09B2\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8! Python `this` Module \u09A6\u09BF\u09AF\u09BC\u09C7 Zen of Python \u09A6\u09C7\u0996\u09BE \u09AF\u09C7\u099F\u09BE\u09B0 \u09B8\u09B9\u099C\u09A8\u09B8\u09B9 \u09B6\u09C7\u0996\u09A4\u09C7 \u09AA\u09BE\u09B0!"; }
      setAiMessages(m => [...m, { role: "ai", text: a }]);
      setAiTyping(false);
    }, 1100);
  }, [aiInput]);

  const toggleStep = (i: number) => { setStepsDone(s => { const n = [...s]; n[i] = !n[i]; return n; }); };

  return (
    <div className="space-y-8 pb-12">
      {/* SECTION 1: Basic */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4D6}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Basic</h2></div>
        </motion.div>
        <div className="px-6 py-6 space-y-6">
          <motion.div variants={FADE_UP}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{"Python \u09B8\u09C7 `this` Module \u0995\u09C0?"}</h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              <span className="font-bold text-cyan-600">{"`this` Module"}</span> {"\u09B9\u09B2\u09CB Python-\u09A8\u09C7\u09B0 "}
              <span className="font-bold text-purple-600">{"easter egg"}</span> {" \u09A5\u09A8\u09CD\u09A4\u09C7 "}
              <span className="font-bold text-green-600">{"Zen of Python"}</span> {" \u09A6\u09C7\u0996\u09BE\u09B0 \u09AF\u09BE\u09AF\u09BC!"}
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              <span className="font-bold text-amber-600">{"`import this`"}</span> {"\u09B2\u09BF\u0996\u09B2\u09C7 "}
              <span className="font-bold text-red-500">{"The Zen of Python"}</span> {" \u09A6\u09C7\u0996\u09BE\u09B0 \u09AF\u09BE\u09AC\u09C7 19\u099F\u09BF "}
              <span className="font-bold text-blue-600">{"\u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3"}</span> {" \u09B8\u09B9 \u09B6\u09BF\u0995\u09CD\u09B7\u09A4\u09BF!"}
            </p>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F40D}"} {"Zen of Python: Wisdom for Python Programmers"}</p>
              <ZenOfPythonAnimation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F4DA}"} Learning Flow</p>
              <LearningFlowAnimation />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F50D}"} The `import` Keyword</p>
              <ImportKeywordIntro />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">{"\u{1F4A1}"}</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">{"\u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09CB:"}</span> {"`this` Module "}
                {"\u09B9\u09B2\u09CB Python-\u09A8\u09C7\u09B0 easter egg \u09AF\u09C7 "}
                {"Zen of Python \u09A6\u09C7\u0996\u09BE\u09B2\u09C7! "}
                {"19\u099F\u09BF \u0997\u09C1\u09B0\u09C1\u09A4\u09CD\u09B5\u09AA\u09C2\u09B0\u09CD\u09A3 Python code \u09B2\u09BF\u0996\u09A8\u09B0 \u09B8\u09C7\u09B0 \u09B8\u09CD\u09AA\u09B7\u09CD\u099F\u09A4\u09BE \u09B6\u09C7\u0996\u09BE!"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 2: Real Life */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F30D}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Real Life Example</h2></div>
        </motion.div>
        <div className="px-6 py-6">
          <motion.p variants={FADE_UP} className="text-sm text-gray-500 mb-5">{"\u09B8\u09AE\u09CD\u09AA\u09A6\u09AE\u09B8\u09C7 \u09A6\u09C7\u0996\u09A8\u09A4\u09C7 \u0995\u09C0\u09A6\u09B0\u09B8 \u099A\u09C7\u09B6\u09CD\u099F\u09BE\u09B0 \u099A\u09C7\u09A4\u09B2\u09CD\u09AA \u09B8\u09A4\u09B0 \u09B8\u09C7 Zen \u09B8\u09B9\u099C!"}</motion.p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "\u{1F4D6}", label: "Rule Book", desc: "\u0995\u09B2\u09C7\u09B0\u09B0\u09C7\u09B0 \u09A8\u09BF\u09AF\u09BC\u09AE \u0995\u09B8\u09CD\u09A4\u09CD\u09B0\u09C2\u09AA\u09B8\u09CD\u099F\u09CD\u09B0!", code: "import this" },
              { icon: "\u{1F3EB}", label: "Classroom Rules", desc: "\u09B8\u09CD\u09A5\u09BE\u09A8\u09C7\u09B0 \u09A8\u09BF\u09AF\u09BC\u09AE \u0995\u09B8\u09CD\u09A4\u09CD\u09B0\u09C2\u09AA!", code: "Zen of Python" },
              { icon: "\u{1F9ED}", label: "Travel Guide", desc: "\u09B8\u09C0\u09A1\u09B8\u09C7\u09A8\u09A4 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09B9!", code: "Programming Wisdom" },
              { icon: "\u{1F4D5}", label: "Story Book", desc: "\u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u09B2\u09C7\u0996\u09BE \u0995\u09A5\u09BE! \u2014 better code!", code: "Better Python Code" },
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F40D}"} Zen of Python Flow</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-4 py-3 bg-amber-900/30 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 font-mono text-sm">{"import this"}</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">{"Import Module"}</p>
                </div>
                <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-400 text-xl">{"\u2192"}</motion.div>
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                    className="px-4 py-3 bg-green-900/30 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 font-mono text-sm">{"Zen of Python"}</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">{"\u{1F4DC} 19 Aphorisms"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">{"\u{1F511}"}</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">{"\u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09CB:"}</span> {"`import this` "}
                {"\u09B9\u09B2\u09CB \u09B0\u09B8\u09CD\u09A4\u09BE \u09A8\u09A4\u09BF\u09B6\u09B8\u09CD\u09A4 \u09AC\u09C7\u09B8\u09CD\u09A4 Python code \u09B2\u09BF\u0996\u09A8\u09B0\u0964 "}
                {"\u09B8\u09B9 \u09B0\u09C1\u09B2\u09C7\u09B8, \u09B8\u09B9\u09B8\u09BE\u09A6\u09A4\u09BE \u0993 \u09B8\u09C1\u09A8\u09CD\u09A6\u09B0 \u09B8\u09A6\u09B0\u09CD\u09B6 \u09B6\u09C7\u0996\u09BE!"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 3: Example */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4BB}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Example</h2></div>
        </div>
        <div className="px-6 py-6"><ExampleSection /></div>
      </motion.section>

      {/* SECTION 4: Instructions */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-orange-500 to-rose-500">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4DD}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">{"\u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09A8\u09BE"}</h2></div>
        </motion.div>
        <div className="px-6 py-6">
          <motion.div variants={FADE_UP} className="mb-5">
            <div className="bg-gradient-to-r from-orange-50 to-rose-50 border-2 border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-3xl">{"\u26A1"}</motion.span>
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">{"Mission: Zen of Python \u09AA\u09A1\u09CB!"}</p>
                  <p className="text-xs text-gray-500 mt-1">{"zen.py \u09AB\u09BE\u0987\u09B2\u09C7 import \u098F\u09AC\u0982 \u09AA\u09A1\u09BC\u09A4\u09C7 \u09B8\u09A6\u09A6\u09B0\u09CD\u09B6\u09A6\u09B2\u0995\u09B0\u09A8"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stepsDone.map((d, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? "w-20" : i === 1 ? "w-14" : "w-14"} ${d ? "bg-green-400" : "bg-orange-200"}`} />))}
                    <span className="text-xs font-bold text-gray-500 ml-1">{stepsDone.filter(Boolean).length}/3</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p><span className="text-purple-400">import</span> <span className="text-cyan-400">this</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { num: 1, text: "`import` keyword \u09A6\u09BF\u09AF\u09BC\u09C7 Module import \u0995\u09B0\u09CB\u0964", code: "import" },
              { num: 2, text: "Module name \u09B9\u09B2\u09CB `this`\u0964", code: "this" },
              { num: 3, text: "\u09B8\u09B0\u09BE\u09B8\u09B0\u09BF program run \u0995\u09B0\u09CB \u098F\u09AC\u0982 \u09A4\u09C1\u09AE\u09BF Zen \u09AA\u09A1\u09BC\u09CB\u0964", code: "python zen.py" },
            ].map((step, i) => (
              <motion.div key={i} variants={FADE_UP} onClick={() => toggleStep(i)}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${stepsDone[i] ? "bg-green-50 border-green-300 shadow-sm" : "bg-orange-50 border-orange-100 hover:border-orange-200"}`}>
                <motion.div animate={stepsDone[i] ? { scale: [1, 1.3, 1] } : {}}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-colors ${stepsDone[i] ? "bg-green-500 text-white" : "bg-orange-500 text-white"}`}>
                  {stepsDone[i] ? "\u2713" : step.num}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">{"Step "}{step.num}{": "}{step.text}</p>
                  <div className="mt-2 bg-gray-900 rounded-lg p-2.5 font-mono text-xs">
                    <span className={step.code.includes("import") ? "text-purple-400" : step.code.includes("this") ? "text-cyan-400" : "text-green-400"}>{step.code}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {stepsDone.every(Boolean) && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mt-5 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-100 border-2 border-green-300 rounded-2xl">
                  <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }} className="text-2xl">{"\u{1F389}"}</motion.span>
                  <span className="font-extrabold text-green-700">Mission Complete!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* SECTION 5: Hint */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4A1}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Hint</h2></div>
        </div>
        <div className="px-6 py-5">
          <button onClick={handleHintToggle} className="w-full flex items-center justify-between px-5 py-4 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl transition-all duration-200">
            <span className="flex items-center gap-2.5 text-sm font-bold text-cyan-800">
              <motion.span animate={hintOpen ? { rotate: [0, 20, -20, 0] } : {}} transition={{ duration: 0.5 }} className="text-xl">{"\u{1F4A1}"}</motion.span>
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

      {/* SECTION 6: Video */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-pink-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F3AC}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Walkthrough Video</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video cursor-pointer group" onClick={handleVideoToggle}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-orange-800 to-yellow-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div animate={videoPlaying ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: videoPlaying ? Infinity : 0 }}
                    className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    {videoPlaying ? (<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>)
                      : (<svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>)}
                  </motion.div>
                  <p className="text-white/80 text-sm font-medium mt-3">{"Chapter 8: Zen of Python - `this` Module"}</p>
                  <p className="text-white/50 text-xs mt-1">{"Learn about Python's Core Philosophy & Wisdom"}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">4:15</div>
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
            <span className="text-xs font-mono text-gray-500 w-10 text-right">4:15</span>
          </div>
        </div>
      </motion.section>

      {/* SECTION 7: Practice */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-700">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F3AF}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Practice</h2></div>
        </div>
        <div className="px-6 py-6">
          <motion.div variants={FADE_UP} className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{"\u{1F3C6}"}</span>
              <p className="text-sm font-bold text-purple-800">{"Goal: Zen of Python \u09A6\u09C7\u0996\u09CB!"}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-sm space-y-1">
              <p className="text-purple-400">import this</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">zen.py</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono"><span>{codeLen} chars</span><span>{"\u00B7"}</span><span>{codeLinesCount} lines</span></div>
              </div>
              <div className="flex bg-gray-900">
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-gray-700">
                  {Array.from({ length: Math.max(codeLinesCount, 8) }, (_, i) => (<div key={i} className="text-gray-600 text-xs font-mono leading-6 h-6">{i + 1}</div>))}
                </div>
                <textarea value={editorCode} onChange={(e) => { setEditorCode(e.target.value); setShowEncourage(false); }}
                  placeholder={"import this"}
                  className="flex-1 bg-transparent text-green-400 font-mono text-sm p-3 resize-none outline-none leading-6 min-h-[192px] placeholder-gray-600" spellCheck={false} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="bg-gray-900 rounded-2xl border border-gray-200 shadow-md flex-1 min-h-[200px]">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Console</span>
                  {isRunning && (<span className="ml-auto text-[10px] text-yellow-400 flex items-center gap-1"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-2.5 h-2.5 border-2 border-yellow-400 border-t-transparent rounded-full" />Running...</span>)}
                </div>
                <div ref={consoleRef} className="p-4 font-mono text-sm min-h-[160px] overflow-y-auto max-h-[280px]">
                  {consoleLines.length === 0 ? (<p className="text-gray-600 text-xs italic">{"Output \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09C7\u0996\u09BE \u09AF\u09BE\u09AC\u09C7..."} </p>)
                    : (<div className="space-y-0.5">{consoleLines.map((l, i) => (<div key={i} className={`font-mono text-[11px] leading-relaxed ${l.startsWith("\u274C") ? "text-red-400" : i === 0 ? "text-amber-400 font-bold" : i === 1 ? "text-gray-500" : l === "" ? "h-2" : "text-green-400"}`}>{l}</div>))}</div>)}
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
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }} className="text-xl">{"\u{1F389}"}</motion.span>
                    <p className="text-sm font-bold text-green-700">{encourage}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 8: Solution */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u2705"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Solution</h2></div>
        </div>
        <div className="px-6 py-5">
          <button onClick={() => setSolutionOpen(!solutionOpen)} className="w-full flex items-center justify-between px-5 py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-2xl transition-all duration-200">
            <span className="flex items-center gap-2.5 text-sm font-bold text-amber-800">
              <span className="text-xl">{solutionOpen ? "\u{1F441}\uFE0F" : "\u{1F512}"}</span>{solutionOpen ? "Hide Solution" : "Show Solution"}
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
                      <span className="ml-2 text-gray-400 text-xs font-mono">zen.py</span>
                    </div>
                    <button onClick={copySolution} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 font-mono transition-colors">
                      {solutionCopied ? "\u2713 Copied!" : "\u{1F4CB} Copy"}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
                    <p><span className="text-purple-400">import</span> <span className="text-cyan-400">this</span></p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* SECTION 9: AI Coding Companion */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F916}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">AI Coding Companion</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-indigo-800 leading-relaxed">
              {"Python `this` Module \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE \u0995\u09B0\u09CB! AI \u09A4\u09C1\u09AE\u09BE\u0995\u09C7 help \u0995\u09B0\u09AC\u09C7\u0964"}
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
              placeholder={"Ask about Zen of Python..."}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={aiSend} disabled={!aiInput.trim()}
              className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors shadow-sm">
              Send
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* BOTTOM NAVIGATION */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex items-center justify-between pt-4">
        <button onClick={onComplete.bind(null, LESSON_ID)}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-md">
          {isCompleted ? "\u2713 Completed" : "Mark Complete"}
        </button>
        {hasNext && (
          <button onClick={onNext}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-md">
            Next Lesson {"\u2192"}
          </button>
        )}
      </motion.div>
    </div>
  );
}
