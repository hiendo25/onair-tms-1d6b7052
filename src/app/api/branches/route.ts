import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { branchService } from "@/services";
import type { CreateBranchDto } from "@/types/dto/branches";

export async function POST(request: NextRequest) {
  try {
    const payload: CreateBranchDto = await request.json();

    const result = await branchService.createBranch(payload);

    revalidatePath(PATHS.BRANCHES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo chi nhánh thành công",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating branch:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo chi nhánh";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
