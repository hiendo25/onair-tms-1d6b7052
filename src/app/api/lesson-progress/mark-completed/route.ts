/**
 * POST /api/lesson-progress/mark-completed
 *
 * Mark a lesson as completed
 * This immediately persists to database (no caching delay)
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ORGANIZATION_ID, HEADER_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { employeesRepository } from "@/repository";
import { createSVClient } from "@/services";
import { markCompleted } from "@/services/lesson-progress/lesson-progress.service";
import type { MarkCompletedRequest } from "@/types/dto/lesson-progress";

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
