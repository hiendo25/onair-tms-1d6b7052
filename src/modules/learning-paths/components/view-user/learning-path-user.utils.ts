import type { LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { DEFAULT_COUNT, PHASE_STATUS, PROGRESS_EMPTY_PERCENT } from "../../learning-path-user.constants";
import { getPhaseLabel } from "../learning-path-detail.utils";

const DEFAULT_PHASE_TITLE = "Giai đoạn học tập";
const DEFAULT_PHASE_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";
const PHASE_TAG_ID = "phase-count";
const COMPLETION_TAG_ID = "completion-criteria";
const PHASE_TAG_SUFFIX = "giai đoạn";
const COMPLETION_TAG_PREFIX = "Hoàn thành";
const PERCENT_SIGN = "%";
const REMAINING_LESSON_PREFIX = "Còn";
const REMAINING_LESSON_SUFFIX = "buổi";
const COMPLETED_LABEL = "Đã hoàn thành";
const NO_LESSON_LABEL = "Chưa có buổi học";
const NO_CLASSROOM_LABEL = "Chưa có lớp học";
const CLASSROOM_LABEL_SUFFIX = "lớp học";
const COMPLETION_BANNER_TITLE_PREFIX = "Bạn đã hoàn thành";
const COMPLETION_BANNER_SUFFIX = "lộ trình học";

const findHighlightPhaseIndex = (items: PhaseTimelineItem[]): number => {
  if (items.length === DEFAULT_COUNT) return -1;

  const activeIndex = items.findIndex((item) => item.status === PHASE_STATUS.ACTIVE);
  if (activeIndex >= DEFAULT_COUNT) return activeIndex;

  for (let index = items.length - 1; index >= DEFAULT_COUNT; index -= 1) {
    if (items?.[index]?.status === PHASE_STATUS.COMPLETED) {
      return index;
    }
  }

  return DEFAULT_COUNT;
};

const buildRemainingLessonsLabel = (remainingLessons: number, totalLessons: number): string => {
  if (totalLessons === DEFAULT_COUNT) return NO_LESSON_LABEL;
  if (remainingLessons <= DEFAULT_COUNT) return COMPLETED_LABEL;
  return `${REMAINING_LESSON_PREFIX} ${remainingLessons} ${REMAINING_LESSON_SUFFIX}`;
};

const buildClassRoomLabel = (completedLessons: number, totalLessons: number): string => {
  if (totalLessons === DEFAULT_COUNT) return NO_CLASSROOM_LABEL;
  return `${completedLessons}/${totalLessons} ${CLASSROOM_LABEL_SUFFIX}`;
};

export interface PhaseHighlightSummary {
  title: string;
  subtitle: string;
  progressPercentage: number;
  remainingLabel: string;
  classRoomLabel: string;
}

export const buildPhaseHighlightSummary = (
  items: PhaseTimelineItem[],
): PhaseHighlightSummary | null => {
  const highlightIndex = findHighlightPhaseIndex(items);
  if (highlightIndex < DEFAULT_COUNT) return null;

  const highlightItem = items[highlightIndex];
  const label = getPhaseLabel(highlightItem?.phase!, highlightIndex);
  const title = highlightItem?.phase.description?.trim() || label || DEFAULT_PHASE_TITLE;
  const totalLessons = highlightItem?.totalLessons ?? DEFAULT_COUNT;
  const completedLessons = highlightItem?.completedLessons ?? DEFAULT_COUNT;
  const remainingLessons = Math.max(totalLessons - completedLessons, DEFAULT_COUNT);
  const progressPercentage = highlightItem?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;

  return {
    title,
    subtitle: label || DEFAULT_PHASE_TITLE,
    progressPercentage,
    remainingLabel: buildRemainingLessonsLabel(remainingLessons, totalLessons),
    classRoomLabel: buildClassRoomLabel(completedLessons, totalLessons),
  };
};

export interface LearningPathHeroTag {
  id: string;
  label: string;
}

export const buildLearningPathHeroTags = (
  learningPath: LearningPathWithDetails,
  progressSummary: LearningPathProgressSummary,
): LearningPathHeroTag[] => {
  const phaseCount = progressSummary.totalPhases ?? learningPath.phase_count ?? DEFAULT_COUNT;
  const completionCriteria = progressSummary.completionCriteria ?? PROGRESS_EMPTY_PERCENT;

  return [
    {
      id: PHASE_TAG_ID,
      label: `${phaseCount} ${PHASE_TAG_SUFFIX}`,
    },
    {
      id: COMPLETION_TAG_ID,
      label: `${COMPLETION_TAG_PREFIX} ${completionCriteria}${PERCENT_SIGN}`,
    },
  ];
};

export interface CompletionBannerData {
  title: string;
  subtitle: string;
}

export const buildCompletionBannerData = (
  learningPath: LearningPathWithDetails,
  progressSummary: LearningPathProgressSummary,
): CompletionBannerData | null => {
  if (!progressSummary.isCompletionReached) return null;

  const progressLabel = `${progressSummary.overallProgress ?? PROGRESS_EMPTY_PERCENT}${PERCENT_SIGN}`;
  return {
    title: `${COMPLETION_BANNER_TITLE_PREFIX} ${progressLabel} ${COMPLETION_BANNER_SUFFIX}`,
    subtitle: learningPath.name || DEFAULT_PHASE_DESCRIPTION,
  };
};
