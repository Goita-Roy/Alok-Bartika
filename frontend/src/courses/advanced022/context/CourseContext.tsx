import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Course, CourseState, CourseAction } from "../types";
import { courseData } from "../course";

// ── Bridge to the existing LMS progress system ───────────────────────────────
// The existing LMS tracks Advanced sub-lesson completion in
// localStorage['capstone_python_progress'] under the LEGACY keys below (the same
// keys the old iframe-based AdvancedCoursePage read). The new advanced-section022
// course uses NEW ids (e.g. "ch1-basic"). To keep the existing chapter-completion
// / class-unlock / final-exam-unlock logic working unchanged, every new sub-lesson
// id is mapped to its legacy key and written to the SAME localStorage key.
const CAPSTONE_PROGRESS_KEY = "capstone_python_progress";

// Legacy sub-lesson keys, grouped by chapter, in the EXACT same order/count as the
// new courseData chapters. Used to build NEW_ID -> LEGACY_KEY mapping.
const LEGACY_KEYS_BY_CHAPTER: string[][] = [
  ["c1_basic", "c1_setting_up", "c1_pattern", "c1_initials", "c1_snail_mail"],
  ["c2_basic", "c2_data_types", "c2_temperature", "c2_bmi", "c2_pythagorean", "c2_currency"],
  ["c3_basic", "c3_syntax_error", "c3_name_error", "c3_type_error"],
  ["c4_basic", "c4_enter_pin", "c4_guess_number", "c4_99_bottles"],
  ["c5_basic", "c5_grocery", "c5_todo", "c5_inventory"],
  ["c6_basic", "c6_dry", "c6_mars_orbiter", "c6_calculator"],
  ["c7_basic", "c7_restuarent", "c7_favorite_city", "c7_bank_account"],
  ["c8_basic", "c8_slot_machine", "c8_countdown", "c8_zen_of_python"],
];

// chapterId -> legacy keys[]
const LEGACY_KEYS_BY_CHAPTER_ID: Record<string, string[]> = {};
courseData.chapters.forEach((ch, i) => {
  LEGACY_KEYS_BY_CHAPTER_ID[ch.id] = LEGACY_KEYS_BY_CHAPTER[i] ?? [];
});

// sub-lesson NEW id -> legacy key
export const NEW_SUB_ID_TO_LEGACY: Record<string, string> = {};
courseData.chapters.forEach((ch) => {
  ch.subchapters.forEach((sub, j) => {
    NEW_SUB_ID_TO_LEGACY[sub.id] = LEGACY_KEYS_BY_CHAPTER_ID[ch.id][j];
  });
});

// legacy key -> new sub-lesson id (reverse lookup, used by AdvancedCoursePage)
export const LEGACY_TO_NEW_SUB_ID: Record<string, string> = {};
for (const [k, v] of Object.entries(NEW_SUB_ID_TO_LEGACY)) {
  LEGACY_TO_NEW_SUB_ID[v] = k;
}

function readCapstone(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CAPSTONE_PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCapstone(key: string, value: string) {
  const current = readCapstone();
  current[key] = value;
  try {
    localStorage.setItem(CAPSTONE_PROGRESS_KEY, JSON.stringify(current));
  } catch {}
  // Notify any listener (same mechanism the old iframe used).
  try {
    window.postMessage(
      { type: "CAPSTONE_PROGRESS_UPDATED", progress: current },
      window.location.origin,
    );
  } catch {}
}

function initCompletedSubchapters(): Set<string> {
  const capstone = readCapstone();
  const done = new Set<string>();
  for (const [newId, legacy] of Object.entries(NEW_SUB_ID_TO_LEGACY)) {
    if (capstone[legacy] === "completed") done.add(newId);
  }
  return done;
}

interface CourseContextValue {
  course: Course;
  state: CourseState;
  dispatch: React.Dispatch<CourseAction>;
  selectChapter: (chapterId: string) => void;
  selectSubchapter: (chapterId: string, subchapterId: string) => void;
  toggleChapter: (chapterId: string) => void;
  completeSubchapter: (subchapterId: string) => void;
  syncFromUrl: (chapterSlug: string, subchapterSlug: string) => void;
  resetState: () => void;
  goHome: () => void;
  onChapterSelect: (chapterSlug: string) => void;
}

const initialState: CourseState = {
  selectedChapter: null,
  selectedSubchapter: null,
  expandedChapter: null,
  completedSubchapters: initCompletedSubchapters(),
};

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case "SELECT_CHAPTER":
      return {
        ...state,
        selectedChapter: action.chapterId,
        selectedSubchapter: null,
        expandedChapter: action.chapterId,
      };

    case "SELECT_SUBCHAPTER":
      return {
        ...state,
        selectedChapter: action.chapterId,
        selectedSubchapter: action.subchapterId,
        expandedChapter: action.chapterId,
      };

    case "TOGGLE_CHAPTER": {
      const isExpanding = state.expandedChapter !== action.chapterId;
      return {
        ...state,
        expandedChapter: isExpanding ? action.chapterId : null,
        selectedChapter: isExpanding ? action.chapterId : state.selectedChapter,
      };
    }

    case "COMPLETE_SUBCHAPTER": {
      const newCompleted = new Set(state.completedSubchapters);
      newCompleted.add(action.subchapterId);
      return { ...state, completedSubchapters: newCompleted };
    }

    case "SYNC_COMPLETED": {
      // Union-merge externally-synced completions (from the LMS backend, relayed
      // via the existing CAPSTONE_PROGRESS_UPDATED message) into the current set.
      // Only ever ADDS — a local completion is never lost. No-op if nothing new.
      let added = false;
      const merged = new Set(state.completedSubchapters);
      action.completedSubchapters.forEach((id) => {
        if (!merged.has(id)) {
          merged.add(id);
          added = true;
        }
      });
      if (!added) return state;
      return { ...state, completedSubchapters: merged };
    }

    case "SET_FROM_URL": {
      const chapter = courseData.chapters.find(
        (ch) => ch.slug === action.chapterSlug,
      );
      if (!chapter) return state;
      const subchapter = chapter.subchapters.find(
        (sub) => sub.slug === action.subchapterSlug,
      );
      return {
        ...state,
        selectedChapter: chapter.id,
        selectedSubchapter: subchapter?.id ?? null,
        expandedChapter: chapter.id,
      };
    }

    case "RESET_STATE":
      // Keep completion, clear selection so the Home (chapter list) view shows.
      return {
        ...state,
        selectedChapter: null,
        selectedSubchapter: null,
        expandedChapter: null,
      };

    default:
      return state;
  }
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({
  children,
  onSubchapterComplete,
  onChapterSelect: onChapterSelectProp,
  chapterSelectRef,
}: {
  children: ReactNode;
  onSubchapterComplete?: (newId: string, legacyKey: string) => void;
  // Notified when the user navigates INTO a chapter from the new course UI, so
  // the host (AdvancedCoursePage) can keep its own `currentLesson` in sync.
  onChapterSelect?: (chapterSlug: string) => void;
  // Lets the host push a chapter selection INTO the new course (Prev/Next Class,
  // deep links). The host stores the setter here and calls it to select.
  chapterSelectRef?: React.MutableRefObject<((chapterId: string) => void) | null>;
}) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const selectChapter = useCallback((chapterId: string) => {
    dispatch({ type: "SELECT_CHAPTER", chapterId });
  }, []);

  const selectSubchapter = useCallback(
    (chapterId: string, subchapterId: string) => {
      dispatch({ type: "SELECT_SUBCHAPTER", chapterId, subchapterId });
    },
    [],
  );

  const toggleChapter = useCallback((chapterId: string) => {
    dispatch({ type: "TOGGLE_CHAPTER", chapterId });
  }, []);

  const completeSubchapter = useCallback(
    (subchapterId: string) => {
      const legacy = NEW_SUB_ID_TO_LEGACY[subchapterId];
      if (legacy) writeCapstone(legacy, "completed");
      dispatch({ type: "COMPLETE_SUBCHAPTER", subchapterId });
      if (legacy) onSubchapterComplete?.(subchapterId, legacy);
    },
    [onSubchapterComplete],
  );

  const syncFromUrl = useCallback(
    (chapterSlug: string, subchapterSlug: string) => {
      dispatch({ type: "SET_FROM_URL", chapterSlug, subchapterSlug });
    },
    [],
  );

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const goHome = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const onChapterSelect = useCallback(
    (chapterSlug: string) => {
      onChapterSelectProp?.(chapterSlug);
    },
    [onChapterSelectProp],
  );

  // Keep completion in sync with the existing LMS/backend progress WITHOUT a
  // page refresh. The host (AdvancedCoursePage) merges the backend response
  // (GET /progression via useCourseProgress) into localStorage['capstone_python_progress']
  // and (re)broadcasts the existing CAPSTONE_PROGRESS_UPDATED message. We consume
  // that same message + storage to union-merge any newly-completed sub-lessons
  // into completedSubchapters, which drives the progress bar. This does not change
  // the message contract or the context's public API — it only reads them.
  useEffect(() => {
    const syncFromCapstone = (capstone?: Record<string, string>) => {
      const source = capstone ?? readCapstone();
      const done = new Set<string>();
      for (const [newId, legacy] of Object.entries(NEW_SUB_ID_TO_LEGACY)) {
        if (source[legacy] === "completed") done.add(newId);
      }
      dispatch({ type: "SYNC_COMPLETED", completedSubchapters: done });
    };

    // Reconcile once on mount (covers a backend backfill that ran before mount).
    syncFromCapstone();

    const onMessage = (event: MessageEvent) => {
      if (
        event.data &&
        event.data.type === "CAPSTONE_PROGRESS_UPDATED" &&
        event.data.progress
      ) {
        syncFromCapstone(event.data.progress as Record<string, string>);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Expose a chapter-select setter to the host so external navigation
  // (Prev/Next Class, deep links) can drive the new course's selection.
  useEffect(() => {
    if (!chapterSelectRef) return;
    chapterSelectRef.current = (chapterId: string) => {
      dispatch({ type: "SELECT_CHAPTER", chapterId });
    };
    return () => {
      chapterSelectRef.current = null;
    };
  }, [chapterSelectRef]);

  const value = useMemo<CourseContextValue>(
    () => ({
      course: courseData,
      state,
      dispatch,
      selectChapter,
      selectSubchapter,
      toggleChapter,
      completeSubchapter,
      syncFromUrl,
      resetState,
      goHome,
      onChapterSelect,
    }),
    [
      state,
      selectChapter,
      selectSubchapter,
      toggleChapter,
      completeSubchapter,
      syncFromUrl,
      resetState,
      goHome,
      onChapterSelect,
    ],
  );

  return (
    <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
  );
}

export function useCourseContext(): CourseContextValue {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
}
