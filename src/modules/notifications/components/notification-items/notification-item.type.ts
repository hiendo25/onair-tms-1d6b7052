import { NotificationType } from "@/model/notification.model";
import { Json } from "@/types/supabase.types";

export type NotificationItemType = {
  title: string;
  isRead: boolean;
  description?: string;
  thumbnailUrl?: string;
  type: NotificationType;
  createdAt: string;
  rawData?: Json;
};
