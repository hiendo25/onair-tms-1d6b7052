import { NextRequest, NextResponse } from "next/server";

import { getAssignmentStudents } from "@/services/assignments/assignment.service";

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

    const students = await getAssignmentStudents(assignmentId, page, limit);

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

