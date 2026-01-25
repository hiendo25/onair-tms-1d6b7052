import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { departmentService } from "@/services";
import type { CreateDepartmentDto } from "@/types/dto/departments";

export async function POST(request: NextRequest) {
  try {
    const payload: CreateDepartmentDto = await request.json();

    const result = await departmentService.createDepartment(payload);

    revalidatePath(PATHS.DEPARTMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo phòng ban thành công",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating department:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo phòng ban";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
