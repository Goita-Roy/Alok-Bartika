import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();
  const { chapterSlug, subchapterSlug } = useParams<{
    chapterSlug: string;
    subchapterSlug: string;
  }>();

  const goToHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const goToChapter = useCallback(
    (chapterSlug: string) => {
      navigate(`/chapters/${chapterSlug}`);
    },
    [navigate]
  );

  const goToSubchapter = useCallback(
    (chapterSlug: string, subchapterSlug: string) => {
      navigate(`/chapters/${chapterSlug}/${subchapterSlug}`);
    },
    [navigate]
  );

  return {
    currentChapterSlug: chapterSlug ?? null,
    currentSubchapterSlug: subchapterSlug ?? null,
    goToHome,
    goToChapter,
    goToSubchapter,
  };
}
