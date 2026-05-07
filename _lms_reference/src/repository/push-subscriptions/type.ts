import { PushSubscriptions } from "@/model/push-subscriptions.model";

export type SubscribePushSubscriptionPayload = Pick<
  PushSubscriptions,
  "auth" | "employee_id" | "endpoint" | "p256dh" | "user_agent" | "organization_id" | "meta_data"
>;
