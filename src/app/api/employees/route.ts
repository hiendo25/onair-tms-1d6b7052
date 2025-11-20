import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { CreateEmployeeDto } from "@/types/dto/employees";
import { employeeService } from "@/services";
import { PATHS } from "@/constants/path.contstants";

export async function POST(request: NextRequest) {
  try {
    const payload: CreateEmployeeDto = await request.json();

    const result = await employeeService.createEmployeeWithRelations(payload);

    revalidatePath(PATHS.EMPLOYEES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo nhân viên thành công",
        userId: result.userId,
        employeeId: result.employeeId,
        employeeCode: result.employeeCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
