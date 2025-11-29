import { UserOrganizationProvider } from "../store/UserOrganizationProvider";
import { redirect, RedirectType } from "next/navigation";
import { PermissionProviderV2 } from "@/modules/roles/store/PermissionsProvider";
import { authRepository } from "@/repository";
import { UserOrganizationService } from "@/services/organization/user-organization.service";

const UserOrganizationWraper = async ({ children }: { readonly children: React.ReactNode }) => {
  const currentUser = await authRepository.ensureGetCurrentUser();
  const userOrganization = new UserOrganizationService(currentUser.id);

  const employeeDetail = await userOrganization.getEmployeeDetail();
  const permissions = await userOrganization.getPermissions();

  if (!employeeDetail || !employeeDetail.organizations) {
    await authRepository.authServerSignOut();
    redirect("/auth/signin", RedirectType.replace);
  }

  return (
    <UserOrganizationProvider
      data={{
        id: employeeDetail.id,
        status: employeeDetail.status,
        employeeCode: employeeDetail.employee_code,
        employeeType: employeeDetail.employee_type || "student",
        userId: currentUser.id,
        organization: {
          id: employeeDetail.organizations?.id,
          name: employeeDetail.organizations?.name,
          subdomain: employeeDetail.organizations?.subdomain,
        },
        profile: employeeDetail.profiles
          ? {
              fullName: employeeDetail.profiles.full_name,
              avatarUrl: employeeDetail.profiles.avatar || "",
              email: employeeDetail.profiles.email,
              gender: employeeDetail.profiles.gender,
            }
          : null,
      }}
    >
      <PermissionProviderV2 permissions={permissions}>{children}</PermissionProviderV2>;
    </UserOrganizationProvider>
  );
};
export default UserOrganizationWraper;
