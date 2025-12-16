import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { UpdateBranchDto } from "@/types/dto/branches";
import { branchService } from "@/services";
import { PATHS } from "@/constants/path.constant";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const payload: UpdateBranchDto = {
      id: params.id,
      ...body,
    };

    const result = await branchService.updateBranch(payload);

    revalidatePath(PATHS.BRANCHES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật chi nhánh thành công",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating branch:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật chi nhánh";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await branchService.deleteBranch(params.id);

    revalidatePath(PATHS.BRANCHES.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Xóa chi nhánh thành công",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting branch:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa chi nhánh";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
