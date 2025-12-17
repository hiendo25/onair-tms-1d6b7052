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

    // Get the current employee's organization
    const employee = await employeesRepository.getEmployeeByUserId(user.id);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;

    // Fetch learning paths
    const result = await learningPathsRepository.getLearningPaths({
      organizationId: employee.organization_id!,
      page,
      limit,
      search,
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        total: result.total,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching learning paths";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

