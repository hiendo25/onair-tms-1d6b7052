import { useQueryClient } from "@tanstack/react-query";

import { GetNotificationQueryParams, GetNotificationsResponse } from "@/repository/notifications";
import { notificationQueryKeys } from "../operations/keys";
import { useMarkReadNotificationMutation } from "../operations/mutation";
type NotificationItem = GetNotificationsResponse[number];

export const useMarkNotificationAsRead = (params: GetNotificationQueryParams) => {
  const { mutate, isPending } = useMarkReadNotificationMutation();
  const queryClient = useQueryClient();

  const markRead = (recordId: string) => {
    mutate(
      { id: recordId },
      {
        onSuccess: ({ data }) => {
          if (!data) return;
          const { id, is_read } = data;

          queryClient.setQueryData<NotificationItem[]>(notificationQueryKeys.list(params), (previousNotifications) => {
            return previousNotifications?.map((n) => (n.id === id ? { ...n, is_read } : n));
          });

          queryClient.invalidateQueries({
            queryKey: notificationQueryKeys.unreadCount(),
          });
        },
      },
    );
  };
  return { isPending, markAsRead: markRead };
};
