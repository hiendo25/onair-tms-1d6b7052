"use server";
import React from "react";
import { cookies } from "next/headers";
import { forbidden, redirect, RedirectType } from "next/navigation";

import { PermissionProvider } from "@/modules/permission-wrapper/store/PermissionProvider";
import { authRepository } from "@/repository";
import { userOrganizationService } from "@/services";
import { OrganizationProvider, OrganizationProviderProps } from "../store/OrganizationProvider";
const OrganizationWrapper = async ({ children }: { readonly children: React.ReactNode }) => {
  const currentUser = await authRepository.getCurrentUser();

  if (!currentUser) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }
  const userId = currentUser.id;

  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organization_id")?.value;

  const [employees, organizations, { roles, permissions }] = await Promise.all([
    userOrganizationService.getEmployees(userId),
    userOrganizationService.getOrganizations(userId),
    userOrganizationService.getRolesPermissions(userId),
  ]);

  const currentEmployee = employees.find((epl) => epl.organization.id === organizationId);

  console.log({ employees, organizations, roles, permissions, currentEmployee });

  if (!currentEmployee) {
    forbidden();
  }

  const organizationsStore = organizations.map((orgEpl): OrganizationProviderProps["organizations"][number] => {
    return {
      employeeId: orgEpl.employee_id,
      orgId: orgEpl.organization.id,
      orgName: orgEpl.organization?.name || "",
      orgLogo: orgEpl.organization?.logo || "",
      orgDomain: orgEpl.organization?.subdomain || "",
      userId: orgEpl.user_id,
      orgFavicon: orgEpl.organization.favicon || "",
      orgShortName: orgEpl.organization.shortname || "",
    };
  });

  const employeesStore = employees.map((employee): OrganizationProviderProps["employees"][number] => {
    return {
      id: employee.id,
      status: employee.status,
      code: employee.employee_code,
      type: employee.employee_type || "student",
      userId: employee.user_id,
      organization: {
        id: employee.organization.id,
        name: employee.organization.name,
      },
      profile: employee.profiles
        ? {
            fullName: employee.profiles.full_name,
            avatarUrl: employee.profiles.avatar || "",
            email: employee.profiles.email,
            gender: employee.profiles.gender,
          }
        : null,
    };
  });

  return (
    <OrganizationProvider
      currentOrganization={{
        employeeId: currentEmployee.id,
        orgDomain: currentEmployee.organization.subdomain,
        orgFavicon: currentEmployee.organization.favicon || "",
        orgShortName: currentEmployee.organization.shortname || "",
        userId: currentEmployee.user_id,
        orgId: currentEmployee.organization.id,
        orgLogo: currentEmployee.organization.logo,
        orgName: currentEmployee.organization.name,
      }}
      currentEmployee={{
        id: currentEmployee.id,
        status: currentEmployee.status,
        code: currentEmployee.employee_code,
        type: currentEmployee.employee_type || "student",
        userId: currentEmployee.user_id,
        organization: {
          id: currentEmployee.organization.id,
          name: currentEmployee.organization.name,
        },
        profile: currentEmployee.profiles
          ? {
              fullName: currentEmployee.profiles.full_name,
              avatarUrl: currentEmployee.profiles.avatar || "",
              email: currentEmployee.profiles.email,
              gender: currentEmployee.profiles.gender,
            }
          : null,
      }}
      organizations={organizationsStore}
      employees={employeesStore}
    >
      <PermissionProvider permissions={permissions} roles={roles}>
        {children}
      </PermissionProvider>
    </OrganizationProvider>
  );
};
export default OrganizationWrapper;
