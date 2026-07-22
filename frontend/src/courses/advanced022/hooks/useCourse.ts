import { useCallback, useMemo } from "react";
import { useCourseContext } from "../context";
import {
  findChapterBySlug,
  findSubchapterBySlug,
  getOverallProgress,
  getChapterProgress,
} from "../utils";

export function useCourse() {
  const {
    course,
    state,
    selectChapter,
    selectSubchapter,
    toggleChapter,
    completeSubchapter,
    syncFromUrl,
    resetState,
  } = useCourseContext();

  const selectedChapter = useMemo(
    () => course.chapters.find((ch) => ch.id === state.selectedChapter) ?? null,
    [course.chapters, state.selectedChapter]
  );

  const selectedSubchapter = useMemo(() => {
    if (!selectedChapter || !state.selectedSubchapter) return null;
    return (
      selectedChapter.subchapters.find(
        (sub) => sub.id === state.selectedSubchapter
      ) ?? null
    );
  }, [selectedChapter, state.selectedSubchapter]);

  const overallProgress = useMemo(
    () => getOverallProgress(course, state.completedSubchapters),
    [course, state.completedSubchapters]
  );

  const chapterProgressMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const chapter of course.chapters) {
      map[chapter.id] = getChapterProgress(chapter, state.completedSubchapters);
    }
    return map;
  }, [course.chapters, state.completedSubchapters]);

  return {
    course,
    state,
    selectedChapter,
    selectedSubchapter,
    expandedChapterId: state.expandedChapter,
    overallProgress,
    chapterProgressMap,
    selectChapter,
    selectSubchapter,
    toggleChapter,
    completeSubchapter,
    syncFromUrl: useCallback(
      (chapterSlug: string, subchapterSlug: string) => {
        syncFromUrl(chapterSlug, subchapterSlug);
      },
      [syncFromUrl]
    ),
    findChapter: useCallback(
      (slug: string) => findChapterBySlug(course, slug),
      [course]
    ),
    findSubchapter: useCallback(
      (chapterSlug: string, subchapterSlug: string) => {
        const chapter = findChapterBySlug(course, chapterSlug);
        if (!chapter) return undefined;
        return findSubchapterBySlug(chapter, subchapterSlug);
      },
      [course]
    ),
    resetState,
  };
}
