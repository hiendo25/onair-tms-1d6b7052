import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { hashTagRepository } from "@/repository";
import { CreateClassRoomHashTagPayload } from "@/repository/hash-tag/type";
const useCreateHashTagMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: (payload: CreateClassRoomHashTagPayload) => hashTagRepository.createClassRoomHashTag(payload),
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLASS_HASH_TAGS] });
    },
  });
};
export { useCreateHashTagMutation };
