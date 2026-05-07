import { useTQuery } from "@/lib/queryClient";
import * as libraryService from "@/services/libraries/library.service";

export const useGetResourceById = (resourceId: string) => {
  return useTQuery({
    queryKey: ["resource", resourceId],
    queryFn: () => libraryService.getResourceById(resourceId),
    enabled: !!resourceId,
  });
};

export const useGetResourcesByIds = (resourceIds: string[]) => {
  return useTQuery({
    queryKey: ["resources", resourceIds],
    queryFn: () => libraryService.getResourcesByIds(resourceIds),
    enabled: resourceIds.length > 0,
  });
};

