import type { Chapter } from "../../../types";
import { toBengaliDigits } from "../../../utils";

interface ChapterHeaderProps {
  chapter: Chapter;
}

export function ChapterHeader({ chapter }: ChapterHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
        অধ্যায়
      </p>
      <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        এই অধ্যায়ে {toBengaliDigits(chapter.subchapters.length)} টি পাঠ
      </p>
    </div>
  );
}
