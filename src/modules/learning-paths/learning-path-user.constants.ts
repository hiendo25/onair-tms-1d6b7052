export const PROGRESS_COMPLETED_PERCENT = 100;
export const PROGRESS_EMPTY_PERCENT = 0;
export const DEFAULT_COUNT = 0;
export const DEFAULT_ORDER_INDEX = 0;

export const PHASE_STATUS = {
  COMPLETED: "completed",
  ACTIVE: "active",
  LOCKED: "locked",
} as const;

export type PhaseStatus = (typeof PHASE_STATUS)[keyof typeof PHASE_STATUS];

export const CLASSROOM_PROGRESS_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  NOT_STARTED: "not_started",
} as const;

export type ClassRoomProgressStatus =
  (typeof CLASSROOM_PROGRESS_STATUS)[keyof typeof CLASSROOM_PROGRESS_STATUS];
