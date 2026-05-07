/**
 * GET /api/phases/[phaseId]/progress
 *
 * Get progress for a specific phase in a learning path
 * Calculates progress based on completed lessons vs total lessons in the phase
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  getPhaseProgress,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phaseId: string }> },
) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get phase ID from route params
    const { phaseId } = await params;

    if (!phaseId) {
      return NextResponse.json(
        { error: "Phase ID is required" },
        { status: 400 },
      );
    }

    // Get the learning path ID for this phase
    const supabase = await createSVClient();
    const { data: phase, error: phaseError } = await supabase
      .from("learning_path_phases")
      .select("learning_path_id")
      .eq("id", phaseId)
      .single();

    if (phaseError || !phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 },
      );
    }

    const learningPathId = phase.learning_path_id;

    // Get progress using optimized query
    const { totalLessons, completedLessons } = await getPhaseProgress(
      phaseId,
      employee.id,
      learningPathId,
    );

    // Build response
    const response = buildProgressResponse({
      entityId: phaseId,
      entityType: "phase",
      totalLessons,
      completedLessons,
      learningPathId,
      employeeId: employee.id,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching phase progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch phase progress",
      },
      { status: 500 },
    );
  }
}
