import { useCallback, useEffect, useMemo } from "react";

import type { LearningLessonSummary, LearningSectionOutline } from "@/modules/learning-screen/types";

interface UseLessonSelectionFromUrlParams {
  courseId: string | null;
  sections: LearningSectionOutline[];
  lessonIdParam: string | null;
  sectionIdParam: string | null;
  searchParamsString: string;
  onReplaceSearchParams: (nextSearchParams: URLSearchParams) => void;
}

interface UseLessonSelectionFromUrlResult {
  flatLessons: LearningLessonSummary[];
  selectedLessonId: string | null;
  selectedLessonSummary: LearningLessonSummary | null;
  handleSelectLesson: (lessonId: string) => void;
}

export const useLessonSelectionFromUrl = ({
  courseId,
  sections,
  lessonIdParam,
  sectionIdParam,
  searchParamsString,
  onReplaceSearchParams,
}: UseLessonSelectionFromUrlParams): UseLessonSelectionFromUrlResult => {
  const { lessonLookup, sectionLookup, flatLessons } = useMemo(() => {
    const lessonMap = new Map<string, LearningLessonSummary>();
    const sectionMap = new Map<string, LearningSectionOutline>();
    const lessons: LearningLessonSummary[] = [];

    for (const section of sections) {
      sectionMap.set(section.id, section);
      for (const lesson of section.lessons) {
        lessonMap.set(lesson.id, lesson);
        lessons.push(lesson);
      }
    }

    return { lessonLookup: lessonMap, sectionLookup: sectionMap, flatLessons: lessons };
  }, [sections]);

  const selectedLessonId = useMemo<string | null>(() => {
    if (!flatLessons.length) return null;

    if (lessonIdParam && lessonLookup.has(lessonIdParam)) {
      return lessonIdParam;
    }

    if (sectionIdParam) {
      const section = sectionLookup.get(sectionIdParam);
      const firstLessonId = section?.lessons?.[0]?.id ?? null;
      if (firstLessonId && lessonLookup.has(firstLessonId)) {
        return firstLessonId;
      }
    }

    return flatLessons[0]?.id ?? null;
  }, [flatLessons, lessonIdParam, lessonLookup, sectionIdParam, sectionLookup]);

  useEffect(() => {
    if (!selectedLessonId) return;

    const params = new URLSearchParams(searchParamsString);
    let shouldReplace = false;

    // Nếu URL chưa có lessonId hợp lệ, set theo derived selection
    if (params.get("lessonId") !== selectedLessonId) {
      params.set("lessonId", selectedLessonId);
      shouldReplace = true;
    }

    if (params.has("sectionId")) {
      params.delete("sectionId");
      shouldReplace = true;
    }

    if (shouldReplace) {
      onReplaceSearchParams(params);
    }
  }, [onReplaceSearchParams, searchParamsString, selectedLessonId]);

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (!lessonId) return;
      if (selectedLessonId && lessonId === selectedLessonId) return;
      if (!lessonLookup.has(lessonId)) return;

      const params = new URLSearchParams(searchParamsString);
      params.set("lessonId", lessonId);
      params.delete("sectionId");

      onReplaceSearchParams(params);
    },
    [lessonLookup, onReplaceSearchParams, searchParamsString, selectedLessonId],
  );

  const selectedLessonSummary = selectedLessonId ? lessonLookup.get(selectedLessonId) ?? null : null;

  void courseId;

  return {
    flatLessons,
    selectedLessonId,
    selectedLessonSummary,
    handleSelectLesson,
  };
};