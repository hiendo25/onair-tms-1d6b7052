"use server";
import { cookies } from "next/headers";

import { authRepository, employeesRepository } from "@/repository";
import { http } from "@/utils/http-status";
export async function requireAuth() {
  const currentUser = await authRepository.getCurrentUser();

  const cookieStore = await cookies();

  const organizationId = cookieStore.get("organization_id")?.value;

  if (!currentUser) {
    throw http.unauthorized();
  }

  if (!organizationId) {
    throw http.badRequest("Invalid organizationId");
  }

  const userOrganization = await employeesRepository.getCurrentEmployee(currentUser.id, organizationId);

  if (!userOrganization) {
    throw http.unauthorized();
  }

  return {
    userId: currentUser.id,
    employeeId: userOrganization.id,
    organizationId: userOrganization.organization_id,
  };
}
