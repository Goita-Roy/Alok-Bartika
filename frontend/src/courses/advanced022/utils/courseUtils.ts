import type { Course, Chapter } from "../types";

export function findChapterBySlug(
  course: Course,
  chapterSlug: string
) {
  return course.chapters.find((ch) => ch.slug === chapterSlug);
}

export function findSubchapterBySlug(
  chapter: Chapter,
  subchapterSlug: string
) {
  return chapter.subchapters.find((sub) => sub.slug === subchapterSlug);
}

export function getTotalSubchapters(course: Course): number {
  return course.chapters.reduce(
    (total, chapter) => total + chapter.subchapters.length,
    0
  );
}

export function getChapterProgress(
  chapter: Chapter,
  completedSubchapters: Set<string>
): number {
  const completed = chapter.subchapters.filter((sub) =>
    completedSubchapters.has(sub.id)
  ).length;
  return Math.round((completed / chapter.subchapters.length) * 100);
}

export function getOverallProgress(
  course: Course,
  completedSubchapters: Set<string>
): number {
  const total = getTotalSubchapters(course);
  if (total === 0) return 0;
  return Math.round((completedSubchapters.size / total) * 100);
}
