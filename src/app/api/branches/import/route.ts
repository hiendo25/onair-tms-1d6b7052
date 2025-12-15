import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ImportBranchesDto } from "@/types/dto/branches";
import { branchService } from "@/services";
import { PATHS } from "@/constants/path.constant";

export async function POST(request: NextRequest) {
  try {
    const payload: ImportBranchesDto = await request.json();

    const result = await branchService.importBranches(payload);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Import chi nhánh thất bại",
          ...result,
        },
        { status: 400 },
      );
    }

    revalidatePath(PATHS.BRANCHES.ROOT);

    return NextResponse.json(
      {
        message: `Import thành công ${result.imported} chi nhánh`,
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error importing branches:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi import chi nhánh";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
