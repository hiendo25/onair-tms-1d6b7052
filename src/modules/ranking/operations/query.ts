import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { client } from "@/lib/api";
import { HttpError } from "@/lib/errors/HttpError";
import { GetLevelsResponse } from "../type";

type GetLevelQueryParams = {
  page: number;
  pageSize: number;
  organizationId: string;
};

const useGetLevelsQuery = (variables?: { queryParams: GetLevelQueryParams; enabled?: boolean }) => {
  const { queryParams = { page: 1, pageSize: 10, organizationId: "" }, enabled = true } = variables || {};
  return useTQuery<GetLevelsResponse, HttpError, GetLevelsResponse["data"]>({
    queryKey: [QUERY_KEYS.GET_LEVELS, queryParams.organizationId, queryParams],
    queryFn: () => client.get("/gamification/level", queryParams),
    select: (data) => {
      return data.data;
    },
    enabled,
  });
};
export { useGetLevelsQuery };
