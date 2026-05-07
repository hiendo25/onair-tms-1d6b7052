import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { PushSubscriptionService } from "@/modules/notifications/service/push-subscriptions.service";

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireAuth();

    await new PushSubscriptionService().push(organizationId, {
      body: "Noi dung mesage",
      title: "thong bao moi",
      url: "/dashboard",
    });

    return http.ok({ success: true });
  } catch (err) {
    console.log(err);

    return http.serverError("Can't send message");
  }
}
