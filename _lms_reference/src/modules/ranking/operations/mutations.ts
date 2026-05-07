import { useTMutation } from "@/lib";
import { client } from "@/lib/api";
import {
  CreateLevelPayload,
  CreateLevelResponse,
  DeleteLevelResponse,
  UpdateLevelPayload,
  UpdateLevelResponse,
  UpdateLevelStatusPayload,
  UpdateLevelStatusResponse,
} from "../type";

export const useCreateLevelMutation = () => {
  return useTMutation({
    mutationFn: async (payload: CreateLevelPayload) => {
      const data = await client.post<CreateLevelResponse>("/gamification/level", payload);
      console.log({ data });
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useUpdateLevelMutation = () => {
  return useTMutation({
    mutationFn: async (payload: UpdateLevelPayload) => {
      const data = await client.put<UpdateLevelResponse>(`/gamification/level/${payload.id}`, payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useDeleteLevelMutation = () => {
  return useTMutation({
    mutationFn: async (recordId: string) => {
      const data = await client.put<DeleteLevelResponse>(`/gamification/level/${recordId}/delete`);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};

export const useToggleActiveStatusLevelMutation = () => {
  return useTMutation({
    mutationFn: async (payload: UpdateLevelStatusPayload) => {
      const data = await client.put<UpdateLevelStatusResponse>(`/gamification/level/${payload.id}/status`, payload);
      if (!data.success) {
        throw data.error.message;
      }
      return data.data;
    },
  });
};
