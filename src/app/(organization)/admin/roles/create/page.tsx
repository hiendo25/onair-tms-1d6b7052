"use client";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { RoleFormContainer } from "@/modules/roles/components/RoleForm";
import { useCreateRole } from "@/modules/roles/operations/mutation";
import { useGetGroupPermissionList } from "@/modules/roles/operations/query";
import { RoleParams, RolePermissionsParams } from "@/repository/roles";
import PageContainer from "@/shared/ui/PageContainer";

const CreateRolePage = () => {
  const router = useRouter();

  const userInfo = useUserOrganization((state) => state.data);

  const { data: permissionModules, isLoading } = useGetGroupPermissionList();
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
    <PageContainer title="Tạo mới vai trò & phân quyền">
      <Backdrop
        open={isPending}
        sx={{
          position: "absolute",
          zIndex: 1,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Đang cập nhật quyền...
          </Typography>
        </Box>
      </Backdrop>
      {permissionModules && (
        <RoleFormContainer
          isEditMode={false}
          initialData={{
            id: "",
            name: "",
            description: "",
            modules: permissionModules || [],
          }}
          onSubmit={handleSubmit}
        />
      )}
    </PageContainer>
  );
};

export default CreateRolePage;
