import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { PushSubscriptionService } from "@/modules/notifications/service/push-subscriptions.service";
import { http } from "@/utils/http-status";

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAuth();

    await new PushSubscriptionService().push(organizationId, {
      body: "12313123",
      title: "thong bao moi",
      url: "/dashboard",
    });

    return http.ok({ success: true });
  } catch (err) {
    console.log(err);

    return http.serverError("Can't create classroom");
  }
}
