import { useTQuery } from "@/lib/queryClient";

import { GET_MY_GAMIFICATION_XP } from "./key";

interface LevelInfo {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  scoreRequired: number;
}

interface NextLevelInfo extends LevelInfo {
  xpNeeded: number;
}

export interface GamificationXpData {
  currentXp: number;
  currentLevelId: string | null;
  currentLevel: LevelInfo | null;
  nextLevel: NextLevelInfo | null;
}

/**
 * Fetch current employee's gamification XP and level information
 *
 * @param options - Query options
 * @returns Query result with XP and level data
 */
export const useGetMyGamificationXpQuery = (options?: {
  enabled?: boolean;
}) => {
  return useTQuery<GamificationXpData>({
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
