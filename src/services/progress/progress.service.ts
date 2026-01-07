/**
 * Optimized progress calculation service using SQL JOINs
 * Replaces N+1 query pattern with single-query approach for better performance
 */

import { createSVClient } from "@/services/supabase/server";
import type { BuildProgressParams, LessonProgressResponse, LessonProgressStatus, ProgressResponse } from "@/types/progress.types";

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
  if (providedLearningPathId) {
    return providedLearningPathId;
  }

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
 * Get progress for a section (optimized single query)
 */
export async function getSectionProgress(
  sectionId: string,
  employeeId: string,
  learningPathId: string | null,
): Promise<{ totalLessons: number; completedLessons: number }> {
  const supabase = await createSVClient();

  // Get all lesson IDs for the section
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("section_id", sectionId)
    .eq("status", "active");

  if (lessonsError || !lessons) {
    console.error("Error fetching lessons:", lessonsError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  const lessonIds = lessons.map((l: { id: string }) => l.id);
  const totalLessons = lessonIds.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get completed lessons count
  let progressQuery = supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .in("lesson_id", lessonIds);

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  }

  const { count, error: progressError } = await progressQuery;

  if (progressError) {
    console.error("Error fetching progress:", progressError);
    return { totalLessons, completedLessons: 0 };
  }

  return { totalLessons, completedLessons: count || 0 };
}

/**
 * Get progress for a course (optimized - single query using JOINs)
 */
export async function getCourseProgress(
  courseId: string,
  employeeId: string,
  learningPathId: string | null,
): Promise<{ totalLessons: number; completedLessons: number }> {
  const supabase = await createSVClient();

  // Get all lessons for the course in one query using JOIN
  const { data: lessons, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      lessons!inner(id)
    `)
    .eq("course_id", courseId)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !lessons) {
    console.error("Error fetching course lessons:", lessonsError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Flatten lesson IDs
  const lessonIds = lessons.flatMap((section: any) =>
    section.lessons?.map((l: { id: string }) => l.id) || []
  );

  // Remove duplicates
  const uniqueLessonIds = Array.from(new Set(lessonIds));
  const totalLessons = uniqueLessonIds.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get completed lessons count
  let progressQuery = supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .in("lesson_id", uniqueLessonIds);

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  }

  const { count, error: progressError } = await progressQuery;

  if (progressError) {
    console.error("Error fetching course progress:", progressError);
    return { totalLessons, completedLessons: 0 };
  }

  return { totalLessons, completedLessons: count || 0 };
}

/**
 * Get progress for a class room (optimized)
 * Flow: class_rooms -> class_sessions -> class_sessions_courses_period -> courses -> sections -> lessons
 */
export async function getClassRoomProgress(
  classRoomId: string,
  employeeId: string,
  learningPathId: string | null,
): Promise<{ totalLessons: number; completedLessons: number }> {
  const supabase = await createSVClient();

  // Single query to get all lessons using JOINs
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select(`
      class_sessions_courses_period!inner(
        course_id
      )
    `)
    .eq("class_room_id", classRoomId);

  if (coursesError || !sessionCourses) {
    console.error("Error fetching class room courses:", coursesError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get unique course IDs
  const courseIds = Array.from(
    new Set(
      sessionCourses.flatMap((session: any) =>
        session.class_sessions_courses_period?.map((scp: any) => scp.course_id) || []
      )
    )
  );

  if (courseIds.length === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get all lessons for all courses in one query
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      lessons!inner(id)
    `)
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching class room lessons:", lessonsError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Flatten and deduplicate lesson IDs
  const lessonIds = sections.flatMap((section: any) =>
    section.lessons?.map((l: { id: string }) => l.id) || []
  );
  const uniqueLessonIds = Array.from(new Set(lessonIds));
  const totalLessons = uniqueLessonIds.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get completed lessons count
  let progressQuery = supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .in("lesson_id", uniqueLessonIds);

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  }

  const { count, error: progressError } = await progressQuery;

  if (progressError) {
    console.error("Error fetching class room progress:", progressError);
    return { totalLessons, completedLessons: 0 };
  }

  return { totalLessons, completedLessons: count || 0 };
}

/**
 * Get progress for a phase (optimized)
 */
export async function getPhaseProgress(
  phaseId: string,
  employeeId: string,
  learningPathId: string,
): Promise<{ totalLessons: number; completedLessons: number }> {
  const supabase = await createSVClient();

  // Get all class rooms for this phase
  const { data: phaseClassRooms, error: pcError } = await supabase
    .from("phase_class_rooms")
    .select("class_room_id")
    .eq("phase_id", phaseId);

  if (pcError || !phaseClassRooms || phaseClassRooms.length === 0) {
    console.error("Error fetching phase class rooms:", pcError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  const classRoomIds = phaseClassRooms.map((pc: { class_room_id: string }) => pc.class_room_id);

  // Get all courses for all class rooms in one query
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select(`
      class_sessions_courses_period!inner(
        course_id
      )
    `)
    .in("class_room_id", classRoomIds);

  if (coursesError || !sessionCourses) {
    console.error("Error fetching phase courses:", coursesError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get unique course IDs
  const courseIds = Array.from(
    new Set(
      sessionCourses.flatMap((session: any) =>
        session.class_sessions_courses_period?.map((scp: any) => scp.course_id) || []
      )
    )
  );

  if (courseIds.length === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get all lessons for all courses
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      lessons!inner(id)
    `)
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching phase lessons:", lessonsError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Flatten and deduplicate lesson IDs
  const lessonIds = sections.flatMap((section: any) =>
    section.lessons?.map((l: { id: string }) => l.id) || []
  );
  const uniqueLessonIds = Array.from(new Set(lessonIds));
  const totalLessons = uniqueLessonIds.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get completed lessons count
  const { count, error: progressError } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .eq("learning_path_id", learningPathId)
    .in("lesson_id", uniqueLessonIds);

  if (progressError) {
    console.error("Error fetching phase progress:", progressError);
    return { totalLessons, completedLessons: 0 };
  }

  return { totalLessons, completedLessons: count || 0 };
}

/**
 * Get all lesson IDs for a learning path (structure only, no employee data)
 * This is used for batch progress calculations
 */
export async function getLearningPathLessonIds(
  learningPathId: string,
): Promise<string[]> {
  const supabase = await createSVClient();

  // Get all phases for this learning path
  const { data: phases, error: phasesError } = await supabase
    .from("learning_path_phases")
    .select("id")
    .eq("learning_path_id", learningPathId);

  if (phasesError || !phases || phases.length === 0) {
    console.error("Error fetching learning path phases:", phasesError);
    return [];
  }

  const phaseIds = phases.map((p: { id: string }) => p.id);

  // Get all class rooms for all phases
  const { data: phaseClassRooms, error: pcError } = await supabase
    .from("phase_class_rooms")
    .select("class_room_id")
    .in("phase_id", phaseIds);

  if (pcError || !phaseClassRooms || phaseClassRooms.length === 0) {
    console.error("Error fetching learning path class rooms:", pcError);
    return [];
  }

  const classRoomIds = phaseClassRooms.map((pc: { class_room_id: string }) => pc.class_room_id);

  // Get all courses for all class rooms
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select(`
      class_sessions_courses_period!inner(
        course_id
      )
    `)
    .in("class_room_id", classRoomIds);

  if (coursesError || !sessionCourses) {
    console.error("Error fetching learning path courses:", coursesError);
    return [];
  }

  // Get unique course IDs
  const courseIds = Array.from(
    new Set(
      sessionCourses.flatMap((session: any) =>
        session.class_sessions_courses_period?.map((scp: any) => scp.course_id) || []
      )
    )
  );

  if (courseIds.length === 0) {
    return [];
  }

  // Get all lessons for all courses
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      lessons!inner(id)
    `)
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching learning path lessons:", lessonsError);
    return [];
  }

  // Flatten and deduplicate lesson IDs
  const lessonIds = sections.flatMap((section: any) =>
    section.lessons?.map((l: { id: string }) => l.id) || []
  );
  const uniqueLessonIds = Array.from(new Set(lessonIds));

  return uniqueLessonIds;
}

/**
 * Get progress for a learning path (optimized)
 */
export async function getLearningPathProgress(
  learningPathId: string,
  employeeId: string,
): Promise<{ totalLessons: number; completedLessons: number }> {
  const supabase = await createSVClient();

  // Get all phases for this learning path
  const { data: phases, error: phasesError } = await supabase
    .from("learning_path_phases")
    .select("id")
    .eq("learning_path_id", learningPathId);

  if (phasesError || !phases || phases.length === 0) {
    console.error("Error fetching learning path phases:", phasesError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  const phaseIds = phases.map((p: { id: string }) => p.id);

  // Get all class rooms for all phases
  const { data: phaseClassRooms, error: pcError } = await supabase
    .from("phase_class_rooms")
    .select("class_room_id")
    .in("phase_id", phaseIds);

  if (pcError || !phaseClassRooms || phaseClassRooms.length === 0) {
    console.error("Error fetching learning path class rooms:", pcError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  const classRoomIds = phaseClassRooms.map((pc: { class_room_id: string }) => pc.class_room_id);

  // Get all courses for all class rooms
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select(`
      class_sessions_courses_period!inner(
        course_id
      )
    `)
    .in("class_room_id", classRoomIds);

  if (coursesError || !sessionCourses) {
    console.error("Error fetching learning path courses:", coursesError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get unique course IDs
  const courseIds = Array.from(
    new Set(
      sessionCourses.flatMap((session: any) =>
        session.class_sessions_courses_period?.map((scp: any) => scp.course_id) || []
      )
    )
  );

  if (courseIds.length === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get all lessons for all courses
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      lessons!inner(id)
    `)
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching learning path lessons:", lessonsError);
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Flatten and deduplicate lesson IDs
  const lessonIds = sections.flatMap((section: any) =>
    section.lessons?.map((l: { id: string }) => l.id) || []
  );
  const uniqueLessonIds = Array.from(new Set(lessonIds));
  const totalLessons = uniqueLessonIds.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0 };
  }

  // Get completed lessons count
  const { count, error: progressError } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .eq("learning_path_id", learningPathId)
    .in("lesson_id", uniqueLessonIds);

  if (progressError) {
    console.error("Error fetching learning path progress:", progressError);
    return { totalLessons, completedLessons: 0 };
  }

  return { totalLessons, completedLessons: count || 0 };
}

/**
 * Get progress for multiple courses in parallel (optimized batch query)
 */
export async function getMultipleCoursesProgress(
  courseIds: string[],
  employeeId: string,
  learningPathId: string | null,
): Promise<Map<string, { totalLessons: number; completedLessons: number }>> {
  const supabase = await createSVClient();
  const progressMap = new Map<string, { totalLessons: number; completedLessons: number }>();

  if (courseIds.length === 0) {
    return progressMap;
  }

  // Get all lessons for all courses in one query
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      course_id,
      lessons!inner(id)
    `)
    .in("course_id", courseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching course lessons:", lessonsError);
    // Return zeros for all courses
    courseIds.forEach((courseId) => {
      progressMap.set(courseId, { totalLessons: 0, completedLessons: 0 });
    });
    return progressMap;
  }

  // Map courses to their lesson IDs
  const courseToLessons = new Map<string, Set<string>>();
  sections.forEach((section: any) => {
    if (!courseToLessons.has(section.course_id)) {
      courseToLessons.set(section.course_id, new Set());
    }
    section.lessons?.forEach((l: { id: string }) => {
      courseToLessons.get(section.course_id)!.add(l.id);
    });
  });

  // Initialize progress map with total lesson counts
  courseIds.forEach((courseId) => {
    const lessonIds = courseToLessons.get(courseId);
    progressMap.set(courseId, {
      totalLessons: lessonIds ? lessonIds.size : 0,
      completedLessons: 0, // Will be calculated next
    });
  });

  // Get all unique lesson IDs across all courses
  const allLessonIds = Array.from(
    new Set(
      Array.from(courseToLessons.values()).flatMap((lessons) => Array.from(lessons))
    )
  );

  if (allLessonIds.length === 0) {
    return progressMap;
  }

  // Get all progress records in one query
  let progressQuery = supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .in("lesson_id", allLessonIds);

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  }

  const { data: progressRecords, error: progressError } = await progressQuery;

  if (progressError) {
    console.error("Error fetching progress records:", progressError);
    return progressMap;
  }

  // Create a set of completed lesson IDs for quick lookup
  const completedLessonIds = new Set(
    progressRecords?.map((p: { lesson_id: string }) => p.lesson_id) || []
  );

  // Update completed counts for each course
  courseIds.forEach((courseId) => {
    const courseLessonIds = courseToLessons.get(courseId);
    if (!courseLessonIds) {
      return;
    }

    const completedCount = Array.from(courseLessonIds).filter((lessonId) =>
      completedLessonIds.has(lessonId)
    ).length;

    const existing = progressMap.get(courseId)!;
    progressMap.set(courseId, {
      totalLessons: existing.totalLessons,
      completedLessons: completedCount,
    });
  });

  return progressMap;
}

/**
 * Get progress for multiple phases in parallel (optimized for /learning-paths/[id]/phases/progress)
 */
export async function getMultiplePhasesProgress(
  phaseIds: string[],
  employeeId: string,
  learningPathId: string,
): Promise<Map<string, { totalLessons: number; completedLessons: number }>> {
  const supabase = await createSVClient();
  const progressMap = new Map<string, { totalLessons: number; completedLessons: number }>();

  if (phaseIds.length === 0) {
    return progressMap;
  }

  // Get all class rooms for all phases in one query
  const { data: phaseClassRooms, error: pcError } = await supabase
    .from("phase_class_rooms")
    .select("phase_id, class_room_id")
    .in("phase_id", phaseIds);

  if (pcError || !phaseClassRooms) {
    console.error("Error fetching phase class rooms:", pcError);
    return progressMap;
  }

  // Group class rooms by phase
  const phaseToClassRooms = new Map<string, string[]>();
  phaseClassRooms.forEach((pc: { phase_id: string; class_room_id: string }) => {
    if (!phaseToClassRooms.has(pc.phase_id)) {
      phaseToClassRooms.set(pc.phase_id, []);
    }
    phaseToClassRooms.get(pc.phase_id)!.push(pc.class_room_id);
  });

  // Get all class room IDs
  const allClassRoomIds = Array.from(new Set(phaseClassRooms.map((pc: any) => pc.class_room_id)));

  if (allClassRoomIds.length === 0) {
    // No class rooms, return zeros for all phases
    phaseIds.forEach((phaseId) => {
      progressMap.set(phaseId, { totalLessons: 0, completedLessons: 0 });
    });
    return progressMap;
  }

  // Get all courses for all class rooms in one query
  const { data: sessionCourses, error: coursesError } = await supabase
    .from("class_sessions")
    .select(`
      class_room_id,
      class_sessions_courses_period!inner(
        course_id
      )
    `)
    .in("class_room_id", allClassRoomIds);

  if (coursesError || !sessionCourses) {
    console.error("Error fetching courses:", coursesError);
    return progressMap;
  }

  // Map class rooms to courses
  const classRoomToCourses = new Map<string, Set<string>>();
  sessionCourses.forEach((session: any) => {
    if (!classRoomToCourses.has(session.class_room_id)) {
      classRoomToCourses.set(session.class_room_id, new Set());
    }
    session.class_sessions_courses_period?.forEach((scp: any) => {
      classRoomToCourses.get(session.class_room_id)!.add(scp.course_id);
    });
  });

  // Get all unique course IDs
  const allCourseIds = Array.from(
    new Set(
      Array.from(classRoomToCourses.values()).flatMap((courses) => Array.from(courses))
    )
  );

  if (allCourseIds.length === 0) {
    phaseIds.forEach((phaseId) => {
      progressMap.set(phaseId, { totalLessons: 0, completedLessons: 0 });
    });
    return progressMap;
  }

  // Get all lessons for all courses in one query
  const { data: sections, error: lessonsError } = await supabase
    .from("sections")
    .select(`
      course_id,
      lessons!inner(id)
    `)
    .in("course_id", allCourseIds)
    .eq("status", "active")
    .eq("lessons.status", "active");

  if (lessonsError || !sections) {
    console.error("Error fetching lessons:", lessonsError);
    return progressMap;
  }

  // Map courses to lessons
  const courseToLessons = new Map<string, Set<string>>();
  sections.forEach((section: any) => {
    if (!courseToLessons.has(section.course_id)) {
      courseToLessons.set(section.course_id, new Set());
    }
    section.lessons?.forEach((l: { id: string }) => {
      courseToLessons.get(section.course_id)!.add(l.id);
    });
  });

  // Calculate lessons for each phase
  phaseIds.forEach((phaseId) => {
    const classRoomIds = phaseToClassRooms.get(phaseId) || [];
    const lessonIds = new Set<string>();

    classRoomIds.forEach((classRoomId) => {
      const courseIds = classRoomToCourses.get(classRoomId);
      if (courseIds) {
        courseIds.forEach((courseId) => {
          const lessons = courseToLessons.get(courseId);
          if (lessons) {
            lessons.forEach((lessonId) => lessonIds.add(lessonId));
          }
        });
      }
    });

    progressMap.set(phaseId, {
      totalLessons: lessonIds.size,
      completedLessons: 0, // Will be calculated next
    });
  });

  // Get all unique lesson IDs across all phases
  const allLessonIds = Array.from(
    new Set(
      Array.from(progressMap.values()).flatMap(() => {
        const lessonIds = new Set<string>();
        phaseIds.forEach((phaseId) => {
          const classRoomIds = phaseToClassRooms.get(phaseId) || [];
          classRoomIds.forEach((classRoomId) => {
            const courseIds = classRoomToCourses.get(classRoomId);
            if (courseIds) {
              courseIds.forEach((courseId) => {
                const lessons = courseToLessons.get(courseId);
                if (lessons) {
                  lessons.forEach((lessonId) => lessonIds.add(lessonId));
                }
              });
            }
          });
        });
        return Array.from(lessonIds);
      })
    )
  );

  if (allLessonIds.length === 0) {
    return progressMap;
  }

  // Get all progress records in one query
  const { data: progressRecords, error: progressError } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("employee_id", employeeId)
    .eq("status", "completed")
    .eq("learning_path_id", learningPathId)
    .in("lesson_id", allLessonIds);

  if (progressError) {
    console.error("Error fetching progress records:", progressError);
    return progressMap;
  }

  // Create a set of completed lesson IDs for quick lookup
  const completedLessonIds = new Set(
    progressRecords?.map((p: { lesson_id: string }) => p.lesson_id) || []
  );

  // Update completed counts for each phase
  phaseIds.forEach((phaseId) => {
    const classRoomIds = phaseToClassRooms.get(phaseId) || [];
    const phaseLessonIds = new Set<string>();

    classRoomIds.forEach((classRoomId) => {
      const courseIds = classRoomToCourses.get(classRoomId);
      if (courseIds) {
        courseIds.forEach((courseId) => {
          const lessons = courseToLessons.get(courseId);
          if (lessons) {
            lessons.forEach((lessonId) => phaseLessonIds.add(lessonId));
          }
        });
      }
    });

    const completedCount = Array.from(phaseLessonIds).filter((lessonId) =>
      completedLessonIds.has(lessonId)
    ).length;

    const existing = progressMap.get(phaseId)!;
    progressMap.set(phaseId, {
      totalLessons: existing.totalLessons,
      completedLessons: completedCount,
    });
  });

  return progressMap;
}

/**
 * Get progress for a single lesson
 * For lessons: totalLessons is always 1, completedLessons is 1 if status is "completed", 0 otherwise
 */
export async function getLessonProgress(
  lessonId: string,
  employeeId: string,
  learningPathId: string | null,
): Promise<LessonProgressResponse> {
  const supabase = await createSVClient();

  // Check if lesson exists and is active
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .eq("status", "active")
    .maybeSingle();

  if (lessonError) {
    console.error("Error fetching lesson:", lessonError);
    throw new Error(`Failed to fetch lesson: ${lessonError.message}`);
  }

  if (!lesson) {
    throw new Error("Lesson not found or inactive");
  }

  // Get lesson progress record
  let progressQuery = supabase
    .from("lesson_progress")
    .select("status, current_position_seconds")
    .eq("employee_id", employeeId)
    .eq("lesson_id", lessonId);

  if (learningPathId) {
    progressQuery = progressQuery.eq("learning_path_id", learningPathId);
  } else {
    progressQuery = progressQuery.is("learning_path_id", null);
  }

  const { data: progress, error: progressError } = await progressQuery.maybeSingle();

  if (progressError) {
    console.error("Error fetching lesson progress:", progressError);
    throw new Error(`Failed to fetch lesson progress: ${progressError.message}`);
  }

  // For a single lesson: totalLessons = 1, completedLessons = 1 if completed, 0 otherwise
  const isCompleted = progress?.status === "completed";
  const totalLessons = 1;
  const completedLessons = isCompleted ? 1 : 0;
  const currentPositionSeconds = progress?.current_position_seconds || null;

  return {
    entityId: lessonId,
    entityType: "lesson" as const,
    totalLessons,
    completedLessons,
    progressPercentage: calculateProgressPercentage(completedLessons, totalLessons),
    learningPathId,
    employeeId,
    currentPositionSeconds,
  };
}
