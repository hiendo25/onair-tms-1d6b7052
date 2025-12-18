"use server";
import React from "react";
import { redirect, RedirectType } from "next/navigation";

import { PermissionProvider } from "@/modules/permission-wrapper/store/PermissionProvider";
import { authRepository } from "@/repository";
import { UserOrganizationService } from "@/services/organization/user-organization.service";
import { UserOrganizationProvider, UserOrganizationProviderProps } from "../store/UserOrganizationProvider";

const UserOrganizationWrapper = async ({ children }: { readonly children: React.ReactNode }) => {
  const currentUser = await authRepository.ensureGetCurrentUser();
  const userOrganization = new UserOrganizationService(currentUser.id);

  const currentEmployee = await userOrganization.getCurrentEmployee();
  const employees = await userOrganization.getEmployees();
  const organizations = await userOrganization.getOrganizations();

  const { roles, permissions } = await userOrganization.getRolesPermissions();

  if (!currentEmployee || !currentEmployee.organization) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }

  const organizationsStore = organizations.reduce((acc, orgEpl): UserOrganizationProviderProps["organizations"] => {
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

  const currentEmployeeProfile: UserOrganizationProviderProps["data"] = {
    id: currentEmployee.id,
    status: currentEmployee.status,
    employeeCode: currentEmployee.employee_code,
    employeeType: currentEmployee.employee_type || "student",
    userId: currentUser.id,
    employeeId: currentEmployee.id,
    organization: {
      id: currentEmployee.organization.id,
      name: currentEmployee.organization.name,
      subdomain: currentEmployee.organization.subdomain,
    },
    profile: currentEmployee.profiles
      ? {
          fullName: currentEmployee.profiles.full_name,
          avatarUrl: currentEmployee.profiles.avatar || "",
          email: currentEmployee.profiles.email,
          gender: currentEmployee.profiles.gender,
        }
      : null,
  };

  const employeesStore = employees.reduce((acc, employee): UserOrganizationProviderProps["employees"] => {
    return [
      ...acc,
      {
        id: employee.id,
        status: employee.status,
        code: employee.employee_code,
        type: employee.employee_type || "student",
        userId: currentUser.id,
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
    <UserOrganizationProvider
      data={currentEmployeeProfile}
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
        userId: currentUser.id,
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
    </UserOrganizationProvider>
  );
};
export default UserOrganizationWrapper;
