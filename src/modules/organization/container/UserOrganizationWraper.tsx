import { UserOrganizationProvider } from "../store/UserOrganizationProvider";
import { getEmployeeDetailInfoByUserId } from "../actions/getOrganization";
import { ensureGetCurrentUser } from "../../auth/actions/getCurrentUser";
import { redirect, RedirectType } from "next/navigation";
import { createSVClient } from "@/services";

const UserOrganizationWraper = async ({ children }: { readonly children: React.ReactNode }) => {
  const supabase = await createSVClient();
  const currentUser = await ensureGetCurrentUser();
  const employeeDetail = await getEmployeeDetailInfoByUserId(currentUser.id);

  if (!employeeDetail || !employeeDetail.organizations) {
    await supabase.auth.signOut();
    redirect("auth/signin", RedirectType.replace);
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
      {children}
    </UserOrganizationProvider>
  );
};
export default UserOrganizationWraper;
