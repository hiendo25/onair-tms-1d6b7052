import {
  buildProgressResponse,
  calculateProgressPercentage,
  getMultipleCoursesProgress,
  resolveLearningPathId,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";
import type { ClassRoomProgressWithRelations } from "@/types/progress.types";

// Database response types
interface ClassSessionRecord {
  id: string;
  start_at: string | null;
}

interface SessionCourseRecord {
  class_session_id: string;
  course_id: string;
}

interface GetClassRoomProgressWithRelationsParams {
  classRoomId: string;
  employeeId: string;
  learningPathId?: string | null;
}

export async function getClassRoomProgressWithRelations(
  params: GetClassRoomProgressWithRelationsParams,
): Promise<ClassRoomProgressWithRelations> {
  const { classRoomId, employeeId, learningPathId: providedLearningPathId } = params;
  if (!classRoomId) {
    throw new Error("Class room ID is required");
  }
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }
  const learningPathId = await resolveLearningPathId(employeeId, providedLearningPathId ?? null);
  const supabase = await createSVClient();

  // Step 1: Fetch all class sessions for this class room
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("class_sessions")
    .select("id, start_at")
    .eq("class_room_id", classRoomId)
    .order("start_at", { ascending: true });

  const sessions = sessionsData as ClassSessionRecord[] | null;

  if (sessionsError) {
    console.error("[Service] Error fetching class sessions:", sessionsError);
    throw new Error("Failed to fetch class sessions");
  }

  if (!sessions || sessions.length === 0) {
    return {
      entityId: classRoomId,
      entityType: "class_room",
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      learningPathId,
      employeeId,
      class_sessions: [],
    };
  }

  const sessionIds = sessions.map((session) => session.id);

  // Step 2: Fetch all courses linked to these sessions
  const { data: sessionCoursesData, error: sessionCoursesError } = await supabase
    .from("class_sessions_courses_period")
    .select("class_session_id, course_id")
    .in("class_session_id", sessionIds);

  const sessionCourses = sessionCoursesData as SessionCourseRecord[] | null;

  if (sessionCoursesError) {
    console.error("[Service] Error fetching session courses:", sessionCoursesError);
    throw new Error("Failed to fetch session courses");
  }

  if (!sessionCourses || sessionCourses.length === 0) {
    const sessionsWithProgress = sessions.map((session) => ({
      entityId: session.id,
      entityType: "class_session" as const,
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      learningPathId,
      employeeId,
      courses: [],
    }));

    return {
      entityId: classRoomId,
      entityType: "class_room",
      totalLessons: 0,
      completedLessons: 0,
      progressPercentage: 0,
      learningPathId,
      employeeId,
      class_sessions: sessionsWithProgress,
    };
  }

  // Step 3: Get unique course IDs and batch fetch progress
  const uniqueCourseIds = Array.from(new Set(sessionCourses.map((sc) => sc.course_id)));

  const courseProgressMap = await getMultipleCoursesProgress(
    uniqueCourseIds,
    employeeId,
    learningPathId,
  );

  // Step 4: Group courses by session
  const coursesBySession = new Map<string, string[]>();
  sessionCourses.forEach((sc) => {
    const existing = coursesBySession.get(sc.class_session_id);
    if (!existing) {
      coursesBySession.set(sc.class_session_id, [sc.course_id]);
    } else {
      existing.push(sc.course_id);
    }
  });

  // Step 5: Build nested response structure
  let totalClassRoomLessons = 0;
  let totalClassRoomCompletedLessons = 0;

  const sessionsWithProgress = sessions.map((session) => {
    const sessionCourseIds = coursesBySession.get(session.id) ?? [];

    // Track session-level totals
    let sessionTotalLessons = 0;
    let sessionCompletedLessons = 0;

    // Build course progress for this session
    const courseProgressList = sessionCourseIds.map((courseId) => {
      const progress = courseProgressMap.get(courseId);
      const totalLessons = progress?.totalLessons ?? 0;
      const completedLessons = progress?.completedLessons ?? 0;

      // Accumulate for session totals
      sessionTotalLessons += totalLessons;
      sessionCompletedLessons += completedLessons;

      return buildProgressResponse({
        entityId: courseId,
        entityType: "course",
        totalLessons,
        completedLessons,
        learningPathId,
        employeeId,
      });
    });

    // Accumulate for class room totals
    totalClassRoomLessons += sessionTotalLessons;
    totalClassRoomCompletedLessons += sessionCompletedLessons;

    return {
      entityId: session.id,
      entityType: "class_session" as const,
      totalLessons: sessionTotalLessons,
      completedLessons: sessionCompletedLessons,
      progressPercentage: calculateProgressPercentage(sessionCompletedLessons, sessionTotalLessons),
      learningPathId,
      employeeId,
      courses: courseProgressList,
    };
  });

  return {
    entityId: classRoomId,
    entityType: "class_room",
    totalLessons: totalClassRoomLessons,
    completedLessons: totalClassRoomCompletedLessons,
    progressPercentage: calculateProgressPercentage(
      totalClassRoomCompletedLessons,
      totalClassRoomLessons,
    ),
    learningPathId,
    employeeId,
    class_sessions: sessionsWithProgress,
  };
}
