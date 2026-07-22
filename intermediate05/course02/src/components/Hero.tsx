import { motion } from 'framer-motion';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface HeroProps {
  onStart: () => void;
  overallProgress: number;
  totalSections: number;
  lessonClass: string;
  lessonTitle: string;
  estimatedTime: string;
  illustration?: 'algorithm' | 'flowchart' | 'events' | 'logic' | 'loops' | 'variables' | 'ifelse';
}

function AlgorithmIllustration() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ধাপ ১
      </motion.div>
      <motion.div
        className="absolute top-16 left-8 w-16 h-16 bg-secondary rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        ধাপ ২
      </motion.div>
      <motion.div
        className="absolute top-16 right-8 w-16 h-16 bg-accent rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-lg"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      >
        ধাপ ৩
      </motion.div>
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-12 bg-purple-500 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      >
        শেষ
      </motion.div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
        <motion.path
          d="M160 40 L160 80"
          stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
        />
        <motion.path
          d="M160 80 L95 120"
          stroke="#1cb0f6" strokeWidth="3" fill="none" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8, repeat: Infinity }}
        />
        <motion.path
          d="M160 80 L225 120"
          stroke="#ff9600" strokeWidth="3" fill="none" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.1, repeat: Infinity }}
        />
        <motion.path
          d="M95 140 L95 180 L160 220"
          stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.4, repeat: Infinity }}
        />
        <motion.path
          d="M225 140 L225 180 L160 220"
          stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="5,5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.7, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

function EventsIllustration() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-80">
      {/* TV */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-20 bg-gray-800 dark:bg-gray-700 rounded-lg shadow-lg flex items-center justify-center border-4 border-gray-600"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.div
          className="w-16 h-12 bg-blue-900 rounded-sm flex items-center justify-center"
          animate={{ backgroundColor: ['#1e3a5f', '#0ea5e9', '#1e3a5f'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white text-lg">📺</span>
        </motion.div>
      </motion.div>

      {/* Remote */}
      <motion.div
        className="absolute top-12 right-4 w-10 h-20 bg-gray-500 rounded-lg shadow-lg flex flex-col items-center justify-center gap-1"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-red-500"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 1 }}
        />
        <div className="w-3 h-1 bg-gray-400 rounded" />
        <div className="w-3 h-1 bg-gray-400 rounded" />
      </motion.div>

      {/* Light bulb */}
      <motion.div
        className="absolute bottom-8 left-8 w-20 h-20"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        <motion.div
          className="w-full h-full rounded-full flex items-center justify-center text-4xl"
          animate={{
            boxShadow: [
              '0 0 10px rgba(255,200,0,0.3)',
              '0 0 30px rgba(255,200,0,0.8)',
              '0 0 10px rgba(255,200,0,0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        >
          💡
        </motion.div>
      </motion.div>

      {/* Arrow from remote to TV */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
        <motion.path
          d="M140 70 L100 50"
          stroke="#ff9600" strokeWidth="2" fill="none" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1, repeat: Infinity }}
        />
        <motion.path
          d="M60 180 L100 150"
          stroke="#ff9600" strokeWidth="2" fill="none" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.5, repeat: Infinity }}
        />
        {/* Event labels */}
        <motion.text x="160" y="160" textAnchor="middle" fill="#58cc02" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Click → Event
        </motion.text>
        <motion.text x="160" y="175" textAnchor="middle" fill="#1cb0f6" fontSize="10" fontWeight="bold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Event → Action
        </motion.text>
      </svg>
    </div>
  );
}

function LogicIllustration() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-80">
      {/* Condition diamond */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rotate-45 bg-primary/20 border-4 border-primary rounded-lg flex items-center justify-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <span className="-rotate-45 text-sm font-bold text-primary">শর্ত?</span>
      </motion.div>

      {/* True branch */}
      <motion.div
        className="absolute top-28 left-8 w-20 h-16 bg-green-500/20 border-2 border-green-500 rounded-xl flex items-center justify-center flex-col"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
      >
        <span className="text-green-600 font-bold text-sm">True</span>
        <span className="text-green-600 text-xs">✅</span>
      </motion.div>

      {/* False branch */}
      <motion.div
        className="absolute top-28 right-8 w-20 h-16 bg-red-500/20 border-2 border-red-500 rounded-xl flex items-center justify-center flex-col"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
      >
        <span className="text-red-600 font-bold text-sm">False</span>
        <span className="text-red-600 text-xs">❌</span>
      </motion.div>

      {/* Result */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-14 bg-accent/20 border-2 border-accent rounded-xl flex items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
      >
        <span className="text-accent font-bold text-sm">রেজাল্ট</span>
      </motion.div>

      {/* Arrows */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
        <motion.path d="M160 50 L160 65" stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.3, repeat: Infinity }} />
        <motion.path d="M160 65 L75 100" stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6, repeat: Infinity }} />
        <motion.path d="M160 65 L245 100" stroke="#ef4444" strokeWidth="3" fill="none" strokeDasharray="4,4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1, repeat: Infinity }} />
        <motion.path d="M75 130 L75 155 L160 185" stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.4, repeat: Infinity }} />
        <motion.path d="M245 130 L245 155 L160 185" stroke="#ef4444" strokeWidth="3" fill="none" strokeDasharray="4,4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.8, repeat: Infinity }} />
      </svg>
    </div>
  );
}

function VariablesIllustration() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-80">
      {/* Box */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-32 bg-orange-100 dark:bg-orange-900/30 border-4 border-orange-400 rounded-2xl shadow-lg flex flex-col items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {/* Label */}
        <motion.div className="absolute -top-4 px-4 py-1 bg-orange-500 text-white text-sm font-bold rounded-full shadow">
          Score
        </motion.div>
        {/* Value */}
        <motion.div
          className="text-4xl font-extrabold text-orange-600"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          42
        </motion.div>
      </motion.div>

      {/* Arrow pointing to box */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
        <motion.path d="M40 160 L80 120" stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4" markerEnd="url(#var-arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.5, repeat: Infinity }} />
        <motion.path d="M280 120 L240 100" stroke="#1cb0f6" strokeWidth="3" fill="none" strokeDasharray="4,4" markerEnd="url(#var-arrow2)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1, repeat: Infinity }} />
        <defs>
          <marker id="var-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#58cc02" />
          </marker>
          <marker id="var-arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#1cb0f6" />
          </marker>
        </defs>
      </svg>

      {/* Name label */}
      <motion.div className="absolute bottom-8 left-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
        Name 🏷️
      </motion.div>

      {/* Value label */}
      <motion.div className="absolute bottom-8 right-4 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
        Value 🔢
      </motion.div>
    </div>
  );
}

function IfElseIllustration() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-80">
      {/* Diamond decision node */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        <svg width="100" height="80" viewBox="0 0 100 80">
          <motion.polygon
            points="50,0 100,40 50,80 0,40"
            fill="rgba(88,204,2,0.15)"
            stroke="#58cc02"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
          <text x="50" y="44" textAnchor="middle" fill="#58cc02" fontSize="10" fontWeight="bold">Condition</text>
        </svg>
      </motion.div>

      {/* True branch */}
      <motion.div
        className="absolute top-28 left-4 flex flex-col items-center"
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <svg width="40" height="30" viewBox="0 0 40 30">
          <motion.path d="M20,0 L40,15 L20,30" fill="rgba(28,176,246,0.15)" stroke="#1cb0f6" strokeWidth="2" />
          <text x="20" y="19" textAnchor="middle" fill="#1cb0f6" fontSize="8" fontWeight="bold">✓</text>
        </svg>
        <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-lg mt-1 shadow-lg">True ✅</div>
      </motion.div>

      {/* False branch */}
      <motion.div
        className="absolute top-28 right-4 flex flex-col items-center"
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        <svg width="40" height="30" viewBox="0 0 40 30">
          <motion.path d="M20,0 L40,15 L20,30" fill="rgba(255,150,0,0.15)" stroke="#ff9600" strokeWidth="2" />
          <text x="20" y="19" textAnchor="middle" fill="#ff9600" fontSize="8" fontWeight="bold">✗</text>
        </svg>
        <div className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg mt-1 shadow-lg">Else ❌</div>
      </motion.div>

      {/* Bottom arrow merging */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center"
        animate={{ y: [0, 2, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
      >
        <svg width="30" height="40" viewBox="0 0 30 40" className="mx-auto">
          <motion.path d="M15,0 L15,30 M15,20 L25,30 M15,20 L5,30" stroke="rgba(206,130,255,0.7)" strokeWidth="2" fill="none" />
        </svg>
        <div className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-lg">Decision ⚖️</div>
      </motion.div>
    </div>
  );
}

function LoopsIllustration() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-80">
      {/* Stack of repeating arrows */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-primary/20 border-4 border-primary rounded-xl flex items-center justify-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-2xl">🔁</span>
      </motion.div>

      <motion.div
        className="absolute top-16 left-8 w-16 h-16 bg-secondary/20 border-4 border-secondary rounded-xl flex items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      >
        <span className="text-xl">①</span>
      </motion.div>

      <motion.div
        className="absolute top-16 right-8 w-16 h-16 bg-accent/20 border-4 border-accent rounded-xl flex items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      >
        <span className="text-xl">②</span>
      </motion.div>

      <motion.div
        className="absolute top-36 left-1/3 w-16 h-16 bg-purple-500/20 border-4 border-purple-500 rounded-xl flex items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      >
        <span className="text-xl">③</span>
      </motion.div>

      <motion.div
        className="absolute top-36 right-1/3 w-16 h-16 bg-rose-500/20 border-4 border-rose-500 rounded-xl flex items-center justify-center"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
      >
        <span className="text-xl">⋯</span>
      </motion.div>

      {/* Repeat label at bottom */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Repeat 🔄
      </motion.div>

      {/* Curved arrows for loop visualization */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
        <motion.path
          d="M160 40 C190 40, 200 60, 180 80"
          stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4" markerEnd="url(#arrow-green)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5, repeat: Infinity }}
        />
        <motion.path
          d="M60 100 C40 130, 60 150, 90 150"
          stroke="#1cb0f6" strokeWidth="3" fill="none" strokeDasharray="4,4" markerEnd="url(#arrow-blue)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8, repeat: Infinity }}
        />
        <motion.path
          d="M260 100 C280 130, 260 150, 230 150"
          stroke="#ff9600" strokeWidth="3" fill="none" strokeDasharray="4,4" markerEnd="url(#arrow-orange)"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.1, repeat: Infinity }}
        />
        <defs>
          <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#58cc02" />
          </marker>
          <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#1cb0f6" />
          </marker>
          <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#ff9600" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function FlowchartIllustration() {
  const symbols = [
    { shape: 'Oval', color: 'bg-primary', top: 'top-0', left: 'left-1/2 -translate-x-1/2', label: 'Start' },
    { shape: 'Parallelogram', color: 'bg-secondary', top: 'top-20', left: 'left-1/2 -translate-x-1/2', label: 'Input' },
    { shape: 'Rectangle', color: 'bg-accent', top: 'top-40', left: 'left-1/2 -translate-x-1/2', label: 'Process' },
    { shape: 'Oval', color: 'bg-purple-500', top: 'top-60', left: 'left-1/2 -translate-x-1/2', label: 'End' },
  ];

  return (
    <div className="relative w-64 h-80 md:w-72 md:h-96">
      {symbols.map((s, i) => (
        <motion.div
          key={s.label}
          className={`absolute ${s.top} ${s.left} ${s.color} rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-sm w-28 h-12`}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
        >
          {s.label}
        </motion.div>
      ))}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 384">
        <motion.path
          d="M144 30 L144 50"
          stroke="#58cc02" strokeWidth="3" fill="none" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3, repeat: Infinity }}
        />
        <motion.path
          d="M144 110 L144 130"
          stroke="#1cb0f6" strokeWidth="3" fill="none" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.7, repeat: Infinity }}
        />
        <motion.path
          d="M144 190 L144 210"
          stroke="#ff9600" strokeWidth="3" fill="none" strokeDasharray="4,4"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.1, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export function Hero({
  onStart,
  overallProgress,
  totalSections,
  lessonClass,
  lessonTitle,
  estimatedTime,
  illustration = 'algorithm',
}: HeroProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block px-4 py-2 bg-primary/10 text-primary font-bold rounded-full text-sm mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {lessonClass}
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <span className="gradient-text">{lessonTitle}</span>
            </motion.h1>

            <motion.p
              className="text-lg text-muted dark:text-muted-dark mb-8 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              <span className="inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {estimatedTime}
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" onClick={onStart} className="animate-pulse-glow">
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  শেখা শুরু করি
                </span>
              </Button>
            </motion.div>

            <motion.div
              className="mt-8 max-w-xs mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
            >
              <ProgressBar current={overallProgress} total={totalSections} />
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          >
            {illustration === 'flowchart' ? <FlowchartIllustration /> : illustration === 'events' ? <EventsIllustration /> : illustration === 'logic' ? <LogicIllustration /> : illustration === 'loops' ? <LoopsIllustration /> : illustration === 'variables' ? <VariablesIllustration /> : illustration === 'ifelse' ? <IfElseIllustration /> : <AlgorithmIllustration />}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-muted dark:text-muted-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
