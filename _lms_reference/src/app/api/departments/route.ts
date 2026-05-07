import { isNumber } from "lodash";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import {
  CreateDepartmentGroupPayload,
  CreateRootDepartmentPayload,
  GetDepartmentsQueryParams,
} from "@/modules/department/type";
import { CreateDepartmentService } from "@/services/departments/create-department.service";
import { GetDepartmentService } from "@/services/departments/get-department.service";
import { parseQueryParams } from "@/utils/query-params";

export async function POST(request: NextRequest) {
  try {
    const { organizationId, employeeId } = await requireAuth();

    const payload: CreateRootDepartmentPayload | CreateDepartmentGroupPayload = await request.json();

    if (payload.type !== "root" && payload.type !== "group") {
      return http.badRequest("type không hợp lệ", "INVALID_TYPE", payload);
    }

    if (payload.type === "root") {
      const data = await new CreateDepartmentService(organizationId, employeeId).createRoot({
        branchId: payload.branchId,
        code: payload.code,
        managedById: payload.managedById,
        name: payload.name,
      });

      return http.created(data);
    }

    if (payload.type === "group") {
      const data = await new CreateDepartmentService(organizationId, employeeId).createChild({
        parentId: payload.parentId,
        code: payload.code,
        managedById: payload.managedById,
        name: payload.name,
      });
      return http.created(data);
    }
  } catch (error: any) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    return http.serverError(error?.message);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { organizationId, employeeId } = await requireAuth();

    const searchParams = request.nextUrl.searchParams;

    const queryObject = <GetDepartmentsQueryParams>parseQueryParams(searchParams);

    const page = queryObject.page && isNumber(Number(queryObject.page)) ? Number(queryObject.page) : undefined;
    const pageSize =
      queryObject.pageSize && isNumber(Number(queryObject.pageSize)) ? Number(queryObject.pageSize) : undefined;

    const data = await new GetDepartmentService(organizationId, employeeId).getDepartments({
      page,
      pageSize,
      branchIds: queryObject.branchIds,
      excludes: queryObject.excludes,
    });

    return http.ok(data);
  } catch (error: any) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    return http.serverError(error?.message);
  }
}
