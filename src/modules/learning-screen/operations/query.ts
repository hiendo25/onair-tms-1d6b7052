import { useTQuery } from "@/lib/queryClient";
import { learningScreenRepository } from "@/repository";
import type { LearningCourseOutline, LearningLesson } from "../types";

export const LEARNING_COURSE_OUTLINE_QUERY_KEY = "learning-course-outline";
export const LEARNING_LESSON_DETAIL_QUERY_KEY = "learning-lesson-detail";
export const LESSON_DETAIL_STALE_TIME_MS = 10 * 60 * 1000;
export const LESSON_DETAIL_GC_TIME_MS = 30 * 60 * 1000;

interface LearningCourseOutlineQueryOptions {
  enabled?: boolean;
  includeProgress?: boolean;
  learningPathId?: string | null;
  classRoomId?: string | null;
  employeeId?: string | null;
}

interface LearningLessonDetailQueryOptions {
  enabled?: boolean;
}

export const useLearningCourseOutlineQuery = (
  courseId: string | null,
  options?: LearningCourseOutlineQueryOptions,
) => {
  return useTQuery<LearningCourseOutline>({
    queryKey: [
      LEARNING_COURSE_OUTLINE_QUERY_KEY,
      {
        courseId,
        includeProgress: options?.includeProgress ?? false,
        learningPathId: options?.learningPathId ?? null,
        classRoomId: options?.classRoomId ?? null,
        employeeId: options?.employeeId ?? null,
      },
    ],
    queryFn: () =>
      learningScreenRepository.getCourseLearningOutline(courseId ?? "", {
        includeProgress: options?.includeProgress,
        learningPathId: options?.learningPathId,
        classRoomId: options?.classRoomId,
        employeeId: options?.employeeId,
      }),
    enabled: Boolean(courseId) && (options?.enabled ?? true),
  });
};

export const useLearningLessonDetailQuery = (
  lessonId: string | null,
  options?: LearningLessonDetailQueryOptions,
) => {
  return useTQuery<LearningLesson | null>({
    queryKey: [LEARNING_LESSON_DETAIL_QUERY_KEY, lessonId],
    queryFn: () => learningScreenRepository.getLessonLearningDetail(lessonId ?? ""),
    enabled: Boolean(lessonId) && (options?.enabled ?? true),
    staleTime: LESSON_DETAIL_STALE_TIME_MS,
    gcTime: LESSON_DETAIL_GC_TIME_MS,
  });
};
