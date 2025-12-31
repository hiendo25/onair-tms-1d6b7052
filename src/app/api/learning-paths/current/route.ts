import { NextRequest, NextResponse } from "next/server";

import { learningPathsRepository } from "@/repository";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Get current learning path for this employee
    const currentLearningPath = await learningPathsRepository.getCurrentLearningPathForEmployee(employee.id);

    return NextResponse.json(
      {
        success: true,
        data: currentLearningPath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching current learning path:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch current learning path",
      },
      { status: 500 }
    );
  }
}
