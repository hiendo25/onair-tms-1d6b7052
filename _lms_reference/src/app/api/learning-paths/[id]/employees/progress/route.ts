/**
 * GET /api/learning-paths/[id]/employees/progress
 *
 * Get progress for all employees assigned to a specific learning path
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - ids: Comma-separated employee IDs to filter (optional)
 *
 * OPTIMIZATIONS APPLIED:
 * 1. Fetch learning path structure ONCE (not per employee)
 * 2. Database-level pagination (not in-memory slicing)
 * 3. Batch query progress for all employees at once (not N+1 queries)
 * 4. In-memory progress calculation using Map for O(n) performance
 *
 * Performance: ~3 queries regardless of employee count (vs ~5n queries before)
 */

import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import {
  calculateProgressPercentage,
  getLearningPathLessonIds,
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

    // Get pagination and filter parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const idsParam = searchParams.get("ids") || "";
    const employeeIds = idsParam ? idsParam.split(",").map(id => id.trim()).filter(Boolean) : [];

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100" },
        { status: 400 },
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createSVClient();

    // First, verify the learning path exists and belongs to the same organization
    const { data: learningPath, error: learningPathError } = await supabase
      .from("learning_paths")
      .select("id, organization_id, name")
      .eq("id", learningPathId)
      .eq("organization_id", employee.organization_id)
      .maybeSingle();

    if (learningPathError) {
      console.error("[API] Error fetching learning path:", learningPathError);
      return NextResponse.json(
        { error: "Failed to fetch learning path" },
        { status: 500 },
      );
    }

    if (!learningPath) {
      return NextResponse.json(
        { error: "Learning path not found or access denied" },
        { status: 404 },
      );
    }

    // OPTIMIZATION: Fetch learning path structure once (not per employee)
    const lessonIds = await getLearningPathLessonIds(learningPathId);
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          total: 0,
          page,
          limit,
        },
        { status: 200 },
      );
    }

    // Build query to get assigned employees with DATABASE-LEVEL PAGINATION
    let employeesQuery = supabase
      .from("employee_learning_paths")
      .select("employee_id", { count: "exact" })
      .eq("learning_path_id", learningPathId)
      .order("created_at", { ascending: false });

    // Apply employee IDs filter if provided
    if (employeeIds.length > 0) {
      employeesQuery = employeesQuery.in("employee_id", employeeIds);
    }

    // Apply pagination at database level (not in-memory)
    employeesQuery = employeesQuery.range(from, to);

    // Execute query
    const { data: paginatedEmployees, error: employeesError, count } = await employeesQuery;

    if (employeesError) {
      console.error("[API] Error fetching employees:", employeesError);
      return NextResponse.json(
        { error: "Failed to fetch employees" },
        { status: 500 },
      );
    }

    if (!paginatedEmployees || paginatedEmployees.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          total: count || 0,
          page,
          limit,
        },
        { status: 200 },
      );
    }

    // OPTIMIZATION: Batch query progress for ALL paginated employees at once
    const employeeIdsList = paginatedEmployees.map((e: any) => e.employee_id);

    const { data: progressData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("employee_id, lesson_id")
      .eq("status", "completed")
      .eq("learning_path_id", learningPathId)
      .in("employee_id", employeeIdsList)
      .in("lesson_id", lessonIds);

    if (progressError) {
      console.error("[API] Error fetching progress data:", progressError);
      return NextResponse.json(
        { error: "Failed to fetch progress data" },
        { status: 500 },
      );
    }

    // OPTIMIZATION: Calculate progress in memory using a Map
    const progressMap = new Map<string, number>();

    // Count completed lessons per employee
    progressData?.forEach((p: any) => {
      const count = progressMap.get(p.employee_id) || 0;
      progressMap.set(p.employee_id, count + 1);
    });

    // Build response for each employee
    const employeesWithProgress: ProgressResponse[] = paginatedEmployees.map((elp: any) => {
      const completedLessons = progressMap.get(elp.employee_id) || 0;

      return {
        entityId: elp.employee_id,
        entityType: "employee",
        employeeId: elp.employee_id,
        totalLessons,
        completedLessons,
        progressPercentage: calculateProgressPercentage(completedLessons, totalLessons),
        learningPathId,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: employeesWithProgress,
        total: count || 0,
        page,
        limit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[API] Error fetching employees progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch employees progress",
      },
      { status: 500 },
    );
  }
}
