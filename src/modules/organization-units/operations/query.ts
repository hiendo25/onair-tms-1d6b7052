import { useTQuery } from "@/lib/queryClient";
import { organizationUnitsRepository } from "@/repository";
import { QUERY_KEYS } from "@/constants/query-key.constant";
import { PaginatedResult } from "@/types/dto/pagination.dto";

type OrganizationUnitType = "department" | "branch";
type OrganizationUnit = {
  id: string;
  name: string;
  type: OrganizationUnitType;
};

export const useGetOrganizationUnitsQuery = () => {
  return useTQuery({
    queryKey: ["organization-units"],
    queryFn: organizationUnitsRepository.getOrganizationUnits,
  });
};

interface UseOrganizationUnitsByOrgParams {
  organizationId?: string;
  type?: OrganizationUnitType;
  search?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useGetOrganizationUnitsByOrgQuery = ({
  organizationId,
  type,
  search,
  page = 1,
  limit = 10,
  enabled = true,
}: UseOrganizationUnitsByOrgParams) => {
  return useTQuery<PaginatedResult<OrganizationUnit>>({
    queryKey: ["organization-units-by-org", organizationId, type, search, page, limit],
    queryFn: () =>
      organizationUnitsRepository.getOrganizationUnitsByOrg({
        organizationId,
        type,
        search,
        page,
        limit,
      }),
    enabled: enabled && !!organizationId && !!type,
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
