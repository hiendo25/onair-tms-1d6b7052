import { useTMutation } from "@/lib";
import { notificationsRepository } from "@/repository";
import { MarkNotificationAsReadPayload } from "@/repository/notifications/type";
export const useMarkReadNotificationMutation = () => {
  return useTMutation({
    mutationFn: (payload: MarkNotificationAsReadPayload) => notificationsRepository.markNotificationAsRead(payload),
  });
};
