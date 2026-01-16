import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

import { requireAuth } from "@/lib/auth/require-auth";
import { SubscribePushSubscriptionDto } from "@/modules/notifications/dto/push-subscription.dto";
import { PushSubscriptionService } from "@/modules/notifications/service/push-subscriptions.service";
import { http } from "@/utils/http-status";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const payload = (await request.json()) as { endpoint: string };
    const data = await new PushSubscriptionService().unsubscribe(payload.endpoint);

    return http.ok(data);
  } catch (error) {
    console.error("Error unsubscribe:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi unsubscribe";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
