import { useMemo } from "react";

import {
  LESSON_PROGRESS_STATUS,
  LESSON_PROGRESS_STATUS_WEIGHT,
  SECTION_PROGRESS_MAX_PERCENT,
  SECTION_PROGRESS_MIN_PERCENT,
} from "@/modules/learning-screen/constants";
import type { LearningLessonSummary, LearningSectionOutline } from "@/modules/learning-screen/types";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getLessonProgressWeight = (status: LearningLessonSummary["progressStatus"]) => {
  const resolved = status ?? LESSON_PROGRESS_STATUS.NOT_STARTED;
  return LESSON_PROGRESS_STATUS_WEIGHT[resolved];
};

const calculateSectionProgress = (lessons: LearningLessonSummary[]) => {
  if (!lessons.length) return SECTION_PROGRESS_MIN_PERCENT;

  const totalWeight = lessons.reduce((acc, lesson) => acc + getLessonProgressWeight(lesson.progressStatus), 0);
  const avgWeight = totalWeight / lessons.length;

  const percent = avgWeight * SECTION_PROGRESS_MAX_PERCENT;
  return clamp(percent, SECTION_PROGRESS_MIN_PERCENT, SECTION_PROGRESS_MAX_PERCENT);
};

export const useSectionProgress = (
  sections: LearningSectionOutline[],
  isLearningPathSource: boolean,
): Record<string, number> => {
  return useMemo(() => {
    if (!isLearningPathSource) return {};

    const progressLookup: Record<string, number> = {};
    for (const section of sections) {
      progressLookup[section.id] = calculateSectionProgress(section.lessons);
    }
    return progressLookup;
  }, [isLearningPathSource, sections]);
};