/**
 * GET /api/courses/[courseId]/progress?learningPathId=[learningPathId]&classRoomId=[classRoomId]
 *
 * Get progress for a specific course
 * Calculates progress based on completed lessons vs total lessons in the course
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 * - classRoomId (optional): Provided for context, not used in calculation
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  countCompletedLessons,
  getLessonIdsForCourse,
  getLessonProgressRecords,
  resolveLearningPathId,
} from "@/services/progress/progress.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get course ID from route params
    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    // Get learning path ID from query params or resolve to most recent
    const providedLearningPathId = request.nextUrl.searchParams.get("learningPathId");
    const learningPathId = await resolveLearningPathId(employee.id, providedLearningPathId);

    // Get all lesson IDs for this course
    const lessonIds = await getLessonIdsForCourse(courseId);

    // Get progress records for all lessons
    const progressRecords = await getLessonProgressRecords(
      lessonIds,
      employee.id,
      learningPathId,
    );

    // Count completed lessons
    const completedLessons = countCompletedLessons(progressRecords);

    // Build response
    const response = buildProgressResponse({
      entityId: courseId,
      entityType: "course",
      totalLessons: lessonIds.length,
      completedLessons,
      learningPathId,
      employeeId: employee.id,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching course progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch course progress",
      },
      { status: 500 },
    );
  }
}
