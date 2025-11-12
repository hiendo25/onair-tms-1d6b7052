import { useTQuery } from "@/lib/queryClient";
import { learningScreenRepository } from "@/repository";
import type { LearningCourseDetail } from "../types";

interface LearningCourseDetailQueryOptions {
  enabled?: boolean;
}

export const useLearningCourseDetailQuery = (
  courseId: string | null,
  options?: LearningCourseDetailQueryOptions,
) => {
  return useTQuery<LearningCourseDetail>({
    queryKey: ["learning-course-detail", courseId],
    queryFn: () => learningScreenRepository.getCourseLearningDetail(courseId ?? ""),
    enabled: Boolean(courseId) && (options?.enabled ?? true),
  });
};
