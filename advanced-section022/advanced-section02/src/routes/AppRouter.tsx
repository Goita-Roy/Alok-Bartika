import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CourseProvider } from "../context";
import { HomePage } from "../pages/HomePage";
import { ChapterDetailsPage } from "../pages/ChapterDetailsPage";
import { LessonPage } from "../pages/LessonPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <CourseProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chapters/:chapterSlug" element={<ChapterDetailsPage />} />
          <Route path="/chapters/:chapterSlug/:subchapterSlug" element={<LessonPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CourseProvider>
    </BrowserRouter>
  );
}
