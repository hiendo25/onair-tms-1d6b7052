import { useTQuery } from "@/lib/queryClient";
import { organizationUnitsRepository } from "@/repository";
import { QUERY_KEYS } from "@/constants/query-key.constant";

export const useGetOrganizationUnitsQuery = () => {
  return useTQuery({
    queryKey: ["organization-units"],
    queryFn: organizationUnitsRepository.getOrganizationUnits,
  });
};

export const useGetOrganizationUnitsByOrgQuery = (organizationId?: string, enabled = true) => {
  return useTQuery({
    queryKey: ["organization-units-by-org", organizationId],
    queryFn: () => organizationUnitsRepository.getOrganizationUnitsByOrg(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 30_000,
  });
};

export const useGetOrganizationUnitDepartmentOrBranchQuery = (options?: {
  queryParams: { type: "department" | "branch" };
  enabled?: boolean;
}) => {
  const { queryParams, enabled = true } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_ORGANIZATION_DEPARTMENT_OR_BRANCH, queryParams],
    queryFn: () => organizationUnitsRepository.getOrganizationDepartmentOrBranch(queryParams?.type),
    enabled,
  });
};
