import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { employeesRepository } from "@/repository";
import { assignmentService } from "@/services";
import { createSVClient } from "@/services";
import type { CreateAssignmentDto } from "@/types/dto/assignments";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Organization invalid" }, { status: 403 });
  }

  try {
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || undefined;

    const result = await assignmentService.getAssignments({
      page,
      limit,
      search,
      createdBy: employee.id,
      organizationId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải danh sách bài kiểm tra";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: CreateAssignmentDto = await request.json();
    const organizationId = payload.organizationId;
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!organizationId) {
      return NextResponse.json({ success: false, message: "Organization Id valid" }, { status: 401 });
    }
    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const result = await assignmentService.createAssignmentWithRelations(payload, employee.id);

    revalidatePath(PATHS.ASSIGNMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo bài kiểm tra thành công",
        assignmentId: result.assignmentId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating assignment:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo bài kiểm tra";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
