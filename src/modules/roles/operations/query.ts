import { useTQuery } from "@/lib";
import { GetRoleListParams, getGroupPermissionList, getRoleList, getRolePermissions } from "@/repository/roles";
import { GET_PERMISSIONS, GET_ROLES, GET_ROLE_PERMISSIONS } from "./key";

export const useGetRoleList = (params?: GetRoleListParams) => {
  return useTQuery({
    queryKey: [GET_ROLES, params?.page, params?.pageSize],
    queryFn: async () => await getRoleList(params),
  });
};

export const useGetGroupPermissionList = () => {
  return useTQuery({
    queryKey: [GET_PERMISSIONS],
    queryFn: async () => await getGroupPermissionList(),
  });
};

export const useGetRolePermissions = (roleCode: string) => {
  return useTQuery({
    queryKey: [GET_ROLE_PERMISSIONS, roleCode],
    queryFn: async () => await getRolePermissions(roleCode),
    enabled: !!roleCode,
  });
};
