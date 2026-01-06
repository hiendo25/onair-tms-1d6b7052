import { createStore } from "zustand/vanilla";

export type NotificationState = {
  messages: any[];
};

export type NotificationActions = {
  markRead: () => void;
};

export type NotificationStore = NotificationState & NotificationActions;

export const defaultInitState: NotificationState = {
  messages: [],
};

export const createNotificationStore = (initState: NotificationState = defaultInitState) => {
  return createStore<NotificationStore>()((set) => ({
    ...initState,
    markRead: () => {},
  }));
};
