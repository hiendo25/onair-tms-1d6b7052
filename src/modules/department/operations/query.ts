import { QUERY_KEYS } from "@/constants/query-key.constant";
import { client } from "@/lib/api";
import { useTQuery } from "@/lib/queryClient";
import * as departmentService from "@/services/departments/department.service";
import { GetDepartmentsQueryParams, GetDepartmentsResponse } from "../type";

export const useGetDepartmentsQuery = (params?: GetDepartmentsQueryParams, options?: { enabled?: boolean }) => {
  const { enabled = true } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_DEPARTMENTS, params],
    queryFn: async () => {
      const data = await client.get<GetDepartmentsResponse>("departments", params);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
    enabled,
  });
};

export const useGetDepartmentQuery = (id: string) => {
  return useTQuery({
    queryKey: ["departments", id],
    queryFn: () => departmentService.getDepartmentById(id),
    enabled: !!id,
  });
};

export const useGetBranchesForDepartmentQuery = (organizationId: string, options?: { enabled?: boolean }) => {
  return useTQuery({
    queryKey: ["branches", "for-department", organizationId],
    queryFn: () => departmentService.getBranches(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  });
};
