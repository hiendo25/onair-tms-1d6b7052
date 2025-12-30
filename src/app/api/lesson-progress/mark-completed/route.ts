/**
 * POST /api/lesson-progress/mark-completed
 *
 * Mark a lesson as completed
 * This immediately persists to database (no caching delay)
 * Supports both cookie-based (web) and token-based (mobile) authentication
 */

import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(result, { status: 200 });
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
