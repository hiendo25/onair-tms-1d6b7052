import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { surveysRepository } from "@/repository";
import { GetSurveysQueryParams } from "@/repository/surveys";

export const useGetSurveysQuery = (options?: { enabled?: boolean; queryParams: GetSurveysQueryParams }) => {
  const { queryParams, enabled } = options || {};
  return useTQuery({
    queryKey: [QUERY_KEYS.GET_SURVEYS, queryParams],
    queryFn: () => surveysRepository.getSurveys(queryParams),
    enabled,
  });
};
