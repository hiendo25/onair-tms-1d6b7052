import { isNumber } from "lodash";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { CreateLevelPayload } from "@/modules/ranking/type";
import { gamificationLevelService } from "@/services";
import { CreateLevelService } from "@/services/gamifications/levels/create-level.service";
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

    const data = await new CreateLevelService(organizationId).execute({
      authorId: payload.authorId,
      description: payload.description,
      icon: payload.icon,
      organizationId: organizationId,
      scoreRequired: payload.scoreRequired,
      title: payload.title,
    });

    return http.ok(data);
  } catch (error) {
    console.error(error);
    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    return http.serverError("Server error");
  }
}
