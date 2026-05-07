import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import type { UpdateBranchPayload, UpdateBranchStatusPayload } from "@/modules/branch/type";
import { branchService } from "@/services";
import { UpdateBranchService } from "@/services/branches/update-branch.service";
import { UpdateBranchStatusService } from "@/services/branches/update-branch-status.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const { id } = await params;
    const payload: UpdateBranchStatusPayload = await request.json();

    const data = await new UpdateBranchStatusService(organizationId, employeeId).execute({
      id: id,
      status: payload?.status,
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
