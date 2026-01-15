import { notificationsRepository } from "@/repository";
import { CreateNotificationPayload } from "@/repository/notifications/type";
abstract class NotificationBaseService {
  protected async bulkCreate(payload: CreateNotificationPayload[]) {
    return await notificationsRepository.bulkCreateNotification(payload);
  }
}
export { NotificationBaseService };
