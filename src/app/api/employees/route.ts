import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
// import type { CreateEmployeeDto } from "@/types/dto/employees";
import { CreateEmployeePayload } from "@/modules/employees/types/create-employee.type";
import { employeeService } from "@/services";
import { CreateEmployeeService } from "@/services/employees/create-employee.service";
export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth();

    const payload: CreateEmployeePayload = await request.json();

    // const result = await employeeService.createEmployeeCore(payload, payload.organizationId);

    // revalidatePath(PATHS.EMPLOYEES.ROOT);
    console.log(payload);
    const data = await new CreateEmployeeService(organizationId).execute(payload);

    console.log({ data });
    return http.created(data);

    // return http.created({ userId: result.userId, employeeId: result.employeeId, employeeCode: result.employeeCode });
  } catch (error) {
    console.error("Error creating employee:", error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
