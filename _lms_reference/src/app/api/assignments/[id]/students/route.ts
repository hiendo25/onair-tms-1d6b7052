import { NextRequest, NextResponse } from "next/server";

import { getAssignmentStudents } from "@/services/assignments/assignment.service";
import type { AssignmentStudentProgressStatus } from "@/types/dto/assignments";

const ALLOWED_STATUSES = new Set<AssignmentStudentProgressStatus>(["completed", "in_progress", "not_started"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params;

    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status") || undefined;
    const status = statusParam && ALLOWED_STATUSES.has(statusParam as AssignmentStudentProgressStatus)
      ? (statusParam as AssignmentStudentProgressStatus)
      : undefined;

    const students = await getAssignmentStudents(assignmentId, { page, limit, search, status });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignment students:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch assignment students",
      },
      { status: 500 }
    );
  }
}
