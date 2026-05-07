import { useTQuery } from "@/lib/queryClient";
import { getAllLevels } from "@/services/gamifications/levels";
import type { EmployeeGamificationXpResult, LevelInfo } from "@/types/gamification.types";

import { GET_MY_GAMIFICATION_XP } from "./key";

/**
 * Fetch current employee's gamification XP and level information
 *
 * @param options - Query options
 * @returns Query result with XP and level data
 */
export const useGetMyGamificationXpQuery = (options?: {
  enabled?: boolean;
}) => {
  return useTQuery<EmployeeGamificationXpResult>({
    queryKey: [GET_MY_GAMIFICATION_XP],
    queryFn: async () => {
      const response = await fetch("/api/gamification/my-xp");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch gamification XP");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: options?.enabled !== false,
  });
};

/**
 * Fetch all levels for the organization
 *
 * @param organizationId - The organization's UUID
 * @param options - Query options
 * @returns Query result with all levels sorted by score (ascending)
 */
export const useGetAllLevelsQuery = (
  organizationId: string,
  options?: {
    enabled?: boolean;
  }
) => {
  return useTQuery<LevelInfo[]>({
    queryKey: [GET_MY_GAMIFICATION_XP, "all-levels", organizationId],
    queryFn: () => getAllLevels(organizationId),
    enabled: options?.enabled !== false && !!organizationId,
  });
};
