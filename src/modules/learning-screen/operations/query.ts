import { useTQuery } from "@/lib/queryClient";
import { learningScreenRepository } from "@/repository";
import type { LearningCourseOutline, LearningLesson } from "../types";

interface LearningCourseOutlineQueryOptions {
  enabled?: boolean;
}

interface LearningLessonDetailQueryOptions {
  enabled?: boolean;
}

export const useLearningCourseOutlineQuery = (
  courseId: string | null,
  options?: LearningCourseOutlineQueryOptions,
) => {
  return useTQuery<LearningCourseOutline>({
    queryKey: ["learning-course-outline", courseId],
    queryFn: () => learningScreenRepository.getCourseLearningOutline(courseId ?? ""),
    enabled: Boolean(courseId) && (options?.enabled ?? true),
  });
};

export const useLearningLessonDetailQuery = (
  lessonId: string | null,
  options?: LearningLessonDetailQueryOptions,
) => {
  return useTQuery<LearningLesson | null>({
    queryKey: ["learning-lesson-detail", lessonId],
    queryFn: () => learningScreenRepository.getLessonLearningDetail(lessonId ?? ""),
    enabled: Boolean(lessonId) && (options?.enabled ?? true),
  });
};
