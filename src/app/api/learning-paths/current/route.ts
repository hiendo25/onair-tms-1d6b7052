import { NextRequest, NextResponse } from "next/server";

import { employeesRepository, learningPathsRepository } from "@/repository";
import { createSVClient } from "@/services/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Get organization ID from header
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get employee by user ID
    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    if (!employee?.id) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

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
