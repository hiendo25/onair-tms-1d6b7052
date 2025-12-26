/**
 * Lesson Progress Service
 *
 * Handles lesson progress tracking with direct database writes
 * Updates triggered on specific events: seek, pause, complete, close tab/browser
 */

import { getLessonProgress, upsertLessonProgress } from "@/repository/lesson-progress";
import type {
  MarkCompletedRequest,
  MarkCompletedResponse,
  UpdatePositionRequest,
  UpdatePositionResponse,
} from "@/types/dto/lesson-progress";

/**
 * Update video position
 *
 * Triggered on specific events: seek, pause, complete, close tab/browser
 * Writes directly to database without caching
 *
 * Note: If lesson is already completed, we don't change the status back to in_progress
 */
async function updatePosition(
  employeeId: string,
  request: UpdatePositionRequest
): Promise<UpdatePositionResponse> {
  const { lessonId, learningPathId, currentPositionSeconds, progressPercentage } = request;

  try {
    const now = new Date().toISOString();

    // Check if lesson is already completed
    const existingProgress = await getLessonProgress(
      employeeId,
      lessonId,
      learningPathId || null
    );

    // If already completed, don't change status back to in_progress
    const status = existingProgress?.status === "completed" ? "completed" : "in_progress";
    const completedAt = existingProgress?.status === "completed" ? existingProgress.completedAt : null;

    const progress = await upsertLessonProgress({
      employee_id: employeeId,
      lesson_id: lessonId,
      learning_path_id: learningPathId || null,
      current_position_seconds: currentPositionSeconds,
      progress_percentage: progressPercentage,
      status,
      started_at: existingProgress?.startedAt || now,
      completed_at: completedAt,
    });

    return {
      success: true,
      progress,
      persisted: true,
    };
  } catch (error) {
    console.error("[LessonProgress] Error updating position:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update video position"
    );
  }
}

/**
 * Mark lesson as completed
 *
 * Writes directly to database with status=completed and progress_percentage=100
 */
async function markCompleted(
  employeeId: string,
  request: MarkCompletedRequest
): Promise<MarkCompletedResponse> {
  const { lessonId, learningPathId, currentPositionSeconds = 0 } = request;

  try {
    const now = new Date().toISOString();

    // Get existing progress to preserve started_at if it exists
    const existingProgress = await getLessonProgress(
      employeeId,
      lessonId,
      learningPathId || null
    );

    const progress = await upsertLessonProgress({
      employee_id: employeeId,
      lesson_id: lessonId,
      learning_path_id: learningPathId || null,
      current_position_seconds: currentPositionSeconds,
      progress_percentage: 100,
      status: "completed",
      started_at: existingProgress?.startedAt || now,
      completed_at: now,
    });

    return {
      success: true,
      progress,
    };
  } catch (error) {
    console.error("[LessonProgress] Error marking completed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to mark lesson as completed"
    );
  }
}

export { updatePosition, markCompleted };
