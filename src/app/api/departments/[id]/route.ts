import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { departmentService } from "@/services";
import type { UpdateDepartmentDto } from "@/types/dto/departments";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const payload: UpdateDepartmentDto = {
      id: params.id,
      ...body,
    };

    const result = await departmentService.updateDepartment(payload);

    revalidatePath(PATHS.DEPARTMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật phòng ban thành công",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating department:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật phòng ban";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await departmentService.deleteDepartment(params.id);

    revalidatePath(PATHS.DEPARTMENTS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Xóa phòng ban thành công",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting department:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa phòng ban";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
