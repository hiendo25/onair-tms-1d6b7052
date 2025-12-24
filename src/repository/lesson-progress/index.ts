/**
 * Lesson Progress Repository
 * Database operations for lesson progress tracking
 */

import { createSVClient } from "@/services";
import type { LessonProgress, LessonProgressStatus } from "@/types/dto/lesson-progress";
import type { Database } from "@/types/supabase.types";

type LessonProgressRow = Database["public"]["Tables"]["lesson_progress"]["Row"];
type LessonProgressInsert = Database["public"]["Tables"]["lesson_progress"]["Insert"];

/**
 * Convert database row to response format
 */
function mapToResponse(row: LessonProgressRow): LessonProgress {
  return {
    id: row.id,
    employeeId: row.employee_id,
    lessonId: row.lesson_id,
    learningPathId: row.learning_path_id,
    currentPositionSeconds: row.current_position_seconds,
    progressPercentage: row.progress_percentage,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Get lesson progress for a specific employee/lesson/learning path combination
 */
export async function getLessonProgress(
  employeeId: string,
  lessonId: string,
  learningPathId?: string | null
): Promise<LessonProgress | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("lesson_id", lessonId)
    .eq("learning_path_id", learningPathId || null)
    .maybeSingle();

  if (error) {
    console.error("[LessonProgress] Error fetching progress:", error);
    throw new Error(`Failed to fetch lesson progress: ${error.message}`);
  }

  return data ? mapToResponse(data) : null;
}

/**
 * Upsert lesson progress (create or update)
 */
export async function upsertLessonProgress(data: {
  employee_id: string;
  lesson_id: string;
  learning_path_id?: string | null;
  current_position_seconds?: number | null;
  progress_percentage?: number | null;
  status?: LessonProgressStatus;
  started_at?: string | null;
  completed_at?: string | null;
}): Promise<LessonProgress> {
  const supabase = await createSVClient();

  const upsertData: LessonProgressInsert = {
    employee_id: data.employee_id,
    lesson_id: data.lesson_id,
    learning_path_id: data.learning_path_id || null,
    current_position_seconds: data.current_position_seconds || null,
    progress_percentage: data.progress_percentage || null,
    status: data.status || "in_progress",
    started_at: data.started_at || new Date().toISOString(),
    completed_at: data.completed_at || null,
  };

  const { data: result, error } = await supabase
    .from("lesson_progress")
    .upsert(upsertData, {
      onConflict: "employee_id,lesson_id,learning_path_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[LessonProgress] Error upserting progress:", error);
    throw new Error(`Failed to upsert lesson progress: ${error.message}`);
  }

  return mapToResponse(result);
}
