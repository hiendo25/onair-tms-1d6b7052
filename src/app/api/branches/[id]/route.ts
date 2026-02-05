import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import type { UpdateBranchPayload } from "@/modules/branch/type";
import { branchService } from "@/services";
import { UpdateBranchService } from "@/services/branches/update-branch.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const { id } = await params;
    const payload: UpdateBranchPayload = await request.json();

    const data = await new UpdateBranchService(organizationId, employeeId).execute({
      id: id,
      code: payload?.code,
      name: payload?.name,
      address: payload?.address,
      parentId: payload?.parentId,
      managedById: payload.managedById,
    });

    return http.ok(data);
  } catch (error) {
    console.error("Error updating branch:", error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật chi nhánh";

    return http.serverError(errorMessage);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await branchService.deleteBranch(id);

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
