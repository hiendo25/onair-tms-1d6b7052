import { UserOrganizationProvider } from "../store/UserOrganizationProvider";
import { redirect, RedirectType } from "next/navigation";
import { PermissionProvider } from "@/modules/roles/store/PermissionsProvider";
import { getUserPermissions } from "@/repository/permissions";
import { authRepository } from "@/repository";
import { organizationsRepository } from "@/repository";

const UserOrganizationWraper = async ({ children }: { readonly children: React.ReactNode }) => {
  const currentUser = await authRepository.ensureGetCurrentUser();
  const employeeDetail = await organizationsRepository.getEmployeeDetailInfoByUserId(currentUser.id);

  const permissions = await getUserPermissions(currentUser.id);

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
      <PermissionProvider initialData={permissions}>{children}</PermissionProvider>;
    </UserOrganizationProvider>
  );
};
export default UserOrganizationWraper;
