import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Course, CourseState, CourseAction } from "../types";
import { courseData } from "../course";

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
}

const initialState: CourseState = {
  selectedChapter: null,
  selectedSubchapter: null,
  expandedChapter: null,
  completedSubchapters: new Set<string>(),
};

function courseReducer(
  state: CourseState,
  action: CourseAction
): CourseState {
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

    case "SET_FROM_URL": {
      const chapter = courseData.chapters.find(
        (ch) => ch.slug === action.chapterSlug
      );
      if (!chapter) return state;
      const subchapter = chapter.subchapters.find(
        (sub) => sub.slug === action.subchapterSlug
      );
      return {
        ...state,
        selectedChapter: chapter.id,
        selectedSubchapter: subchapter?.id ?? null,
        expandedChapter: chapter.id,
      };
    }

    case "RESET_STATE":
      return {
        ...initialState,
        completedSubchapters: state.completedSubchapters,
      };

    default:
      return state;
  }
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const selectChapter = useCallback((chapterId: string) => {
    dispatch({ type: "SELECT_CHAPTER", chapterId });
  }, []);

  const selectSubchapter = useCallback(
    (chapterId: string, subchapterId: string) => {
      dispatch({ type: "SELECT_SUBCHAPTER", chapterId, subchapterId });
    },
    []
  );

  const toggleChapter = useCallback((chapterId: string) => {
    dispatch({ type: "TOGGLE_CHAPTER", chapterId });
  }, []);

  const completeSubchapter = useCallback((subchapterId: string) => {
    dispatch({ type: "COMPLETE_SUBCHAPTER", subchapterId });
  }, []);

  const syncFromUrl = useCallback(
    (chapterSlug: string, subchapterSlug: string) => {
      dispatch({ type: "SET_FROM_URL", chapterSlug, subchapterSlug });
    },
    []
  );

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

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
    }),
    [
      state,
      selectChapter,
      selectSubchapter,
      toggleChapter,
      completeSubchapter,
      syncFromUrl,
      resetState,
    ]
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
