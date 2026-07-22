import { useCallback } from "react";
import { useCourseContext } from "../context";

// Navigation is handled entirely inside the Advanced course page (no react-router
// URL changes), so this hook bridges the new course's goTo* calls to the
// CourseContext selection state.
export function useNavigation() {
  const { course, selectChapter, selectSubchapter, goHome, onChapterSelect } =
    useCourseContext();

  const goToHome = useCallback(() => {
    goHome();
  }, [goHome]);

  const goToChapter = useCallback(
    (chapterSlug: string) => {
      const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
      if (chapter) {
        selectChapter(chapter.id);
        onChapterSelect(chapter.slug);
      }
    },
    [course.chapters, selectChapter, onChapterSelect],
  );

  const goToSubchapter = useCallback(
    (chapterSlug: string, subchapterSlug: string) => {
      const chapter = course.chapters.find((ch) => ch.slug === chapterSlug);
      if (!chapter) return;
      const sub = chapter.subchapters.find((s) => s.slug === subchapterSlug);
      if (sub) selectSubchapter(chapter.id, sub.id);
    },
    [course.chapters, selectSubchapter],
  );

  return {
    currentChapterSlug: null,
    currentSubchapterSlug: null,
    goToHome,
    goToChapter,
    goToSubchapter,
  };
}
