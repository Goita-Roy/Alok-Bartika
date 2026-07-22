import type { Subchapter, Chapter } from "../../../types";

interface SubchapterContentProps {
  subchapter: Subchapter;
  chapter: Chapter;
  onComplete: (subchapterId: string) => void;
  onNext: () => void;
  isCompleted: boolean;
  hasNext: boolean;
}

export function SubchapterContent({
  subchapter,
  chapter,
  onComplete,
  onNext,
  isCompleted,
  hasNext,
}: SubchapterContentProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
          {chapter.title}
        </span>
        <span className="text-gray-300">/</span>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {subchapter.title}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {subchapter.title}
      </h2>

      <div className="mt-4">
        <p className="text-gray-700 leading-relaxed">{subchapter.content}</p>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Practice Area
          </p>
          <p className="text-sm text-gray-600">
            Complete the exercises for this lesson to mark it as done. Apply
            what you learned in this section.
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        {!isCompleted ? (
          <button
            onClick={() => onComplete(subchapter.id)}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Mark as Complete
          </button>
        ) : (
          <span className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Completed
          </span>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Next Lesson →
          </button>
        )}
      </div>
    </div>
  );
}
