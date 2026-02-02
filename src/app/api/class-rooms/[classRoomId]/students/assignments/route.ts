import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getClassRoomStudentsAssignmentStatus } from "@/services/class-room/class-room-students-assignment-status.service";

const parseEmployeeIds = (value: string | null): string[] => {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classRoomId: string }> },
) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { classRoomId } = await params;
    if (!classRoomId) {
      return NextResponse.json({ error: "Class room ID is required" }, { status: 400 });
    }

    const assignmentConfigId = request.nextUrl.searchParams.get("assignmentConfigId");
    if (!assignmentConfigId) {
      return NextResponse.json({ error: "Assignment config ID is required" }, { status: 400 });
    }

    const employeeIds = parseEmployeeIds(request.nextUrl.searchParams.get("employeeIds"));

    const result = await getClassRoomStudentsAssignmentStatus({
      assignmentConfigId,
      employeeIds,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room students assignment status:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch class room students assignment status",
      },
      { status: 500 },
    );
  }
}
