"use server";
import React from "react";
import { cookies, headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { PermissionProvider } from "@/modules/permission-wrapper/store/PermissionProvider";
import { authRepository } from "@/repository";
import { UserOrganizationService } from "@/services/organization/user-organization.service";
import { OrganizationProvider, OrganizationProviderProps } from "../store/OrganizationProvider";

const OrganizationWrapper = async ({ children }: { readonly children: React.ReactNode }) => {
  const cookieStore = await cookies();
  const organizationId = cookieStore.get("organization_id")?.value;

  const currentUser = await authRepository.getCurrentUser();

  console.log({ organizationId });
  if (!organizationId || !currentUser) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }

  const userOrganization = new UserOrganizationService(currentUser.id);

  const [employees, organizations, { roles, permissions }, currentEmployee] = await Promise.all([
    userOrganization.getEmployees(),
    userOrganization.getOrganizations(),
    userOrganization.getRolesPermissions(),
    userOrganization.getCurrentEmployee(organizationId),
  ]);

  const organizationsStore = organizations.reduce((acc, orgEpl): OrganizationProviderProps["organizations"] => {
    return [
      ...acc,
      {
        employeeId: orgEpl.employee_id,
        orgId: orgEpl.organization.id,
        orgName: orgEpl.organization?.name || "",
        orgLogo: orgEpl.organization?.logo || "",
        orgDomain: orgEpl.organization?.subdomain || "",
        userId: orgEpl.user_id,
        orgFavicon: orgEpl.organization.favicon || "",
        orgShortName: orgEpl.organization.shortname || "",
      },
    ];
  }, []);

  const employeesStore = employees.reduce((acc, employee): OrganizationProviderProps["employees"] => {
    return [
      ...acc,
      {
        id: employee.id,
        status: employee.status,
        code: employee.employee_code,
        type: employee.employee_type || "student",
        userId: currentEmployee.user_id,
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
      },
    ];
  }, []);

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
