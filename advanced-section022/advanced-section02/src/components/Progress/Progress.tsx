import { useCourse } from "../../hooks";

export function Progress() {
  const { overallProgress, chapterProgressMap, course } = useCourse();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Course Progress
        </span>
        <span className="text-sm font-bold text-indigo-600">
          {overallProgress}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <div className="flex gap-1.5 mt-2.5">
        {course.chapters.map((chapter) => {
          const progress = chapterProgressMap[chapter.id] ?? 0;
          return (
            <div
              key={chapter.id}
              className="flex-1 group relative"
              title={`${chapter.title}: ${progress}%`}
            >
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress === 100
                      ? "bg-green-500"
                      : progress > 0
                      ? "bg-indigo-400"
                      : "bg-gray-200"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
