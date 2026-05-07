import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getClassRoomStudentAssignmentsStatus } from "@/services/class-room/class-room-students-assignment-status.service";

const parseIds = (value: string | null): string[] => {
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

    const employeeId = request.nextUrl.searchParams.get("employeeId");
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const assignmentConfigIds = parseIds(request.nextUrl.searchParams.get("assignmentConfigIds"));

    const result = await getClassRoomStudentAssignmentsStatus({
      employeeId,
      assignmentConfigIds,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room student assignments:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch class room student assignments",
      },
      { status: 500 },
    );
  }
}
