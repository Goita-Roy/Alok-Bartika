export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type CourseStatus = 'draft' | 'published'

export interface Course {
  _id: string
  title: string
  level: CourseLevel
  description: string
  thumbnailUrl: string
  lessonCount?: number
  status?: CourseStatus
  createdAt: string
  updatedAt: string
}

export interface CourseSummary {
  total: number
  beginner: number
  intermediate: number
  advanced: number
}

export interface CoursePagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface CoursesResponse {
  data: Course[]
  summary?: CourseSummary
  pagination?: CoursePagination
}
