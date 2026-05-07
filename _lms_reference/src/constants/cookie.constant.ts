export const COOKIE_STORE_KEY = {
  organization_id: "organization_id",
  employee_id: "employee_id",
} as const;

export type CookieStoreKey = keyof typeof COOKIE_STORE_KEY;
export type CookieStoreValue<K extends CookieStoreKey> = K extends "organization_id" ? string : never;
