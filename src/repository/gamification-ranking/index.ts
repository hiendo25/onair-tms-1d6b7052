import { createSVClient } from "@/services/supabase/server";

export interface DepartmentRankingEmployee {
  employee_id: string;
  organization_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  avatar: string | null;
  department_id: string;
  department_name: string;
  current_xp: number;
  max_possible_xp: number;
  completion_percentage: number;
  level_id: string | null;
  level_title: string | null;
  level_icon: string | null;
  level_score_required: number | null;
  department_rank: number;
}

export interface GetDepartmentRankingParams {
  departmentId: string;
  organizationId: string;
  page?: number;
  limit?: number;
}

export interface GetDepartmentRankingResult {
  data: DepartmentRankingEmployee[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get department-specific gamification ranking
 * Queries the department_gamification_ranking view with pagination
 *
 * @param params - Parameters including departmentId, organizationId, page, limit
 * @returns Paginated list of ranked employees in the department
 *
 * @example
 * const result = await getDepartmentRanking({
 *   departmentId: 'dept-uuid',
 *   organizationId: 'org-uuid',
 *   page: 1,
 *   limit: 50
 * });
 */
export async function getDepartmentRanking(
  params: GetDepartmentRankingParams
): Promise<GetDepartmentRankingResult> {
  const supabase = await createSVClient();
  const { departmentId, organizationId, page = 1, limit = 50 } = params;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("department_gamification_ranking")
    .select("*", { count: "exact" })
    .eq("department_id", departmentId)
    .eq("organization_id", organizationId)
    .order("department_rank", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch department ranking: ${error.message}`);
  }

  return {
    data: (data as DepartmentRankingEmployee[]) || [],
    total: count || 0,
    page,
    limit,
  };
}

/**
 * Get specific employee's ranking in their department
 *
 * @param employeeId - The employee's UUID
 * @param organizationId - The organization's UUID
 * @returns The employee's department ranking data, or null if not found
 *
 * @example
 * const rank = await getEmployeeDepartmentRank(
 *   'employee-uuid',
 *   'org-uuid'
 * );
 */
export async function getEmployeeDepartmentRank(
  employeeId: string,
  organizationId: string
): Promise<DepartmentRankingEmployee | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("department_gamification_ranking")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch employee department rank: ${error.message}`
    );
  }

  return data as DepartmentRankingEmployee | null;
}
