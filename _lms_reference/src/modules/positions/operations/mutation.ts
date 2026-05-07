import { useTMutation } from "@/lib/queryClient";
import { positionsRepository } from "@/repository";

export const useCreatePositionMutation = () => {
  return useTMutation({
    mutationFn: (title: string) => positionsRepository.createPosition(title),
  });
};
