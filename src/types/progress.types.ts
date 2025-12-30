/**
 * Shared types for learning progress tracking across different levels
 */

import { Database } from "@/types/supabase.types";

/**
 * Base progress response structure
 */
export interface ProgressResponse {
  /** The ID of the entity (learning path, phase, class room, course, or section) */
  entityId: string;
  /** The type of entity this progress belongs to */
  entityType: "learning_path" | "phase" | "class_room" | "course" | "section";
  /** Total number of lessons in this entity */
  totalLessons: number;
  /** Number of completed lessons */
  completedLessons: number;
  /** Progress percentage (0-100) */
  progressPercentage: number;
  /** The learning path ID this progress is associated with */
  learningPathId: string | null;
  /** The employee ID this progress is for */
  employeeId: string;
}

/**
 * Input parameters for building a progress response
 * Excludes progressPercentage as it's calculated
 */
export type BuildProgressParams = Omit<ProgressResponse, "progressPercentage">;

/**
 * Lesson progress status from database
 */
export type LessonProgressStatus = Database["public"]["Enums"]["lesson_progress_status"];

/**
 * Lesson progress record from database
 */
export interface LessonProgressRecord {
  id: string;
  lesson_id: string;
  employee_id: string;
  learning_path_id: string | null;
  status: LessonProgressStatus;
  progress_percentage: number | null;
  current_position_seconds: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
