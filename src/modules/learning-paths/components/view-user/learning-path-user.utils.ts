import type {
  HighlightPhaseSummary,
  LearningPathProgressSummary,
} from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { DEFAULT_COUNT, PROGRESS_EMPTY_PERCENT } from "../../learning-path-user.constants";
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
  highlightSummary?: HighlightPhaseSummary | null,
): PhaseHighlightSummary | null => {
  if (!highlightSummary?.phase) return null;

  const fallbackIndex = Math.max(highlightSummary.orderIndex - 1, DEFAULT_COUNT);
  const label = getPhaseLabel(highlightSummary.phase, fallbackIndex);
  const title = highlightSummary.phase.description?.trim() || label || DEFAULT_PHASE_TITLE;
  const totalLessons = highlightSummary.totalLessons ?? DEFAULT_COUNT;
  const completedLessons = highlightSummary.completedLessons ?? DEFAULT_COUNT;
  const remainingLessons = Math.max(totalLessons - completedLessons, DEFAULT_COUNT);
  const progressPercentage = highlightSummary.progressPercentage ?? PROGRESS_EMPTY_PERCENT;

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
