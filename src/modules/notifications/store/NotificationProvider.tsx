"use client";
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo } from "react";
import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { StoreApi, useStore } from "zustand";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useUserOrganization } from "@/modules/organization";
import { useSubscribeNotifications } from "../hooks/useNotificationsRealtime";
import { notificationQueryKeys } from "../operations/keys";
import { useGetNotificationsUnReadCountQuery } from "../operations/query";

import { createNotificationStore, NotificationStore } from "./NotificationStore";

type NotificationStoreApi = StoreApi<NotificationStore>;

const NotificationContext = createContext<NotificationStoreApi | undefined>(undefined);

interface NotificationProviderProps extends PropsWithChildren {}
const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationStoreRef = useRef<NotificationStoreApi>(null);
  const { id: employeeId } = useUserOrganization((state) => state.currentEmployee);

  const { data: { data: dataUnreadCount } = {} } = useGetNotificationsUnReadCountQuery({ params: { employeeId } });
  const queryClient = useQueryClient();

  const totalUnReadCount = useMemo(() => {
    return dataUnreadCount?.reduce((sum, it) => (sum += it.count), 0) || 0;
  }, [dataUnreadCount]);

  if (!notificationStoreRef.current) {
    notificationStoreRef.current = createNotificationStore({
      isOpenDrawer: false,
      notifications: [],
      unRead: totalUnReadCount,
    });
  }

  useSubscribeNotifications(employeeId, () => {
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() });
    queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() });
  });

  useEffect(() => {
    if (!notificationStoreRef.current) return;

    notificationStoreRef.current.setState({
      unRead: totalUnReadCount,
    });
  }, [totalUnReadCount]);

  return <NotificationContext.Provider value={notificationStoreRef.current}>{children}</NotificationContext.Provider>;
};
export default NotificationProvider;

export const useNotificationStore = <T,>(selector: (store: NotificationStore) => T): T => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(`useNotification must be used within NotificationProvider`);
  }
  return useStore(context, selector);
};
