import { webpush } from "@/lib/webpush";
import { pushSubscriptionsRepository } from "@/repository";
import { SubscribePushSubscriptionPayload } from "@/repository/push-subscriptions/type";
import { DomainError } from "@/services/DomainError";
import { SendPushNotificationPayloadDto, SubscribePushSubscriptionDto } from "../dto/push-subscription.dto";

export class PushSubscriptionService {
  async subscribe(dto: SubscribePushSubscriptionDto) {
    const payload: SubscribePushSubscriptionPayload = {
      auth: dto.auth,
      employee_id: dto.employeeId,
      endpoint: dto.endpoint,
      p256dh: dto.p256dh,
      user_agent: dto.userAgent,
      organization_id: dto.organizationId,
      meta_data: null,
    };
    const { data, error } = await pushSubscriptionsRepository.subscribeUser(payload);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async push(organizationId: string, payload: SendPushNotificationPayloadDto) {
    const { data: subscriptions, error } = await pushSubscriptionsRepository.getSubscriptionsByOrganizationId(
      organizationId,
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!subscriptions) {
      throw new DomainError("Subscriptions are empty", "SUBSCRIPTIONS_EMPTY", 400);
    }

    if (!subscriptions.length) return;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          console.log("success", payload);
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload),
          );
        } catch (err: any) {
          console.log(err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            await pushSubscriptionsRepository.unsubscribeUser(sub.endpoint);
          }
        }
      }),
    );
  }
  async unsubscribe(endpoint: string) {
    return await pushSubscriptionsRepository.unsubscribeUser(endpoint);
  }
}
