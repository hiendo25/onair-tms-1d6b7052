import { CreateNotificationPayload } from "@/repository/notifications/type";
import { client } from "../api";
abstract class NotificationBaseService {
  protected async bulkCreate(payload: CreateNotificationPayload[]) {
    return client.post("notifications/bulk-create", payload);
  }
}
export { NotificationBaseService };
