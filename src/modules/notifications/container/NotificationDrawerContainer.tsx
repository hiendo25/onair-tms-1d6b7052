"use client";
import React, { memo, useEffect, useEffectEvent, useMemo, useState } from "react";

import { NOTIFICATION_OPTIONS } from "@/constants/notification.constant";
import { useUserOrganization } from "@/modules/organization";
import { GetNotificationsByEmployeeQueryParams, GetNotificationsResponse } from "@/repository/notifications";
import { NotificationItemClassRoom } from "../components/notification-items/variants/NotificationItemClassRoom";
import { NotificationItemSystem } from "../components/notification-items/variants/NotificationItemSystem";
import NotificationDrawer, { NotificationDrawerProps } from "../components/NotificationDrawer";
import { useMarkNotificationAsRead } from "../hooks/useMarkNotificationAsRead";
import { useGetNotificationsByEmployeeInfiniteQuery, useGetNotificationsCountQuery } from "../operations/query";
import { useNotificationStore } from "../store";
type NotificationRow = GetNotificationsResponse[number];
type NotificationType = NotificationRow["type"];
import { usePathname } from "next/navigation";

interface NotificationDrawerContainerProps {}

type RequireOne<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

const DEFAULT_PAGE_SIZE = 10;
const NotificationDrawerContainer: React.FC<NotificationDrawerContainerProps> = (props) => {
  const pathname = usePathname();
  const isOpenDrawer = useNotificationStore((state) => state.isOpenDrawer);
  const closeNotification = useNotificationStore((state) => state.closeDrawer);
  const totalUnRead = useNotificationStore((state) => state.unRead);

  const {
    id: employeeId,
    organization: { id: organizationId },
  } = useUserOrganization((state) => state.currentEmployee);

  const [notificationQueryParams, setNotificationQueryParams] = useState<
    RequireOne<GetNotificationsByEmployeeQueryParams, "page" | "pageSize" | "organizationId" | "employeeId">
  >({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    organizationId,
    employeeId,
  });

  const { data, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useGetNotificationsByEmployeeInfiniteQuery({
      queryParams: notificationQueryParams,
      enabled: isOpenDrawer,
    });

  const notificationsAllPage = useMemo(() => {
    return data?.pages.flatMap((page) => page.data ?? []) || [];
  }, [data]);

  const { data: { data: dataCount } = {} } = useGetNotificationsCountQuery({
    params: { employeeId },
    enabled: isOpenDrawer,
  });
  const { markAsRead } = useMarkNotificationAsRead(notificationQueryParams);

  const notificationOptionWithCount = useMemo(() => {
    let totalCount = 0;
    const totalCountMap = new Map(
      dataCount?.map((it) => {
        totalCount += it.count;
        return [it.type, it];
      }),
    );

    return NOTIFICATION_OPTIONS.map((opt) => {
      const item = totalCountMap.get(opt.value as NotificationType);
      if (item) {
        return { ...opt, count: item.count };
      }
      if (opt.value === "all") {
        return { ...opt, count: totalCount };
      }
      return opt;
    });
  }, [dataCount]);

  const handleFilterNotification: NotificationDrawerProps<NotificationRow>["onFilterChange"] = (option) => {
    setNotificationQueryParams((prev) => ({
      ...prev,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      type: option.value === "all" ? undefined : (option.value as NotificationType),
    }));
  };

  const handleFetchNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  };
  const handleMarkReadNotify = (recordId: string) => () => {
    markAsRead(recordId);
  };

  useEffect(() => {
    if (!isOpenDrawer) return;
    closeNotification();
  }, [pathname]);

  return (
    <NotificationDrawer<NotificationRow>
      open={isOpenDrawer}
      onClose={closeNotification}
      items={notificationsAllPage}
      loading={isPending}
      disabledMarkAllRead={totalUnRead === 0}
      filterOptions={notificationOptionWithCount}
      onFilterChange={handleFilterNotification}
      onFetchNext={handleFetchNextPage}
      isFetchingNext={isFetchingNextPage}
      render={(item, index) => (
        <div className="-mx-4">
          {item.type === "class_room" ? (
            <NotificationItemClassRoom
              data={{
                title: item.title,
                description: item.body ?? undefined,
                thumbnailUrl: item.thumbnail_url ?? undefined,
                createdAt: item.created_at,
                isRead: item.is_read,
                type: "class_room",
                rawData: item.data,
              }}
              onClick={handleMarkReadNotify(item.id)}
            />
          ) : item.type === "system" ? (
            <NotificationItemSystem
              data={{
                title: item.title,
                description: item.body ?? undefined,
                thumbnailUrl: item.thumbnail_url ?? undefined,
                createdAt: item.created_at,
                isRead: item.is_read,
                type: "system",
                rawData: item.data,
              }}
              onClick={handleMarkReadNotify(item.id)}
            />
          ) : (
            <NotificationItemClassRoom
              data={{
                title: item.title,
                description: item.body ?? undefined,
                thumbnailUrl: item.thumbnail_url ?? undefined,
                createdAt: item.created_at,
                isRead: item.is_read,
                type: item.type,
                rawData: item.data,
              }}
              onClick={handleMarkReadNotify(item.id)}
            />
          )}
        </div>
      )}
    />
  );
};
export default memo(NotificationDrawerContainer);
