"use client";
import { IMMUTABLE_ROLES } from "@/constants/roles.constant";
import { RoleFormContainer } from "@/modules/roles/components/RoleForm";
import { useUpdateRolePermissions } from "@/modules/roles/operations/mutation";
import { useGetRolePermissions } from "@/modules/roles/operations/query";
import { RoleParams, RolePermissionsParams } from "@/repository/roles";
import PageContainer from "@/shared/ui/PageContainer";
import { Alert, Backdrop, Box, Button, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";

const EditRolePage = () => {
  const router = useRouter();
  const params = useParams<{ code: string }>();

  if (!params?.code)
    return (
      <PageContainer title="Lỗi">
        <Alert severity="error">Không tìm thấy mã vai trò. Vui lòng thử lại.</Alert>
        <Box sx={{ mt: 2 }} alignSelf={"center"}>
          <Button variant="contained" onClick={() => router.push("/roles")}>
            Quay về danh sách vai trò
          </Button>
        </Box>
      </PageContainer>
    );

  const { data: rolePermissions, isLoading } = useGetRolePermissions(params.code);
  const { mutate: updateRoleMutate, isPending } = useUpdateRolePermissions(rolePermissions?.id || "");

  if (isLoading)
    return (
      <PageContainer title="Đang tải...">
        <div>Đang tải dữ liệu vai trò...</div>
      </PageContainer>
    );

  if (!rolePermissions)
    return (
      <PageContainer title="Lỗi">
        <Alert severity="error">Không tìm thấy dữ liệu vai trò. Vui lòng thử lại.</Alert>
        <Box sx={{ mt: 2 }} alignSelf={"center"}>
          <Button variant="contained" onClick={() => router.push("/roles")}>
            Quay về danh sách vai trò
          </Button>
        </Box>
      </PageContainer>
    );

  const handleSubmit = (data: RoleParams & RolePermissionsParams) => {
    if (!data.title || data.title.trim() === "") return alert("Vui lòng nhập tên vai trò.");
    updateRoleMutate(
      {
        title: data.title,
        description: data.description,
        permissionsToAdd: data.permissionsToAdd,
        permissionsToRemove: data.permissionsToRemove,
      },
      {
        onSuccess: (data) => {
          router.push("/roles");
        },
      },
    );
  };

  const isSuperAdminRole = params.code === IMMUTABLE_ROLES.SUPER_ADMIN;

  return (
    <PageContainer title="Chỉnh sửa vai trò & phân quyền">
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
      {rolePermissions && (
        <RoleFormContainer
          initialData={rolePermissions}
          onSubmit={handleSubmit}
          isEditMode={true}
          isSuperAdminRole={isSuperAdminRole}
        />
      )}
    </PageContainer>
  );
};

export default EditRolePage;
