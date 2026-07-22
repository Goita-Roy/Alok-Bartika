import { useEffect } from "react";
import { motion } from "framer-motion";
import { useCourse, useNavigation } from "../hooks";
import { useCourseContext } from "../context";

const CHAPTER_ICONS = ["📘", "📙", "📗", "📕", "📔", "📒", "📓", "URY"];

const CHAPTER_DESCRIPTIONS = [
  "Start your Python journey",
  "Store and manage data",
  "Find and fix mistakes",
  "Repeat actions easily",
  "Work with collections",
  "Build reusable code",
  "Create your own types",
  "Use powerful libraries",
];

const CHAPTER_COLORS = [
  { from: "from-blue-500", to: "to-indigo-600", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { from: "from-orange-400", to: "to-red-500", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { from: "from-emerald-400", to: "to-teal-600", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { from: "from-red-400", to: "to-rose-600", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  { from: "from-amber-400", to: "to-yellow-600", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { from: "from-violet-400", to: "to-purple-600", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { from: "from-cyan-400", to: "to-blue-600", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  { from: "from-pink-400", to: "to-fuchsia-600", bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
];

export function HomePage() {
  const { course, chapterProgressMap, overallProgress, resetState } = useCourse();
  const { goToChapter } = useNavigation();
  const { state } = useCourseContext();

  useEffect(() => {
    resetState();
  }, [resetState]);

  const lastCompletedIndex = course.chapters.findIndex(
    (ch) => !ch.subchapters.every((sub) => state.completedSubchapters.has(sub.id))
  );
  const continueChapter = lastCompletedIndex >= 0 ? course.chapters[lastCompletedIndex] : course.chapters[0];
  const continueProgress = chapterProgressMap[continueChapter.id] ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            {course.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl">
            {course.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 sm:mb-10"
        >
          <div
            className="relative overflow-hidden rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl cursor-pointer"
            onClick={() => goToChapter(continueChapter.slug)}
          >
            <div className="absolute inset-0 bg-white/5" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full">
                  Continue Learning
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">
                {continueChapter.title}
              </h2>
              <p className="text-sm text-white/80 mb-4">
                {CHAPTER_DESCRIPTIONS[course.chapters.indexOf(continueChapter)]}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/70">Progress</span>
                    <span className="text-xs font-bold">{continueProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${continueProgress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
                <span className="text-xs text-white/70">
                  {continueChapter.subchapters.filter((sub) =>
                    state.completedSubchapters.has(sub.id)
                  ).length}/{continueChapter.subchapters.length} lessons
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10"
        >
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">All Chapters</h2>
          </div>

          {course.chapters.map((chapter, index) => {
            const icon = CHAPTER_ICONS[index % CHAPTER_ICONS.length];
            const color = CHAPTER_COLORS[index % CHAPTER_COLORS.length];
            const progress = chapterProgressMap[chapter.id] ?? 0;
            const isCompleted = progress === 100;
            const completedLessons = chapter.subchapters.filter((sub) =>
              state.completedSubchapters.has(sub.id)
            ).length;

            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.06 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group"
              >
                <button
                  onClick={() => goToChapter(chapter.slug)}
                  className={`w-full h-full text-left rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-green-300 bg-green-50/50 hover:shadow-lg hover:shadow-green-100"
                      : `${color.border} ${color.bg} hover:shadow-lg`
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <motion.span
                      className="text-3xl sm:text-4xl"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                    >
                      {icon}
                    </motion.span>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  <p className={`text-[10px] font-semibold mb-0.5 ${color.text}`}>
                    Chapter {index + 1}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {CHAPTER_DESCRIPTIONS[index]}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">
                        {completedLessons}/{chapter.subchapters.length} lessons
                      </span>
                      <span className={`text-[10px] font-bold ${color.text}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-green-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Overall Progress</h3>
            <span className="text-lg sm:text-xl font-bold text-indigo-600">{overallProgress}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {course.chapters.map((chapter, index) => {
              const progress = chapterProgressMap[chapter.id] ?? 0;
              return (
                <div key={chapter.id} className="text-center">
                  <span className="text-lg sm:text-xl">{CHAPTER_ICONS[index % CHAPTER_ICONS.length]}</span>
                  <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 truncate">{progress}%</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
