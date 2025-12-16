import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ImportDepartmentsDto } from "@/types/dto/departments";
import { departmentService } from "@/services";
import { PATHS } from "@/constants/path.constant";

export async function POST(request: NextRequest) {
  try {
    const payload: ImportDepartmentsDto = await request.json();

    const result = await departmentService.importDepartments(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Import phòng ban thất bại",
          ...result,
        },
        { status: 400 },
      );
    }

    revalidatePath(PATHS.DEPARTMENTS.ROOT);

    return NextResponse.json(
      {
        message: `Import thành công ${result.imported} phòng ban`,
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error importing departments:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi import phòng ban";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
