/**
 * GET /api/sections/[sectionId]/progress?learningPathId=[learningPathId]
 *
 * Get progress for a specific section
 * Calculates progress based on completed lessons vs total lessons in the section
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  getSectionProgress,
  resolveLearningPathId,
} from "@/services/progress/progress.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get section ID from route params
    const { sectionId } = await params;

    if (!sectionId) {
      return NextResponse.json(
        { error: "Section ID is required" },
        { status: 400 },
      );
    }

    // Get learning path ID from query params or resolve to most recent
    const providedLearningPathId = request.nextUrl.searchParams.get("learningPathId");
    const learningPathId = await resolveLearningPathId(employee.id, providedLearningPathId);

    // Get progress using optimized query
    const { totalLessons, completedLessons } = await getSectionProgress(
      sectionId,
      employee.id,
      learningPathId,
    );

    // Build response
    const response = buildProgressResponse({
      entityId: sectionId,
      entityType: "section",
      totalLessons,
      completedLessons,
      learningPathId,
      employeeId: employee.id,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching section progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch section progress",
      },
      { status: 500 },
    );
  }
}
