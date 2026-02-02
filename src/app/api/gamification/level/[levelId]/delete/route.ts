import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { DeleteLevelService } from "@/services/gamifications/levels/delete-level.service";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]/delete">) {
  try {
    const { organizationId } = await requireAuth(request);

    const levelId = (await ctx.params).levelId;

    const data = await new DeleteLevelService(organizationId).execute(levelId);

    return http.ok(data);
  } catch (error) {
    console.error(error);
    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }
    return http.serverError("Server error");
  }
}
