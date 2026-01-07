import { useTQuery } from "@/lib/queryClient";

interface DepartmentRankingEmployee {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  email: string;
  avatar: string | null;
  departmentId: string;
  departmentName: string;
  currentXp: number;
  maxPossibleXp: number;
  completionPercentage: number;
  level: {
    id: string | null;
    title: string | null;
    icon: string | null;
    scoreRequired: number | null;
  };
  rank: number;
}

interface DepartmentRankingResult {
  employees: DepartmentRankingEmployee[];
  total: number;
  page: number;
  limit: number;
  departmentId: string;
}

interface GetDepartmentRankingParams {
  departmentId: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch department-specific gamification ranking
 *
 * @param params - Query parameters including departmentId, page, limit
 * @param options - Query options
 * @returns Query result with department ranking data
 */
export const useGetDepartmentRankingQuery = (
  params: GetDepartmentRankingParams,
  options?: { enabled?: boolean }
) => {
  const { departmentId, page = 1, limit = 50 } = params;

  return useTQuery<DepartmentRankingResult>({
    queryKey: ["department-ranking", departmentId, page, limit],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        departmentId,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `/api/gamification/department-ranking?${searchParams.toString()}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch department ranking");
      }

      const result = await response.json();
      return result.data;
    },
    enabled: options?.enabled !== false && !!departmentId,
  });
};

/**
 * Fetch current employee's department ranking
 *
 * @param options - Query options
 * @returns Query result with current employee's ranking data
 */
export const useGetMyDepartmentRankingQuery = (options?: {
  enabled?: boolean;
}) => {
  return useTQuery<DepartmentRankingEmployee>({
    queryKey: ["my-department-ranking"],
    queryFn: async () => {
      const response = await fetch("/api/gamification/my-department-ranking");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Failed to fetch my department ranking"
        );
      }

      const result = await response.json();
      return result.data;
    },
    enabled: options?.enabled !== false,
  });
};
