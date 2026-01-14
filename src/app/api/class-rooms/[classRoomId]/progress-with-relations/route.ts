/**
 * GET /api/class-rooms/[classRoomId]/progress-with-relations?learningPathId=[learningPathId]
 *
 * Get class room progress with nested class sessions and their courses progress
 * Returns class room progress along with all class sessions and their courses
 *
 * Query params:
 * - learningPathId (optional): If not provided, will get the most recent learning path for the employee
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Batch fetch all class sessions for the class room
 * 2. Batch fetch all courses for all sessions via class_sessions_courses_period
 * 3. Use getMultipleCoursesProgress for batch progress calculation
 * 4. In-memory calculation for nested structure
 *
 * Performance: 3-4 queries regardless of session/course count
 */

import { NextRequest, NextResponse } from "next/server";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getClassRoomProgressWithRelations } from "@/services/class-room/class-room-progress-with-relations.service";

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

    const providedLearningPathId = request.nextUrl.searchParams.get(
      ROUTE_QUERY_KEYS.LEARNING_PATH_ID,
    );

    const classRoomProgress = await getClassRoomProgressWithRelations({
      classRoomId,
      employeeId: employee.id,
      learningPathId: providedLearningPathId,
    });

    return NextResponse.json(classRoomProgress, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room progress with relations:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch class room progress with relations",
      },
      { status: 500 },
    );
  }
}
