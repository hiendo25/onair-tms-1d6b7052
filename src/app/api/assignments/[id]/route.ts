import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { UpdateAssignmentDto } from "@/types/dto/assignments";
import { assignmentService } from "@/services";
import { createSVClient } from "@/services";
import { employeesRepository } from "@/repository";
import { PATHS } from "@/constants/path.contstants";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assignmentId } = await params;

    if (!assignmentId || typeof assignmentId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid assignment ID" }, { status: 400 });
    }

    // Check if assignment has assigned students
    const assignment = await assignmentService.getAssignmentById(assignmentId);

    if (assignment.assignment_employees && assignment.assignment_employees.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Không thể xóa bài kiểm tra đã có học viên được giao. Vui lòng xóa tất cả học viên trước khi xóa bài kiểm tra."
        },
        { status: 400 }
      );
    }

    await assignmentService.deleteAssignmentWithRelations(assignmentId);

    revalidatePath(PATHS.ASSIGNMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Assignment deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assignment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while deleting the assignment";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assignmentId } = await params;

    if (!assignmentId || typeof assignmentId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid assignment ID" }, { status: 400 });
    }

    const payload: UpdateAssignmentDto = await request.json();

    if (payload.id !== assignmentId) {
      return NextResponse.json({ success: false, message: "Assignment ID mismatch" }, { status: 400 });
    }

    // Get the current user's employee ID
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const employee = await employeesRepository.getEmployeeByUserId(user.id);

    await assignmentService.updateAssignmentWithRelations(payload, employee.id);

    revalidatePath(PATHS.ASSIGNMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Assignment updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating assignment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while updating the assignment";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: assignmentId } = await params;

    if (!assignmentId || typeof assignmentId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid assignment ID" }, { status: 400 });
    }

    const assignment = await assignmentService.getAssignmentById(assignmentId);

    return NextResponse.json(
      {
        success: true,
        data: assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching assignment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching the assignment";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

