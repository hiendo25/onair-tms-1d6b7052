import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { employeeFileService } from "@/services";
import { PATHS } from "@/constants/path.constant";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file trong request" }, { status: 400 });
    }

    const result = await employeeFileService.importEmployees(file);

    revalidatePath(PATHS.EMPLOYEES.ROOT);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error importing employee file:", error);
    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi import file nhân viên";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
