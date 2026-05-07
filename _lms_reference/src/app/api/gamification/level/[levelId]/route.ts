import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { UpdateLevelPayload } from "@/modules/ranking/type";
import { UpdateLevelService } from "@/services/gamifications/levels/update-level.service";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]">) {
  try {
    const levelId = (await ctx.params).levelId;
    const { organizationId } = await requireAuth(request);

    const payload = (await request.json()) as UpdateLevelPayload;

    const data = await new UpdateLevelService(organizationId).execute({
      description: payload.description,
      icon: payload.icon,
      id: payload.id,
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
