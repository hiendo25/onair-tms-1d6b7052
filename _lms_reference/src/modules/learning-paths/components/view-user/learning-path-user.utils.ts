import { PATHS } from "@/constants/path.constant";
import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import type { LearningPathProgressSummary } from "@/modules/learning-paths/types";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { PROGRESS_EMPTY_PERCENT } from "../../learning-path-user.constants";

const DEFAULT_PHASE_DESCRIPTION = "Chưa có mô tả cho giai đoạn này.";
const PERCENT_SIGN = "%";
const COMPLETION_BANNER_TITLE_PREFIX = "Bạn đã hoàn thành";
const COMPLETION_BANNER_SUFFIX = "lộ trình học";
export interface CompletionBannerData {
  title: string;
  subtitle: string;
}

export const buildLearningPathClassRoomHref = (
  slug: string | null | undefined,
  learningPathId: string | null | undefined,
): string | null => {
  const normalizedSlug = slug?.trim();
  const normalizedLearningPathId = learningPathId?.trim();
  if (!normalizedSlug || !normalizedLearningPathId) {
    return null;
  }

  const params = new URLSearchParams({
    [ROUTE_QUERY_KEYS.LEARNING_PATH_ID]: normalizedLearningPathId,
  });

  return `${PATHS.CLASSROOMS.DETAIL_CLASSROOM(normalizedSlug)}?${params.toString()}`;
};

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
