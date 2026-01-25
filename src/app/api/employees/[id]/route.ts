import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { employeeService } from "@/services";
import type { UpdateEmployeeDto } from "@/types/dto/employees";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: employeeId } = await params;

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid employee ID" }, { status: 400 });
    }

    await employeeService.deleteEmployeeWithRelations(employeeId);

    revalidatePath(PATHS.EMPLOYEES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Employee deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting employee:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while deleting the employee";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: employeeId } = await params;

    if (!employeeId || typeof employeeId !== "string") {
      return NextResponse.json({ success: false, message: "Invalid employee ID" }, { status: 400 });
    }

    const payload: UpdateEmployeeDto = await request.json();

    if (payload.id !== employeeId) {
      return NextResponse.json({ success: false, message: "Employee ID mismatch" }, { status: 400 });
    }

    await employeeService.updateEmployeeWithRelations(payload);

    revalidatePath(PATHS.EMPLOYEES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Employee updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating employee:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while updating the employee";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
