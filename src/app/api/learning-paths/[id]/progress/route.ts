/**
 * GET /api/learning-paths/[id]/progress
 *
 * Get progress for a specific learning path
 * Calculates progress based on completed lessons vs total lessons in the learning path
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  countCompletedLessons,
  getLessonIdsForLearningPath,
  getLessonProgressRecords,
} from "@/services/progress/progress.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get learning path ID from route params
    const { id: learningPathId } = await params;

    if (!learningPathId) {
      return NextResponse.json(
        { error: "Learning path ID is required" },
        { status: 400 },
      );
    }

    // Get all lesson IDs for this learning path
    const lessonIds = await getLessonIdsForLearningPath(learningPathId);

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
      entityId: learningPathId,
      entityType: "learning_path",
      totalLessons: lessonIds.length,
      completedLessons,
      learningPathId,
      employeeId: employee.id,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching learning path progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch learning path progress",
      },
      { status: 500 },
    );
  }
}
