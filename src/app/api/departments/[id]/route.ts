import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { UpdateDepartmentGroupPayload, UpdateRootDepartmentPayload } from "@/modules/department/type";
import { departmentService } from "@/services";
import { GetDepartmentService } from "@/services/departments/get-department.service";
import { UpdateDepartmentService } from "@/services/departments/update-department.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const { id } = await params;
    const payload = (await request.json()) as UpdateRootDepartmentPayload | UpdateDepartmentGroupPayload;

    if (payload.type !== "root" && payload.type !== "group") {
      return http.badRequest("type không hợp lệ.");
    }

    if (payload.type === "root") {
      const data = await new UpdateDepartmentService(organizationId, employeeId).updateRoot({
        id: id,
        branchId: payload.branchId,
        code: payload.code,
        managedById: payload.managedById,
        name: payload.name,
      });

      return http.created(data);
    }

    if (payload.type === "group") {
      const data = await new UpdateDepartmentService(organizationId, employeeId).updateGroup({
        id,
        parentId: payload.parentId,
        code: payload.code,
        managedById: payload.managedById,
        name: payload.name,
      });

      return http.created(data);
    }
  } catch (error) {
    console.error("Error updating department:", error);
    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật phòng ban";

    return http.serverError(errorMessage);
  }
}
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const { id } = await params;

    const data = await new GetDepartmentService(organizationId, employeeId).getDetailDepartmentById(id);

    return http.ok(data);
  } catch (error) {
    console.error("Error get department:", error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa phòng ban";

    return http.serverError(errorMessage);
  }
}
