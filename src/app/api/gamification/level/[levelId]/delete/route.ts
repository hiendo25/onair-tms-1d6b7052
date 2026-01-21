import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { gamificationLevelService } from "@/services";
import { http } from "@/utils/http-status";

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/gamification/level/[levelId]/delete">) {
  try {
    const { organizationId } = await requireAuth(request);

    const levelId = (await ctx.params).levelId;

    const data = await gamificationLevelService.deleteLevel(levelId);

    return http.ok(data);
  } catch (error) {
    console.error(error);
    throw http.serverError("Server error");
  }
}
