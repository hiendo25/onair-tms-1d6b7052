/**
 * GET /api/class-rooms/[classRoomId]/progress-with-relations?learningPathId=[learningPathId]
 *
 * Get class room progress with nested class sessions and their courses progress
 * Returns class room progress along with all class sessions and their courses
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Batch fetch all class sessions for the class room
 * 2. Batch fetch all courses for all sessions via class_sessions_courses_period
 * 3. Use getMultipleCoursesProgress for batch progress calculation
 * 4. In-memory calculation for nested structure
 *
 * Performance: 3-4 queries regardless of session/course count
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  calculateProgressPercentage,
  getMultipleCoursesProgress,
  resolveLearningPathId,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";
import type { ProgressResponse } from "@/types/progress.types";

// Database response types
interface ClassSessionRecord {
  id: string;
  start_date: string | null;
}

interface SessionCourseRecord {
  class_session_id: string;
  course_id: string;
}

// API response types
interface ClassSessionWithCoursesProgress extends ProgressResponse {
  courses: ProgressResponse[];
}

interface ClassRoomProgressWithRelations extends ProgressResponse {
  class_sessions: ClassSessionWithCoursesProgress[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classRoomId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get class room ID from route params
    const { classRoomId } = await params;

    if (!classRoomId) {
      return NextResponse.json(
        { error: "Class room ID is required" },
        { status: 400 },
      );
    }

    // Get learning path ID from query params or resolve to most recent
    const providedLearningPathId = request.nextUrl.searchParams.get("learningPathId");
    const learningPathId = await resolveLearningPathId(employee.id, providedLearningPathId);

    const supabase = await createSVClient();

    // Step 1: Fetch all class sessions for this class room
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("class_sessions")
      .select("id, start_date")
      .eq("class_room_id", classRoomId)
      .order("start_date", { ascending: true });

    const sessions = sessionsData as ClassSessionRecord[] | null;

    if (sessionsError) {
      console.error("[API] Error fetching class sessions:", sessionsError);
      return NextResponse.json(
        { error: "Failed to fetch class sessions" },
        { status: 500 },
      );
    }

    if (!sessions || sessions.length === 0) {
      // No sessions, return class room with empty structure
      const classRoomProgress: ClassRoomProgressWithRelations = {
        entityId: classRoomId,
        entityType: "class_room",
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        class_sessions: [],
      };

      return NextResponse.json(classRoomProgress, { status: 200 });
    }

    const sessionIds = sessions.map((session) => session.id);

    // Step 2: Fetch all courses linked to these sessions
    const { data: sessionCoursesData, error: sessionCoursesError } = await supabase
      .from("class_sessions_courses_period")
      .select("class_session_id, course_id")
      .in("class_session_id", sessionIds);

    const sessionCourses = sessionCoursesData as SessionCourseRecord[] | null;

    if (sessionCoursesError) {
      console.error("[API] Error fetching session courses:", sessionCoursesError);
      return NextResponse.json(
        { error: "Failed to fetch session courses" },
        { status: 500 },
      );
    }

    if (!sessionCourses || sessionCourses.length === 0) {
      // No courses, return class room with sessions but no courses
      const sessionsWithProgress: ClassSessionWithCoursesProgress[] = sessions.map((session) => ({
        entityId: session.id,
        entityType: "class_session" as const,
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        courses: [],
      }));

      const classRoomProgress: ClassRoomProgressWithRelations = {
        entityId: classRoomId,
        entityType: "class_room",
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0,
        learningPathId,
        employeeId: employee.id,
        class_sessions: sessionsWithProgress,
      };

      return NextResponse.json(classRoomProgress, { status: 200 });
    }

    // Step 3: Get unique course IDs and batch fetch progress
    const uniqueCourseIds = Array.from(new Set(sessionCourses.map((sc) => sc.course_id)));

    const courseProgressMap = await getMultipleCoursesProgress(
      uniqueCourseIds,
      employee.id,
      learningPathId,
    );

    // Step 4: Group courses by session
    const coursesBySession = new Map<string, string[]>();
    sessionCourses.forEach((sc) => {
      const sessionCourses = coursesBySession.get(sc.class_session_id);
      if (!sessionCourses) {
        coursesBySession.set(sc.class_session_id, [sc.course_id]);
      } else {
        sessionCourses.push(sc.course_id);
      }
    });

    // Step 5: Build nested response structure
    let totalClassRoomLessons = 0;
    let totalClassRoomCompletedLessons = 0;

    const sessionsWithProgress: ClassSessionWithCoursesProgress[] = sessions.map((session) => {
      const sessionCourseIds = coursesBySession.get(session.id) ?? [];

      // Track session-level totals
      let sessionTotalLessons = 0;
      let sessionCompletedLessons = 0;

      // Build course progress for this session
      const courseProgressList: ProgressResponse[] = sessionCourseIds.map((courseId) => {
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
          employeeId: employee.id,
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
        progressPercentage: calculateProgressPercentage(
          sessionCompletedLessons,
          sessionTotalLessons
        ),
        learningPathId,
        employeeId: employee.id,
        courses: courseProgressList,
      };
    });

    // Build final class room progress response
    const classRoomProgress: ClassRoomProgressWithRelations = {
      entityId: classRoomId,
      entityType: "class_room",
      totalLessons: totalClassRoomLessons,
      completedLessons: totalClassRoomCompletedLessons,
      progressPercentage: calculateProgressPercentage(
        totalClassRoomCompletedLessons,
        totalClassRoomLessons
      ),
      learningPathId,
      employeeId: employee.id,
      class_sessions: sessionsWithProgress,
    };

    return NextResponse.json(classRoomProgress, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room progress with relations:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch class room progress with relations",
      },
      { status: 500 },
    );
  }
}
