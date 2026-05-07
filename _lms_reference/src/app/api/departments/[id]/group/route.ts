import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { GetDepartmentService } from "@/services/departments/get-department.service";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const { id } = await params;

    const data = await new GetDepartmentService(organizationId, employeeId).getChildDepartmentByIds({
      departmentIds: [id],
    });

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
