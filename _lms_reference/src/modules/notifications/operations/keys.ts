import { QUERY_KEYS } from "@/constants/query-key.constant";
import { GetNotificationQueryParams } from "@/repository/notifications";
export const notificationQueryKeys = {
  all: [QUERY_KEYS.GET_NOTIFICATIONS],
  list: (queryParams?: GetNotificationQueryParams) =>
    queryParams ? [...notificationQueryKeys.all, "list", queryParams] : [...notificationQueryKeys.all, "list"],
  unreadCount: () => [...notificationQueryKeys.all, "unreadCount"],
  count: () => [...notificationQueryKeys.all, "count"],
} as const;
