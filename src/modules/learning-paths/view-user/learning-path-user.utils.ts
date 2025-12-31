import { DEFAULT_COMPLETION_CRITERIA } from "@/modules/learning-paths/components/learning-path-detail.utils";
import type { PhaseWithClassRooms } from "@/repository/learning-paths";
import type { ProgressResponse } from "@/types/progress.types";

import {
  DEFAULT_COUNT,
  DEFAULT_ORDER_INDEX,
  PHASE_STATUS,
  type PhaseStatus,
  PROGRESS_COMPLETED_PERCENT,
  PROGRESS_EMPTY_PERCENT,
} from "./learning-path-user.constants";
import type { LearningPathProgressSummary, PhaseTimelineItem } from "./learning-path-user.types";

export interface BuildPhaseTimelineOptions {
  sequentialLearning?: boolean;
}

const sortPhasesByOrder = (phases: PhaseWithClassRooms[]): PhaseWithClassRooms[] => {
  return [...phases].sort((left, right) => {
    const leftOrder = left.order_index ?? DEFAULT_ORDER_INDEX;
    const rightOrder = right.order_index ?? DEFAULT_ORDER_INDEX;

    if (leftOrder === rightOrder) {
      return left.created_at.localeCompare(right.created_at);
    }

    return leftOrder - rightOrder;
  });
};

const getProgressPercentage = (progress?: ProgressResponse | null): number => {
  return progress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;
};

const getClassRoomCount = (phase: PhaseWithClassRooms): number => {
  if (typeof phase.phase_class_rooms_count === "number") {
    return phase.phase_class_rooms_count;
  }

  return phase.phase_class_rooms?.length ?? DEFAULT_COUNT;
};

const resolvePhaseStatus = (
  progressPercentage: number,
  index: number,
  firstIncompleteIndex: number,
  sequentialLearning: boolean
): PhaseStatus => {
  if (progressPercentage >= PROGRESS_COMPLETED_PERCENT) {
    return PHASE_STATUS.COMPLETED;
  }

  if (!sequentialLearning) {
    return PHASE_STATUS.ACTIVE;
  }

  if (firstIncompleteIndex === -1) {
    return PHASE_STATUS.COMPLETED;
  }

  if (index === firstIncompleteIndex) {
    return PHASE_STATUS.ACTIVE;
  }

  return PHASE_STATUS.LOCKED;
};

export const buildPhaseTimelineItems = (
  phases: PhaseWithClassRooms[],
  phasesProgress: ProgressResponse[],
  options?: BuildPhaseTimelineOptions
): PhaseTimelineItem[] => {
  const sortedPhases = sortPhasesByOrder(phases);
  const progressMap = new Map<string, ProgressResponse>(
    phasesProgress.map((progress) => [progress.entityId, progress])
  );
  const sequentialLearning = options?.sequentialLearning ?? true;
  const progressPercentages = sortedPhases.map((phase) => {
    return getProgressPercentage(progressMap.get(phase.id));
  });
  const firstIncompleteIndex = sequentialLearning
    ? progressPercentages.findIndex((percentage) => percentage < PROGRESS_COMPLETED_PERCENT)
    : -1;

  return sortedPhases.map((phase, index) => {
    const progress = progressMap.get(phase.id) ?? null;
    const progressPercentage = getProgressPercentage(progress);

    return {
      phase,
      status: resolvePhaseStatus(progressPercentage, index, firstIncompleteIndex, sequentialLearning),
      orderIndex: phase.order_index ?? index + 1,
      progressPercentage,
      completedLessons: progress?.completedLessons ?? DEFAULT_COUNT,
      totalLessons: progress?.totalLessons ?? DEFAULT_COUNT,
      classRoomCount: getClassRoomCount(phase),
    };
  });
};

export const buildLearningPathProgressSummary = (
  learningPathProgress: ProgressResponse | null,
  timelineItems: PhaseTimelineItem[],
  completionCriteria: number = DEFAULT_COMPLETION_CRITERIA
): LearningPathProgressSummary => {
  const completedPhases = timelineItems.filter((item) => item.status === PHASE_STATUS.COMPLETED).length;
  const totalPhases = timelineItems.length;
  const overallProgress = learningPathProgress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;

  return {
    overallProgress,
    completedPhases,
    totalPhases,
    completionCriteria,
    isCompletionReached: overallProgress >= completionCriteria,
  };
};
