"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, BookOpen, Lock, Play } from "lucide-react";

export interface ClassItem {
  id: string;
  label: string;
  title: string;
  anchorId: string;
}

interface Props {
  classes: ClassItem[];
  currentClassId: string | null;
  onClassClick: (classId: string, anchorId: string) => void;
}

function getClassStatus(
  classId: string,
  currentClassId: string | null,
  classIds: string[]
): "completed" | "current" | "upcoming" {
  if (classId === currentClassId) return "current";
  const currentIdx = currentClassId ? classIds.indexOf(currentClassId) : -1;
  const thisIdx = classIds.indexOf(classId);
  if (currentIdx < 0) return "upcoming";
  if (thisIdx < currentIdx) return "completed";
  return "upcoming";
}

export default function LessonNavigation({ classes, currentClassId, onClassClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const classIds = classes.map((c) => c.id);

  const handleClick = useCallback(
    (classId: string, anchorId: string) => {
      onClassClick(classId, anchorId);
    },
    [onClassClick]
  );

  return (
    <nav className="w-full">
      <div className="max-w-5xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex gap-1.5 md:gap-3 overflow-x-auto pb-2 pt-2 justify-start snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {classes.map((cls, i) => {
            const status = getClassStatus(cls.id, currentClassId, classIds);
            const isCurrent = status === "current";
            const isCompleted = status === "completed";
            const isUpcoming = status === "upcoming";

            return (
              <motion.button
                key={cls.id}
                onClick={() => handleClick(cls.id, cls.anchorId)}
                className={`relative flex-shrink-0 snap-start flex items-center gap-1.5 md:gap-3 px-2 md:px-5 py-2 md:py-3 rounded-xl border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 ${
                  isCurrent
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/40 shadow-lg shadow-purple-500/10"
                    : isCompleted
                    ? "bg-green-500/10 border-green-500/20 hover:bg-green-500/15"
                    : "glass border-white/5 hover:border-white/20 hover:bg-white/5"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Status icon */}
                <span className="flex-shrink-0">
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20"
                    >
                      <Check className="w-3 h-3 text-green-400" />
                    </motion.span>
                  ) : isCurrent ? (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center justify-center w-5 h-5"
                    >
                      <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                    </motion.span>
                  ) : (
                    <span className="flex items-center justify-center w-5 h-5">
                      <Lock className="w-3 h-3 text-slate-600" />
                    </span>
                  )}
                </span>

                {/* Label */}
                <div className="text-left">
                  <span
                    className={`text-xs md:text-sm font-semibold leading-tight block ${
                      isCurrent
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300"
                        : isCompleted
                        ? "text-green-300"
                        : "text-slate-400"
                    }`}
                  >
                    {cls.label}
                  </span>
                  <span
                    className={`text-[10px] md:text-xs leading-tight hidden md:block mt-0.5 max-w-[160px] truncate ${
                      isCurrent ? "text-slate-300" : isCompleted ? "text-slate-500" : "text-slate-600"
                    }`}
                  >
                    {cls.title}
                  </span>
                </div>

                {/* Active indicator underline */}
                {isCurrent && (
                  <motion.div
                    layoutId="activeClassUnderline"
                    className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Arrow between classes */}
                {i < classes.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-700 hidden md:block flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Mobile scroll hint */}
        <AnimatePresence>
          {classes.length > 2 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.5, y: 0 }}
              exit={{ opacity: 0 }}
              className="md:hidden text-center"
            >
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-flex items-center gap-1"
              >
                <span className="text-[10px] text-slate-600">স্ক্রল করুন</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <ChevronRight className="w-3 h-3 text-slate-500 -ml-2" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
