import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTQuery } from "@/lib";
import { hashTagRepository } from "@/repository";
const useGetClassHashTagsQuery = () => {
  return useTQuery({
    queryFn: hashTagRepository.getHashTags,
    queryKey: [QUERY_KEYS.GET_CLASS_HASH_TAGS],
  });
};
export { useGetClassHashTagsQuery };
