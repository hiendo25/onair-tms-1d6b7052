import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { SubscribePushSubscriptionDto } from "@/modules/notifications/dto/push-subscription.dto";
import { PushSubscriptionService } from "@/modules/notifications/service/push-subscriptions.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const payload = (await request.json()) as { endpoint: string; p256dh: string; auth: string; userAgent?: string };
    const userAgent = request.headers.get("user-agent");

    const subscribePayload: SubscribePushSubscriptionDto = {
      employeeId: user.employeeId,
      organizationId: user.organizationId,
      auth: payload.auth,
      endpoint: payload.endpoint,
      p256dh: payload.p256dh,
      userAgent: userAgent,
    };

    console.log({ subscribePayload });
    const data = await new PushSubscriptionService().subscribe(subscribePayload);

    return http.created(data);
  } catch (error) {
    console.error("Error creating employee:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo nhân viên";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
