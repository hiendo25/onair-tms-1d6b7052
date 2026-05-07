import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { UpdateLevelStatusPayload } from "@/modules/ranking/type";
import { UpdateLevelStatusService } from "@/services/gamifications/levels/update-level-status.service";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]/status">) {
  try {
    const levelId = (await ctx.params).levelId;
    const { organizationId } = await requireAuth(request);

    const payload = (await request.json()) as UpdateLevelStatusPayload;

    const data = await new UpdateLevelStatusService(organizationId).execute({
      id: levelId,
      status: payload.status,
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
