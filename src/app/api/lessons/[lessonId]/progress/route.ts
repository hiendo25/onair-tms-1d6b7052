/**
 * GET /api/lessons/[lessonId]/progress
 *
 * Get progress for a specific lesson
 * Returns progress data including completion status and current position in seconds
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getLessonProgressData, resolveLearningPathId } from "@/services/progress/progress.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get lesson ID from route params
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID is required" },
        { status: 400 },
      );
    }

    // Get learning path ID from query params or resolve to current
    const searchParams = request.nextUrl.searchParams;
    const queryLearningPathId = searchParams.get("learningPathId");
    const learningPathId = await resolveLearningPathId(employee.id, queryLearningPathId);

    // Get lesson progress including current position
    const progressData = await getLessonProgressData(
      lessonId,
      employee.id,
      learningPathId,
    );

    return NextResponse.json(progressData, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching lesson progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch lesson progress",
      },
      { status: 500 },
    );
  }
}
