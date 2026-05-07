import { client } from "@/lib/api";
import { CreateNotificationPayload } from "@/repository/notifications/type";
abstract class NotificationBaseService {
  protected async bulkCreate(payload: CreateNotificationPayload[]) {
    return client.post("notifications/bulk-create", payload);
  }
}
export { NotificationBaseService };
