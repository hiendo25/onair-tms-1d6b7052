import { isNumber } from "lodash";
import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { EmployeeType } from "@/model/employee.model";
import { CreateEmployeePayload } from "@/modules/employees/types/create-employee.type";
import { CreateEmployeeService } from "@/services/employees/create-employee.service";
import { GetEmployeeService } from "@/services/employees/get-employee.service";
export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth();

    const payload: CreateEmployeePayload = await request.json();

    console.log(payload);
    const data = await new CreateEmployeeService(organizationId).execute(payload);

    console.log({ data });
    return http.created(data);
  } catch (error) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const departmentId = searchParams.get("departmentId") ?? undefined;
    const branchId = searchParams.get("branchId") ?? undefined;
    const employeeType = (searchParams.get("employeeType") as EmployeeType) ?? undefined;

    const page = pageParam && isNumber(Number(pageParam)) ? Number(pageParam) : undefined;
    const pageSize = pageSizeParam && isNumber(Number(pageSizeParam)) ? Number(pageSizeParam) : undefined;

    const data = await new GetEmployeeService(organizationId).getList({
      organizationId,
      branchId,
      departmentId,
      employeeType,
      page,
      pageSize,
    });

    return http.ok(data);
  } catch (error) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
