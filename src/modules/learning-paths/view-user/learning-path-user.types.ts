import type { PhaseWithClassRooms } from "@/repository/learning-paths";

import type { PhaseStatus } from "./learning-path-user.constants";

export interface PhaseTimelineItem {
  phase: PhaseWithClassRooms;
  status: PhaseStatus;
  orderIndex: number;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  classRoomCount: number;
}

export interface LearningPathProgressSummary {
  overallProgress: number;
  completedPhases: number;
  totalPhases: number;
  completionCriteria: number;
  isCompletionReached: boolean;
}
