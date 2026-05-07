import { NextRequest, NextResponse } from "next/server";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getClassRoomDetailWithProgressBySlug } from "@/services/class-room/class-room-detail-with-progress.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }

    const { employee } = authResult;
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Class room slug is required" }, { status: 400 });
    }

    const learningPathId = request.nextUrl.searchParams.get(
      ROUTE_QUERY_KEYS.LEARNING_PATH_ID,
    );

    const classRoomDetail = await getClassRoomDetailWithProgressBySlug({
      slug,
      employeeId: employee.id,
      learningPathId,
    });

    return NextResponse.json({ data: classRoomDetail, error: null }, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching class room detail with progress:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch class room detail with progress",
      },
      { status: 500 },
    );
  }
}
