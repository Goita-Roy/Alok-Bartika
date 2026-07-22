import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useCourse, useNavigation } from "../hooks";

const CHAPTER_ICONS = ["📘", "📙", "📗", "📕", "📔", "📒", "📓", "URY"];

const CHAPTER_COLORS = [
  { from: "from-blue-500", to: "to-indigo-600" },
  { from: "from-orange-400", to: "to-red-500" },
  { from: "from-emerald-400", to: "to-teal-600" },
  { from: "from-red-400", to: "to-rose-600" },
  { from: "from-amber-400", to: "to-yellow-600" },
  { from: "from-violet-400", to: "to-purple-600" },
  { from: "from-cyan-400", to: "to-blue-600" },
  { from: "from-pink-400", to: "to-fuchsia-600" },
];

const LESSON_ICONS = ["📖", "💡", "🎯", "🔢", "📝", "🧩", "🎮", "🏆"];

export function ChapterDetailsPage() {
  const { chapterSlug } = useParams<{ chapterSlug: string }>();
  const { syncFromUrl, course, state, chapterProgressMap } = useCourse();
  const { goToSubchapter } = useNavigation();

  useEffect(() => {
    if (chapterSlug) {
      syncFromUrl(chapterSlug, "");
    }
  }, [chapterSlug, syncFromUrl]);

  const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Chapter not found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const chapterIndex = course.chapters.findIndex((ch) => ch.id === chapter.id);
  const icon = CHAPTER_ICONS[chapterIndex % CHAPTER_ICONS.length];
  const color = CHAPTER_COLORS[chapterIndex % CHAPTER_COLORS.length];
  const progress = chapterProgressMap[chapter.id] ?? 0;
  const isCompleted = progress === 100;
  const completedCount = chapter.subchapters.filter(
    (sub) => state.completedSubchapters.has(sub.id)
  ).length;
  const remainingCount = chapter.subchapters.length - completedCount;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4 sm:mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chapters
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={`relative rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 overflow-hidden bg-gradient-to-br ${color.from} ${color.to} text-white shadow-xl`}
        >
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <motion.span
                  className="text-4xl sm:text-5xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {icon}
                </motion.span>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white/70 mb-0.5">
                    Chapter {chapterIndex + 1}
                  </p>
                  <h1 className="text-xl sm:text-3xl font-bold leading-tight">
                    {chapter.title}
                  </h1>
                </div>
              </div>

              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0 w-10 sm:w-12 h-10 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center"
                >
                  <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-bold">{chapter.subchapters.length}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">Total Lessons</p>
              </div>
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-bold text-green-200">{completedCount}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">Completed</p>
              </div>
              <div className="bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-bold text-amber-200">{remainingCount}</p>
                <p className="text-[10px] sm:text-xs text-white/70 mt-0.5">Remaining</p>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-xs font-medium text-white/70">Progress</span>
                <span className="text-[10px] sm:text-xs font-bold">{progress}%</span>
              </div>
              <div className="h-2 sm:h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            Lessons
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {chapter.subchapters.map((subchapter, subIndex) => {
              const isSubCompleted = state.completedSubchapters.has(subchapter.id);
              const lessonIcon = LESSON_ICONS[subIndex % LESSON_ICONS.length];

              return (
                <motion.div
                  key={subchapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + subIndex * 0.06 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <button
                    onClick={() => goToSubchapter(chapter.slug, subchapter.slug)}
                    className={`w-full text-left h-full rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 ${
                      isSubCompleted
                        ? "border-green-300 bg-green-50/50 shadow-md shadow-green-50 hover:shadow-lg"
                        : "border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <motion.span
                        className="text-2xl sm:text-3xl"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: subIndex * 0.2 }}
                      >
                        {lessonIcon}
                      </motion.span>

                      {isSubCompleted ? (
                        <div className="w-6 sm:w-7 h-6 sm:h-7 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold bg-gray-200 text-gray-500">
                          {subIndex + 1}
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2">
                      {subchapter.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2 sm:mt-3">
                      <span className={`text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSubCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {isSubCompleted ? "✓ Done" : `Lesson ${subIndex + 1}`}
                      </span>
                    </div>

                    {isSubCompleted && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="h-0.5 bg-green-400 rounded-full mt-3 origin-left"
                      />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
