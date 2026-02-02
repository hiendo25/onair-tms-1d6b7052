import { QUERY_KEYS } from "@/constants/query-key.constant";
import { client } from "@/lib/api";
import { useTQuery } from "@/lib/queryClient";
import * as branchService from "@/services/branches/branch.service";
// import type { GetBranchesParams } from "@/types/dto/branches";
import { GetBranchesQueryParams, GetBranchesResponse } from "../type";

export const useGetBranchesQuery = (params: GetBranchesQueryParams, options?: { enabled?: boolean }) => {
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_BRANCHES, params],
    queryFn: async () => {
      const data = await client.get<GetBranchesResponse>("branches", params);
      if (!data.success) {
        throw data.error;
      }
      return data.data;
    },
    enabled: options?.enabled,
  });
};

export const useGetBranchQuery = (id: string) => {
  return useTQuery({
    queryKey: ["branches", id],
    queryFn: () => branchService.getBranchById(id),
    enabled: !!id,
  });
};
