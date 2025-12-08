import { useTMutation } from "@/lib";
import { PermissionParams, RoleParams, RolePermissionsParams, createRole, updateRole } from "@/repository/roles";
import { useQueryClient } from "@tanstack/react-query";
import { GET_ROLES, GET_ROLE_PERMISSIONS } from "./key";

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationKey: ["create-role"],
    mutationFn: async (data: RoleParams & { permissions: PermissionParams[] }) => createRole(data),
    onSuccess: () => {
      [GET_ROLES, GET_ROLE_PERMISSIONS].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};

export const useUpdateRolePermissions = (roleId: string) => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationKey: ["update-role-permissions", roleId],
    mutationFn: async (data: RoleParams & RolePermissionsParams) => updateRole(roleId, data),
    onSuccess: () => {
      [GET_ROLES, GET_ROLE_PERMISSIONS].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationKey: ["delete-role"],
    mutationFn: async (roleId: string) => {
      const { deleteRole } = await import("@/repository/roles");
      return deleteRole(roleId);
    },
    onSuccess: () => {
      [GET_ROLES, GET_ROLE_PERMISSIONS].forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};
