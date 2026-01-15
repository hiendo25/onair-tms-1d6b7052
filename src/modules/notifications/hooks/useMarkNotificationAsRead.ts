import { useQueryClient } from "@tanstack/react-query";

import { GetNotificationByEmployeeResponse, GetNotificationQueryParams } from "@/repository/notifications";
import { notificationQueryKeys } from "../operations/keys";
import { useMarkReadNotificationMutation } from "../operations/mutation";

export const useMarkNotificationAsRead = (params: GetNotificationQueryParams) => {
  const { mutate, isPending } = useMarkReadNotificationMutation();
  const queryClient = useQueryClient();

  const markRead = (recordId: string) => {
    mutate(
      { id: recordId },
      {
        onSuccess: ({ data }) => {
          queryClient.invalidateQueries({
            queryKey: notificationQueryKeys.list(params),
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
