import { isNumber } from "lodash";
import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { CreateEmployeePayload } from "@/modules/employees/types/create-employee.type";
import { GetEmployeesQueryParams } from "@/modules/employees/types/get-employee.type";
import { CreateEmployeeService } from "@/services/employees/create-employee.service";
import { GetEmployeeService } from "@/services/employees/get-employee.service";
import { parseQueryParams } from "@/utils/query-params";
export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth();

    const payload: CreateEmployeePayload = await request.json();

    const data = await new CreateEmployeeService(organizationId).execute(payload);

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
    const queryObject = parseQueryParams(request.nextUrl.searchParams) as GetEmployeesQueryParams;

    const page = queryObject.page && isNumber(Number(queryObject.page)) ? Number(queryObject.page) : undefined;
    const pageSize =
      queryObject.pageSize && isNumber(Number(queryObject.pageSize)) ? Number(queryObject.pageSize) : undefined;

    const data = await new GetEmployeeService(organizationId).getList({
      organizationId,
      branchId: queryObject.branchId,
      departmentId: queryObject.departmentId,
      employeeType: queryObject.employeeType,
      filter: {
        field: queryObject.filter?.field,
        value: queryObject.filter?.value,
      },
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
