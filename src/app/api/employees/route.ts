import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { authRepository } from "@/repository";
import { employeeService } from "@/services";
import type { CreateEmployeeDto } from "@/types/dto/employees";
import { http } from "@/utils/http-status";

export async function POST(request: NextRequest) {
  try {
    const user = await authRepository.getCurrentUser();

    if (!user) return http.unauthorized();

    const payload: CreateEmployeeDto = await request.json();

    const result = await employeeService.createEmployeeCore(payload, payload.organizationId);

    revalidatePath(PATHS.EMPLOYEES.ROOT);

    return http.created({ userId: result.userId, employeeId: result.employeeId, employeeCode: result.employeeCode });
  } catch (error) {
    console.error("Error creating employee:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
