import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { employeesRepository, learningPathsRepository } from "@/repository";
import { createSVClient } from "@/services/supabase/server";
import { PATHS } from "@/constants/path.constant";

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || undefined;

    // Fetch learning paths
    const result = await learningPathsRepository.getLearningPaths({
      organizationId,
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

export async function POST(request: NextRequest) {
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

    // Get the current employee
    const employee = (await employeesRepository.getEmployeesByUserId(user.id))?.[0];

    if (!employee) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 404 });
    }

    const payload = await request.json();

    // Transform the form data to match repository interface
    const createParams: learningPathsRepository.CreateLearningPathParams = {
      name: payload.info.name,
      description: payload.info.description || undefined,
      thumbnail_url: payload.info.thumbnail || undefined,
      organization_id: organizationId,
      created_by: employee.id,
      metadata: {
        assignmentMode: payload.info.assignmentMode,
        sequentialLearning: payload.settings?.sequentialLearning ?? false,
        completionCriteria: payload.settings?.completionCriteria ?? 80,
        deadlineType: payload.settings?.deadlineType ?? "none",
        deadlineHours: payload.settings?.deadlineHours,
        allowRetake: payload.settings?.allowRetake ?? false,
      },
      phases: (payload.phases || []).map((phase: any) => ({
        order_index: phase.order,
        description: phase.description || undefined,
        class_room_ids: phase.class_rooms.map((cr: any) => cr.id),
      })),
      assigned_employee_ids:
        payload.info.assignmentMode === "manual"
          ? payload.info.assignedEmployees?.map((emp: any) => emp.id) || []
          : undefined,
    };

    const result = await learningPathsRepository.createLearningPath(createParams);

    revalidatePath(PATHS.LEARNING_PATHS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo lộ trình học tập thành công",
        learning_path_id: result.learning_path_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating learning path:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo lộ trình học tập";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

