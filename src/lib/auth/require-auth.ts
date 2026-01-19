"use server";
import { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { authRepository, employeesRepository } from "@/repository";
import { createSVClient } from "@/services";
import { http } from "@/utils/http-status";

export async function requireAuth(request?: NextRequest) {
  const supabaseSV = await createSVClient();

  let currentUser: User | null = null;

  if (request) {
    const token = await getBearerToken(request);
    const { data, error } = await supabaseSV.auth.getUser(token);
    currentUser = data.user;
  } else {
    const { data, error } = await supabaseSV.auth.getUser();
    currentUser = data.user;
  }

  const cookieStore = await cookies();

  const organizationId = cookieStore.get("organization_id")?.value;

  console.log({ currentUser, organizationId });

  const userId = currentUser?.id;

  if (!userId) {
    throw http.unauthorized("Unauthorized");
  }

  if (!organizationId) {
    throw http.badRequest("Invalid organizationId");
  }

  const userOrganization = await employeesRepository.getCurrentEmployee(userId, organizationId);

  if (!userOrganization) {
    throw http.unauthorized();
  }

  return {
    userId: userId,
    employeeId: userOrganization.id,
    organizationId: userOrganization.organization_id,
  };
}

const getBearerToken = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  return token;
};
