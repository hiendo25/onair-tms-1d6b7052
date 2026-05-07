import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { client } from "@/lib/api";
import { categoriesRepository, classFieldRepository, coursesRepository } from "@/repository";
import { CreateCategoryPayload } from "@/repository/categories/type";
import { CreateClassFieldPayload } from "@/repository/class-room-field/type";
import { DeleteCourseResponse } from "../type";

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

const useDeleteCourseByIdMutation = () => {
  const queryClient = useQueryClient();
  return useTMutation({
    mutationFn: async (courseId: string) => {
      const data = await client.delete<DeleteCourseResponse>(`/courses/${courseId}`);
      console.log(data);
      if (!data.success) {
        throw new Error(data.error.message);
      }
      return data;
    },
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COURSES] });
    },
  });
};

export { useCreateClassFieldMutation, useCreateCategoriesMutation, useDeleteCourseByIdMutation };
