import { NextRequest, NextResponse } from "next/server";

import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { getCurrentLearningPathSummaryForEmployee } from "@/services/learning-paths/learning-path-summary.service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    const summary = await getCurrentLearningPathSummaryForEmployee(employee.id);

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching current learning path summary:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch current learning path summary";

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
