export {
  useCreateQRCodeMutation,
  useActivateQRCodeMutation,
  useDeactivateQRCodeMutation,
  useUpdateQRCodeMutation,
  useDeleteQRCodeMutation,
  useCheckInWithQRMutation,
} from "./qr-attendance/mutation";
import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { categoriesRepository, classFieldRepository } from "@/repository";
import { CreateCategoryPayload } from "@/repository/categories/type";
import { CreateClassFieldPayload } from "@/repository/class-room-field/type";

const useCreateClassFieldMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: (payload: CreateClassFieldPayload) => classFieldRepository.createClassField(payload),
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CLASS_FIELDS] });
    },
  });
};

const useCreateCategoriesMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesRepository.createCategory(payload),
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_CATEGORIES] });
    },
  });
};

export { useCreateClassFieldMutation, useCreateCategoriesMutation };
