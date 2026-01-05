import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getLearningPathPhaseDetailForEmployee } from "@/services/learning-paths/learning-path-phase-detail.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    const { phaseId } = await params;

    if (!phaseId) {
      return NextResponse.json({ error: "Phase ID is required" }, { status: 400 });
    }

    const phaseDetail = await getLearningPathPhaseDetailForEmployee(
      phaseId,
      employee.organization_id,
      employee.id
    );

    if (!phaseDetail) {
      return NextResponse.json({ error: "Phase not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: phaseDetail,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error fetching phase detail:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch phase detail",
      },
      { status: 500 }
    );
  }
}
