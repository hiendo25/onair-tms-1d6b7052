import { isNumber } from "lodash";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { CreateBranchPayload } from "@/modules/branch/type";
import { CreateBranchService } from "@/services/branches/create-branch.service";
import { GetBranchService } from "@/services/branches/get-branch.service";

export async function POST(request: NextRequest) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const payload: CreateBranchPayload = await request.json();

    const data = await new CreateBranchService(organizationId, employeeId).execute(payload);

    return http.created(data);
  } catch (error: any) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    return http.serverError(error?.message || "Có lỗi xảy ra khi tạo chi nhánh");
  }
}

export async function GET(request: NextRequest) {
  try {
    const { organizationId, employeeId } = await requireAuth();
    const searchParams = request.nextUrl.searchParams;

    const pageParam = searchParams.get("page");
    const pageSizeParam = searchParams.get("pageSize");
    const excludesParams = searchParams.get("excludes");

    const page = pageParam && isNumber(Number(pageParam)) ? Number(pageParam) : undefined;
    const pageSize = pageSizeParam && isNumber(Number(pageSizeParam)) ? Number(pageSizeParam) : undefined;

    const data = await new GetBranchService(organizationId, employeeId).getBranches({
      page,
      pageSize,
      excludes: excludesParams ? excludesParams.split(",") : undefined,
    });

    return http.ok(data);
  } catch (error: any) {
    console.error(error);

    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    return http.serverError(error?.message || "Có lỗi xảy ra khi tạo chi nhánh");
  }
}
