import { useLearningLessonDetailQuery } from "@/modules/learning-screen/operations/query";
import type { LearningLesson } from "@/modules/learning-screen/types";

interface UseLessonDetailResult {
  selectedLesson: LearningLesson | null;
  isLessonRequestLoading: boolean;
  lessonErrorMessage: string | null;
  refetchLessonDetail: () => void;
}

export const useLessonDetail = (selectedLessonId: string | null): UseLessonDetailResult => {
  const {
    data: selectedLessonDetail,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLearningLessonDetailQuery(selectedLessonId, {
    enabled: Boolean(selectedLessonId),
  });

  const selectedLesson = selectedLessonDetail ?? null;
  const lessonErrorMessage = isError
    ? error instanceof Error
      ? error.message
      : "Không thể tải dữ liệu bài học."
    : null;
  const isLessonRequestLoading = (isLoading || isFetching) && Boolean(selectedLessonId);

  return {
    selectedLesson,
    isLessonRequestLoading,
    lessonErrorMessage,
    refetchLessonDetail: refetch,
  };
};
