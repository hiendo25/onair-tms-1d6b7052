export type SubscribePushSubscriptionDto = {
  endpoint: string;
  p256dh: string;
  auth: string;
  employeeId: string;
  userAgent: string | null;
  organizationId: string;
};

export type SendPushNotificationPayloadDto = {
  title: string;
  body: string;
  url: string;
};
