import { keyof, unknown } from "zod";

export const LOCAL_STORAGE_KEYS = {
  ORGANIZATION_ID: "onair_organization_id",
  PUSH_NOTIFICATION_RECEIVED: "push_notification_received",
} as const;

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS;

export type LocalStorageValue<K extends LocalStorageKey> = K extends "ORGANIZATION_ID"
  ? string
  : K extends "PUSH_NOTIFICATION_RECEIVED"
    ? { except: boolean; timeStamp: number }
    : never;

export type PushNotificationReceivedValues = {
  except: boolean;
  timeStamp: number;
};
