"use server";
import { cache } from "react";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { createSVClient } from "@/services";

export async function requireAuth(request?: NextRequest) {
  const supabaseSV = await createSVClient();

  const { data } = request ? await supabaseSV.auth.getUser(getBearerToken(request)) : await supabaseSV.auth.getUser();

  const user = data.user;

  if (!user) {
    throw http.unauthorized("Unauthorized");
  }

  const cookieStore = await cookies();

  const organizationId = cookieStore.get("organization_id")?.value;

  if (!organizationId) {
    throw http.badRequest("Invalid organizationId");
  }
  const employee = await getEmployee(supabaseSV)(user.id, organizationId);

  if (!employee) {
    throw http.unauthorized();
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

const getBearerToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return token;
};
