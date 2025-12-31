import type { PhaseWithClassRooms } from "@/repository/learning-paths";

import type { ClassRoomProgressStatus } from "./learning-path-user.constants";

export interface PhaseClassRoomCardItem {
  id: string;
  title: string;
  description: string | null;
  modeLabel: string;
  modeKey: string;
  durationLabel: string;
  progressPercentage: number;
  status: ClassRoomProgressStatus;
  statusLabel: string;
  statusColor: "success" | "info" | "warning" | "default";
  href?: string | null;
}

export interface PhaseProgressSummary {
  progressPercentage: number;
  completedClassRooms: number;
  totalClassRooms: number;
}

export interface PhaseDetailData {
  phase: PhaseWithClassRooms;
  classRooms: PhaseClassRoomCardItem[];
  summary: PhaseProgressSummary;
}
