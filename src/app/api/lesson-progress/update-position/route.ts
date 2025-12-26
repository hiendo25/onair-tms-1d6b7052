/**
 * POST /api/lesson-progress/update-position
 *
 * Update video position during playback
 * Called every 10 seconds by the video player
 *
 * Uses Redis caching to prevent database overload
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ORGANIZATION_ID, HEADER_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { employeesRepository } from "@/repository";
import { createSVClient } from "@/services";
import { updatePosition } from "@/services/lesson-progress/lesson-progress.service";
import type { UpdatePositionRequest } from "@/types/dto/lesson-progress";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createSVClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get organization ID from header or cookie
    const headerOrgId = request.headers.get(HEADER_ORGANIZATION_ID);
    const cookieStore = await cookies();
    const cookieOrgId = cookieStore.get(COOKIE_ORGANIZATION_ID)?.value;
    const organizationId = headerOrgId || cookieOrgId;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization not found. Provide via x-organization-id header or cookie." },
        { status: 403 }
      );
    }

    // Get employee from user
    const employee = await employeesRepository.getCurrentEmployee(
      user.id,
      organizationId
    );

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

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
