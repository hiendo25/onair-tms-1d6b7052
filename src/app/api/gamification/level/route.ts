import { isNumber } from "lodash";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { CreateLevelPayload } from "@/modules/ranking/type";
import { gamificationLevelService } from "@/services";

export async function GET(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth(request);

    const searchParams = request.nextUrl.searchParams;

    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const pageNum = page && isNumber(Number(page)) ? Number(page) : undefined;
    const pageSizeNum = pageSize && isNumber(Number(pageSize)) ? Number(pageSize) : undefined;

    const data = await gamificationLevelService.getLevels({
      organizationId: organizationId,
      page: pageNum,
      pageSize: pageSizeNum,
    });

    return http.ok(data);
  } catch (error: any) {
    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    return http.serverError("Server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await requireAuth(request);

    const payload = (await request.json()) as CreateLevelPayload;

    const data = await gamificationLevelService.createLevel({
      ...payload,
      organizationId: organizationId,
    });

    return http.ok(data);
  } catch (error) {
    console.error(error);
    throw http.serverError("Server error");
  }
}
