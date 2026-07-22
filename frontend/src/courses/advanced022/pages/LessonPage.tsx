import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SubchapterContent } from "../components/Content/SubchapterContent/SubchapterContent";
import { ContentProtection } from "../components/ContentProtection/ContentProtection";
import { getLessonComponent } from "../lessons";
import { useCourse, useNavigation } from "../hooks";
import { toBengaliDigits } from "../utils";
import { useLessonSize } from "../components/LessonFontSizeControl/LessonFontSizeControl";

export function LessonPage() {
  const {
    selectedChapter,
    selectedSubchapter,
    completeSubchapter,
    state,
    course,
  } = useCourse();
  const { goToSubchapter, goToHome } = useNavigation();

  const [scrolled, setScrolled] = useState(false);
  const lessonSize = useLessonSize();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!selectedChapter || !selectedSubchapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">লোড হচ্ছে...</h2>
          <button
            onClick={goToHome}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← হোমে ফিরুন
          </button>
        </div>
      </div>
    );
  }

  const subchapterIndex = selectedChapter.subchapters.findIndex(
    (sub) => sub.id === selectedSubchapter.id,
  );

  const hasNext =
    subchapterIndex < selectedChapter.subchapters.length - 1 && subchapterIndex >= 0;

  const handleNext = () => {
    if (subchapterIndex === -1 || !hasNext) return;
    const nextSubchapter = selectedChapter.subchapters[subchapterIndex + 1];
    goToSubchapter(selectedChapter.slug, nextSubchapter.slug);
  };

  const LessonComponent = getLessonComponent(
    selectedChapter.id,
    selectedSubchapter.id,
  );

  const chapterIndex = course.chapters.findIndex(
    (ch) => ch.id === selectedChapter.id,
  );

  // Chapter progress derived from the existing LMS completion state
  // (state.completedSubchapters, sourced from capstone_python_progress and
  // updated by completeSubchapter()). No separate progress system.
  const totalLessons = selectedChapter.subchapters.length;
  const completedLessons = selectedChapter.subchapters.filter((sub) =>
    state.completedSubchapters.has(sub.id),
  ).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      <motion.header
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200"
        animate={{
          boxShadow: scrolled
            ? "0 1px 6px 0 rgb(0 0 0 / 0.06)"
            : "0 0px 0px 0 rgb(0 0 0 / 0)",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              scrolled ? "py-1.5" : "py-2.5"
            }`}
          >
            <motion.button
              onClick={goToHome}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              aria-label="ফিরে যান"
            >
              <svg
                className={`transition-all duration-300 ${scrolled ? "w-4 h-4" : "w-4.5 h-4.5"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSubchapter.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <p
                    className={`text-gray-400 transition-all duration-300 truncate ${
                      scrolled ? "text-[10px] leading-tight" : "text-[11px] leading-snug"
                    }`}
                  >
                    <span className="font-medium text-gray-500">
                      অধ্যায় {toBengaliDigits(chapterIndex + 1)}
                    </span>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span>{selectedChapter.title}</span>
                  </p>
                  <h1
                    className={`font-bold text-gray-900 leading-tight truncate transition-all duration-300 ${
                      scrolled ? "text-sm" : "text-base sm:text-lg"
                    }`}
                  >
                    {selectedSubchapter.title}
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className={`transition-all duration-300 ${scrolled ? "pb-1.5" : "pb-2.5"}`}>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-600 rounded-full"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium text-gray-500 whitespace-nowrap">
                {toBengaliDigits(completedLessons)}/{toBengaliDigits(totalLessons)} টি পাঠ সম্পন্ন
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <ContentProtection className="px-4 sm:px-8 py-4 sm:py-6 max-w-3xl mx-auto w-full">
        <div data-lesson-body className={`lesson-size-${lessonSize}`}>
          {LessonComponent ? (
            <LessonComponent
              onComplete={completeSubchapter}
              onNext={handleNext}
              isCompleted={state.completedSubchapters.has(selectedSubchapter.id)}
              hasNext={hasNext}
            />
          ) : (
            <SubchapterContent
              subchapter={selectedSubchapter}
              chapter={selectedChapter}
              onComplete={completeSubchapter}
              onNext={handleNext}
              isCompleted={state.completedSubchapters.has(selectedSubchapter.id)}
              hasNext={hasNext}
            />
          )}
        </div>
      </ContentProtection>
    </motion.div>
  );
}
