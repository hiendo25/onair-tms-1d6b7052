import type { HighlightPhaseSummary, LearningPathProgressSummary, PhaseTimelineItem } from "@/modules/learning-paths/types";
import { learningPathsRepository } from "@/repository";
import type { PhaseWithClassRooms } from "@/repository/learning-paths";
import type { LearningPathWithDetails } from "@/repository/learning-paths";
import { parseMetadata } from "@/repository/learning-paths/transformers";
import {
  buildProgressResponse,
  getLearningPathProgress,
  getMultiplePhasesProgress,
} from "@/services/progress/progress.service";
import type { ProgressResponse } from "@/types/progress.types";

const PROGRESS_ENTITY_TYPES = {
  learningPath: "learning_path",
  phase: "phase",
} as const;

const PROGRESS_COMPLETED_PERCENT = 100;
const PROGRESS_EMPTY_PERCENT = 0;
const DEFAULT_COUNT = 0;
const DEFAULT_COMPLETION_CRITERIA = 80;
const INVALID_INDEX = -1;

const PHASE_STATUS = {
  COMPLETED: "completed",
  ACTIVE: "active",
  LOCKED: "locked",
} as const;

const EMPTY_PROGRESS = { totalLessons: 0, completedLessons: 0 };

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
  sequentialLearning: boolean,
): PhaseTimelineItem["status"] => {
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

const buildPhaseTimelineItems = (
  phases: PhaseWithClassRooms[],
  phasesProgress: ProgressResponse[],
  sequentialLearning: boolean,
): PhaseTimelineItem[] => {
  const progressMap = new Map<string, ProgressResponse>(
    phasesProgress.map((progress) => [progress.entityId, progress]),
  );
  const progressPercentages = phases.map((phase) => {
    return getProgressPercentage(progressMap.get(phase.id));
  });
  const firstIncompleteIndex = sequentialLearning
    ? progressPercentages.findIndex((percentage) => percentage < PROGRESS_COMPLETED_PERCENT)
    : -1;

  return phases.map((phase, index) => {
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

const buildLearningPathProgressSummary = (
  learningPathProgress: ProgressResponse | null,
  timelineItems: PhaseTimelineItem[],
  completionCriteria: number,
): LearningPathProgressSummary => {
  let completedPhases = 0;
  let totalPhases = 0;

  for (const item of timelineItems) {
    totalPhases += 1;
    if (item.status === PHASE_STATUS.COMPLETED) {
      completedPhases += 1;
    }
  }

  const overallProgress = learningPathProgress?.progressPercentage ?? PROGRESS_EMPTY_PERCENT;

  return {
    overallProgress,
    completedPhases,
    totalPhases,
    completionCriteria,
    isCompletionReached: overallProgress >= completionCriteria,
  };
};

const findHighlightPhaseIndex = (items: PhaseTimelineItem[]): number => {
  if (items.length === DEFAULT_COUNT) return INVALID_INDEX;

  const activeIndex = items.findIndex((item) => item.status === PHASE_STATUS.ACTIVE);
  if (activeIndex >= DEFAULT_COUNT) return activeIndex;

  for (let index = items.length - 1; index >= DEFAULT_COUNT; index -= 1) {
    if (items?.[index]?.status === PHASE_STATUS.COMPLETED) {
      return index;
    }
  }

  return DEFAULT_COUNT;
};

const buildHighlightPhaseSummary = (
  timelineItems: PhaseTimelineItem[],
): HighlightPhaseSummary | null => {
  const highlightIndex = findHighlightPhaseIndex(timelineItems);
  if (highlightIndex < DEFAULT_COUNT) return null;

  const highlightItem = timelineItems[highlightIndex];

  return {
    phase: highlightItem?.phase!,
    orderIndex: highlightItem?.orderIndex ?? highlightIndex + 1,
    progressPercentage: highlightItem?.progressPercentage ?? PROGRESS_EMPTY_PERCENT,
    completedLessons: highlightItem?.completedLessons ?? DEFAULT_COUNT,
    totalLessons: highlightItem?.totalLessons ?? DEFAULT_COUNT,
  };
};

export interface CurrentLearningPathSummary {
  learningPath: LearningPathWithDetails | null;
  timelineItems: PhaseTimelineItem[];
  progressSummary: LearningPathProgressSummary | null;
  highlightPhaseSummary: HighlightPhaseSummary | null;
}

export async function getCurrentLearningPathSummaryForEmployee(
  employeeId: string,
): Promise<CurrentLearningPathSummary> {
  const currentLearningPath = await learningPathsRepository.getCurrentLearningPathForEmployee(employeeId);

  if (!currentLearningPath) {
    return {
      learningPath: null,
      timelineItems: [],
      progressSummary: null,
      highlightPhaseSummary: null,
    };
  }

  const learningPath = await learningPathsRepository.getLearningPathWithDetails(currentLearningPath.id);

  if (!learningPath) {
    return {
      learningPath: null,
      timelineItems: [],
      progressSummary: null,
      highlightPhaseSummary: null,
    };
  }

  const phaseIds = (learningPath.learning_path_phases ?? []).map((phase) => phase.id);

  const [learningPathProgressRaw, phasesProgressMap] = await Promise.all([
    getLearningPathProgress(learningPath.id, employeeId),
    getMultiplePhasesProgress(phaseIds, employeeId, learningPath.id),
  ]);

  const learningPathProgress = buildProgressResponse({
    entityId: learningPath.id,
    entityType: PROGRESS_ENTITY_TYPES.learningPath,
    totalLessons: learningPathProgressRaw.totalLessons,
    completedLessons: learningPathProgressRaw.completedLessons,
    learningPathId: learningPath.id,
    employeeId,
  });

  const phasesProgress = (learningPath.learning_path_phases ?? []).map((phase) => {
    const progress = phasesProgressMap.get(phase.id) ?? EMPTY_PROGRESS;

    return buildProgressResponse({
      entityId: phase.id,
      entityType: PROGRESS_ENTITY_TYPES.phase,
      totalLessons: progress.totalLessons,
      completedLessons: progress.completedLessons,
      learningPathId: learningPath.id,
      employeeId,
    });
  });

  const metadata = parseMetadata(learningPath.metadata);
  const sequentialLearning = metadata?.sequentialLearning ?? true;
  const completionCriteria = metadata?.completionCriteria ?? DEFAULT_COMPLETION_CRITERIA;

  const timelineItems = buildPhaseTimelineItems(
    learningPath.learning_path_phases ?? [],
    phasesProgress,
    sequentialLearning,
  );
  const progressSummary = buildLearningPathProgressSummary(
    learningPathProgress,
    timelineItems,
    completionCriteria,
  );
  const highlightPhaseSummary = buildHighlightPhaseSummary(timelineItems);

  return {
    learningPath,
    timelineItems,
    progressSummary,
    highlightPhaseSummary,
  };
}
