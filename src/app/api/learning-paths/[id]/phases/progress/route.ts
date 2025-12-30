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
  countCompletedLessons,
  getLessonIdsForPhase,
  getLessonProgressRecords,
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

    // Calculate progress for each phase
    const progressPromises = phases.map(async (phase: { id: string }) => {
      // Get all lesson IDs for this phase
      const lessonIds = await getLessonIdsForPhase(phase.id);

      // Get progress records for all lessons in this phase
      const progressRecords = await getLessonProgressRecords(
        lessonIds,
        employee.id,
        learningPathId,
      );

      // Count completed lessons
      const completedLessons = countCompletedLessons(progressRecords);

      // Build progress response for this phase
      return buildProgressResponse({
        entityId: phase.id,
        entityType: "phase",
        totalLessons: lessonIds.length,
        completedLessons,
        learningPathId,
        employeeId: employee.id,
      });
    });

    // Wait for all progress calculations to complete
    const progressResults: ProgressResponse[] = await Promise.all(progressPromises);

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
