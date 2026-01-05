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
      const message = "Phase ID is required";
      return NextResponse.json({ error: message, message }, { status: 400 });
    }

    const phaseDetail = await getLearningPathPhaseDetailForEmployee(
      phaseId,
      employee.organization_id,
      employee.id
    );

    if (!phaseDetail) {
      const message = "Phase not found";
      return NextResponse.json({ error: message, message }, { status: 404 });
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

    const errorMessage = error instanceof Error ? error.message : "Failed to fetch phase detail";

    return NextResponse.json(
      {
        error: errorMessage,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
