import { useTQuery } from "@/lib";
import { getGroupPermissionList, getRoleList, GetRoleListParams, getRolePermissions } from "@/repository/roles";
import { GET_PERMISSIONS, GET_ROLE_PERMISSIONS, GET_ROLES } from "./key";

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
