/**
 * POST /api/lesson-progress/update-position
 *
 * Update video position during playback
 * Called every 10 seconds by the video player
 *
 * Supports both cookie-based (web) and token-based (mobile) authentication
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { updatePosition } from "@/services/lesson-progress/lesson-progress.service";
import type { UpdatePositionRequest } from "@/types/dto/lesson-progress";

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
    const {
      lessonId,
      learningPathId,
      currentPositionSeconds,
      progressPercentage,
    } = body as UpdatePositionRequest;

    // Validate required fields
    if (
      !lessonId ||
      typeof currentPositionSeconds !== "number" ||
      typeof progressPercentage !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: lessonId, currentPositionSeconds, and progressPercentage",
        },
        { status: 400 }
      );
    }

    // Validate position is non-negative
    if (currentPositionSeconds < 0) {
      return NextResponse.json(
        { error: "currentPositionSeconds must be non-negative" },
        { status: 400 }
      );
    }

    // Validate progressPercentage is between 0 and 100
    if (progressPercentage < 0 || progressPercentage > 100) {
      return NextResponse.json(
        { error: "progressPercentage must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Update position using service
    const result = await updatePosition(employee.id, {
      lessonId,
      learningPathId: learningPathId || null,
      currentPositionSeconds,
      progressPercentage,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error updating lesson position:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update lesson position",
      },
      { status: 500 }
    );
  }
}
