import { NextRequest, NextResponse } from "next/server";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getClassRoomStudentsProgress } from "@/services/class-room/class-room-students-progress.service";

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

    const employeeIds = parseEmployeeIds(request.nextUrl.searchParams.get("employeeIds"));
    const learningPathId = request.nextUrl.searchParams.get(ROUTE_QUERY_KEYS.LEARNING_PATH_ID);

    const result = await getClassRoomStudentsProgress({
      classRoomId,
      employeeIds,
      learningPathId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room students progress:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch class room students progress",
      },
      { status: 500 },
    );
  }
}
