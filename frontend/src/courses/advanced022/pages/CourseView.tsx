import { AnimatePresence } from "framer-motion";
import { useCourse } from "../hooks";
import { HomePage } from "./HomePage";
import { ChapterDetailsPage } from "./ChapterDetailsPage";
import { LessonPage } from "./LessonPage";

// View switcher for the embedded Advanced course. The original standalone app
// used react-router to move between Home -> Chapter -> Lesson; inside the LMS we
// derive the current view from CourseContext selection state instead.
//   - no chapter selected            -> HomePage (chapter list)
//   - chapter but no subchapter      -> ChapterDetailsPage (lesson list)
//   - chapter + subchapter selected  -> LessonPage (lesson content)
export function CourseView({
  lockedChapterSlugs,
}: {
  lockedChapterSlugs?: Set<string>;
} = {}) {
  const { selectedChapter, selectedSubchapter } = useCourse();

  let view: "home" | "chapter" | "lesson" = "home";
  if (selectedChapter && selectedSubchapter) view = "lesson";
  else if (selectedChapter) view = "chapter";

  return (
    <AnimatePresence mode="wait">
      {view === "lesson" ? (
        <LessonPage key="lesson" />
      ) : view === "chapter" ? (
        <ChapterDetailsPage key="chapter" />
      ) : (
        <HomePage key="home" lockedChapterSlugs={lockedChapterSlugs} />
      )}
    </AnimatePresence>
  );
}
