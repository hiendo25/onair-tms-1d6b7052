import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { UpdateLevelPayload } from "@/modules/ranking/type";
import { gamificationLevelService } from "@/services";
import { http } from "@/utils/http-status";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]">) {
  try {
    const levelId = (await ctx.params).levelId;
    const { organizationId } = await requireAuth(request);

    const payload = (await request.json()) as UpdateLevelPayload;

    const data = await gamificationLevelService.updateLevel({
      ...payload,
      id: levelId,
      organizationId: organizationId,
    });

    return http.ok(data);
  } catch (error) {
    console.error(error);
    throw http.serverError("Server error");
  }
}
