export const LOCAL_STORAGE_KEYS = {
  ORGANIZATION_ID: "onair_organization_id",
} as const;

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_KEYS;
