"use server";
import React from "react";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { authRepository } from "@/repository";
import { userOrganizationService } from "@/services";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await authRepository.getCurrentUser();

  if (!currentUser) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }

  const organizationId = (await cookies()).get("organization_id")?.value;

  if (!organizationId) {
    redirect("/403");
  }

  const currentEmployee = await userOrganizationService.getCurrentEmployee(currentUser.id, organizationId);

  if (!currentEmployee || currentEmployee.employee_type !== "admin") {
    redirect("/403");
  }

  return <>{children}</>;
}
