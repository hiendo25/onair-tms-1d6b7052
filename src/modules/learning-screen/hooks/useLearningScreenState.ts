import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import {
  LEARNING_SCREEN_SOURCE,
  LESSON_PROGRESS_STATUS,
  LESSON_PROGRESS_STATUS_WEIGHT,
  SECTION_PROGRESS_MAX_PERCENT,
  SECTION_PROGRESS_MIN_PERCENT,
} from "@/modules/learning-screen/constants";
import {
  LEARNING_LESSON_DETAIL_QUERY_KEY,
  LESSON_DETAIL_STALE_TIME_MS,
  useLearningCourseOutlineQuery,
  useLearningLessonDetailQuery,
} from "@/modules/learning-screen/operations/query";
import type { LearningLessonSummary, LearningSectionOutline } from "@/modules/learning-screen/types";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { learningScreenRepository } from "@/repository";

const createLessonLookup = (sections: LearningSectionOutline[]) => {
  const lookup = new Map<string, LearningLessonSummary>();
  for (const section of sections) {
    for (const lesson of section.lessons) {
      lookup.set(lesson.id, lesson);
    }
  }
  return lookup;
};

const resolveSource = (sourceParam: string | null, learningPathId: string | null) => {
  if (sourceParam === LEARNING_SCREEN_SOURCE.LEARNING_PATH) {
    return LEARNING_SCREEN_SOURCE.LEARNING_PATH;
  }
  if (learningPathId) {
    return LEARNING_SCREEN_SOURCE.LEARNING_PATH;
  }
  return LEARNING_SCREEN_SOURCE.CLASSROOM;
};

const getLessonProgressWeight = (status: LearningLessonSummary["progressStatus"]) => {
  const resolvedStatus = status ?? LESSON_PROGRESS_STATUS.NOT_STARTED;
  return LESSON_PROGRESS_STATUS_WEIGHT[resolvedStatus];
};

const calculateSectionProgress = (lessons: LearningLessonSummary[]) => {
  if (!lessons.length) {
    return SECTION_PROGRESS_MIN_PERCENT;
  }
  const totalWeight = lessons.reduce(
    (acc, lesson) => acc + getLessonProgressWeight(lesson.progressStatus),
    LESSON_PROGRESS_STATUS_WEIGHT[LESSON_PROGRESS_STATUS.NOT_STARTED],
  );
  return (totalWeight / lessons.length) * SECTION_PROGRESS_MAX_PERCENT;
};

interface UseLearningScreenStateParams {
  courseId: string | null;
}

export const useLearningScreenState = ({ courseId }: UseLearningScreenStateParams) => {
  const { id: studentId } = useUserOrganization((state) => state.currentEmployee);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const sectionIdParam = searchParams.get("sectionId");
  const lessonIdParam = searchParams.get("lessonId");
  const learningPathIdParam = searchParams.get("learningPathId");
  const sourceParam = searchParams.get("source");
  const screenSource = resolveSource(sourceParam, learningPathIdParam);
  const isLearningPathSource = screenSource === LEARNING_SCREEN_SOURCE.LEARNING_PATH;

  const { data, isLoading, isError, refetch } = useLearningCourseOutlineQuery(courseId, {
    enabled: Boolean(courseId),
    includeProgress: isLearningPathSource,
    learningPathId: learningPathIdParam,
  });

  const course = data?.course ?? null;
  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const lessonLookup = useMemo(() => createLessonLookup(sections), [sections]);
  const flatLessons = useMemo(() => Array.from(lessonLookup.values()), [lessonLookup]);

  const lessonSectionLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of sections) {
      for (const lesson of section.lessons) {
        map.set(lesson.id, section.id);
      }
    }
    return map;
  }, [sections]);

  const sectionLookup = useMemo(() => {
    return new Map(sections.map((section) => [section.id, section]));
  }, [sections]);

  const sectionProgressById = useMemo<Record<string, number>>(() => {
    if (!isLearningPathSource) {
      return {};
    }
    const progressLookup: Record<string, number> = {};
    for (const section of sections) {
      progressLookup[section.id] = calculateSectionProgress(section.lessons);
    }
    return progressLookup;
  }, [isLearningPathSource, sections]);

  useEffect(() => {
    setSelectedLessonId(null);
  }, [courseId]);

  useEffect(() => {
    if (!flatLessons.length) {
      setSelectedLessonId(null);
      return;
    }

    if (lessonIdParam && lessonLookup.has(lessonIdParam)) {
      setSelectedLessonId(lessonIdParam);
      return;
    }

    if (sectionIdParam) {
      const targetSection = sectionLookup.get(sectionIdParam);
      const firstLesson = targetSection?.lessons?.[0];
      if (firstLesson?.id) {
        setSelectedLessonId(firstLesson.id);
        return;
      }
    }

    setSelectedLessonId(flatLessons[0]?.id ?? null);
  }, [flatLessons, lessonIdParam, lessonLookup, sectionIdParam, sectionLookup]);

  const selectedLessonSummary = selectedLessonId ? lessonLookup.get(selectedLessonId) ?? null : null;
  const nextLessonId = useMemo(() => {
    if (!selectedLessonId) {
      return null;
    }
    const currentIndex = flatLessons.findIndex((lesson) => lesson.id === selectedLessonId);
    if (currentIndex < 0) {
      return null;
    }
    return flatLessons[currentIndex + 1]?.id ?? null;
  }, [flatLessons, selectedLessonId]);

  const {
    data: selectedLessonDetail,
    isLoading: isLessonLoading,
    isFetching: isLessonFetching,
    isError: isLessonError,
    error: lessonError,
    refetch: refetchLessonDetail,
  } = useLearningLessonDetailQuery(selectedLessonId, {
    enabled: Boolean(selectedLessonId),
  });

  const selectedLesson = selectedLessonDetail ?? null;
  const lessonErrorMessage = isLessonError
    ? lessonError instanceof Error
      ? lessonError.message
      : "Không thể tải dữ liệu bài học."
    : null;
  const isLessonRequestLoading = (isLessonLoading || isLessonFetching) && Boolean(selectedLessonId);

  const selectedSectionId = selectedLessonId ? lessonSectionLookup.get(selectedLessonId) ?? null : null;

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

  useEffect(() => {
    if (!selectedLessonId || !selectedSectionId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    let shouldReplace = false;

    if (params.get("lessonId") !== selectedLessonId) {
      params.set("lessonId", selectedLessonId);
      shouldReplace = true;
    }

    if (params.get("sectionId") !== selectedSectionId) {
      params.set("sectionId", selectedSectionId);
      shouldReplace = true;
    }

    if (params.get("source") !== screenSource) {
      params.set("source", screenSource);
      shouldReplace = true;
    }

    if (shouldReplace) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [router, screenSource, searchParams, selectedLessonId, selectedSectionId]);

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (!lessonId || lessonId === selectedLessonId) {
        return;
      }
      setSelectedLessonId(lessonId);
    },
    [selectedLessonId],
  );

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
