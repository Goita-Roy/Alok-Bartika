import type { Chapter } from "../../../types";

interface ChapterHeaderProps {
  chapter: Chapter;
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
        Chapter
      </p>
      <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {chapter.subchapters.length} lessons in this chapter
      </p>
    </div>
  );
}
