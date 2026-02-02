"use server";

import { cache } from "react";
import { forbidden } from "next/navigation";

import { createSVClient } from "@/services";
import { getCookieStore } from "../cookies";

export default async function organizationAuth() {
  const supabaseSV = await createSVClient();

  const {
    data: { user },
  } = await supabaseSV.auth.getUser();

  if (!user) {
    forbidden();
  }

  const organizationId = await getCookieStore("organization_id");

  if (!organizationId) {
    forbidden();
  }
  const employee = await getEmployee(supabaseSV)(user.id, organizationId);

  if (!employee) {
    forbidden();
  }

  return {
    userId: employee.user_id,
    employeeId: employee.id,
    organizationId: employee.organization_id,
  };
}

const getEmployee = cache(
  (supabaseSV: Awaited<ReturnType<typeof createSVClient>>) => async (userId: string, organizationId: string) => {
    const { data: employee, error } = await supabaseSV
      .from("employees")
      .select("*")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw new Error(error.details);
    }
    return employee;
  },
);
