import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

interface Highlight {
  word: string;
  color: string;
}

interface DefinitionSectionProps {
  term: string;
  fullText: string;
  highlights: Highlight[];
  illustration?: 'computer' | 'flowchart' | 'events' | 'logic' | 'loops' | 'variables' | 'ifelse';
}

function ComputerIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.rect x="30" y="20" width="140" height="110" rx="12" stroke="#22C55E" strokeWidth="4" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }} />
      <motion.rect x="30" y="130" width="140" height="10" rx="3" stroke="#06B6D4" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.8 }} />
      <motion.rect x="70" y="140" width="60" height="8" rx="2" stroke="#06B6D4" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1 }} />
      <motion.rect x="85" y="148" width="30" height="8" rx="2" stroke="#F59E0B" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 1.1 }} />
      <motion.rect x="50" y="156" width="100" height="30" rx="14" stroke="#F59E0B" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 1.2 }} />
      <motion.text x="100" y="75" textAnchor="middle" fill="#22C55E" fontSize="12" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Algorithm</motion.text>
      <motion.circle cx="50" cy="100" r="4" fill="#06B6D4" initial={{ opacity: 0 }} animate={{ opacity: 1, cx: [50, 100, 150] }} transition={{ delay: 1.8, duration: 2, repeat: Infinity }} />
    </svg>
  );
}

function EventsIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.rect x="20" y="20" width="70" height="36" rx="10" stroke="#22C55E" strokeWidth="3" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
      <motion.text x="55" y="43" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Action</motion.text>
      <motion.path d="M90 38 L115 38" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.4 }} />
      <motion.rect x="115" y="20" width="70" height="36" rx="10" stroke="#06B6D4" strokeWidth="3" fill="rgba(6,182,212,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
      <motion.text x="150" y="43" textAnchor="middle" fill="#06B6D4" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Event</motion.text>
      <motion.path d="M150 56 L150 75" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.7, duration: 0.4 }} />
      <motion.rect x="105" y="75" width="90" height="36" rx="10" stroke="#A855F7" strokeWidth="3" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.9, duration: 0.6 }} />
      <motion.text x="150" y="98" textAnchor="middle" fill="#A855F7" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>Program Runs</motion.text>
      <motion.text x="40" y="130" fontSize="36" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.8, type: 'spring' }}>🐱</motion.text>
      <motion.text x="100" y="155" fontSize="28" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>🚩</motion.text>
      <motion.text x="150" y="130" fontSize="36" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5 }}>⌨️</motion.text>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function LogicIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.polygon points="100,15 155,65 100,115 45,65" stroke="#22C55E" strokeWidth="3" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
      <motion.text x="100" y="70" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>শর্ত?</motion.text>
      <motion.path d="M155 65 L175 65 L175 120 L155 120" stroke="#06B6D4" strokeWidth="3" fill="rgba(6,182,212,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }} />
      <motion.text x="165" y="100" textAnchor="middle" fill="#06B6D4" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>True</motion.text>
      <motion.path d="M45 65 L25 65 L25 120 L45 120" stroke="#F59E0B" strokeWidth="3" fill="rgba(245,158,11,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.5 }} />
      <motion.text x="35" y="100" textAnchor="middle" fill="#F59E0B" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>False</motion.text>
      <motion.rect x="115" y="120" width="80" height="36" rx="8" stroke="#A855F7" strokeWidth="3" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.5 }} />
      <motion.text x="155" y="143" textAnchor="middle" fill="#A855F7" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>রেজাল্ট</motion.text>
      <motion.rect x="5" y="120" width="80" height="36" rx="8" stroke="#A855F7" strokeWidth="3" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.5 }} />
      <motion.text x="45" y="143" textAnchor="middle" fill="#A855F7" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}>রেজাল্ট</motion.text>
      <motion.path d="M175 65 L185 65" stroke="#06B6D4" strokeWidth="2" markerEnd="url(#arrow-blue)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
      <motion.path d="M25 65 L15 65" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-orange)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.3 }} />
      <defs>
        <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#06B6D4" />
        </marker>
        <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function VariablesIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.rect x="45" y="10" width="110" height="36" rx="10" stroke="#22C55E" strokeWidth="3" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
      <motion.text x="100" y="33" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Variable Name 🏷️</motion.text>
      <motion.path d="M100 46 L100 60" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#v-arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.3 }} />
      <motion.rect x="55" y="60" width="90" height="36" rx="10" stroke="#06B6D4" strokeWidth="3" fill="rgba(6,182,212,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.5 }} />
      <motion.text x="100" y="83" textAnchor="middle" fill="#06B6D4" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>Stored Value 🔢</motion.text>
      <motion.path d="M100 96 L100 110" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#v-arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.3 }} />
      <motion.rect x="40" y="110" width="120" height="36" rx="10" stroke="#A855F7" strokeWidth="3" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.5 }} />
      <motion.text x="100" y="133" textAnchor="middle" fill="#A855F7" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>Value Changes 🔄</motion.text>
      {[0, 1, 2].map((i) => (
        <motion.text key={i} x={70 + i * 30} y="170" textAnchor="middle" fill="#06B6D4" fontSize="16" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 2.5 + i * 0.3 }}>{i}</motion.text>
      ))}
      <defs>
        <marker id="v-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function IfElseIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.polygon points="100,10 170,50 100,90 30,50" stroke="#22C55E" strokeWidth="3" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
      <motion.text x="100" y="56" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Condition ❓</motion.text>
      <motion.path d="M100 50 L100 60 L30 60 L25 70" stroke="#06B6D4" strokeWidth="2" fill="none" markerEnd="url(#if-true)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.4 }} />
      <motion.rect x="10" y="70" width="48" height="30" rx="8" stroke="#06B6D4" strokeWidth="2" fill="rgba(6,182,212,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.4 }} />
      <motion.text x="34" y="89" textAnchor="middle" fill="#06B6D4" fontSize="8" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>True ✅</motion.text>
      <motion.path d="M100 50 L100 60 L170 60 L175 70" stroke="#F59E0B" strokeWidth="2" fill="none" markerEnd="url(#if-false)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 0.4 }} />
      <motion.rect x="142" y="70" width="55" height="30" rx="8" stroke="#F59E0B" strokeWidth="2" fill="rgba(245,158,11,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.4 }} />
      <motion.text x="170" y="89" textAnchor="middle" fill="#F59E0B" fontSize="8" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>Else ❌</motion.text>
      <motion.path d="M34 100 L34 130 L100 130" stroke="#A855F7" strokeWidth="1.5" fill="none" strokeDasharray="3,3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.4 }} />
      <motion.path d="M170 100 L170 130 L100 130" stroke="#A855F7" strokeWidth="1.5" fill="none" strokeDasharray="3,3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.6, duration: 0.4 }} />
      <motion.rect x="55" y="120" width="90" height="30" rx="8" stroke="#A855F7" strokeWidth="2" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.5 }} />
      <motion.text x="100" y="139" textAnchor="middle" fill="#A855F7" fontSize="9" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }}>Decision ⚖️</motion.text>
      <defs>
        <marker id="if-true" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5" fill="#06B6D4" />
        </marker>
        <marker id="if-false" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function LoopsIllustration() {
  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      <motion.rect x="55" y="10" width="90" height="30" rx="8" stroke="#22C55E" strokeWidth="3" fill="rgba(34,197,94,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
      <motion.text x="100" y="30" textAnchor="middle" fill="#22C55E" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Instruction</motion.text>
      <motion.path d="M100 40 L100 55" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow-loop)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.3 }} />
      <motion.path d="M30 55 L170 55 L170 170 L30 170 L30 55 Z" stroke="#06B6D4" strokeWidth="3" fill="rgba(6,182,212,0.04)" strokeDasharray="6,3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.8 }} />
      <motion.text x="100" y="75" textAnchor="middle" fill="#06B6D4" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>Repeat</motion.text>
      <motion.text x="100" y="88" textAnchor="middle" fill="#06B6D4" fontSize="11" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>10</motion.text>
      <motion.rect x="55" y="100" width="90" height="30" rx="8" stroke="#A855F7" strokeWidth="3" fill="rgba(168,85,247,0.08)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.5 }} />
      <motion.text x="100" y="120" textAnchor="middle" fill="#A855F7" fontSize="10" fontWeight="bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>Jump</motion.text>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={100 + (i - 1) * 15} cy={148} r="3" fill="#06B6D4" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 2 + i * 0.2 }} />
      ))}
      <defs>
        <marker id="arrow-loop" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function FlowchartIllustration() {
  const symbols = [
    { shape: 'Oval', x: 60, y: 10, w: 80, h: 36, label: 'Start', color: '#22C55E' },
    { shape: 'Parallelogram', x: 55, y: 60, w: 90, h: 36, label: 'Input', color: '#06B6D4' },
    { shape: 'Rectangle', x: 55, y: 110, w: 90, h: 36, label: 'Process', color: '#F59E0B' },
    { shape: 'Oval', x: 60, y: 160, w: 80, h: 36, label: 'End', color: '#A855F7' },
  ];

  return (
    <svg className="w-full h-full p-6" viewBox="0 0 200 200" fill="none">
      {symbols.map((s, i) => (
        <motion.g key={s.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.2 }}>
          {s.shape === 'Oval' ? (
            <ellipse cx={s.x + s.w / 2} cy={s.y + s.h / 2} rx={s.w / 2} ry={s.h / 2} stroke={s.color} strokeWidth="3" fill={`${s.color}15`} />
          ) : s.shape === 'Parallelogram' ? (
            <polygon points={`${s.x + 15},${s.y} ${s.x + s.w},${s.y} ${s.x + s.w - 15},${s.y + s.h} ${s.x},${s.y + s.h}`} stroke={s.color} strokeWidth="3" fill={`${s.color}15`} />
          ) : (
            <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="6" stroke={s.color} strokeWidth="3" fill={`${s.color}15`} />
          )}
          <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 5} textAnchor="middle" fill={s.color} fontSize="11" fontWeight="bold">{s.label}</text>
        </motion.g>
      ))}
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M100 ${46 + i * 50} L100 ${56 + i * 50}`} stroke="#22C55E" strokeWidth="2" markerEnd="url(#arrow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 + i * 0.3, duration: 0.5 }} />
      ))}
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill="#22C55E" />
        </marker>
      </defs>
    </svg>
  );
}

export function DefinitionSection({
  term,
  fullText,
  highlights,
  illustration = 'computer',
}: DefinitionSectionProps) {
  const { ref, isVisible } = useScrollAnimation();
  const [showTyping, setShowTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setShowTyping(true), 500);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    if (!showTyping) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setShowButton(true);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [showTyping, fullText]);

  const handleUnderstand = useCallback(() => {
    setCompleted(true);
  }, []);

  return (
    <section ref={ref} className="py-24 px-4 md:px-8 bg-[#FBF4FD]">
      <div className="max-w-[1200px] mx-auto w-full">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-[#22C55E] via-[#06B6D4] to-[#22C55E] bg-clip-text text-transparent">সংজ্ঞা</span>
        </motion.h2>

        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.div
              key="definition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_24px_70px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
                <div className="p-6 md:p-12">
                  <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-12">
                    <div className="w-full lg:w-[35%] flex-shrink-0 flex justify-center">
                      <motion.div
                        className="relative w-48 h-48 md:w-56 md:h-56"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={isVisible ? { scale: 1, rotate: 0 } : {}}
                        transition={{ type: 'spring', delay: 0.3, stiffness: 120 }}
                      >
                        <div className="relative w-full h-full bg-white rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center overflow-hidden">
                          {illustration === 'flowchart' ? <FlowchartIllustration /> : illustration === 'events' ? <EventsIllustration /> : illustration === 'logic' ? <LogicIllustration /> : illustration === 'loops' ? <LoopsIllustration /> : illustration === 'variables' ? <VariablesIllustration /> : illustration === 'ifelse' ? <IfElseIllustration /> : <ComputerIllustration />}
                        </div>
                      </motion.div>
                    </div>

                    <div className="w-full lg:w-[65%] flex-1 text-center lg:text-left">
                      <motion.h3
                        className="text-3xl md:text-4xl font-bold mb-8"
                        initial={{ opacity: 0, x: 20 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <span className="bg-gradient-to-r from-[#22C55E] to-[#06B6D4] bg-clip-text text-transparent">{term}</span>
                      </motion.h3>

                      <div className="min-h-[140px] flex items-center">
                        {showTyping && (
                          <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                            {typedText}
                            {!showButton && <span className="inline-block w-1 h-6 bg-gradient-to-b from-[#22C55E] to-[#06B6D4] ml-1.5 animate-pulse rounded-full" />}
                          </p>
                        )}
                      </div>

                      <AnimatePresence>
                        {showButton && (
                          <motion.div className="mt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Button
                              onClick={handleUnderstand}
                              className="px-8 py-3.5 bg-gradient-to-r from-[#22C55E] to-[#06B6D4] text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.03] active:scale-95 transition-all duration-300"
                            >
                              আমি বুঝেছি ✓
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.word}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 + i * 0.15 }}
                  >
                    <Card className="text-center py-8 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300">
                      <span className={`text-3xl font-bold ${h.color}`}>{h.word}</span>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card highlighted className="max-w-md mx-auto rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100">
                <motion.div className="text-6xl mb-6" initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }} transition={{ type: 'spring' }}>🎉</motion.div>
                <p className="text-xl font-bold text-gray-800">দারুণ! তুমি সংজ্ঞাটি বুঝতে পেরেছো!</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}



