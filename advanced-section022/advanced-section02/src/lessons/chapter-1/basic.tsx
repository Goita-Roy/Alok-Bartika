import { useState, useRef, useCallback } from "react";

interface Ch1BasicProps {
  onComplete: (id: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

const LESSON_ID = "ch1-basic";
const SOLUTION_CODE = 'print("Hello World!")';

const SUGGESTED_QUESTIONS = [
  "print() দিয়ে কী করা যায়?",
  "Single quotes ও double quotes এর পার্থক্য কী?",
  "একাধিক কথা একসাথে কিভাবে দেখাবো?",
];

const MOTIVATIONAL_MESSAGES = [
  "চমৎকার! তুমি এগিয়ে যাচ্ছো!",
  "দারুণ! তুমি পারবে!",
  "ভালো চেষ্টা! আবার চেষ্টা করো।",
  "প্রয়োজনীয় কোড লেখো!",
  "তুমি সঠিক পথে আছো!",
];

export function Ch1Basic({ onComplete, onNext, isCompleted, hasNext }: Ch1BasicProps) {
  const [hintOpen, setHintOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solutionCopied, setSolutionCopied] = useState(false);
  const [editorCode, setEditorCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMsg, setEncouragementMsg] = useState("");
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress] = useState(0);
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  const codeLines = editorCode.split("\n").length;
  const charCount = editorCode.length;

  const handleRun = useCallback(() => {
    if (!editorCode.trim()) {
      setConsoleOutput(["⚠️ প্রথমে কিছু কোড লেখো!"]);
      return;
    }
    setIsRunning(true);
    setConsoleOutput([]);
    setTimeout(() => {
      const output: string[] = [];
      const lines = editorCode.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
          const inner = trimmed.slice(6, -1).trim();
          if (
            (inner.startsWith('"') && inner.endsWith('"')) ||
            (inner.startsWith("'") && inner.endsWith("'"))
          ) {
            output.push(inner.slice(1, -1));
          } else {
            output.push(`>>> ${inner}`);
          }
        } else if (trimmed === "") {
          continue;
        } else {
          output.push(`>>> ${trimmed}`);
        }
      }
      if (output.length === 0) {
        output.push("⚠️ কোনো output পাওয়া যায়নি। print() ব্যবহার করো!");
      }
      setConsoleOutput(output);
      setIsRunning(false);
      if (output.some((o) => o === "Hello World!") || editorCode.trim() === SOLUTION_CODE) {
        setEncouragementMsg(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * 2)]);
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 3000);
      }
    }, 600);
  }, [editorCode]);

  const handleReset = useCallback(() => {
    setEditorCode("");
    setConsoleOutput([]);
    setShowEncouragement(false);
  }, []);

  const handleCopySolution = useCallback(() => {
    navigator.clipboard.writeText(SOLUTION_CODE);
    setSolutionCopied(true);
    setTimeout(() => setSolutionCopied(false), 2000);
  }, []);

  const handleAiSend = useCallback(() => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      let reply = "";
      if (userMsg.toLowerCase().includes("print") || userMsg.includes("print")) {
        reply = "print() হলো Python-এর একটি built-in function। এটি যেকোনো text বা value স্ক্রিনে দেখাতে ব্যবহার হয়। যেমন: print(\"Hello\") — এটি \"Hello\" লেখাটি স্ক্রিনে দেখাবে।";
      } else if (userMsg.includes("quote") || userMsg.includes("quotes")) {
        reply = "Python-এ double quotes \" \" এবং single quotes ' ' — দুটোই ব্যবহার করা যায়। তবে একটি string-এর শুরু ও শেষের quotes একই ধরনের হতে হবে।";
      } else if (userMsg.includes("multiple") || userMsg.includes("একাধিক") || userMsg.includes("একসাথে")) {
        reply = "একাধিক print() statement ব্যবহার করে একাধিক কথা দেখাতে পারো:\nprint(\"Hello\")\nprint(\"World\")\nএতে প্রতিটি print() আলাদা লাইনে output দেখাবে।";
      } else {
        reply = "ভালো প্রশ্ন! print() function Python-এ সবচেয়ে প্রথম function যা আমরা শিখি। আপনি যেকোনো text print() এর ভেতরে লিখতে পারেন।";
      }
      setAiMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setAiTyping(false);
    }, 1200);
  }, [aiInput]);

  const handleAiQuestion = useCallback((q: string) => {
    setAiInput(q);
    setTimeout(() => {
      aiInputRef.current?.focus();
    }, 50);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* ═══════════════ SECTION 1: Basic ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center gap-3">
          <span className="text-2xl">📘</span>
          <h2 className="text-lg font-bold text-white">Basic</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-800 leading-relaxed">
            Python-এ <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-semibold">print()</code> ফাংশন ব্যবহার করা হয় কম্পিউটারকে "কথা বলানোর" জন্য।
          </p>
          <p className="text-gray-700 leading-relaxed">
            অর্থাৎ, আমরা যখন কোনো লেখা বা তথ্য স্ক্রিনে দেখাতে চাই, তখন <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-semibold">print()</code> ব্যবহার করি।
          </p>
          <p className="text-gray-700 leading-relaxed">
            আমরা যে মেসেজটি দেখাতে চাই, সেটি <code className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono text-sm font-semibold">print()</code> এর parentheses <code className="font-mono text-sm text-gray-600">()</code> এর ভেতরে এবং quotation marks এর মধ্যে লিখতে হয়।
          </p>

          <div className="mt-4 bg-gray-900 rounded-xl p-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="ml-2 text-gray-500 text-xs">hello.py</span>
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-purple-400">print</span>
                <span className="text-gray-300">(</span>
                <span className="text-green-400">"Hello World!"</span>
                <span className="text-gray-300">)</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400 text-xs">
              <span className="text-green-400 font-semibold">Output: </span>
              <span className="text-white">Hello World!</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed mt-3">
            Quotation marks হিসেবে double quotes <code className="font-mono text-sm text-gray-600">" "</code> অথবা single quotes <code className="font-mono text-sm text-gray-600">' '</code> — দুটোই ব্যবহার করা যায়। তবে শুরু ও শেষের quotation একই হতে হবে।
          </p>

          <div className="flex gap-3 mt-3">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 font-mono text-sm font-semibold">print("Hello")</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ সঠিক</span>
            </div>
            <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p className="text-green-700 font-mono text-sm font-semibold">print('Hello')</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">✓ সঠিক</span>
            </div>
            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-600 font-mono text-sm font-semibold line-through">print("Hello')</p>
              <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">✗ ভুল</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 2: Example ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center gap-3">
          <span className="text-2xl">💻</span>
          <h2 className="text-lg font-bold text-white">Example</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-4">Real Life Example</p>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏪</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2">দোকানের বোর্ড</h4>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  মনে করো একটি দোকানের সামনে একটি বোর্ড আছে। সেই বোর্ডে লেখা — "স্বাগতম! আমাদের দোকানে আসুন।"
                </p>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Python-এ <code className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">print()</code> ঠিক সেই বোর্ডের মতো — এটি স্ক্রিনে একটি মেসেজ দেখায়।
                </p>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="text-purple-400">print</span>
                      <span className="text-gray-300">(</span>
                      <span className="text-green-400">"স্বাগতম! আমাদের দোকানে আসুন।"</span>
                      <span className="text-gray-300">)</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400 text-xs">
                    <span className="text-green-400 font-semibold">Output: </span>
                    <span className="text-white">স্বাগতম! আমাদের দোকানে আসুন।</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <span className="flex-shrink-0 text-xl mt-0.5">💡</span>
            <p className="text-sm text-amber-800 leading-relaxed">
              <span className="font-bold">মনে রাখো:</span> print() মূলত একটি "বোর্ড" — তুমি যা লেখো, সেটাই স্ক্রিনে দেখায়। তুমি যতবার print() ব্যবহার করো, ততবার আলাদা আলাদা মেসেজ দেখাবে।
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3: Instructions ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-rose-500 flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <h2 className="text-lg font-bold text-white">নির্দেশনা</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-800 leading-relaxed mb-4">
            চল এবার editor ব্যবহার করে একটি নতুন <code className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-mono text-sm font-semibold">hello_world.py</code> প্রোগ্রাম তৈরি করি।
          </p>
          <p className="text-gray-800 leading-relaxed mb-5">
            নতুন লাইনে <code className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-mono text-sm font-semibold">print()</code> ব্যবহার করে নিচের মেসেজটি দেখাও।
          </p>
          <p className="text-gray-800 leading-relaxed mb-5">
            তারপর প্রোগ্রামটি রান করো।
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <p className="text-sm text-gray-800">নিচের <span className="font-bold">Practice</span> সেকশনে যাও।</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <p className="text-sm text-gray-800">Code Editor-এ নিচের কোডটি লেখো:</p>
            </div>
            <div className="ml-11 bg-gray-900 rounded-lg p-3 font-mono text-sm">
              <span className="text-purple-400">print</span>
              <span className="text-gray-300">(</span>
              <span className="text-green-400">"Hello World!"</span>
              <span className="text-gray-300">)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <p className="text-sm text-gray-800"><span className="font-bold">Run</span> বাটনে ক্লিক করো।</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
              <p className="text-sm text-gray-800">Console-এ <span className="font-bold font-mono text-green-700">Hello World!</span> দেখতে পাবে!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4: Hint ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center gap-3">
          <span className="text-2xl">💡</span>
          <h2 className="text-lg font-bold text-white">Hint</h2>
        </div>
        <div className="px-6 py-5">
          <button
            onClick={() => setHintOpen(!hintOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-xl transition-all duration-200 group"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-cyan-800">
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Need a Hint?
            </span>
            <svg
              className={`w-5 h-5 text-cyan-500 transition-transform duration-300 ${hintOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              hintOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  <code className="px-1 py-0.5 bg-cyan-100 text-cyan-700 rounded font-mono text-xs font-semibold">print</code> লেখো — এটি Python-এর একটি function।
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  তারপর <code className="font-mono text-xs text-gray-600">(</code> বন্ধনী খুলো।
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  বন্ধনীর ভেতরে quotes এর মধ্যে লেখো: <code className="px-1 py-0.5 bg-cyan-100 text-cyan-700 rounded font-mono text-xs font-semibold">"Hello World!"</code>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  শেষে <code className="font-mono text-xs text-gray-600">)</code> বন্ধনী বন্ধ করো।
                </p>
              </div>
              <div className="mt-3 p-3 bg-gray-900 rounded-lg font-mono text-sm">
                <span className="text-purple-400">print</span>
                <span className="text-gray-300">(</span>
                <span className="text-green-400">"Hello World!"</span>
                <span className="text-gray-300">)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 5: Walkthrough Video ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 flex items-center gap-3">
          <span className="text-2xl">🎥</span>
          <h2 className="text-lg font-bold text-white">Walkthrough Video</h2>
        </div>
        <div className="px-6 py-5">
          <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video group cursor-pointer" onClick={() => setVideoPlaying(!videoPlaying)}>
            {/* Thumbnail */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/80 text-sm font-medium mt-3">Chapter 1: Hello World — Basic</p>
                  <p className="text-white/50 text-xs mt-1">print() function explained in Bangla</p>
                </div>
              </div>
            </div>

            {/* Duration badge */}
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-xs font-mono">
              4:32
            </div>

            {/* Completed badge */}
            {videoProgress >= 100 && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Completed
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500 w-10">0:00</span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${videoProgress || 0}%` }}
              />
            </div>
            <span className="text-xs font-mono text-gray-500 w-10 text-right">4:32</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6: Practice ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-700 flex items-center gap-3">
          <span className="text-2xl">🎯</span>
          <h2 className="text-lg font-bold text-white">Practice</h2>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Code Editor */}
            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-2 text-gray-400 text-xs font-mono">hello_world.py</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <span>{charCount} chars</span>
                  <span>·</span>
                  <span>{codeLines} lines</span>
                </div>
              </div>
              <div className="flex">
                {/* Line numbers */}
                <div className="flex-shrink-0 py-3 pl-3 pr-2 text-right select-none">
                  {Array.from({ length: Math.max(codeLines, 10) }, (_, i) => (
                    <div key={i} className="text-gray-600 text-xs font-mono leading-6 h-6">
                      {i + 1}
                    </div>
                  ))}
                </div>
                {/* Editor */}
                <textarea
                  value={editorCode}
                  onChange={(e) => {
                    setEditorCode(e.target.value);
                    setShowEncouragement(false);
                  }}
                  placeholder={`print("Hello World!")`}
                  className="flex-1 bg-transparent text-green-400 font-mono text-sm p-3 resize-none outline-none leading-6 min-h-[240px] placeholder-gray-600"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Console + Controls */}
            <div className="flex flex-col gap-3">
              {/* Console */}
              <div className="bg-gray-900 rounded-xl border border-gray-700 flex-1 min-h-[180px]">
                <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Console</span>
                  {isRunning && (
                    <span className="ml-auto text-xs text-yellow-400 flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Running...
                    </span>
                  )}
                </div>
                <div ref={consoleRef} className="p-3 font-mono text-sm min-h-[140px] overflow-y-auto max-h-[200px]">
                  {consoleOutput.length === 0 ? (
                    <p className="text-gray-600 text-xs italic">Output এখানে দেখা যাবে...</p>
                  ) : (
                    <div className="space-y-1">
                      {consoleOutput.map((line, i) => (
                        <div key={i} className={`${line.startsWith("⚠️") ? "text-yellow-400" : line.startsWith(">>>") ? "text-gray-400" : "text-green-400"}`}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {isRunning ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Reset
                </button>
                <button
                  disabled
                  className="px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-semibold rounded-lg border border-gray-200 cursor-not-allowed"
                  title="Check functionality coming soon"
                >
                  Check
                </button>
              </div>

              {/* Encouragement */}
              <div
                className={`transition-all duration-500 ${
                  showEncouragement ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-lg">🎉</span>
                  <p className="text-sm font-semibold text-green-700">{encouragementMsg}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7: Solution ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <h2 className="text-lg font-bold text-white">Solution</h2>
        </div>
        <div className="px-6 py-5">
          <button
            onClick={() => setSolutionOpen(!solutionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all duration-200"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              {solutionOpen ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
              {solutionOpen ? "Hide Solution" : "Show Solution"}
            </span>
            <svg
              className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${solutionOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              solutionOpen ? "max-h-60 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="ml-2 text-gray-400 text-xs font-mono">solution.py</span>
                </div>
                <button
                  onClick={handleCopySolution}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  {solutionCopied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
              <div className="p-4 font-mono text-sm leading-6">
                <div>
                  <span className="text-purple-400">print</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-green-400">"Hello World!"</span>
                  <span className="text-gray-300">)</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="p-3 bg-gray-800 rounded-lg text-xs">
                  <span className="text-gray-500">Output → </span>
                  <span className="text-green-400 font-semibold">Hello World!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 8: AI Coding Companion ═══════════════ */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-purple-700 flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <h2 className="text-lg font-bold text-white">AI Coding Companion</h2>
        </div>
        <div className="px-6 py-5">
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-xl overflow-hidden">
            {/* Chat header */}
            <div className="px-4 py-3 bg-purple-100/50 border-b border-purple-200 flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <p className="text-sm font-bold text-purple-900">PyBot</p>
                <p className="text-[10px] text-purple-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  Online
                </p>
              </div>
            </div>

            {/* Chat area */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {aiMessages.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl">👋</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">Hello! I'm PyBot</p>
                  <p className="text-xs text-gray-500 max-w-[240px] mb-4">
                    Python শেখতে তোমাকে সাহায্য করতে পারি। নিচের যেকোনো প্রশ্নে ক্লিক করো বা নিজে লেখো!
                  </p>
                  <div className="space-y-2 w-full max-w-[300px]">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleAiQuestion(q)}
                        className="w-full text-left px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                      >
                        <span className="text-purple-400 mr-1.5">💡</span>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages */
                <>
                  {aiMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-purple-600 text-white rounded-br-md"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Suggested questions (shown after some messages) */}
            {aiMessages.length > 0 && aiMessages.length < 6 && (
              <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto">
                {SUGGESTED_QUESTIONS.slice(0, 2).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAiQuestion(q)}
                    className="flex-shrink-0 px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input box */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <input
                  ref={aiInputRef}
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
                  placeholder="তোমার প্রশ্ন লেখো..."
                  className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                />
                <button
                  onClick={handleAiSend}
                  disabled={!aiInput.trim() || aiTyping}
                  className="flex-shrink-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ Bottom Actions ═══════════════ */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {!isCompleted ? (
          <button
            onClick={() => onComplete(LESSON_ID)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Mark as Complete
          </button>
        ) : (
          <span className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 text-sm font-semibold rounded-xl border border-green-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completed!
          </span>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            Next Lesson
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
