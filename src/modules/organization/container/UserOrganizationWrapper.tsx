import React from "react";
import { redirect, RedirectType } from "next/navigation";

import { PermissionProvider } from "@/modules/permission-wrapper/store/PermissionProvider";
import { authRepository } from "@/repository";
import { UserOrganizationService } from "@/services/organization/user-organization.service";
import { UserOrganizationProvider, UserOrganizationProviderProps } from "../store/UserOrganizationProvider";

const UserOrganizationWrapper = async ({ children }: { readonly children: React.ReactNode }) => {
  const currentUser = await authRepository.ensureGetCurrentUser();
  const userOrganization = new UserOrganizationService(currentUser.id);

  const mainEmployee = await userOrganization.getMainEmployee();
  const orgsEmployees = await userOrganization.getEmployees();

  console.log({ orgsEmployees, mainEmployee });

  const { roles, permissions } = await userOrganization.getRolesPermissions();

  if (!mainEmployee || !mainEmployee.organization) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }

  const organizationsEmployees = orgsEmployees?.reduce(
    (acc, orgEpl): UserOrganizationProviderProps["employeesOrganizations"] => {
      return [
        ...acc,
        {
          employeeId: orgEpl.id,
          isMain: orgEpl.is_main || false,
          orgId: orgEpl.organization.id,
          orgName: orgEpl.organization?.name || "",
          orgLogo: orgEpl.organization?.logo || "",
          orgDomain: orgEpl.organization?.subdomain || "",
          userId: orgEpl.user_id,
          orgFavicon: orgEpl.organization.favicon || "",
          orgShortName: orgEpl.organization.shortname || "",
        },
      ];
    },
    [],
  );

  const currentEmployeeProfile: UserOrganizationProviderProps["data"] = {
    id: mainEmployee.id,
    status: mainEmployee.status,
    employeeCode: mainEmployee.employee_code,
    employeeType: mainEmployee.employee_type || "student",
    userId: currentUser.id,
    organization: {
      id: mainEmployee.organization.id,
      name: mainEmployee.organization.name,
      subdomain: mainEmployee.organization.subdomain,
    },
    profile: mainEmployee.profiles
      ? {
          fullName: mainEmployee.profiles.full_name,
          avatarUrl: mainEmployee.profiles.avatar || "",
          email: mainEmployee.profiles.email,
          gender: mainEmployee.profiles.gender,
        }
      : null,
  };

  return (
    <UserOrganizationProvider
      data={currentEmployeeProfile}
      mainOrganization={{
        isMain: mainEmployee.is_main || false,
        employeeId: mainEmployee.id,
        orgDomain: mainEmployee.organization.subdomain,
        orgFavicon: mainEmployee.organization.favicon || "",
        orgShortName: mainEmployee.organization.shortname || "",
        userId: mainEmployee.user_id,
        orgId: mainEmployee.organization.id,
        orgLogo: mainEmployee.organization.logo,
        orgName: mainEmployee.organization.name,
      }}
      employeesOrganizations={organizationsEmployees || []}
    >
      <PermissionProvider permissions={permissions} roles={roles}>
        {children}
      </PermissionProvider>
    </UserOrganizationProvider>
  );
};
export default UserOrganizationWrapper;
