/**
 * GET /api/learning-paths/[id]/phases/progress
 *
 * Get progress for all phases in a specific learning path
 * Returns an array of progress responses, one for each phase
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  buildProgressResponse,
  getMultiplePhasesProgress,
} from "@/services/progress/progress.service";
import { createSVClient } from "@/services/supabase/server";
import type { ProgressResponse } from "@/types/progress.types";

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

    // Get all phases for this learning path
    const supabase = await createSVClient();
    const { data: phases, error: phasesError } = await supabase
      .from("learning_path_phases")
      .select("id")
      .eq("learning_path_id", learningPathId)
      .order("order_index", { ascending: true });

    if (phasesError) {
      console.error("Error fetching phases:", phasesError);
      return NextResponse.json(
        { error: "Failed to fetch phases" },
        { status: 500 },
      );
    }

    if (!phases || phases.length === 0) {
      // No phases found, return empty array
      return NextResponse.json([], { status: 200 });
    }

    // Get phase IDs
    const phaseIds = phases.map((phase: { id: string }) => phase.id);

    // Get progress for all phases in an optimized batch query
    const progressMap = await getMultiplePhasesProgress(
      phaseIds,
      employee.id,
      learningPathId,
    );

    // Build response array in the same order as phases
    const progressResults: ProgressResponse[] = phases.map((phase: { id: string }) => {
      const progress = progressMap.get(phase.id) || { totalLessons: 0, completedLessons: 0 };

      return buildProgressResponse({
        entityId: phase.id,
        entityType: "phase",
        totalLessons: progress.totalLessons,
        completedLessons: progress.completedLessons,
        learningPathId,
        employeeId: employee.id,
      });
    });

    return NextResponse.json(progressResults, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching phases progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch phases progress",
      },
      { status: 500 },
    );
  }
}
