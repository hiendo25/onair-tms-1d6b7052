import { useCallback, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { LEARNING_SCREEN_ROUTE_PREFIX } from "@/modules/learning-screen/constants";
import { useLessonDetail } from "@/modules/learning-screen/hooks/useLessonDetail";
import { useLessonSelectionFromUrl } from "@/modules/learning-screen/hooks/useLessonSelectionFromUrl";
import { useSectionProgress } from "@/modules/learning-screen/hooks/useSectionProgress";
import {
  LEARNING_LESSON_DETAIL_QUERY_KEY,
  LESSON_DETAIL_STALE_TIME_MS,
  useLearningCourseOutlineQuery,
} from "@/modules/learning-screen/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { learningScreenRepository } from "@/repository";

interface UseLearningScreenStateParams {
  courseId: string | null;
  learningPathId?: string | null;
}

export const useLearningScreenState = ({
  courseId,
  learningPathId
}: UseLearningScreenStateParams) => {
  const { id: studentId } = useUserOrganization((state) => state.currentEmployee);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const queryClient = useQueryClient();
  const lessonIdParam = searchParams.get("lessonId");
  const sectionIdParam = searchParams.get("sectionId");
  const isLearningPathSource = Boolean(learningPathId);

  const { data, isLoading, isError, refetch } = useLearningCourseOutlineQuery(courseId, {
    enabled: Boolean(courseId),
    includeProgress: true,
    learningPathId: learningPathId ?? null,
    employeeId: studentId,
  });

  const course = data?.course ?? null;
  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);

  const handleReplaceSearchParams = useCallback(
    (nextSearchParams: URLSearchParams) => {
      const next = nextSearchParams.toString();
      if (next === searchParamsString) {
        return;
      }
      router.replace(`?${next}`, { scroll: false });
    },
    [router, searchParamsString],
  );
  const {
    flatLessons,
    selectedLessonId,
    selectedLessonSummary,
    handleSelectLesson,
  } = useLessonSelectionFromUrl({
    courseId,
    sections,
    lessonIdParam,
    sectionIdParam,
    searchParamsString,
    onReplaceSearchParams: handleReplaceSearchParams,
  });

  const sectionProgressById = useSectionProgress(sections);
  const lessonIndexById = useMemo(() => {
    const map = new Map<string, number>();
    flatLessons.forEach((lesson, idx) => map.set(lesson.id, idx));
    return map;
  }, [flatLessons]);

  const nextLessonId = useMemo(() => {
    if (!selectedLessonId) return null;

    const currentIndex = lessonIndexById.get(selectedLessonId);
    if (currentIndex === undefined) return null;

    return flatLessons[currentIndex + 1]?.id ?? null;
  }, [flatLessons, lessonIndexById, selectedLessonId]);

  const {
    selectedLesson,
    isLessonRequestLoading,
    lessonErrorMessage,
    refetchLessonDetail,
  } = useLessonDetail(selectedLessonId);

  useEffect(() => {
    if (!nextLessonId) {
      return;
    }
    queryClient.prefetchQuery({
      queryKey: [LEARNING_LESSON_DETAIL_QUERY_KEY, nextLessonId],
      queryFn: () => learningScreenRepository.getLessonLearningDetail(nextLessonId),
      staleTime: LESSON_DETAIL_STALE_TIME_MS,
    });
  }, [nextLessonId, queryClient]);

  return {
    course,
    sections,
    isLoading,
    isError,
    refetch,
    flatLessons,
    selectedLessonId,
    selectedLessonSummary,
    selectedLesson,
    isLessonRequestLoading,
    lessonErrorMessage,
    refetchLessonDetail,
    handleSelectLesson,
    studentId,
    isLearningPathSource,
    sectionProgressById,
  };
};
