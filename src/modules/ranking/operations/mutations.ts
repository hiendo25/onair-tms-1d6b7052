import { useTMutation } from "@/lib";
import { levelRepository } from "@/repository";

const useCreateLevelMutation = () => {
  return useTMutation({
    mutationFn: levelRepository.createLevel,
    mutationKey: ["create_level"],
  });
};

const useUpdateLevelMutation = () => {
  return useTMutation({
    mutationFn: levelRepository.updateLevel,
    mutationKey: ["update_level"],
  });
};

const useDeleteLevelMutation = () => {
  return useTMutation({
    mutationFn: (payload: { recordId: string }) =>
      levelRepository.updateStatusLevel({ status: "deleted", id: payload.recordId }),
    mutationKey: ["delete_level"],
  });
};

const useToggleActiveStatusLevelMutation = () => {
  return useTMutation({
    mutationFn: (payload: { recordId: string; status: "active" | "inactive" }) =>
      levelRepository.updateStatusLevel({ status: payload.status, id: payload.recordId }),
    mutationKey: ["delete_level"],
  });
};
export { useCreateLevelMutation, useUpdateLevelMutation, useDeleteLevelMutation, useToggleActiveStatusLevelMutation };
