import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "../components/Progress/Progress";
import { SubchapterContent } from "../components/Content/SubchapterContent/SubchapterContent";
import { ContentProtection } from "../components/ContentProtection/ContentProtection";
import { getLessonComponent } from "../lessons";
import { useCourse, useNavigation } from "../hooks";

export function LessonPage() {
  const { chapterSlug, subchapterSlug } = useParams<{
    chapterSlug: string;
    subchapterSlug: string;
  }>();
  const {
    selectedChapter,
    selectedSubchapter,
    completeSubchapter,
    syncFromUrl,
    state,
    course,
    chapterProgressMap,
  } = useCourse();
  const { goToSubchapter, goToHome } = useNavigation();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (chapterSlug && subchapterSlug) {
      syncFromUrl(chapterSlug, subchapterSlug);
    }
  }, [chapterSlug, subchapterSlug, syncFromUrl]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!selectedChapter || !selectedSubchapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const subchapterIndex = selectedChapter.subchapters.findIndex(
    (sub) => sub.id === selectedSubchapter.id
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
    selectedSubchapter.id
  );

  const chapterIndex = course.chapters.findIndex(
    (ch) => ch.id === selectedChapter.id
  );

  const chapterProgress = chapterProgressMap[selectedChapter.id] ?? 0;

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
              aria-label="Go back"
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
                      Ch {chapterIndex + 1}
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

            <div className="shrink-0 flex items-center gap-2">
              <span
                className={`font-semibold text-indigo-600 transition-all duration-300 ${
                  scrolled ? "text-[10px]" : "text-xs"
                }`}
              >
                {chapterProgress}%
              </span>
            </div>
          </div>

          <div className="h-0.5 -mx-4 sm:-mx-6 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-r-full"
              initial={{ width: 0 }}
              animate={{ width: `${chapterProgress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.header>

      <Progress />

      <ContentProtection className="px-4 sm:px-8 py-4 sm:py-6 max-w-3xl mx-auto w-full">
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
      </ContentProtection>
    </motion.div>
  );
}
