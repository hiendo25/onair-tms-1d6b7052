/**
 * Reusable service functions for calculating learning progress at different levels
 */

import { createSVClient } from "@/services/supabase/server";
import type { BuildProgressParams, LessonProgressRecord, ProgressResponse } from "@/types/progress.types";

/**
 * Calculate progress percentage based on completed vs total lessons
 */
export function calculateProgressPercentage(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) {
    return 0;
  }
  return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Get the current learning path ID for an employee
 * Falls back to the most recent learning path if not provided
 */
export async function resolveLearningPathId(
  employeeId: string,
  providedLearningPathId?: string | null,
): Promise<string | null> {
  // If learningPathId is provided, use it
  if (providedLearningPathId) {
    return providedLearningPathId;
  }

  // Otherwise, get the most recent learning path for this employee
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("employee_learning_paths")
    .select("learning_path_id")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.learning_path_id;
}

/**
 * Get lesson progress records for specific lessons
 */
export async function getLessonProgressRecords(
  lessonIds: string[],
  employeeId: string,
  learningPathId: string | null,
): Promise<LessonProgressRecord[]> {
  if (lessonIds.length === 0) {
    return [];
  }

  const supabase = await createSVClient();

  let query = supabase
    .from("lesson_progress")
    .select("*")
    .eq("employee_id", employeeId)
    .in("lesson_id", lessonIds);

  // Filter by learning path if provided
  if (learningPathId) {
    query = query.eq("learning_path_id", learningPathId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching lesson progress:", error);
    return [];
  }

  return (data as LessonProgressRecord[]) || [];
}

/**
 * Count completed lessons from progress records
 */
export function countCompletedLessons(progressRecords: LessonProgressRecord[]): number {
  return progressRecords.filter((record) => record.status === "completed").length;
}

/**
 * Build a standard progress response
 */
export function buildProgressResponse(params: BuildProgressParams): ProgressResponse {
  const { entityId, entityType, totalLessons, completedLessons, learningPathId, employeeId } = params;

  return {
    entityId,
    entityType,
    totalLessons,
    completedLessons,
    progressPercentage: calculateProgressPercentage(completedLessons, totalLessons),
    learningPathId,
    employeeId,
  };
}

/**
 * Get all lesson IDs for a specific section
 */
export async function getLessonIdsForSection(sectionId: string): Promise<string[]> {
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("section_id", sectionId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching lessons for section:", error);
    return [];
  }

  return data?.map((lesson: { id: string }) => lesson.id) || [];
}

/**
 * Get all lesson IDs for a specific course
 */
export async function getLessonIdsForCourse(courseId: string): Promise<string[]> {
  const supabase = await createSVClient();
  const { data, error } = await supabase
    .from("sections")
    .select("id")
    .eq("course_id", courseId)
    .eq("status", "active");

  if (error || !data) {
    console.error("Error fetching sections for course:", error);
    return [];
  }

  const sectionIds = data.map((section: { id: string }) => section.id);
  if (sectionIds.length === 0) {
    return [];
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .in("section_id", sectionIds)
    .eq("status", "active");

  if (lessonsError) {
    console.error("Error fetching lessons for course:", lessonsError);
    return [];
  }

  return lessons?.map((lesson) => lesson.id) || [];
}

/**
 * Get all lesson IDs for a specific class room
 * Flow: class_rooms -> class_sessions -> class_sessions_courses_period -> courses -> sections -> lessons
 */
export async function getLessonIdsForClassRoom(classRoomId: string): Promise<string[]> {
  const supabase = await createSVClient();

  // Step 1: Get all class sessions for this class room
  const { data: classSessions, error: sessionsError } = await supabase
    .from("class_sessions")
    .select("id")
    .eq("class_room_id", classRoomId);

  if (sessionsError || !classSessions || classSessions.length === 0) {
    console.error("Error fetching class sessions:", sessionsError);
    return [];
  }

  const classSessionIds = classSessions.map((session: { id: string }) => session.id);

  // Step 2: Get all courses linked to these class sessions via junction table
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions_courses_period")
    .select("course_id")
    .in("class_session_id", classSessionIds);

  if (coursesError || !sessionCourses || sessionCourses.length === 0) {
    console.error("Error fetching session courses:", coursesError);
    return [];
  }

  // Get unique course IDs
  const courseIds = Array.from(
    new Set(sessionCourses.map((sc: { course_id: string }) => sc.course_id))
  );

  // Step 3: Get all lessons for all courses
  const allLessonIds: string[] = [];
  for (const courseId of courseIds) {
    const lessonIds = await getLessonIdsForCourse(courseId);
    allLessonIds.push(...lessonIds);
  }

  // Remove duplicates (in case multiple courses share lessons)
  return Array.from(new Set(allLessonIds));
}

/**
 * Get all lesson IDs for a specific phase
 */
export async function getLessonIdsForPhase(phaseId: string): Promise<string[]> {
  const supabase = await createSVClient();

  // Get all class rooms in this phase
  const { data: phaseClassRooms, error } = await supabase
    .from("phase_class_rooms")
    .select("class_room_id")
    .eq("phase_id", phaseId);

  if (error || !phaseClassRooms) {
    console.error("Error fetching phase class rooms:", error);
    return [];
  }

  const classRoomIds = phaseClassRooms.map((pc: { class_room_id: string }) => pc.class_room_id);
  if (classRoomIds.length === 0) {
    return [];
  }

  // Get all lessons for all class rooms in this phase
  const allLessonIds: string[] = [];
  for (const classRoomId of classRoomIds) {
    const lessonIds = await getLessonIdsForClassRoom(classRoomId);
    allLessonIds.push(...lessonIds);
  }

  // Remove duplicates
  return Array.from(new Set(allLessonIds));
}

/**
 * Get all lesson IDs for a specific learning path
 */
export async function getLessonIdsForLearningPath(learningPathId: string): Promise<string[]> {
  const supabase = await createSVClient();

  // Get all phases in this learning path
  const { data: phases, error } = await supabase
    .from("learning_path_phases")
    .select("id")
    .eq("learning_path_id", learningPathId);

  if (error || !phases) {
    console.error("Error fetching phases for learning path:", error);
    return [];
  }

  const phaseIds = phases.map((phase: { id: string }) => phase.id);
  if (phaseIds.length === 0) {
    return [];
  }

  // Get all lessons for all phases in this learning path
  const allLessonIds: string[] = [];
  for (const phaseId of phaseIds) {
    const lessonIds = await getLessonIdsForPhase(phaseId);
    allLessonIds.push(...lessonIds);
  }

  // Remove duplicates
  return Array.from(new Set(allLessonIds));
}
