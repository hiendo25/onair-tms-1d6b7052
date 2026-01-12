import { createStore } from "zustand/vanilla";

import { NotificationType } from "@/model/notification.model";
import { Json } from "@/types/supabase.types";
type Notification = {
  body: string | null;
  createdAt: string;
  data: Json;
  employeeId: string;
  id: string;
  isRead: boolean;
  organizationId: string;
  title: string;
  type: NotificationType;
  url: string | null;
};
export type NotificationState = {
  isOpenDrawer: boolean;
  notifications: Notification[];
  unRead: number;
};

export type NotificationActions = {
  openDrawer: () => void;
  closeDrawer: () => void;
};

export type NotificationStore = NotificationState & NotificationActions;

export const defaultInitState: NotificationState = {
  isOpenDrawer: false,
  notifications: [],
  unRead: 0,
};

export const createNotificationStore = (initState: NotificationState = defaultInitState) => {
  return createStore<NotificationStore>()((set) => ({
    ...initState,
    openDrawer: () => {
      set({ isOpenDrawer: true });
    },
    closeDrawer: () => {
      set({ isOpenDrawer: false });
    },
  }));
};
