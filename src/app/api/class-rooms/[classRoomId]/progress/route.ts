/**
 * GET /api/class-rooms/[classRoomId]/progress?learningPathId=[learningPathId]
 *
 * Get progress for a specific class room
 * Calculates progress based on completed lessons vs total lessons in the class room
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  countCompletedLessons,
  getLessonIdsForClassRoom,
  getLessonProgressRecords,
  resolveLearningPathId,
} from "@/services/progress/progress.service";

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

    // Get all lesson IDs for this class room
    const lessonIds = await getLessonIdsForClassRoom(classRoomId);

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
      entityId: classRoomId,
      entityType: "class_room",
      totalLessons: lessonIds.length,
      completedLessons,
      learningPathId,
      employeeId: employee.id,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch class room progress",
      },
      { status: 500 },
    );
  }
}
