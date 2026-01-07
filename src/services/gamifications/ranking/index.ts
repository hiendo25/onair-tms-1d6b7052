import { gamificationRankingRepository } from "@/repository";

export interface DepartmentRankingEmployee {
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

export interface DepartmentRankingResult {
  employees: DepartmentRankingEmployee[];
  total: number;
  page: number;
  limit: number;
  departmentId: string;
}

/**
 * Get department gamification ranking with formatted data
 *
 * @param departmentId - The department's UUID
 * @param organizationId - The organization's UUID
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 50, max: 100)
 * @returns Paginated department ranking with camelCase formatting
 *
 * @throws Error if departmentId or organizationId is missing
 * @throws Error if page < 1 or limit not in range [1, 100]
 *
 * @example
 * const ranking = await getDepartmentGamificationRanking(
 *   'dept-uuid',
 *   'org-uuid',
 *   1,
 *   50
 * );
 * // Returns: { employees: [...], total: 25, page: 1, limit: 50, departmentId: '...' }
 */
export async function getDepartmentGamificationRanking(
  departmentId: string,
  organizationId: string,
  page: number = 1,
  limit: number = 50
): Promise<DepartmentRankingResult> {
  // Validate inputs
  if (!departmentId || !organizationId) {
    throw new Error("Department ID and Organization ID are required");
  }

  if (page < 1) {
    throw new Error("Page must be greater than 0");
  }

  if (limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  // Fetch from repository
  const result = await gamificationRankingRepository.getDepartmentRanking({
    departmentId,
    organizationId,
    page,
    limit,
  });

  // Transform data to camelCase format
  const employees: DepartmentRankingEmployee[] = result.data.map((emp) => ({
    employeeId: emp.employee_id,
    employeeCode: emp.employee_code,
    fullName: emp.full_name,
    email: emp.email,
    avatar: emp.avatar,
    departmentId: emp.department_id,
    departmentName: emp.department_name,
    currentXp: emp.current_xp,
    maxPossibleXp: emp.max_possible_xp,
    completionPercentage: emp.completion_percentage,
    level: {
      id: emp.level_id,
      title: emp.level_title,
      icon: emp.level_icon,
      scoreRequired: emp.level_score_required,
    },
    rank: emp.department_rank,
  }));

  return {
    employees,
    total: result.total,
    page: result.page,
    limit: result.limit,
    departmentId,
  };
}

/**
 * Get specific employee's department ranking
 *
 * @param employeeId - The employee's UUID
 * @param organizationId - The organization's UUID
 * @returns The employee's ranking data with camelCase formatting, or null if not found
 *
 * @throws Error if employeeId or organizationId is missing
 *
 * @example
 * const myRank = await getEmployeeDepartmentRanking(
 *   'employee-uuid',
 *   'org-uuid'
 * );
 * // Returns: { employeeId: '...', rank: 5, completionPercentage: 75.50, ... }
 */
export async function getEmployeeDepartmentRanking(
  employeeId: string,
  organizationId: string
): Promise<DepartmentRankingEmployee | null> {
  if (!employeeId || !organizationId) {
    throw new Error("Employee ID and Organization ID are required");
  }

  const data = await gamificationRankingRepository.getEmployeeDepartmentRank(
    employeeId,
    organizationId
  );

  if (!data) {
    return null;
  }

  return {
    employeeId: data.employee_id,
    employeeCode: data.employee_code,
    fullName: data.full_name,
    email: data.email,
    avatar: data.avatar,
    departmentId: data.department_id,
    departmentName: data.department_name,
    currentXp: data.current_xp,
    maxPossibleXp: data.max_possible_xp,
    completionPercentage: data.completion_percentage,
    level: {
      id: data.level_id,
      title: data.level_title,
      icon: data.level_icon,
      scoreRequired: data.level_score_required,
    },
    rank: data.department_rank,
  };
}
