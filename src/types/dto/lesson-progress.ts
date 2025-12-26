/**
 * Lesson Progress DTOs
 * Types for lesson progress tracking API
 */

import type { Database } from "@/types/supabase.types";

export type LessonProgressStatus = Database["public"]["Enums"]["lesson_progress_status"];

/**
 * Request: Update video position
 * Triggered on specific events: seek, pause, close tab/browser
 */
export interface UpdatePositionRequest {
  lessonId: string;
  learningPathId?: string | null;
  currentPositionSeconds: number;
  progressPercentage: number;
}

/**
 * Request: Mark lesson as completed
 */
export interface MarkCompletedRequest {
  lessonId: string;
  learningPathId?: string | null;
  currentPositionSeconds?: number;
}

/**
 * Response: Lesson progress data
 */
export interface LessonProgress {
  id: string;
  employeeId: string;
  lessonId: string;
  learningPathId: string | null;
  currentPositionSeconds: number | null;
  progressPercentage: number | null;
  status: LessonProgressStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

/**
 * Response: Update position result
 */
export interface UpdatePositionResponse {
  success: boolean;
  progress: LessonProgress;
  persisted: boolean;
}

/**
 * Response: Mark completed result
 */
export interface MarkCompletedResponse {
  success: boolean;
  progress: LessonProgress;
}
