import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LESSON_ID = "ch8-slot-machine";
const SOLUTION_CODE = 'import random\n\nsymbols = ["\u{1F352}", "\u{1F34B}", "\u2B50", "\u{1F349}"]\n\nprint(random.choice(symbols))\nprint(random.choice(symbols))\nprint(random.choice(symbols))';

const SUGGESTED_QUESTIONS = [
  "Slot Machine \u0995\u09C0?",
  "`random` Module \u0995\u09C0?",
  "`random.choice()` \u0995\u09C0\u09AD\u09BE\u09B9\u09C7 \u0995\u09BE\u099C \u0995\u09B0\u09C7?",
  "\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09BE\u09B0 \u0986\u09B2\u09BE\u09A6\u09BE Result \u0995\u09C7\u09A8?",
  "\u09A4\u09BF\u09A8\u099F\u09BF Reel \u0995\u09C0\u09AD\u09BE\u09B9\u09C7 Random \u09B9\u09AF\u09BC?",
];

const MOTIVATIONAL = [
  "\u099A\u09AE\u09A4\u09CD\u0995\u09BE\u09B0! Random Symbol \u098F\u09B8\u09C7\u099B\u09C7!",
  "\u09A6\u09BE\u09B0\u09C1\u09A3! \u09A4\u09C1\u09AE\u09BF \u09AA\u09BE\u09B0\u09AC\u09C7!",
  "\u0985\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u099A\u09C7\u09B7\u09CD\u099F\u09BE!",
  "\u09A4\u09C1\u09AE\u09BF \u09B8\u09A0\u09BF\u0995 \u09AA\u09A5\u09C7 \u0986\u099B\u09CB!",
  "\u09AC\u09BE\u09B9! Slot Machine master!",
  "\u099C\u09CD\u099E\u09BE\u09A8\u09B6\u09C8\u09B2! JACKPOT!",
];

const HINTS = [
  "`random` Module import \u0995\u09B0\u09CB\u0964",
  "\u098F\u0995\u099F\u09BF List of symbols \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09CB\u0964",
  "\u09AA\u09CD\u09B0\u09A4\u09BF\u099F\u09BF Reel \u09AF\u09A4\u09CD\u09A6 `random.choice()` \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09CB\u0964",
  "\u09A4\u09BF\u09A8\u099F\u09BF random symbol print \u0995\u09B0\u09CB\u0964",
];

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};
const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const SLOT_SYMBOLS = ["\u{1F352}", "\u{1F34B}", "\u2B50", "\u{1F349}"];

interface Ch8SlotMachineProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

/* ── Slot Machine Reel Animation ── */
function SlotMachineReelAnimation() {
  const [step, setStep] = useState(-1);

  const steps = [
    { icon: "\u{1F3B0}", label: "Press Spin", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "\u{1F3B2}", label: "Reel 1 Spins", color: "text-red-400", bg: "bg-red-900/30 border-red-500/50" },
    { icon: "\u{1F3B2}", label: "Reel 2 Spins", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
    { icon: "\u{1F3B2}", label: "Reel 3 Spins", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "\u{1F352}\u{1F34B}\u2B50", label: "Results", color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-500/50" },
    { icon: "\u{1F389}", label: "Jackpot!", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
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
            {i < steps.length - 1 ? (
              <div className={`w-32 sm:w-36 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{s.icon}</span>
                  <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <motion.div
                  animate={i <= step ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                  className={`w-32 sm:w-36 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{s.icon}</span>
                    <p className={`text-[11px] font-bold ${i <= step ? s.color : "text-gray-600"}`}>{s.label}</p>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-500/30 rounded-xl">
              <span className="text-lg">{"\u{1F389}"}</span>
              <p className="text-sm font-bold text-green-400">{"Slot Machine random choice \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A4\u09BF\u09A8\u099F\u09BF reel spin \u09B9\u09AF\u09BC!"}</p>
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
    { icon: "\u{1F4E5}", label: "Import Module", color: "text-blue-400", bg: "bg-blue-900/30 border-blue-500/50" },
    { icon: "\u{1F3B0}", label: "Spin Reels", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/50" },
    { icon: "\u{1F3B2}", label: "Random Symbols", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/50" },
    { icon: "\u{1F504}", label: "Different Every Time", color: "text-cyan-400", bg: "bg-cyan-900/30 border-cyan-500/50" },
    { icon: "\u{1F389}", label: "Play Again", color: "text-green-400", bg: "bg-green-900/30 border-green-500/50" },
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
            <div className={`w-32 sm:w-36 h-14 rounded-2xl flex items-center justify-center border-2 ${s.bg}`}>
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
              <span className="text-lg">{"\u{1F389}"}</span>
              <p className="text-sm font-bold text-green-400">{"random Module \u09A6\u09BF\u09AF\u09BC\u09C7 \u09A4\u09C1\u09AE\u09BF Slot Machine \u099A\u09B2\u09BE\u09A8!"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Import Keyword Intro ── */
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
              <span className="text-lg font-mono font-bold text-white">random</span>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="text-[10px] text-gray-400 mt-2 font-mono"
          >
            {"import keyword + module name"}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.5 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.3 }}
          className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span className="text-xl font-mono font-bold text-white">choice</span>
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
              <p className="text-sm font-bold text-purple-400">{"`import random` + `random.choice()` = Random Symbol!"}</p>
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
  const [reelResults, setReelResults] = useState<string[]>([]);
  const [isJackpot, setIsJackpot] = useState(false);

  const fullCode = 'import random\n\nsymbols = ["\u{1F352}", "\u{1F34B}", "\u2B50", "\u{1F349}"]\n\nprint(random.choice(symbols))\nprint(random.choice(symbols))\nprint(random.choice(symbols))';

  const startDemo = useCallback(() => {
    setPhase("typing");
    setTypedCode("");
    setOutputLines([]);
    setFlowSteps([]);
    setReelResults([]);
    setIsJackpot(false);

    let idx = 0;
    const typeInterval = setInterval(() => {
      if (idx < fullCode.length) {
        setTypedCode(fullCode.slice(0, idx + 1));
        idx++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhase("running");
          setFlowSteps(["\u{1F4E5} Importing random module..."]);
          setTimeout(() => {
            setFlowSteps(prev => [...prev, "\u{1F3B0} Spinning 3 reels..."]);
            const r1 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
            setTimeout(() => {
              setReelResults([r1]);
              setFlowSteps(prev => [...prev, `\u{1F352} Reel 1: ${r1}`]);
              const r2 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
              setTimeout(() => {
                setReelResults([r1, r2]);
                setFlowSteps(prev => [...prev, `\u{1F34B} Reel 2: ${r2}`]);
                const r3 = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
                setTimeout(() => {
                  setReelResults([r1, r2, r3]);
                  setFlowSteps(prev => [...prev, `\u2B50 Reel 3: ${r3}`]);
                  const jack = r1 === r2 && r2 === r3;
                  setIsJackpot(jack);
                  setTimeout(() => {
                    if (jack) {
                      setFlowSteps(prev => [...prev, "\u{1F389} JACKPOT! All match!"]);
                      setOutputLines([r1, r2, r3, "\u{1F389} JACKPOT!"]);
                    } else {
                      setFlowSteps(prev => [...prev, "\u{1F622} No match. Try again!"]);
                      setOutputLines([r1, r2, r3]);
                    }
                    setPhase("done");
                  }, 500);
                }, 600);
              }, 600);
            }, 600);
          }, 400);
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
        {phase === "idle" || phase === "done" ? "\u25B6 Run Demo" : phase === "typing" ? "\u2328\uFE0F Typing..." : "\u26A1 Running..."}
      </button>

      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-gray-400 text-xs font-mono">slot_machine.py</span>
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
                    <span className="text-cyan-400"> random</span>
                  </>
                ) : line.trim().startsWith("symbols") ? (
                  <span className="pl-4"><span className="text-cyan-400">symbols</span><span className="text-gray-300"> = [</span><span className="text-amber-400">{"\"\u{1F352}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F34B}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u2B50\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F349}\""}</span><span className="text-gray-300">]</span></span>
                ) : line.trim().startsWith("print(random.choice") ? (
                  <span className="pl-4"><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></span>
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
              <p className="text-[10px] text-gray-500 font-mono">{"\u{1F3B0}"} {"Slot Machine 3 reels spin \u0995\u09B0\u09C7 random symbol \u09AC\u09C7\u09B0 \u0995\u09B0\u09C7..."}</p>
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
              outputLines.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className={`font-bold text-lg ${line.includes("JACKPOT") ? "text-amber-400 text-xl" : "text-green-400"}`}>
                  {line}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {phase === "done" && reelResults.length === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl p-4 ${isJackpot ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{isJackpot ? "\u{1F389}" : "\u2705"}</span>
              <p className={`text-sm font-bold ${isJackpot ? "text-amber-700" : "text-green-700"}`}>
                {isJackpot
                  ? `JACKPOT! All 3 reels matched: ${reelResults[0]} ${reelResults[1]} ${reelResults[2]}!`
                  : `3 reels spun: ${reelResults[0]} ${reelResults[1]} ${reelResults[2]} \u2014 random.choice() \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B0\u09A1\u09A8\u09CD\u09A1\u09A8 \u09AB\u09B2\u09BE\u09AB\u09B2 \u09A6\u09BF\u09AF\u09BC\u09B2!`
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ── */
export function Ch8SlotMachine({
  onComplete, onNext, isCompleted, hasNext,
}: Ch8SlotMachineProps) {
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
    setStepsDone([true, false, false, false]);

    const code = editorCode;
    const hasImportRandom = /import\s+random/.test(code);

    if (!hasImportRandom) {
      setConsoleLines(["\u274C \u09A4\u09C1\u09AE\u09BF `import random` \u09B2\u09BF\u0996\u09A8\u09BF!"]);
      setIsRunning(false);
      return;
    }
    setStepsDone([true, true, false, false]);

    const lines = code.split("\n");
    let listLine = "";
    for (const line of lines) {
      if (line.trim().includes("[") && line.trim().includes("]")) {
        listLine = line;
        break;
      }
    }

    if (!listLine) {
      setConsoleLines(["\u274C \u09A4\u09C1\u09AE\u09BF symbols list \u09A4\u09C8\u09B0\u09BF \u09B2\u09BF\u0996\u09A8\u09BF!"]);
      setIsRunning(false);
      return;
    }
    setStepsDone([true, true, true, false]);

    const bracketContent = listLine.substring(listLine.indexOf("["), listLine.lastIndexOf("]") + 1);
    const emojis = bracketContent.match(/"([^"]+)"/g);
    const symbols = emojis ? emojis.map(e => e.replace(/"/g, "")) : [];
    if (symbols.length === 0) {
      setConsoleLines(["\u274C \u09B8\u09C0\u09AE\u09CD\u09AC\u09B2\u09C7 symbols \u09AA\u09BE\u09A8\u09BF!"]);
      setIsRunning(false);
      return;
    }

    const printCount = (code.match(/print\s*\(\s*random\.choice/g) || []).length;
    if (printCount < 2) {
      setConsoleLines(["\u274C \u09A4\u09C1\u09AE\u09BF \u0995\u09AE\u09A4\u09A4\u09B0 2-3 \u09A4\u09B0\u09A6\u09A4\u09B0 print(random.choice(symbols)) \u09B2\u09BF\u0996\u09A8\u09BF!"]);
      setIsRunning(false);
      return;
    }

    setStepsDone([true, true, true, true]);

    const count = Math.min(Math.max(printCount, 2), 3);
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      results.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    setTimeout(() => {
      const out: string[] = [];
      let resultIdx = 0;
      for (const line of lines) {
        const t = line.trim();
        if (t.startsWith("print(random.choice") && resultIdx < results.length) {
          out.push(results[resultIdx]);
          resultIdx++;
        }
      }
      if (out.length === 0) {
        for (const r of results) out.push(r);
      }
      const allMatch = out.length >= 2 && out.every(s => s === out[0]);
      if (allMatch && out.length >= 2) {
        out.push("\u{1F389} JACKPOT! \u09B8\u09AC \u0995\u09B0\u09C7\u099B\u09C7!");
      }
      setConsoleLines(out);
      setIsRunning(false);

      const hasSuccess = out.some(l => !l.startsWith("\u274C") && !l.startsWith("\u26A0\uFE0F") && l.length > 0);
      const hasError = out.some(l => l.startsWith("\u274C"));
      if (hasSuccess && !hasError) {
        setEncourage(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setShowEncourage(true);
        setTimeout(() => setShowEncourage(false), 3500);
      }
    }, 650);
  }, [editorCode]);

  const handleReset = useCallback(() => { setEditorCode(""); setConsoleLines([]); setShowEncourage(false); setStepsDone([false, false, false, false]); }, []);
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
      if (q.includes("Slot Machine") || q.includes("slot machine")) { a = "Slot Machine \u09B9\u09B2\u09CB \u098F\u0995\u099F\u09BF \u0996\u09C7\u09B2\u09BE\u09B0 machine \u09AF\u09C7\u099F\u09BE \u09AF\u09C7\u09B9\u09BE \u09B0\u09C7\u09B2\u099A\u09B2 \u099A\u09B2\u09C7! \u09A4\u09C1\u09AE\u09BF coins \u09A1\u09BE\u09B2\u09C7 \u09A1\u09BE\u09A8\u09CD\u09B8\u09C7 Reels spin \u09B9\u09AF\u09BC \u09A6\u09C7\u0996\u09C7!"; }
      else if (q.includes("Module") || q.includes("module")) { a = "Module \u09B9\u09B2\u09CB Python-\u09A8\u09C7 \u098F\u0995\u099F\u09BF reusable code file \u09AF\u09C7\u099F\u09BE \u0985\u09A8\u09CD\u09AF \u0995\u09CB\u09A1\u09C7 import \u0995\u09B0\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC! \u099F\u09C7\u09AE\u09A8: `math`, `random`, `os`\u0964"; }
      else if (q.includes("random")) { a = "`random` Module \u09B9\u09B2\u09CB Python-\u09A8\u09C7\u09B0 built-in module \u09AF\u09C7\u099F\u09BE\u09A4\u09C7 random functions \u0986\u099B\u09C7 \u2014 \u099F\u09C7\u09AE\u09A8 `random.choice()`, `random.randint()`\u0964"; }
      else if (q.includes("choice")) { a = "`random.choice()` function \u098F\u0995\u099F\u09BF list \u09A5\u09C7\u0995\u09C7 \u09B0\u09CD\u09A8\u09A1\u09A8 random element \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09C7! \u09AF\u09C7\u09AE\u09A8: `random.choice([\"\\u{1F352}\", \"\\u{1F34B}\"])` \u09AF\u09A4\u0995\u09CD\u09B7\u09A3 \u098F\u0995\u099F\u09BF \u09B8\u09CD\u09B2\u099F\u09C7 random symbol \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09C7!"; }
      else if (q.includes("\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09BE\u09B0") || q.includes("\u0986\u09B2\u09BE\u09A6\u09BE")) { a = "\u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09BE\u09B0 random \u09AB\u09B2\u09BE\u09AB\u09B2 \u0986\u09B8\u09C7 \u0995\u09BE\u09B0\u09A3 \u0995\u09BE\u09B0\u09A8 \u09B9\u09AF\u09BC\u09C7\u09B9\u09A4\u09C7\u0964 `random.choice()` \u09A1\u09C7 \u09AC\u09C7\u09B0 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09C7 \u09A8\u09A4\u09C1\u09A8 \u09AB\u09B2\u09BE\u09AB\u09B2 \u09AA\u09BE\u09A8!"; }
      else if (q.includes("Reel") || q.includes("reel")) { a = "\u09A4\u09BF\u09A8\u099F\u09BF reel \u09A4\u09C7 \u098F\u0995\u099F\u09BF random symbol \u0986\u09B8\u09C7! `random.choice(symbols)` \u09A6\u09BF\u09AF\u09BC\u09C7 \u098F\u0995\u099F\u09BF reel \u09B8\u09CD\u09AA\u09BF\u09A8 \u09A6\u09C7\u0996\u09BE\u09A8\u09B0 \u099F\u09B0 \u09A8\u09A4\u09C1\u09A8 symbol \u09AA\u09BE\u09AF\u09BC!"; }
      else if (q.includes("import")) { a = "`import` keyword \u09A6\u09BF\u09AF\u09BC\u09C7 \u0986\u09AE\u09B0\u09BE Module import \u0995\u09B0\u09BF\u0964 \u09AF\u09C7\u09AE\u09A8: `import random` \u2014 \u098F\u09A4\u09C7 random module-\u09A8\u09C7\u09B0 \u09B8\u09AC functions \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09BE \u09AF\u09BE\u09AF\u09BC!"; }
      else { a = "\u09AD\u09BE\u09B2\u09CB \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8! Python `random` Module \u09A6\u09BF\u09AF\u09BC\u09C7 `random.choice()` \u09A6\u09BF\u09AF\u09BC\u09C7 \u09B8\u09B9\u099C\u09C7 random symbol \u09AC\u09C7\u09B0 \u0995\u09B0\u09CB! Slot Machine \u099A\u09B2\u09B2!"; }
      setAiMessages(m => [...m, { role: "ai", text: a }]);
      setAiTyping(false);
    }, 1100);
  }, [aiInput]);

  const toggleStep = (i: number) => { setStepsDone(s => { const n = [...s]; n[i] = !n[i]; return n; }); };

  return (
    <div className="space-y-8 pb-12">
      {/* {"\u2550".repeat(5)} SECTION 1: Basic {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-red-500 via-pink-500 to-rose-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4D6}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Basic</h2></div>
        </motion.div>
        <div className="px-6 py-6 space-y-6">
          <motion.div variants={FADE_UP}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">{"Slot Machine \u0995\u09C0?"}</h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              <span className="font-bold text-amber-600">{"Slot Machine"}</span> {"\u09B9\u09B2\u09CB \u098F\u0995\u099F\u09BF \u09B2\u09CB\u0995\u09AA\u09CD\u09B0\u09BF\u09AF\u09BC\u09B6\u09A8 machine \u09AF\u09C7\u099F\u09BE \u09AF\u09C7\u09B9\u09BE \u09B0\u09C7\u09B2\u099A\u09B2 \u099A\u09B2\u09C7! \u098F\u09A4\u09BF \u09A4\u09BF\u09A8\u099F\u09BF "}
              <span className="font-bold text-purple-600">{"3 \u099F\u09BF reels"}</span> {" \u09B8\u09CD\u09AA\u09BF\u09A8 \u0995\u09B0\u09C7 \u09A4\u09BE\u09B0\u09A7\u09BE\u09A8\u09A6\u09C7\u09B0 \u099B\u09C7\u09B2\u09B0 \u09B8\u09CD\u09A4\u09A8\u09CD\u09A4 \u098F\u0995\u099F\u09BF random symbol \u09A6\u09C7\u0996\u09BE\u09A8\u09CD\u09A4\u09B0! \u0995\u09C7 \u099C\u09BE\u09A8\u09C7 \u09AF\u09BE\u09A4\u09C7 \u0995\u09B0\u09A8\u09B8\u09C7 \u09A8\u09A4\u09C1\u09A8 symbol \u0986\u09B8\u09A4\u09C7 \u09B8\u09C7 \u0995\u09A4\u09A4\u09A4\u09A4\u09A4\u09A8 \u099B\u09C7\u09B2\u09B2\u09A8!"}
            </p>
            <p className="text-gray-700 text-[15px] leading-relaxed mt-2">
              <span className="font-bold text-cyan-600">{"Python random Module"}</span> {"\u09A6\u09BF\u09AF\u09BC\u09C7 \u09A4\u09C1\u09AE\u09BF Slot Machine \u09A4\u09C8\u09B0\u09BF \u09A4\u09C8\u09B0\u09BF \u09B8\u09CD\u09B2\u099F\u09A8 \u09A6\u09C7\u0996\u09B2\u09C7 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7! "}
              <span className="font-bold text-green-600">{"`random.choice()`"}</span> {"\u09A6\u09BF\u09AF\u09BC\u09C7 \u098F\u0995\u099F\u09BF list \u09A5\u09C7\u0995\u09C7 \u09B0\u09CD\u09A8\u09A1\u09AE random symbol \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09C7!"}
            </p>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F3B0}"} {"Slot Machine: Spin \u2192 Random Symbols!"}</p>
              <SlotMachineReelAnimation />
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F50D}"} {"The `import` Keyword"}</p>
              <ImportKeywordIntro />
            </div>
          </motion.div>

          <motion.div variants={FADE_UP}>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">{"\u{1F4A1}"}</span>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">{"\u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09CB:"}</span> {"`random` Module "}
                {"\u09B9\u09B2\u09CB randomness \u09A4\u09C8\u09B0\u09BF\u09A4\u09C7\u09B0 \u099C\u09A8\u09CD\u09A4\u09CD\u09B0\u09A8\u09CD\u09A4\u09B0\u0964 "}
                {"`random.choice()` \u09A6\u09BF\u09AF\u09BC\u09C7 list \u09A5\u09C7\u0995\u09C7 \u09B0\u09CD\u09A8\u09A1\u09A8 random symbol \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09C7\u0964"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* {"\u2550".repeat(5)} SECTION 2: Real Life {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={STAGGER} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <motion.div variants={FADE_UP} className="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F30D}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Real Life Example</h2></div>
        </motion.div>
        <div className="px-6 py-6">
          <motion.p variants={FADE_UP} className="text-sm text-gray-500 mb-5">{"\u09B8\u09AE\u09CD\u09AA\u09A6\u09AE\u09B8\u09C7 \u099C\u09C0\u09AC\u09A8\u09C7\u099B\u09C7\u0993 \u09B8\u09C7 Slot Machine \u09A6\u09C7\u0996\u09BE!"}</motion.p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "\u{1F3B0}", label: "Slot Machine", desc: "\u09B8\u09CD\u09B2\u099F \u09AE\u09C7\u09B6\u09BF\u09A8 \u2014 random spin!", code: "random.choice(symbols)" },
              { icon: "\u{1F3B2}", label: "Dice Roll", desc: "\u09AA\u09BE\u09B6\u09BE \u099B\u09CB\u0981\u09B0\u09BE \u2014 random number!", code: "random.randint(1,6)" },
              { icon: "\u{1F0CF}", label: "Card Draw", desc: "\u09A4\u09BE\u09B8 \u099F\u09BE\u09A8\u09B6\u09C7\u09B2 \u2014 random card!", code: "random.shuffle(cards)" },
              { icon: "\u{1F3AF}", label: "Lucky Dip", desc: "\u09B2\u09BE\u0995\u09BF \u09A1\u09BF\u09AA \u2014 random winner!", code: "random.choice(names)" },
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
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">{"\u{1F3B0}"} {"Amusement Park: Insert Coin \u2192 Spin!"}</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                    className="px-4 py-3 bg-amber-900/30 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-400 font-mono text-sm">{"\u{1F3B0} Insert Coin"}</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">{"\u2705 Press Spin"}</p>
                </div>
                <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-gray-400 text-xl">{"\u2192"}</motion.div>
                <div className="text-center">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                    className="px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl">
                    <p className="text-purple-400 font-mono text-sm">{"\u{1F52E} Reels Spin"}</p>
                  </motion.div>
                  <p className="text-xs text-gray-500 mt-2">{"\u{1F3B2} Random Result"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-5">
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">{"\u{1F511}"}</span>
              <p className="text-sm text-teal-800 leading-relaxed">
                <span className="font-bold">{"\u09AE\u09A8\u09C7 \u09B0\u09BE\u0996\u09CB:"}</span> {"Amusement Park \u09A4\u09C7 Slot Machine "}
                {"\u09B9\u09B2\u09CB random \u09B8\u09B8\u09CD\u09A4 \u0995\u09B0\u09C7! "}
                {"\u09B0\u09A1\u09A8\u09CD\u09A1\u09B8\u09B8\u09CD\u09A4 \u09AB\u09B2\u09BE\u09AB\u09B2 \u09AA\u09BE\u09B9\u09BE!"}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* {"\u2550".repeat(5)} SECTION 3: Example {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4BB}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Example</h2></div>
        </div>
        <div className="px-6 py-6"><ExampleSection /></div>
      </motion.section>

      {/* {"\u2550".repeat(5)} SECTION 4: Instructions {"\u2550".repeat(5)} */}
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
                  <p className="font-extrabold text-gray-900 text-lg">{"Mission: Slot Machine game \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09CB!"}</p>
                  <p className="text-xs text-gray-500 mt-1">{"slot_machine.py \u09AB\u09BE\u0987\u09B2\u09C7 import \u098F\u09AC\u0982 random.choice() \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09CB"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stepsDone.map((d, i) => (<div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === 0 ? "w-16" : i === 1 ? "w-12" : i === 2 ? "w-12" : "w-10"} ${d ? "bg-green-400" : "bg-orange-200"}`} />))}
                    <span className="text-xs font-bold text-gray-500 ml-1">{stepsDone.filter(Boolean).length}/4</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm space-y-1">
                <p><span className="text-purple-400">import</span> <span className="text-cyan-400">random</span></p>
                <p></p>
                <p><span className="text-cyan-400">symbols</span> <span className="text-gray-300">= [</span><span className="text-amber-400">{"\"\u{1F352}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F34B}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u2B50\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F349}\""}</span><span className="text-gray-300">]</span></p>
                <p></p>
                <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
                <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
                <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              { num: 1, text: "`import random` \u09A6\u09BF\u09AF\u09BC\u09C7 random Module import \u0995\u09B0\u09CB\u0964", code: "import random" },
              { num: 2, text: "symbols list \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09CB 4 \u099F\u09BF symbols \u09A6\u09BF\u09AF\u09BC\u09C7\u0964", code: 'symbols = ["\u{1F352}", "\u{1F34B}", "\u2B50", "\u{1F349}"]' },
              { num: 3, text: "`random.choice(symbols)` \u09A6\u09BF\u09AF\u09BC\u09C7 \u09AA\u09CD\u09B0\u09A4\u09BF Reel \u09A4\u09C7 random symbol \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u09B9 \u0995\u09B0\u09CB\u0964", code: "print(random.choice(symbols))" },
              { num: 4, text: "3 \u09A4\u09B0 reels \u09B8\u09B9 \u0995\u09B0\u09C7 output \u09A6\u09C7\u0996\u09CB\u0964", code: "python slot_machine.py" },
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
                    <span className={step.code.includes("import") ? "text-purple-400" : step.code.includes("random") ? "text-cyan-400" : step.code.includes("print") ? "text-green-400" : "text-gray-400"}>{step.code}</span>
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

      {/* {"\u2550".repeat(5)} SECTION 5: Hint {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-cyan-500 to-blue-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F4A1}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Hint</h2></div>
        </div>
        <div className="px-6 py-5">
          <button onClick={handleHintToggle} className="w-full flex items-center justify-between px-5 py-4 bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl transition-all duration-200">
            <span className="flex items-center gap-2.5 text-sm font-bold text-cyan-800">
              <motion.span animate={hintOpen ? { rotate: [0, 20, -20, 0] } : {}} transition={{ duration: 0.5 }} className="text-xl">{"\u{1F4A1}"}</motion.span>
              {"Need a Hint?"}
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

      {/* {"\u2550".repeat(5)} SECTION 6: Video {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-rose-500 to-pink-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F3AC}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Walkthrough Video</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video cursor-pointer group" onClick={handleVideoToggle}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 via-orange-800 to-red-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div animate={videoPlaying ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: videoPlaying ? Infinity : 0 }}
                    className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    {videoPlaying ? (<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>)
                      : (<svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>)}
                  </motion.div>
                  <p className="text-white/80 text-sm font-medium mt-3">{"Chapter 8: Random Module - Slot Machine"}</p>
                  <p className="text-white/50 text-xs mt-1">{"Learn about random.choice() & Slot Machines"}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-xs font-mono">7:20</div>
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
              <motion.div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" animate={{ width: `${videoProgress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">7:20</span>
          </div>
        </div>
      </motion.section>

      {/* {"\u2550".repeat(5)} SECTION 7: Practice {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-700">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F3AF}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">Practice</h2></div>
        </div>
        <div className="px-6 py-6">
          <motion.div variants={FADE_UP} className="mb-5 bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{"\u{1F3C6}"}</span>
              <p className="text-sm font-bold text-purple-800">{"Goal: Slot Machine game \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09CB!"}</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-3 font-mono text-sm space-y-1">
              <p className="text-purple-400">import random</p>
              <p></p>
              <p className="text-cyan-400">{"symbols = [\"\\u{1F352}\", \"\\u{1F34B}\", \"\\u2B50\", \"\\u{1F349}\"]"}</p>
              <p></p>
              <p className="text-green-400">print(random.choice(symbols))</p>
              <p className="text-green-400">print(random.choice(symbols))</p>
              <p className="text-green-400">print(random.choice(symbols))</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" /><span className="w-3 h-3 rounded-full bg-yellow-400" /><span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-gray-400 text-xs font-mono">slot_machine.py</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono"><span>{codeLen} chars</span><span>{"\u00B7"}</span><span>{codeLinesCount} lines</span></div>
              </div>
              <div className="flex bg-gray-900">
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none border-r border-gray-700">
                  {Array.from({ length: Math.max(codeLinesCount, 12) }, (_, i) => (<div key={i} className="text-gray-600 text-xs font-mono leading-6 h-6">{i + 1}</div>))}
                </div>
                <textarea value={editorCode} onChange={(e) => { setEditorCode(e.target.value); setShowEncourage(false); }}
                  placeholder={"import random\n\nsymbols = [\"\\u{1F352}\", \"\\u{1F34B}\", \"\\u2B50\", \"\\u{1F349}\"]\n\nprint(random.choice(symbols))\nprint(random.choice(symbols))\nprint(random.choice(symbols))"}
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
                  {consoleLines.length === 0 ? (<p className="text-gray-600 text-xs italic">{"Output \u098F\u0996\u09BE\u09A8\u09C7 \u09A6\u09C7\u0996\u09BE\u09AC\u09C7 \u09AF\u09BE\u09AC\u09C7..."} </p>)
                    : (<div className="space-y-0.5">{consoleLines.map((l, i) => (<div key={i} className={`text-lg font-bold ${l.startsWith("\u274C") ? "text-red-400" : l.startsWith(">>>") ? "text-gray-400" : l.startsWith("\u26A0\uFE0F") ? "text-yellow-400" : l.includes("JACKPOT") ? "text-amber-400 text-xl" : "text-green-400"}`}>{l}</div>))}</div>)}
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

      {/* {"\u2550".repeat(5)} SECTION 8: Solution {"\u2550".repeat(5)} */}
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
                      <span className="ml-2 text-gray-400 text-xs font-mono">solution.py</span>
                    </div>
                    <button onClick={copySolution} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 font-mono transition-colors">
                      {solutionCopied ? "\u2713 Copied!" : "\u{1F4CB} Copy"}
                    </button>
                  </div>
                  <div className="bg-gray-900 p-4 font-mono text-sm space-y-1">
                    <p><span className="text-purple-400">import</span> <span className="text-cyan-400">random</span></p>
                    <p></p>
                    <p><span className="text-cyan-400">symbols</span> <span className="text-gray-300">= [</span><span className="text-amber-400">{"\"\u{1F352}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F34B}\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u2B50\""}</span><span className="text-gray-300">, </span><span className="text-amber-400">{"\"\u{1F349}\""}</span><span className="text-gray-300">]</span></p>
                    <p></p>
                    <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
                    <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
                    <p><span className="text-green-400">print</span><span className="text-gray-300">(</span><span className="text-cyan-400">random.choice</span><span className="text-gray-300">(</span><span className="text-cyan-400">symbols</span><span className="text-gray-300">))</span></p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* {"\u2550".repeat(5)} SECTION 9: AI Coding Companion {"\u2550".repeat(5)} */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={FADE_UP} className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center gap-3"><span className="text-3xl">{"\u{1F916}"}</span><h2 className="text-xl font-extrabold text-white tracking-tight">AI Coding Companion</h2></div>
        </div>
        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-4">
            <p className="text-sm text-indigo-800 leading-relaxed">
              {"Python random Module \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7 \u099C\u09BF\u099C\u09CD\u099E\u09BE\u09B8\u09BE \u0995\u09B0\u09CB! AI \u09A4\u09C1\u09AE\u09BE\u0995\u09C7 help \u0995\u09B0\u09AC\u09C7\u0964"}
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
              placeholder={"Ask about random Module..."}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            <motion.button whileTap={{ scale: 0.95 }} onClick={aiSend} disabled={!aiInput.trim()}
              className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors shadow-sm">
              Send
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* {"\u2550".repeat(5)} BOTTOM NAVIGATION {"\u2550".repeat(5)} */}
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
