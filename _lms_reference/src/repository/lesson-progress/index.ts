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
    classRoomId: row.class_room_id,
    currentPositionSeconds: row.current_position_seconds,
    progressPercentage: row.progress_percentage,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

/**
 * Get lesson progress for a specific employee/lesson/learning path/class room combination
 */
export async function getLessonProgress(
  employeeId: string,
  lessonId: string,
  learningPathId?: string | null,
  classRoomId?: string | null
): Promise<LessonProgress | null> {
  const supabase = await createSVClient();

  // Normalize IDs: undefined or empty string becomes null
  const normalizedLearningPathId: string | null = learningPathId || null;
  const normalizedClassRoomId: string | null = classRoomId || null;

  let query = supabase
    .from("lesson_progress")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("lesson_id", lessonId);

  // Apply filters based on context
  // Learning path takes precedence, then class room, then standalone
  if (normalizedLearningPathId) {
    query = query.eq("learning_path_id", normalizedLearningPathId);
    query = query.is("class_room_id", null);
  } else if (normalizedClassRoomId) {
    query = query.eq("class_room_id", normalizedClassRoomId);
    query = query.is("learning_path_id", null);
  } else {
    query = query.is("learning_path_id", null);
    query = query.is("class_room_id", null);
  }

  const { data, error } = await query.maybeSingle();

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
  class_room_id?: string | null;
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
    class_room_id: data.class_room_id || null,
    current_position_seconds: data.current_position_seconds || null,
    progress_percentage: data.progress_percentage || null,
    status: data.status || "in_progress",
    started_at: data.started_at || new Date().toISOString(),
    completed_at: data.completed_at || null,
  };

  // First, check if a record exists
  const existing = await getLessonProgress(
    data.employee_id,
    data.lesson_id,
    data.learning_path_id || null,
    data.class_room_id || null
  );

  if (existing) {
    // Update existing record
    const { data: result, error } = await supabase
      .from("lesson_progress")
      .update({
        current_position_seconds: upsertData.current_position_seconds,
        progress_percentage: upsertData.progress_percentage,
        status: upsertData.status,
        started_at: upsertData.started_at,
        completed_at: upsertData.completed_at,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("[LessonProgress] Error updating progress:", error);
      throw new Error(`Failed to update lesson progress: ${error.message}`);
    }

    return mapToResponse(result);
  } else {
    // Insert new record
    const { data: result, error } = await supabase
      .from("lesson_progress")
      .insert(upsertData)
      .select()
      .single();

    if (error) {
      console.error("[LessonProgress] Error inserting progress:", error);
      throw new Error(`Failed to insert lesson progress: ${error.message}`);
    }

    return mapToResponse(result);
  }
}

/**
 * Get completed lessons for an employee in a specific context (class-room or standalone)
 */
export async function getCompletedLessonsForEmployee(
  employeeId: string,
  lessonIds: string[],
  classRoomId?: string | null
) {
  const supabase = await createSVClient();

  let query = supabase
    .from("lesson_progress")
    .select("lesson_id")
    .in("lesson_id", lessonIds)
    .eq("employee_id", employeeId)
    .is("learning_path_id", null)
    .eq("status", "completed");

  // Filter by class_room_id if provided
  if (classRoomId) {
    query = query.eq("class_room_id", classRoomId);
  } else {
    query = query.is("class_room_id", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[LessonProgress] Error fetching completed lessons:", error);
    throw new Error(`Failed to fetch completed lessons: ${error.message}`);
  }

  return data || [];
}
