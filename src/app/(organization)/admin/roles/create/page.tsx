"use client";
import PageContainer from "@/shared/ui/PageContainer";
import { RoleFormContainer } from "@/modules/roles/components/RoleForm";
import { useRouter } from "next/navigation";
import { useGetGroupPermissionList } from "@/modules/roles/operations/query";
import { RoleParams, RolePermissionsParams } from "@/repository/roles";
import { useCreateRole } from "@/modules/roles/operations/mutation";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

const CreateRolePage = () => {
  const router = useRouter();

  const userInfo = useUserOrganization((state) => state.data);

  const { data: permissionModules, isLoading } = useGetGroupPermissionList();
  const { mutate: createRoleMutate, isPending } = useCreateRole();

  if (isLoading)
    return (
      <PageContainer title="Đang tải...">
        <div>Đang tải dữ liệu phân quyền...</div>
      </PageContainer>
    );

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
          router.push("/roles");
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
