"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

import { CookieStoreKey, CookieStoreValue } from "@/constants/cookie.constant";

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

export const removeCookieStore = async <K extends CookieStoreKey>(key: K) => {
  const cookieStore = await cookies();
  return cookieStore.delete(key);
};
