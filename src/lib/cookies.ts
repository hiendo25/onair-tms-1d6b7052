"use server";

import { cookies } from "next/headers";

const CookieStoreKey = {
  organization_id: "organization_id",
  employee_id: "employee_id",
} as const;

type cookieStoreKey = keyof typeof CookieStoreKey;
export const getCookieStore = async (key: cookieStoreKey) => {
  const cookieStore = await cookies();

  return cookieStore.get(key)?.value;
};

export const getOrganizationId = async () => {
  const cookieStore = await cookies();

  return cookieStore.get("organization_id")?.value;
};
