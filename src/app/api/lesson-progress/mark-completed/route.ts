/**
 * POST /api/lesson-progress/mark-completed
 *
 * Mark a lesson as completed
 * This immediately persists to database (no caching delay)
 * Supports both cookie-based (web) and token-based (mobile) authentication
 */

import { NextRequest, NextResponse } from "next/server";

import { handleLessonCompletion } from "@/services/gamifications/event-handler";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { markCompleted } from "@/services/lesson-progress/lesson-progress.service";
import type { MarkCompletedRequest } from "@/types/dto/lesson-progress";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Parse request body
    const body = await request.json();
    const { lessonId, learningPathId, currentPositionSeconds } =
      body as MarkCompletedRequest;

    // Validate required fields
    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing required field: lessonId" },
        { status: 400 }
      );
    }

    // Validate position if provided
    if (
      currentPositionSeconds !== undefined &&
      currentPositionSeconds < 0
    ) {
      return NextResponse.json(
        { error: "currentPositionSeconds must be non-negative" },
        { status: 400 }
      );
    }

    // Mark lesson as completed
    const result = await markCompleted(employee.id, {
      lessonId,
      learningPathId: learningPathId || null,
      currentPositionSeconds,
    });

    // Handle gamification
    // Option 1: Synchronous (wait for result) - Better UX, user sees XP awards immediately
    // Option 2: Asynchronous (background) - Better performance, faster response time
    //
    // Currently using synchronous approach for better user experience
    // If performance becomes an issue, switch to async by uncommenting below

    const gamificationResult = await handleLessonCompletion({
      employeeId: employee.id,
      organizationId: employee.organization_id,
      lessonId,
      learningPathId: learningPathId || null,
    });

    // For async approach (better performance), uncomment this and comment out above:
    // handleLessonCompletion({
    //   employeeId: employee.id,
    //   organizationId: employee.organization_id,
    //   lessonId,
    //   learningPathId: learningPathId || null,
    // }).catch((error) => {
    //   console.error("[Gamification] Error processing XP awards:", error);
    // });

    // Return result with gamification info
    return NextResponse.json(
      {
        ...result,
        gamification: {
          xpAwarded: gamificationResult.xpAwarded,
          awards: gamificationResult.awards,
        },
        // For async: { processing: true, message: "XP awards are being processed" }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error marking lesson as completed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark lesson as completed",
      },
      { status: 500 }
    );
  }
}
