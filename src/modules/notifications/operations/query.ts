import { useTQuery } from "@/lib";
import { notificationsRepository } from "@/repository";
import { GetNotificationQueryParams, GetNotificationsByEmployeeQueryParams } from "@/repository/notifications";

import { notificationQueryKeys } from "./keys";
export const useGetOwnNotificationsQuery = (variables: {
  queryParams: GetNotificationQueryParams;
  enabled: boolean;
}) => {
  const { queryParams, enabled = true } = variables || {};
  return useTQuery({
    queryKey: notificationQueryKeys.list(queryParams),
    queryFn: () => notificationsRepository.getNotifications(queryParams),
    enabled,
  });
};

export const useGetNotificationsByEmployeeQuery = (variables: {
  queryParams: GetNotificationsByEmployeeQueryParams;
  enabled: boolean;
}) => {
  const { queryParams, enabled = true } = variables || {};
  return useTQuery({
    queryKey: notificationQueryKeys.list(queryParams),
    queryFn: () => notificationsRepository.getNotificationsByEmployee(queryParams),
    enabled,
  });
};

export const useGetNotificationsQuery = (variables?: {
  queryParams?: GetNotificationQueryParams;
  enabled?: boolean;
}) => {
  const { queryParams, enabled = true } = variables || {};
  return useTQuery({
    queryKey: notificationQueryKeys.list(queryParams),
    queryFn: () => notificationsRepository.getNotifications(queryParams),
    enabled,
  });
};

export const useGetNotificationsCountQuery = (variables: { params: { employeeId: string }; enabled?: boolean }) => {
  const { enabled = true, params } = variables || {};
  return useTQuery({
    queryKey: notificationQueryKeys.count(),
    queryFn: () => notificationsRepository.getNotificationsCount({ ...params, onlyUnRead: false }),
    enabled,
  });
};

export const useGetNotificationsUnReadCountQuery = (variables: {
  params: { employeeId: string };
  enabled?: boolean;
}) => {
  const { enabled = true, params } = variables || {};
  return useTQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: () => notificationsRepository.getNotificationsCount({ ...params, onlyUnRead: true }),
    enabled,
  });
};
