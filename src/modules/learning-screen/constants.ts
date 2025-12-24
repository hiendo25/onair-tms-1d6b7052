import type { LessonProgressStatus } from "@/modules/learning-screen/types";

export const LEARNING_SCREEN_ROUTE_PREFIX = {
  LEARNING_PATH: "/learning-path/learning-screen",
} as const;

export const LESSON_PROGRESS_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export const LESSON_PROGRESS_STATUS_WEIGHT: Record<LessonProgressStatus, number> = {
  [LESSON_PROGRESS_STATUS.NOT_STARTED]: 0,
  [LESSON_PROGRESS_STATUS.IN_PROGRESS]: 0.5,
  [LESSON_PROGRESS_STATUS.COMPLETED]: 1,
};

export const SECTION_PROGRESS_MIN_PERCENT = 0;
export const SECTION_PROGRESS_MAX_PERCENT = 100;
