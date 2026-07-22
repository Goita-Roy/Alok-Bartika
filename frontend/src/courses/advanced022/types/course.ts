export interface Subchapter {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  subchapters: Subchapter[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

export interface CourseState {
  selectedChapter: string | null;
  selectedSubchapter: string | null;
  expandedChapter: string | null;
  completedSubchapters: Set<string>;
}

export type CourseAction =
  | { type: "SELECT_CHAPTER"; chapterId: string }
  | { type: "SELECT_SUBCHAPTER"; chapterId: string; subchapterId: string }
  | { type: "TOGGLE_CHAPTER"; chapterId: string }
  | { type: "COMPLETE_SUBCHAPTER"; subchapterId: string }
  | { type: "SYNC_COMPLETED"; completedSubchapters: Set<string> }
  | { type: "SET_FROM_URL"; chapterSlug: string; subchapterSlug: string }
  | { type: "RESET_STATE" };
