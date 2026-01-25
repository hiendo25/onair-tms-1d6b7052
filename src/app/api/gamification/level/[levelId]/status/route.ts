import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { UpdateLevelStatusPayload } from "@/modules/ranking/type";
import { gamificationLevelService } from "@/services";
import { http } from "@/utils/http-status";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]/status">) {
  try {
    const levelId = (await ctx.params).levelId;
    const { organizationId } = await requireAuth(request);

    const payload = (await request.json()) as UpdateLevelStatusPayload;

    const data = await gamificationLevelService.updateLevelStatus({
      ...payload,
      id: levelId,
    });

    return http.ok(data);
  } catch (error) {
    console.error(error);
    throw http.serverError("Server error");
  }
}
