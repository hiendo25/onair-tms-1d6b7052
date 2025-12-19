import { NextRequest, NextResponse } from "next/server";

import { employeeFileService } from "@/services";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Không tìm thấy file trong request" },
        { status: 400 }
      );
    }

    const result = await employeeFileService.validateEmployeeFile(file);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error validating employee file:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi xác thực file";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
