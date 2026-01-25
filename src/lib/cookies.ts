"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const COOKIE_STORE_KEY = {
  organization_id: "organization_id",
  employee_id: "employee_id",
} as const;
type CookieStoreKey = keyof typeof COOKIE_STORE_KEY;

type CookieStoreValue<K extends CookieStoreKey> = K extends "organization_id" ? string : never;

export const getCookieStore = async <K extends CookieStoreKey>(key: K) => {
  const cookieStore = await cookies();

  return cookieStore.get(key as string)?.value as CookieStoreValue<K>;
};

export const setCookieStore = async <K extends CookieStoreKey>(
  key: K,
  value: CookieStoreValue<K>,
  cookie?: Partial<ResponseCookie>,
) => {
  const cookieStore = await cookies();

  return cookieStore.set(key, value, cookie);
};
