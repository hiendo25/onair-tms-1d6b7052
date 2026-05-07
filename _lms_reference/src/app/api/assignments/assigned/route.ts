import { NextRequest, NextResponse } from "next/server";

import { getAssignedAssignments } from "@/services/assignments/assignment.service";
import type { AssignmentAssignedStatusFilter } from "@/types/dto/assignments";

const ALLOWED_STATUSES = new Set<AssignmentAssignedStatusFilter>(["completed", "in_progress", "not_started"]);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;
    const organizationId = searchParams.get("organizationId") || undefined;

    const statusParam = searchParams.get("status") || undefined;
    const status = statusParam && ALLOWED_STATUSES.has(statusParam as AssignmentAssignedStatusFilter)
      ? (statusParam as AssignmentAssignedStatusFilter)
      : undefined;

    const result = await getAssignedAssignments({
      page,
      limit,
      search,
      status,
      organizationId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching assigned assignments:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch assigned assignments",
      },
      { status: 500 },
    );
  }
}
