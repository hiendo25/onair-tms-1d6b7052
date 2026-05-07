import { useTQuery } from "@/lib/queryClient";
import { positionsRepository } from "@/repository";

export const useGetPositionsQuery = () => {
  return useTQuery({
    queryKey: ["positions"],
    queryFn: positionsRepository.getPositions,
  });
};

