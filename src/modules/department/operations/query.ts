import { useTQuery } from "@/lib/queryClient";
import * as departmentService from "@/services/departments/department.service";
import type { GetDepartmentsParams } from "@/types/dto/departments";

export const useGetDepartmentsQuery = (
  params?: GetDepartmentsParams,
  options?: { enabled?: boolean }
) => {
  return useTQuery({
    queryKey: ["departments", params],
    queryFn: () => departmentService.getDepartments(params),
    enabled: options?.enabled !== false && !!params?.organizationId,
  });
};

export const useGetDepartmentQuery = (id: string) => {
  return useTQuery({
    queryKey: ["departments", id],
    queryFn: () => departmentService.getDepartmentById(id),
    enabled: !!id,
  });
};

export const useGetBranchesForDepartmentQuery = (
  organizationId: string,
  options?: { enabled?: boolean }
) => {
  return useTQuery({
    queryKey: ["branches", "for-department", organizationId],
    queryFn: () => departmentService.getBranches(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  });
};
