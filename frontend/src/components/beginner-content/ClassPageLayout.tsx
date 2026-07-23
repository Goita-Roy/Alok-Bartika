"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor, Trophy, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useCourseProgress } from "../../hooks/useCourseProgress";
import { API_BASE_URL } from "../../config/api";
import ParticleBackground from "./ParticleBackground";
import { LessonProgressBar } from "../lesson/LessonProgressBar";
import { LessonCompleteToast } from "../lesson/LessonCompleteToast";
import { useLessonReadingProgress } from "../../hooks/useLessonReadingProgress";
import { lessonClasses, classIdToPath, classSectionAnchors, classHeroes } from "./lessonConfig";
import { useScrollContainer } from "./ScrollContext";
import { usePendingCompletion } from "./PendingCompletionContext";

interface Props {
  currentClassId: string;
  children: React.ReactNode;
}

export default function ClassPageLayout({ currentClassId, children }: Props) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const scrollContainer = useScrollContainer();
  const { scrollYProgress } = useScroll({ container: scrollContainer || undefined });
  const currentIndex = lessonClasses.findIndex((c) => c.id === currentClassId);
  const nextClassId = currentIndex < lessonClasses.length - 1 ? lessonClasses[currentIndex + 1].id : null;
  const hero = classHeroes[currentClassId];
  const anchors = classSectionAnchors[currentClassId] || [];
  const readingProgress = useLessonReadingProgress(currentClassId, scrollContainer as any);

  const { token } = useAuth();

  // Fetch courses to find beginner ID (needed for API calls)
  const { data: coursesRes } = useQuery<{ data: { _id: string; level: string }[] }>({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/courses`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
    enabled: !!token,
  });

  const begCourseId = coursesRes?.data?.find(c => c.level === "beginner")?._id;

  // Use slug IDs consistently with the hook (same as BeginnerCoursePage)
  const beginnerLessonIds = useMemo(() => lessonClasses.map(c => c.id), []);

  const classesByLevel = useMemo(() => ({
    beginner: lessonClasses.map(c => ({ id: c.id })),
    intermediate: [],
    advanced: [],
  }), []);

  const { completedClassIds, markClassComplete, markActivityComplete, markPracticeComplete, isPracticeComplete, markQuizComplete, isQuizComplete, getLessonActivityProgress, completeLevel } = useCourseProgress(classesByLevel, beginnerLessonIds);

  console.log('[DEBUG:ClassPageLayout] render — currentClassId:', currentClassId, 'completedClassIds:', completedClassIds)

  const [showCompleteToast, setShowCompleteToast] = useState(false);

  const hasUserScrolled = useRef(false);
  const pendingCompletionRef = usePendingCompletion();
  const completionInitiatedRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const sectionIds = useMemo(() => (classSectionAnchors[currentClassId] || []).map(a => a.id), [currentClassId]);

  useEffect(() => {
    const container = scrollContainer?.current;
    if (!container) return;
    const markVisibleSections = () => {
      const containerRect = container.getBoundingClientRect();
      for (const sid of sectionIds) {
        const el = document.getElementById(sid);
        if (!el) continue;
        const elRect = el.getBoundingClientRect();
        const visibleTop = Math.max(elRect.top, containerRect.top);
        const visibleBottom = Math.min(elRect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const ratio = elRect.height > 0 ? visibleHeight / elRect.height : 0;
        if (ratio >= 0.3) {
          if (sid.endsWith('-game') || sid === 'game') {
            markPracticeComplete(currentClassId);
          } else if (sid.includes('brain-teaser')) {
            markQuizComplete(currentClassId);
          } else {
            markActivityComplete(`${currentClassId}:${sid}`);
          }
        }
      }
    };
    const onScroll = () => {
      if (!hasUserScrolled.current) {
        hasUserScrolled.current = true;
        markVisibleSections();
      }
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [scrollContainer, sectionIds, currentClassId, markActivityComplete, markPracticeComplete, markQuizComplete]);

  const activityProgress = useMemo(
    () => getLessonActivityProgress(currentClassId, sectionIds),
    [getLessonActivityProgress, currentClassId, sectionIds]
  );

  const practiceDone = isPracticeComplete(currentClassId);
  const quizDone = isQuizComplete(currentClassId);

  const combinedProgress = useMemo(
    () => Math.min(100, Math.max(readingProgress, activityProgress) + (practiceDone ? 10 : 0) + (quizDone ? 10 : 0)),
    [readingProgress, activityProgress, practiceDone, quizDone]
  );

  const isBeginnerCompleted = useMemo(() => {
    if (!beginnerLessonIds.length) return false;
    return beginnerLessonIds.every(id => completedClassIds.includes(id));
  }, [beginnerLessonIds, completedClassIds]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = scrollContainer?.current ?? null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!hasUserScrolled.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const sid = entry.target.id;
            if (sid.endsWith('-game') || sid === 'game') {
              markPracticeComplete(currentClassId);
            } else if (sid.includes('brain-teaser')) {
              markQuizComplete(currentClassId);
            } else {
              markActivityComplete(`${currentClassId}:${sid}`);
            }
          }
        }
      },
      { root, threshold: 0.3 }
    );
    for (const sid of sectionIds) {
      const el = document.getElementById(sid);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [currentClassId, sectionIds, scrollContainer, markActivityComplete, markPracticeComplete, markQuizComplete]);

  useEffect(() => {
    completionInitiatedRef.current = false;
  }, [currentClassId]);

  useEffect(() => {
    const hasCompleted = completedClassIds.includes(currentClassId);
    const allConditions = {
      combinedProgress: combinedProgress >= 80,
      notAlreadyCompleted: !hasCompleted,
      hasScrolled: hasUserScrolled.current,
      notInitiated: !completionInitiatedRef.current,
    };
    const shouldFire = Object.values(allConditions).every(Boolean);
    console.log('[DEBUG:AutoComplete] running —', { currentClassId, combinedProgress, begCourseId, hasCompleted, completionInitiated: completionInitiatedRef.current, allConditions, shouldFire });
    if (shouldFire) {
      console.log('[DEBUG:AutoComplete] INVOKING markClassComplete for', currentClassId);
      completionInitiatedRef.current = true;
      const p = markClassComplete(currentClassId, begCourseId);
      pendingCompletionRef.current = p instanceof Promise ? p : null;
      setShowCompleteToast(true);
    }
  }, [combinedProgress, currentClassId, completedClassIds, begCourseId, markClassComplete]);

  useEffect(() => {
    if (isBeginnerCompleted) {
      completeLevel('beginner');
    }
  }, [isBeginnerCompleted, completeLevel]);

  const isLastLesson = currentIndex === lessonClasses.length - 1;
  const nextLessonLabel = !isLastLesson ? lessonClasses[currentIndex + 1]?.label : undefined;

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      navigate(classIdToPath(lessonClasses[currentIndex - 1].id));
    }
  }, [currentIndex, navigate]);

  const goToNext = useCallback(async () => {
    if (isNavigating) return;
    if (currentIndex < lessonClasses.length - 1) {
      setIsNavigating(true);
      try {
        const nextId = lessonClasses[currentIndex + 1].id;
        if (pendingCompletionRef.current) {
          await pendingCompletionRef.current;
        } else if (!completedClassIds.includes(currentClassId)) {
          await markClassComplete(currentClassId, begCourseId);
          setShowCompleteToast(true);
        }
        navigate(classIdToPath(nextId));
      } catch {
        setIsNavigating(false);
      }
    }
  }, [currentIndex, navigate, isNavigating, currentClassId, completedClassIds, begCourseId, markClassComplete, setShowCompleteToast]);

  if (!mounted) return null;

  return (
    <div className="beginner-content">
      <ParticleBackground />

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E7C66] via-[#FFC93C] to-[#0E7C66] z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Lesson progress */}
      <div className="relative z-10">
        <LessonProgressBar progress={combinedProgress} />
      </div>

      <LessonCompleteToast
        show={showCompleteToast}
        isLevelCompleted={isLastLesson}
        nextLessonLabel={nextLessonLabel}
        onDismiss={() => setShowCompleteToast(false)}
      />

      {/* Navigation dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3">
        {anchors.map(({ id, label }) => (
          <motion.a
            key={id}
            href={`#${id}`}
            whileHover={{ scale: 1.3 }}
            className="group relative flex items-center justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#DCE8E2] hover:bg-[#FFC93C] transition-colors" />
            <span className="absolute right-4 px-2 py-1 rounded bg-white text-[#2F3A35] border border-[#DCE8E2] shadow-md text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {label}
            </span>
          </motion.a>
        ))}
      </nav>

      {/* Hero Section */}
      <section className="beginner-lesson-hero relative z-10 flex min-h-[460px] flex-col items-center justify-center px-4 pt-16 text-center sm:min-h-[520px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl md:text-8xl mb-6"
          >
            {hero?.icon || "💻"}
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4"
        >
          {currentClassId === "class-01" ? (
            <>
              <span className="text-gradient">কম্পিউটার</span>{" "}
              <span className="text-[#1F2937]">পরিচিতি</span>
            </>
          ) : (
            <span className="text-gradient">{hero?.title || currentClassId}</span>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-base md:text-lg text-[#4B5563] max-w-lg mb-10"
        >
          {hero?.subtitle || ""}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.a
            href={`#${anchors[0]?.id || "definition"}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFC93C] text-[#2F3A35] font-semibold shadow-lg shadow-[#FFC93C]/25 hover:bg-[#FFC93C]/90 transition-all"
          >
            <Monitor className="w-4 h-4" />
            <span>শুরু করা যাক</span>
          </motion.a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-[#6B7280] text-sm"
          >
            <span>নিচে স্ক্রল করুন</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Lesson Sections */}
      {children}

      {/* Previous / Next Navigation */}
      <div className="relative z-10 py-10">
        <div className="beginner-lesson-navigation mx-auto flex justify-between gap-4">
          {currentIndex > 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPrev}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE8E2] text-[#2F3A35] shadow-sm hover:bg-[#0E7C66] hover:text-white hover:border-[#0E7C66] transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">{lessonClasses[currentIndex - 1].label}</span>
            </motion.button>
          ) : (
            <div />
          )}

          {currentIndex < lessonClasses.length - 1 ? (
          <button
            disabled={isNavigating}
            onClick={() => goToNext()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#DCE8E2] text-[#2F3A35] shadow-sm hover:bg-[#0E7C66] hover:text-white hover:border-[#0E7C66] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
              <span className="text-sm">{lessonClasses[currentIndex + 1].label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            isBeginnerCompleted ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-200"
                style={{ backgroundColor: "#0E7C66", borderColor: "#0E7C66", color: "#FFFDF8" }}
              >
                <Link to="/exam/beginner" className="flex items-center gap-2 text-sm font-black">
                  <Trophy className="w-4 h-4" />
                  <span>চূড়ান্ত পরীক্ষা দিন</span>
                </Link>
              </motion.button>
            ) : (
              <div className="relative group">
                <button
                  disabled
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[#DCE8E2] text-[#5C665F] cursor-not-allowed bg-white"
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-bold">চূড়ান্ত পরীক্ষা দিন (লক)</span>
                </button>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 text-center text-xs bg-[#2F3A35] text-[#FFFDF8] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  সকল ক্লাস সম্পন্ন করলে ফাইনাল পরীক্ষা আনলক হবে।
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-10 text-center">
        <p className="text-sm text-[#5C665F]">
          © ২০২৬ — ইন্টারেক্টিভ লার্নিং প্ল্যাটফর্ম
        </p>
      </footer>
    </div>
  );
}
