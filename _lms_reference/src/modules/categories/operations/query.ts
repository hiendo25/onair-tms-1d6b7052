import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { categoriesRepository } from "@/repository";

const useGetCategoriesQuery = () => {
  return useTQuery({
    queryFn: categoriesRepository.getCategories,
    queryKey: [QUERY_KEYS.GET_CATEGORIES],
  });
};

export { useGetCategoriesQuery };
