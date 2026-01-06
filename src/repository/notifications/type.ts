import { Notifications } from "@/model/notification.model";

export type CreateNotificationPayload = Pick<
  Notifications,
  "body" | "data" | "employee_id" | "is_read" | "organization_id" | "title" | "type" | "url"
>;

export type MarkReadNotificationPayload = Pick<Notifications, "id">;
