"use client";
import PageContainer from "@/shared/ui/PageContainer";
import { RoleFormContainer } from "@/modules/roles/components/RoleForm";
import { useRouter } from "next/navigation";
import { useGetGroupPermissionList } from "@/modules/roles/operations/query";
import { RoleParams, RolePermissionsParams } from "@/repository/roles";
import { useCreateRole } from "@/modules/roles/operations/mutation";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { PATHS } from "@/constants/path.contstants";
import ManageRoleForm from "@/modules/roles/components/ManageRoleForm";

const CreateRolePage = () => {
  const router = useRouter();

  const userInfo = useUserOrganization((state) => state.data);

  const { data: permissionModules, isLoading } = useGetGroupPermissionList();

  console.log({ permissionModules });
  const { mutate: createRoleMutate, isPending } = useCreateRole();

  const handleSubmit = (data: RoleParams & RolePermissionsParams) => {
    if (!data.title || data.title.trim() === "") return alert("Vui lòng nhập tên vai trò.");

    if (!data.permissionsToAdd || data.permissionsToAdd.length === 0)
      return alert("Vui lòng chọn ít nhất một quyền cho vai trò.");

    createRoleMutate(
      {
        title: data.title,
        description: data.description,
        permissions: data.permissionsToAdd,
        organization_id: userInfo.organization.id,
      },
      {
        onSuccess: () => {
          router.push(PATHS.ROLE.ROOT);
        },
      },
    );
  };

  return (
    <PageContainer
      title="Tạo mới vai trò & phân quyền"
      breadcrumbs={[
        { title: "Quản lý vai trò", path: PATHS.ROLE.ROOT },
        { title: "Tạo vai trò", path: PATHS.ROLE.CREATE },
      ]}
    >
      <ManageRoleForm />
      <RoleFormContainer
        isEditMode={false}
        initialData={{
          id: "",
          name: "",
          description: "",
          // modules: [],
        }}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
};

export default CreateRolePage;
