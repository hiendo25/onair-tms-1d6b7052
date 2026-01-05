import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { levelRepository } from "@/repository";
import { GetLevelQueryParams } from "@/repository/level";
const useGetLevelsQuery = (variables?: { queryParams: GetLevelQueryParams; enabled?: boolean }) => {
  const { queryParams = { page: 1, pageSize: 10 }, enabled = true } = variables || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_LEVELS, queryParams],
    queryFn: () => levelRepository.getLevels(queryParams),
    enabled,
  });
};
export { useGetLevelsQuery };
