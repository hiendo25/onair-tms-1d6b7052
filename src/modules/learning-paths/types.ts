import type { PhaseClassRoomWithDetails, PhaseWithClassRooms } from "@/repository/learning-paths";
import type { ProgressResponse } from "@/types/progress.types";

import type { ClassRoomProgressStatus } from "./learning-path-user.constants";

export type PhaseStatus = "completed" | "active" | "locked";

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

export interface PhaseClassRoomWithProgress extends PhaseClassRoomWithDetails {
  progress: ProgressResponse | null;
}

export type PhaseWithClassRoomsWithProgress = Omit<PhaseWithClassRooms, "phase_class_rooms"> & {
  phase_class_rooms: PhaseClassRoomWithProgress[];
};

export interface PhaseClassRoomCardItem {
  id: string;
  title: string;
  description: string | null;
  modeKey: string;
  sessionCount: number;
  progressPercentage: number;
  status: ClassRoomProgressStatus;
  href?: string | null;
}

export interface PhaseProgressSummary {
  progressPercentage: number;
  completedClassRooms: number;
  totalClassRooms: number;
}

export interface PhaseDetailData {
  phase: PhaseWithClassRoomsWithProgress;
  classRooms: PhaseClassRoomCardItem[];
  summary: PhaseProgressSummary;
}

export interface LearningPathPhaseDetailViewData {
  learningPath: {
    id: string;
    name: string;
    organization_id: string;
  };
  detailData: PhaseDetailData;
}
