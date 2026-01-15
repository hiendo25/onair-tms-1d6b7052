import { infiniteQueryOptions } from "@tanstack/react-query";

import { useTInfiniteQuery, useTQuery } from "@/lib";
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

function getNotificationByEmployeeInfiniteQueryOptions(queryParams: GetNotificationsByEmployeeQueryParams) {
  let queryKey = notificationQueryKeys.list(queryParams);

  const pageSize = queryParams.pageSize || 5;

  return infiniteQueryOptions({
    queryKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      notificationsRepository.getNotificationsByEmployee({
        ...queryParams,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (!lastPage.data) return undefined;
      if (lastPage.data?.length < pageSize) return undefined;

      return lastPageParam + 1;
    },
  });
}

export const useGetNotificationsByEmployeeInfiniteQuery = (variables: {
  queryParams: GetNotificationsByEmployeeQueryParams;
  enabled: boolean;
}) => {
  const { queryParams, enabled = true } = variables || {};
  return useTInfiniteQuery({
    ...getNotificationByEmployeeInfiniteQueryOptions(queryParams),
    enabled,
  });
};

// export const useInfiniteOnlineCourseQuery = ({
// 	filters,
// }: {
// 	filters: OnlineCourseComboQueryFilter;
// }) => {
// 	return useInfiniteQuery({
// 		...courseAndComboInfiniteQueryOptions(filters),
// 		placeholderData: (previousData, previousQuery) => previousData,
// 	});
// };
