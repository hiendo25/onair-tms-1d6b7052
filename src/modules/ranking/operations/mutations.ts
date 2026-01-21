import { useTMutation } from "@/lib";
import { client } from "@/lib/api";
import {
  CreateLevelPayload,
  DeleteLevelResponse,
  UpdateLevelPayload,
  UpdateLevelStatusPayload,
  UpdateLevelStatusResponse,
} from "../type";

const useCreateLevelMutation = () => {
  return useTMutation({
    mutationFn: (payload: CreateLevelPayload) => client.post("/gamification/level", payload),
  });
};

const useUpdateLevelMutation = () => {
  return useTMutation({
    mutationFn: (payload: UpdateLevelPayload) => client.put(`/gamification/level/${payload.id}`, payload),
  });
};

const useDeleteLevelMutation = () => {
  return useTMutation<DeleteLevelResponse, Error, string>({
    mutationFn: (recordId) => client.put(`/gamification/level/${recordId}/delete`),
  });
};

const useToggleActiveStatusLevelMutation = () => {
  return useTMutation<UpdateLevelStatusResponse, Error, UpdateLevelStatusPayload>({
    mutationFn: (payload) => client.put(`/gamification/level/${payload.id}/status`, payload),
  });
};
export { useCreateLevelMutation, useUpdateLevelMutation, useDeleteLevelMutation, useToggleActiveStatusLevelMutation };
